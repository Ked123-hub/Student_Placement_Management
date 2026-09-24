import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import {
  demoDrives,
  demoRecruitmentRounds,
  demoRoundParticipants,
  demoShortlistCandidates,
} from "../mocks/tpoData";
import { getStudentDrives } from "../mocks/studentData";
import { mockError, paginate } from "../mocks/utils";

export const driveService = {
  getCurrent: (params = {}) =>
    MOCKS_ENABLED
      ? Promise.resolve({
          items: getStudentDrives(),
          ...paginate(getStudentDrives(), params),
        })
      : api.get(`/drives/current${toQueryString(params)}`),
  getById: (driveId) =>
    MOCKS_ENABLED
      ? Promise.resolve(
          getStudentDrives().find((drive) => drive.id === driveId) ??
            demoDrives.find((drive) => drive.id === driveId),
        )
      : api.get(`/drives/${driveId}`),
  getRounds: (driveId) =>
    MOCKS_ENABLED
      ? Promise.resolve({ items: demoRecruitmentRounds })
      : api.get(`/drives/${driveId}/rounds`),
  admin: {
    list: (params = {}) =>
      MOCKS_ENABLED
        ? Promise.resolve({
            ...paginate(demoDrives, params),
          })
        : api.get(`/admin/drives${toQueryString(params)}`),
    getById: (driveId) =>
      MOCKS_ENABLED
        ? Promise.resolve(demoDrives.find((drive) => drive.id === driveId))
        : api.get(`/admin/drives/${driveId}`),
    create: (payload) =>
      MOCKS_ENABLED
        ? createMockDrive(payload)
        : api.post("/admin/drives", payload),
    update: (driveId, payload) =>
      MOCKS_ENABLED
        ? updateMockDrive(driveId, payload)
        : api.patch(`/admin/drives/${driveId}`, payload),
    publish: (driveId) =>
      MOCKS_ENABLED
        ? publishMockDrive(driveId)
        : api.post(`/admin/drives/${driveId}/publish`),
    close: (driveId) =>
      MOCKS_ENABLED
        ? updateMockDrive(driveId, { status: "CLOSED" })
        : api.post(`/admin/drives/${driveId}/close`),
    cancel: (driveId) =>
      MOCKS_ENABLED
        ? updateMockDrive(driveId, { status: "CANCELLED" })
        : api.post(`/admin/drives/${driveId}/cancel`),
    addEligibilityCriterion: (driveId, payload) =>
      MOCKS_ENABLED
        ? Promise.resolve({ id: driveId, ...payload })
        : api.post(`/admin/drives/${driveId}/eligibility-criteria`, payload),
    calculateEligibility: (driveId) =>
      MOCKS_ENABLED
        ? Promise.resolve({ eligible: 420, ineligible: 580, driveId })
        : api.post(`/admin/drives/${driveId}/eligibility/calculate`),
    finalizeEligibility: (driveId) =>
      MOCKS_ENABLED
        ? Promise.resolve({
            driveId,
            status: "FINALIZED",
            eligibleStudents: 420,
          })
        : api.post(`/admin/drives/${driveId}/eligibility/finalize`),
    calculateShortlist: (driveId, payload) =>
      MOCKS_ENABLED
        ? Promise.resolve({
            id: `shortlist-${driveId}`,
            processed: 186,
            valid: 92,
            invalid: 0,
            status: "DRAFT",
            criteria: payload.criteria,
            candidates: demoShortlistCandidates,
          })
        : api.post(`/admin/drives/${driveId}/shortlists/calculate`, payload),
    uploadCompanyShortlist: (driveId, file) => {
      const body = new FormData();
      body.append("file", file);
      return MOCKS_ENABLED
        ? Promise.resolve({
            processed: 100,
            valid: 92,
            invalid: 8,
            issues: [{ row: 12, prn: "202300999", code: "STUDENT_NOT_FOUND" }],
          })
        : api.post(`/admin/drives/${driveId}/shortlists/company-upload`, body);
    },
    publishShortlist: (shortlistId) =>
      MOCKS_ENABLED
        ? Promise.resolve({ id: shortlistId, status: "PUBLISHED" })
        : api.post(`/admin/shortlists/${shortlistId}/publish`),
    getShortlistCandidates: (driveId) =>
      MOCKS_ENABLED
        ? Promise.resolve({
            items: demoShortlistCandidates,
            shortlistId: `shortlist-${driveId}`,
            status: "DRAFT",
          })
        : api.get(`/admin/drives/${driveId}/shortlists/current`),
    createRound: (driveId, payload) =>
      MOCKS_ENABLED
        ? Promise.resolve({
            id: `round-${Date.now()}`,
            ...payload,
            status: "UPCOMING",
          })
        : api.post(`/admin/drives/${driveId}/rounds`, payload),
    getRoundParticipants: (roundId) =>
      MOCKS_ENABLED
        ? Promise.resolve({ items: demoRoundParticipants })
        : api.get(`/admin/rounds/${roundId}/participants`),
    getAttendance: (roundId) =>
      MOCKS_ENABLED
        ? Promise.resolve({ items: [] })
        : api.get(`/admin/rounds/${roundId}/attendance`),
    recordAttendance: (roundId, payload) =>
      MOCKS_ENABLED
        ? Promise.resolve({ roundId, ...payload })
        : api.post(`/admin/rounds/${roundId}/attendance`, payload),
    recordResults: (roundId, payload) =>
      MOCKS_ENABLED
        ? Promise.resolve({ roundId, ...payload })
        : api.post(`/admin/rounds/${roundId}/results`, payload),
  },
};

function toQueryString(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function createMockDrive(payload) {
  if (
    !payload.companyId ||
    !payload.jobRole ||
    !payload.package ||
    !payload.applicationDeadline
  ) {
    return mockError(
      "DRIVE_REQUIRED_FIELDS",
      "Company, role, package, and deadline are required.",
      422,
    );
  }
  const drive = {
    id: `drive-${Date.now()}`,
    ...payload,
    status: "DRAFT",
    eligibilityStatus: "NOT_CONFIGURED",
  };
  demoDrives.push(drive);
  return Promise.resolve(drive);
}

function publishMockDrive(driveId) {
  const drive = demoDrives.find((item) => item.id === driveId);
  if (!drive)
    return mockError("DRIVE_NOT_FOUND", "The drive could not be found.", 404);
  if (drive.eligibilityStatus !== "FINALIZED") {
    return mockError(
      "ELIGIBILITY_NOT_FINALIZED",
      "Finalize eligibility before publishing this drive.",
    );
  }
  return updateMockDrive(driveId, { status: "OPEN" });
}

function updateMockDrive(driveId, payload) {
  const drive = demoDrives.find((item) => item.id === driveId);
  if (drive) Object.assign(drive, payload);
  return Promise.resolve(drive ?? { id: driveId, ...payload });
}
