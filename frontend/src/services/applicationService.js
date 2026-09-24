import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import { demoApplications, demoProgress } from "../mocks/studentData";
import { mockError, paginate } from "../mocks/utils";

export const applicationService = {
  apply: (driveId) =>
    MOCKS_ENABLED
      ? applyMockApplication(driveId)
      : api.post("/applications", { driveId }),
  listMine: (params = {}) =>
    MOCKS_ENABLED
      ? Promise.resolve(paginate(demoApplications, params))
      : api.get(`/applications/me${toQueryString(params)}`),
  withdraw: (applicationId) =>
    MOCKS_ENABLED
      ? withdrawMockApplication(applicationId)
      : api.patch(`/applications/${applicationId}/withdraw`),
  getProgress: (applicationId) =>
    MOCKS_ENABLED
      ? Promise.resolve({ ...demoProgress, applicationId })
      : api.get(`/applications/${applicationId}/progress`),
  admin: {
    recordFinalResult: (applicationId, result) =>
      MOCKS_ENABLED
        ? Promise.resolve({ applicationId, finalResult: result })
        : api.post(`/admin/applications/${applicationId}/final-result`, {
            result,
          }),
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

function applyMockApplication(driveId) {
  if (demoApplications.some((application) => application.driveId === driveId)) {
    return mockError(
      "ALREADY_APPLIED",
      "You have already applied to this drive.",
    );
  }
  const application = {
    id: `application-${Date.now()}`,
    driveId,
    companyName: "Demo Company",
    jobRole: "Placement role",
    package: 10,
    status: "APPLIED",
    appliedAt: new Date().toISOString(),
  };
  demoApplications.push(application);
  return Promise.resolve(application);
}

function withdrawMockApplication(applicationId) {
  const application = demoApplications.find(
    (item) => item.id === applicationId,
  );
  if (!application)
    return mockError("APPLICATION_NOT_FOUND", "Application not found.", 404);
  if (!["APPLIED", "SHORTLISTED"].includes(application.status))
    return mockError(
      "WITHDRAWAL_NOT_ALLOWED",
      "This application can no longer be withdrawn.",
    );
  application.status = "WITHDRAWN";
  return Promise.resolve(application);
}
