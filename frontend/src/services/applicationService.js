import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import { demoApplications, demoProgress } from "../mocks/studentData";

export const applicationService = {
  apply: (driveId) =>
    MOCKS_ENABLED
      ? Promise.resolve({
          id: `application-${Date.now()}`,
          driveId,
          status: "APPLIED",
        })
      : api.post("/applications", { driveId }),
  listMine: (params = {}) =>
    MOCKS_ENABLED
      ? Promise.resolve({
          items: demoApplications,
          pagination: { page: 1, limit: 20, total: demoApplications.length },
        })
      : api.get(`/applications/me${toQueryString(params)}`),
  withdraw: (applicationId) =>
    MOCKS_ENABLED
      ? Promise.resolve({ id: applicationId, status: "WITHDRAWN" })
      : api.patch(`/applications/${applicationId}/withdraw`),
  getProgress: (applicationId) =>
    MOCKS_ENABLED
      ? Promise.resolve({ ...demoProgress, applicationId })
      : api.get(`/applications/${applicationId}/progress`),
  admin: {
    recordFinalResult: (applicationId, result) =>
      api.post(`/admin/applications/${applicationId}/final-result`, { result }),
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
