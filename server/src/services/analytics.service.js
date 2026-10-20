const prisma = require("../config/db");

function createAppError(code, message, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

function parseFilters(query = {}) {
  const filters = {};

  if (query.branch && typeof query.branch === "string" && query.branch.trim()) {
    filters.branch = query.branch.trim();
  }

  if (query.year !== undefined && query.year !== null && query.year !== "") {
    const y = Number(query.year);
    if (isNaN(y) || !Number.isInteger(y) || y < 1 || y > 6) {
      throw createAppError("VALIDATION_ERROR", "year must be a valid integer between 1 and 6", 400);
    }
    filters.year = y;
  }

  if (query.startDate) {
    const d = new Date(query.startDate);
    if (isNaN(d.getTime())) {
      throw createAppError("VALIDATION_ERROR", "Invalid startDate format", 400);
    }
    filters.startDate = d;
  }

  if (query.endDate) {
    const d = new Date(query.endDate);
    if (isNaN(d.getTime())) {
      throw createAppError("VALIDATION_ERROR", "Invalid endDate format", 400);
    }
    filters.endDate = d;
  }

  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    throw createAppError("VALIDATION_ERROR", "startDate cannot be after endDate", 400);
  }

  if (query.companyId && typeof query.companyId === "string" && query.companyId.trim()) {
    filters.companyId = query.companyId.trim();
  }

  if (query.driveId && typeof query.driveId === "string" && query.driveId.trim()) {
    filters.driveId = query.driveId.trim();
  }

  return filters;
}

