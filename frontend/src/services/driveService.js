import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import { demoDrives } from "../mocks/tpoData";
import { getStudentDrives } from "../mocks/studentData";

export const driveService = {
  getCurrent: (params = {}) =>
    MOCKS_ENABLED
      ? Promise.resolve({
          items: getStudentDrives(),
          pagination: { page: 1, limit: 20, total: getStudentDrives().length },
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
      ? Promise.resolve({ items: [] })
      : api.get(`/drives/${driveId}/rounds`),
  admin: {
    list: (params = {}) =>
      MOCKS_ENABLED
        ? Promise.resolve({
            items: demoDrives,
            pagination: { page: 1, limit: 20, total: demoDrives.length },
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
        ? updateMockDrive(driveId, { status: "OPEN" })
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
    createRound: (driveId, payload) =>
      MOCKS_ENABLED
        ? Promise.resolve({
            id: `round-${Date.now()}`,
            ...payload,
            status: "UPCOMING",
          })
        : api.post(`/admin/drives/${driveId}/rounds`, payload),
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
  const drive = {
    id: `drive-${Date.now()}`,
    ...payload,
    status: "DRAFT",
    eligibilityStatus: "NOT_CONFIGURED",
  };
  demoDrives.push(drive);
  return Promise.resolve(drive);
}

function updateMockDrive(driveId, payload) {
  const drive = demoDrives.find((item) => item.id === driveId);
  if (drive) Object.assign(drive, payload);
  return Promise.resolve(drive ?? { id: driveId, ...payload });
}
