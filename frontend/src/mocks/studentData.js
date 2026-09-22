import { demoDrives } from "./tpoData";

export const demoStudentProfile = {
  id: "student-1",
  name: "Aarav Mehta",
  rollNumber: "21",
  prn: "202300121",
  email: "aarav@college.edu",
  phone: "9876543210",
  branch: "Computer Engineering",
  year: 4,
  cgpa: 8.7,
  percentage10th: 91.4,
  percentage12th: 87.6,
  percentageDiploma: null,
  backlogs: 0,
  resume: {
    id: "resume-1",
    fileName: "Aarav_Mehta_Resume.pdf",
    uploadedAt: "2026-09-18T10:00:00Z",
  },
};

export const demoStudentDashboard = {
  placementStatus: "UNPLACED",
  activeDrives: 2,
  applications: 3,
  shortlisted: 1,
  selected: 0,
  recentNotifications: [],
};

export const demoApplications = [
  {
    id: "application-1",
    driveId: "drive-1",
    companyName: "Northstar Systems",
    jobRole: "Software Engineer",
    package: 12.5,
    status: "SHORTLISTED",
    appliedAt: "2026-09-20T12:00:00Z",
  },
  {
    id: "application-2",
    driveId: "drive-3",
    companyName: "Northstar Systems",
    jobRole: "QA Engineer",
    package: 8.5,
    status: "REJECTED",
    appliedAt: "2026-09-12T09:30:00Z",
  },
];

export const demoNotifications = [
  {
    id: "notification-1",
    title: "Technical interview shortlist",
    message:
      "You have been shortlisted for the Northstar Systems technical interview.",
    type: "SHORTLIST",
    read: false,
    createdAt: "2026-09-22T10:30:00Z",
  },
  {
    id: "notification-2",
    title: "New placement drive",
    message: "Vertex Labs has opened a new Data Analyst opportunity.",
    type: "DRIVE",
    read: false,
    createdAt: "2026-09-21T08:00:00Z",
  },
  {
    id: "notification-3",
    title: "Application update",
    message:
      "Your QA Engineer application was not selected for the next round.",
    type: "RESULT",
    read: true,
    createdAt: "2026-09-19T14:15:00Z",
  },
];

export const demoProgress = {
  applicationId: "application-1",
  companyName: "Northstar Systems",
  currentStatus: "IN_PROGRESS",
  currentRound: { id: "round-1", name: "Technical Interview" },
  rounds: [
    { name: "Online Assessment", status: "PASSED" },
    { name: "Technical Interview", status: "UPCOMING" },
    { name: "HR Interview", status: "UPCOMING" },
  ],
};

export const demoPlacement = { status: "UNPLACED", placement: null };

export function getStudentDrives() {
  return demoDrives
    .filter((drive) => drive.status === "OPEN")
    .map((drive) => ({
      ...drive,
      eligibilityStatus: drive.id === "drive-1" ? "ELIGIBLE" : "NOT_ELIGIBLE",
      applicationStatus: drive.id === "drive-1" ? "APPLIED" : null,
    }));
}