function escapeCSV(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers, rows) {
  const headerLine = headers.map(escapeCSV).join(",");
  const dataLines = rows.map((r) => r.map(escapeCSV).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}

/**
 * 1. Overview Dashboard Summary
 * Metric Definitions:
 * - totalStudents: Registered student records matching filter
 * - activePlacements: Count of FinalPlacement records with status === 'ACTIVE'
 * - unplacedStudents: totalStudents - activePlacements (floor at 0)
 * - placementRate: (activePlacements / totalStudents) * 100 (0.00% if totalStudents === 0)
 * - totalDrives: Count of PlacementDrive records matching filter
 * - publishedDrives: Placement drives with status === 'PUBLISHED'
 * - activeDrives: Published placement drives with applicationDeadline in the future
 * - totalApplications: Count of Application records with status === 'APPLIED'
 * - uniqueApplicantStudents: Count of distinct students who applied
 * - totalCompanies: Count of unique companies participating in recruitment
 * - totalOffers: Count of PlacementOffer records
 * - acceptedOffers: Placement offers with status === 'ACCEPTED'
 */
async function getOverview(query = {}) {
  const filters = parseFilters(query);

  const studentWhere = {};
  if (filters.branch) studentWhere.branch = filters.branch;
  if (filters.year) studentWhere.year = filters.year;

  const placementWhere = { status: "ACTIVE" };
  if (Object.keys(studentWhere).length > 0) {
    placementWhere.student = studentWhere;
  }
  if (filters.startDate || filters.endDate) {
    placementWhere.placementDate = {};
    if (filters.startDate) placementWhere.placementDate.gte = filters.startDate;
    if (filters.endDate) placementWhere.placementDate.lte = filters.endDate;
  }
  if (filters.companyId) {
    placementWhere.offer = { drive: { companyId: filters.companyId } };
  }
  if (filters.driveId) {
    placementWhere.offer = { ...(placementWhere.offer || {}), driveId: filters.driveId };
  }

  const driveWhere = {};
  if (filters.companyId) driveWhere.companyId = filters.companyId;
  if (filters.driveId) driveWhere.id = filters.driveId;

  const appWhere = { status: "APPLIED" };
  if (Object.keys(studentWhere).length > 0) appWhere.student = studentWhere;
  if (filters.companyId) appWhere.drive = { companyId: filters.companyId };
  if (filters.driveId) appWhere.driveId = filters.driveId;

  const now = new Date();

  const [
    totalStudents,
    activePlacements,
    totalDrives,
    publishedDrives,
    activeDrives,
    totalApplications,
    uniqueApplicantGroups,
    participatingCompanies,
    totalOffers,
    acceptedOffers
  ] = await Promise.all([
    prisma.student.count({ where: studentWhere }),
    prisma.finalPlacement.count({ where: placementWhere }),
    prisma.placementDrive.count({ where: driveWhere }),
    prisma.placementDrive.count({ where: { ...driveWhere, status: "PUBLISHED" } }),
    prisma.placementDrive.count({
      where: {
        ...driveWhere,
        status: "PUBLISHED",
        applicationDeadline: { gte: now }
      }
    }),
    prisma.application.count({ where: appWhere }),
    prisma.application.groupBy({
      by: ["studentId"],
      where: appWhere
    }),
    prisma.company.count({
      where: filters.companyId ? { id: filters.companyId } : { drives: { some: {} } }
    }),
    prisma.placementOffer.count({
      where: {
        student: Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
        drive: Object.keys(driveWhere).length > 0 ? driveWhere : undefined
      }
    }),
    prisma.placementOffer.count({
      where: {
        status: "ACCEPTED",
        student: Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
        drive: Object.keys(driveWhere).length > 0 ? driveWhere : undefined
      }
    })
  ]);

  const uniqueApplicants = uniqueApplicantGroups.length;
  const unplacedStudents = Math.max(0, totalStudents - activePlacements);
  const placementRate = totalStudents > 0
    ? Number(((activePlacements / totalStudents) * 100).toFixed(2))
    : 0;

  return {
    students: {
      total: totalStudents,
      activePlaced: activePlacements,
      unplaced: unplacedStudents,
      placementRatePercent: placementRate
    },
    drives: {
      total: totalDrives,
      published: publishedDrives,
      active: activeDrives
    },
    applications: {
      total: totalApplications,
      uniqueApplicants
    },
    offers: {
      total: totalOffers,
      accepted: acceptedOffers
    },
    companies: {
      participating: participatingCompanies
    },
    definitions: {
      placementRate: "Calculated strictly as (active final placements / total registered students) * 100. Cancelled placements are excluded."
    }
  };
}

/**
 * 2. Branch-Wise Analytics
 * Computes registered students, active placements, unplaced students,
 * placement rate, offers, and package metrics per branch.
 */
async function getBranchAnalytics(query = {}) {
  const filters = parseFilters(query);

  const studentWhere = {};
  if (filters.branch) studentWhere.branch = filters.branch;
  if (filters.year) studentWhere.year = filters.year;

  // Group registered students by branch
  const studentBranchCounts = await prisma.student.groupBy({
    by: ["branch"],
    where: studentWhere,
    _count: { id: true }
  });

  // Fetch active placements with student branch and offer package
  const placementWhere = { status: "ACTIVE" };
  if (Object.keys(studentWhere).length > 0) placementWhere.student = studentWhere;
  if (filters.startDate || filters.endDate) {
    placementWhere.placementDate = {};
    if (filters.startDate) placementWhere.placementDate.gte = filters.startDate;
    if (filters.endDate) placementWhere.placementDate.lte = filters.endDate;
  }

  const activePlacements = await prisma.finalPlacement.findMany({
    where: placementWhere,
    select: {
      student: { select: { branch: true } },
      offer: { select: { package: true } }
    }
  });

  // Fetch offers with student branch
  const offers = await prisma.placementOffer.findMany({
    where: Object.keys(studentWhere).length > 0 ? { student: studentWhere } : undefined,
    select: {
      student: { select: { branch: true } }
    }
  });

  // Collate all known branches
  const branchesMap = new Map();

  for (const s of studentBranchCounts) {
    branchesMap.set(s.branch, {
      branch: s.branch,
      totalStudents: s._count.id,
      activePlacements: 0,
      totalOffers: 0,
      packages: []
    });
  }

  // Also include any branch present in active placements
  for (const p of activePlacements) {
    const b = p.student?.branch || "UNKNOWN";
    if (!branchesMap.has(b)) {
      branchesMap.set(b, {
        branch: b,
        totalStudents: 0,
        activePlacements: 0,
        totalOffers: 0,
        packages: []
      });
    }
    const entry = branchesMap.get(b);
    entry.activePlacements += 1;
    if (p.offer?.package !== null && p.offer?.package !== undefined) {
      entry.packages.push(Number(p.offer.package));
    }
  }

  for (const o of offers) {
    const b = o.student?.branch || "UNKNOWN";
    if (branchesMap.has(b)) {
      branchesMap.get(b).totalOffers += 1;
    }
  }

  const branches = Array.from(branchesMap.values()).map((b) => {
    const unplaced = Math.max(0, b.totalStudents - b.activePlacements);
    const rate = b.totalStudents > 0
      ? Number(((b.activePlacements / b.totalStudents) * 100).toFixed(2))
      : 0;

    let avgPkg = null;
    let maxPkg = null;
    let minPkg = null;

    if (b.packages.length > 0) {
      const sum = b.packages.reduce((acc, val) => acc + val, 0);
      avgPkg = Number((sum / b.packages.length).toFixed(2));
      maxPkg = Number(Math.max(...b.packages).toFixed(2));
      minPkg = Number(Math.min(...b.packages).toFixed(2));
    }

    return {
      branch: b.branch,
      totalStudents: b.totalStudents,
      activePlacements: b.activePlacements,
      unplacedStudents: unplaced,
      placementRatePercent: rate,
      totalOffers: b.totalOffers,
      averagePackageLPA: avgPkg,
      highestPackageLPA: maxPkg,
      lowestPackageLPA: minPkg
    };
  });

  branches.sort((a, b) => a.branch.localeCompare(b.branch));

  if (query.format === "csv") {
    const headers = [
      "Branch",
      "Total Students",
      "Active Placements",
      "Unplaced Students",
      "Placement Rate (%)",
      "Total Offers",
      "Average Package (LPA)",
      "Highest Package (LPA)",
      "Lowest Package (LPA)"
    ];
    const rows = branches.map((b) => [
      b.branch,
      b.totalStudents,
      b.activePlacements,
      b.unplacedStudents,
      b.placementRatePercent,
      b.totalOffers,
      b.averagePackageLPA !== null ? b.averagePackageLPA : "N/A",
      b.highestPackageLPA !== null ? b.highestPackageLPA : "N/A",
      b.lowestPackageLPA !== null ? b.lowestPackageLPA : "N/A"
    ]);
    return {
      isCSV: true,
      filename: "branch_placement_analytics",
      content: toCSV(headers, rows)
    };
  }

  return {
    totalBranches: branches.length,
    branches
  };
}

/**
 * 3. Package Analytics
 * Calculates average, minimum, maximum, median, and bracket distribution
 * for active final placements. Packages are stored in LPA (Lakhs Per Annum).
 */
async function getPackageAnalytics(query = {}) {
  const filters = parseFilters(query);

  const studentWhere = {};
  if (filters.branch) studentWhere.branch = filters.branch;
  if (filters.year) studentWhere.year = filters.year;

  const placementWhere = { status: "ACTIVE" };
  if (Object.keys(studentWhere).length > 0) placementWhere.student = studentWhere;
  if (filters.companyId) placementWhere.offer = { drive: { companyId: filters.companyId } };
  if (filters.driveId) {
    placementWhere.offer = { ...(placementWhere.offer || {}), driveId: filters.driveId };
  }
  if (filters.startDate || filters.endDate) {
    placementWhere.placementDate = {};
    if (filters.startDate) placementWhere.placementDate.gte = filters.startDate;
    if (filters.endDate) placementWhere.placementDate.lte = filters.endDate;
  }

  const placements = await prisma.finalPlacement.findMany({
    where: placementWhere,
    select: {
      id: true,
      placementDate: true,
      offer: {
        select: {
          role: true,
          package: true,
          drive: {
            select: {
              jobRole: true,
              company: { select: { name: true } }
            }
          }
        }
      },
      student: {
        select: {
          branch: true,
          year: true
        }
      }
    }
  });

  const packages = [];
  for (const p of placements) {
    if (p.offer?.package !== null && p.offer?.package !== undefined) {
      packages.push(Number(p.offer.package));
    }
  }

  packages.sort((a, b) => a - b);

  const totalPlaced = placements.length;
  const packagesCount = packages.length;

  let average = 0;
  let minimum = 0;
  let maximum = 0;
  let median = 0;

  if (packagesCount > 0) {
    const sum = packages.reduce((acc, val) => acc + val, 0);
    average = Number((sum / packagesCount).toFixed(2));
    minimum = Number(packages[0].toFixed(2));
    maximum = Number(packages[packagesCount - 1].toFixed(2));

    const mid = Math.floor(packagesCount / 2);
    if (packagesCount % 2 === 0) {
      median = Number(((packages[mid - 1] + packages[mid]) / 2).toFixed(2));
    } else {
      median = Number(packages[mid].toFixed(2));
    }
  }

  // Bracket distribution bands (in LPA)
  const bands = [
    { label: "Below 5 LPA", min: 0, max: 4.99, count: 0 },
    { label: "5 - 10 LPA", min: 5.0, max: 9.99, count: 0 },
    { label: "10 - 15 LPA", min: 10.0, max: 14.99, count: 0 },
    { label: "15 - 20 LPA", min: 15.0, max: 19.99, count: 0 },
    { label: "Above 20 LPA", min: 20.0, max: Infinity, count: 0 }
  ];

  for (const pkg of packages) {
    if (pkg < 5.0) bands[0].count++;
    else if (pkg < 10.0) bands[1].count++;
    else if (pkg < 15.0) bands[2].count++;
    else if (pkg < 20.0) bands[3].count++;
    else bands[4].count++;
  }

  const distribution = bands.map((b) => ({
    band: b.label,
    minPackage: b.min,
    maxPackage: b.max === Infinity ? null : b.max,
    count: b.count,
    percentage: packagesCount > 0
      ? Number(((b.count / packagesCount) * 100).toFixed(2))
      : 0
  }));

  if (query.format === "csv") {
    const headers = [
      "Package Band (LPA)",
      "Placed Students Count",
      "Percentage (%)"
    ];
    const rows = distribution.map((d) => [
      d.band,
      d.count,
      d.percentage
    ]);
    return {
      isCSV: true,
      filename: "package_distribution_analytics",
      content: toCSV(headers, rows)
    };
  }

  return {
    unit: "LPA",
    currency: "INR",
    totalActivePlacements: totalPlaced,
    placementsWithPackage: packagesCount,
    statistics: {
      average,
      minimum,
      maximum,
      median
    },
    distribution
  };
}

/**
 * 4. Company-Wise Hiring Analytics
 * Aggregates drives, applications, offers, active placements,
 * and package ranges per recruiting company.
 */
async function getCompanyAnalytics(query = {}) {
  const filters = parseFilters(query);

  const companyWhere = {};
  if (filters.companyId) companyWhere.id = filters.companyId;

  const companies = await prisma.company.findMany({
    where: companyWhere,
    select: {
      id: true,
      name: true,
      status: true,
      drives: {
        where: filters.driveId ? { id: filters.driveId } : undefined,
        select: {
          id: true,
          jobRole: true,
          package: true,
          applications: {
            where: { status: "APPLIED" },
            select: { studentId: true }
          },
          placementOffers: {
            select: {
              id: true,
              package: true,
              status: true,
              finalPlacement: {
                select: {
                  id: true,
                  status: true,
                  placementDate: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const companyReports = companies.map((c) => {
    let totalDrives = c.drives.length;
    let totalApplications = 0;
    const applicantSet = new Set();
    let totalOffers = 0;
    let activePlacements = 0;
    const placedPackages = [];

    for (const d of c.drives) {
      totalApplications += d.applications.length;
      for (const a of d.applications) {
        applicantSet.add(a.studentId);
      }

      for (const o of d.placementOffers) {
        totalOffers += 1;
        if (o.finalPlacement && o.finalPlacement.status === "ACTIVE") {
          // Check date filter if present
          if (filters.startDate || filters.endDate) {
            const pDate = o.finalPlacement.placementDate;
            if (filters.startDate && pDate < filters.startDate) continue;
            if (filters.endDate && pDate > filters.endDate) continue;
          }

          activePlacements += 1;
          if (o.package !== null && o.package !== undefined) {
            placedPackages.push(Number(o.package));
          }
        }
      }
    }

    let avgPkg = null;
    let maxPkg = null;
    let minPkg = null;

    if (placedPackages.length > 0) {
      const sum = placedPackages.reduce((acc, val) => acc + val, 0);
      avgPkg = Number((sum / placedPackages.length).toFixed(2));
      maxPkg = Number(Math.max(...placedPackages).toFixed(2));
      minPkg = Number(Math.min(...placedPackages).toFixed(2));
    }

    return {
      companyId: c.id,
      companyName: c.name,
      totalDrives,
      totalApplications,
      uniqueApplicants: applicantSet.size,
      totalOffers,
      activePlacements,
      averagePackageLPA: avgPkg,
      highestPackageLPA: maxPkg,
      lowestPackageLPA: minPkg
    };
  });

  companyReports.sort((a, b) => b.activePlacements - a.activePlacements || a.companyName.localeCompare(b.companyName));

  if (query.format === "csv") {
    const headers = [
      "Company Name",
      "Total Drives",
      "Total Applications",
      "Unique Applicants",
      "Total Offers",
      "Active Placements",
      "Average Package (LPA)",
      "Highest Package (LPA)",
      "Lowest Package (LPA)"
    ];
    const rows = companyReports.map((c) => [
      c.companyName,
      c.totalDrives,
      c.totalApplications,
      c.uniqueApplicants,
      c.totalOffers,
      c.activePlacements,
      c.averagePackageLPA !== null ? c.averagePackageLPA : "N/A",
      c.highestPackageLPA !== null ? c.highestPackageLPA : "N/A",
      c.lowestPackageLPA !== null ? c.lowestPackageLPA : "N/A"
    ]);
    return {
      isCSV: true,
      filename: "company_hiring_analytics",
      content: toCSV(headers, rows)
    };
  }

  return {
    totalCompanies: companyReports.length,
    companies: companyReports
  };
}

/**
 * 5. Drive-Wise Analytics
 * Returns metrics per recruitment drive: applications, unique applicants,
 * shortlisted counts, recruitment rounds, offers, and final placements.
 */
async function getDriveAnalytics(query = {}) {
  const filters = parseFilters(query);

  const driveWhere = {};
  if (filters.driveId) driveWhere.id = filters.driveId;
  if (filters.companyId) driveWhere.companyId = filters.companyId;
  if (query.status && typeof query.status === "string" && query.status.trim()) {
    driveWhere.status = query.status.trim().toUpperCase();
  }

  const drives = await prisma.placementDrive.findMany({
    where: driveWhere,
    include: {
      company: {
        select: { id: true, name: true }
      },
      applications: {
        where: { status: "APPLIED" },
        select: { studentId: true }
      },
      shortlists: {
        where: { status: "PUBLISHED" },
        include: {
          students: { select: { studentId: true } }
        }
      },
      rounds: {
        select: { id: true }
      },
      placementOffers: {
        include: {
          finalPlacement: { select: { status: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const driveMetrics = drives.map((d) => {
    const totalApps = d.applications.length;
    const uniqueApplicants = new Set(d.applications.map((a) => a.studentId)).size;

    // Union of students in published shortlists
    const shortlistedSet = new Set();
    for (const sh of d.shortlists) {
      for (const s of sh.students) {
        shortlistedSet.add(s.studentId);
      }
    }

    const totalOffers = d.placementOffers.length;
    const activePlacements = d.placementOffers.filter(
      (o) => o.finalPlacement && o.finalPlacement.status === "ACTIVE"
    ).length;

    return {
      driveId: d.id,
      companyId: d.company.id,
      companyName: d.company.name,
      jobRole: d.jobRole,
      packageLPA: d.package !== null ? Number(d.package) : null,
      status: d.status,
      applicationDeadline: d.applicationDeadline,
      openings: d.openings,
      totalApplications: totalApps,
      uniqueApplicants,
      shortlistedCount: shortlistedSet.size,
      totalRounds: d.rounds.length,
      totalOffers,
      activePlacements
    };
  });

  if (query.format === "csv") {
    const headers = [
      "Drive ID",
      "Company",
      "Job Role",
      "Package (LPA)",
      "Status",
      "Deadline",
      "Openings",
      "Applications",
      "Unique Applicants",
      "Shortlisted Students",
      "Rounds",
      "Offers Issued",
      "Active Placements"
    ];
    const rows = driveMetrics.map((d) => [
      d.driveId,
      d.companyName,
      d.jobRole,
      d.packageLPA !== null ? d.packageLPA : "N/A",
      d.status,
      d.applicationDeadline.toISOString(),
      d.openings,
      d.totalApplications,
      d.uniqueApplicants,
      d.shortlistedCount,
      d.totalRounds,
      d.totalOffers,
      d.activePlacements
    ]);
    return {
      isCSV: true,
      filename: "drive_placement_analytics",
      content: toCSV(headers, rows)
    };
  }

  return {
    totalDrives: driveMetrics.length,
    drives: driveMetrics
  };
}

/**
 * 6. Recruitment Funnel Analytics
 * Summarizes progression of unique candidate cohorts across the 7 recruitment phases:
 * Eligible -> Applied -> Shortlisted -> Round Passed -> Offer Extended -> Offer Accepted -> Final Placement
 * Supports optional driveId filter for drive-specific funnel or overall college-wide.
 */
async function getRecruitmentFunnel(query = {}) {
  const filters = parseFilters(query);

  const driveFilter = filters.driveId ? { driveId: filters.driveId } : {};

  // 1. Eligible Students
  const eligibleGroup = await prisma.driveEligibility.findMany({
    where: {
      eligible: true,
      ...driveFilter
    },
    distinct: ["studentId"],
    select: { studentId: true }
  });
  const eligibleStudents = eligibleGroup.length;

  // 2. Applied Students
  const appliedGroup = await prisma.application.findMany({
    where: {
      status: "APPLIED",
      ...driveFilter
    },
    distinct: ["studentId"],
    select: { studentId: true }
  });
  const appliedStudents = appliedGroup.length;

  // 3. Shortlisted Students (in published shortlists)
  const shortlistedGroup = await prisma.shortlistStudent.findMany({
    where: {
      shortlist: {
        status: "PUBLISHED",
        ...driveFilter
      }
    },
    distinct: ["studentId"],
    select: { studentId: true }
  });
  const shortlistedStudents = shortlistedGroup.length;

  // 4. Students who Passed at least one recruitment round
  const passedGroup = await prisma.roundResult.findMany({
    where: {
      result: "PASSED",
      round: driveFilter.driveId ? { driveId: driveFilter.driveId } : undefined
    },
    distinct: ["studentId"],
    select: { studentId: true }
  });
  const roundPassedStudents = passedGroup.length;

  // 5. Students who Received an Offer
  const offeredGroup = await prisma.placementOffer.findMany({
    where: driveFilter,
    distinct: ["studentId"],
    select: { studentId: true }
  });
  const offeredStudents = offeredGroup.length;

  // 6. Students who Accepted an Offer
  const acceptedGroup = await prisma.placementOffer.findMany({
    where: {
      status: "ACCEPTED",
      ...driveFilter
    },
    distinct: ["studentId"],
    select: { studentId: true }
  });
  const acceptedStudents = acceptedGroup.length;

  // 7. Active Final Placements
  const placementGroup = await prisma.finalPlacement.findMany({
    where: {
      status: "ACTIVE",
      offer: driveFilter.driveId ? { driveId: driveFilter.driveId } : undefined
    },
    distinct: ["studentId"],
    select: { studentId: true }
  });
  const finalPlacedStudents = placementGroup.length;

  const calcRate = (num, denom) =>
    denom > 0 ? Number(((num / denom) * 100).toFixed(2)) : 0;

  const stages = [
    {
      stage: "Eligible Candidates",
      uniqueStudents: eligibleStudents,
      conversionFromPreviousPercent: 100.0,
      conversionFromAppliedPercent: calcRate(eligibleStudents, appliedStudents)
    },
    {
      stage: "Applications Submitted",
      uniqueStudents: appliedStudents,
      conversionFromPreviousPercent: calcRate(appliedStudents, eligibleStudents),
      conversionFromAppliedPercent: 100.0
    },
    {
      stage: "Shortlisted Candidates",
      uniqueStudents: shortlistedStudents,
      conversionFromPreviousPercent: calcRate(shortlistedStudents, appliedStudents),
      conversionFromAppliedPercent: calcRate(shortlistedStudents, appliedStudents)
    },
    {
      stage: "Rounds Cleared",
      uniqueStudents: roundPassedStudents,
      conversionFromPreviousPercent: calcRate(roundPassedStudents, shortlistedStudents),
      conversionFromAppliedPercent: calcRate(roundPassedStudents, appliedStudents)
    },
    {
      stage: "Offers Extended",
      uniqueStudents: offeredStudents,
      conversionFromPreviousPercent: calcRate(offeredStudents, roundPassedStudents),
      conversionFromAppliedPercent: calcRate(offeredStudents, appliedStudents)
    },
    {
      stage: "Offers Accepted",
      uniqueStudents: acceptedStudents,
      conversionFromPreviousPercent: calcRate(acceptedStudents, offeredStudents),
      conversionFromAppliedPercent: calcRate(acceptedStudents, appliedStudents)
    },
    {
      stage: "Final Placements Confirmed",
      uniqueStudents: finalPlacedStudents,
      conversionFromPreviousPercent: calcRate(finalPlacedStudents, acceptedStudents),
      conversionFromAppliedPercent: calcRate(finalPlacedStudents, appliedStudents)
    }
  ];

  if (query.format === "csv") {
    const headers = [
      "Funnel Stage",
      "Unique Students",
      "Conversion From Previous (%)",
      "Conversion From Applied (%)"
    ];
    const rows = stages.map((s) => [
      s.stage,
      s.uniqueStudents,
      s.conversionFromPreviousPercent,
      s.conversionFromAppliedPercent
    ]);
    return {
      isCSV: true,
      filename: "recruitment_funnel_analytics",
      content: toCSV(headers, rows)
    };
  }

  return {
    scope: filters.driveId ? `Drive: ${filters.driveId}` : "College-Wide",
    stages,
    definitions: {
      countingRule: "Every stage counts distinct students who successfully reached that milestone. Conversions express student progression through the pipeline."
    }
  };
}

module.exports = {
  getOverview,
  getBranchAnalytics,
  getPackageAnalytics,
  getCompanyAnalytics,
  getDriveAnalytics,
  getRecruitmentFunnel
};
