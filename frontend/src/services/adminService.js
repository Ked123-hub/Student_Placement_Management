import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import { demoCompanies, demoDashboard, demoStudents } from "../mocks/tpoData";
import { mockError, paginate } from "../mocks/utils";

export const adminService = {
  getDashboard: () =>
    MOCKS_ENABLED
      ? Promise.resolve(demoDashboard)
      : api.get("/admin/dashboard"),
  listStudents: (params = {}) =>
    MOCKS_ENABLED
      ? Promise.resolve(paginate(filterStudents(params), params))
      : api.get(`/admin/students${toQueryString(params)}`),
  listCompanies: (params = {}) =>
    MOCKS_ENABLED
      ? Promise.resolve(paginate(demoCompanies, params))
      : api.get(`/admin/companies${toQueryString(params)}`),
  createCompany: (payload) =>
    MOCKS_ENABLED
      ? createMockCompany(payload)
      : api.post("/admin/companies", payload),
  updateCompany: (companyId, payload) =>
    MOCKS_ENABLED
      ? updateMockCompany(companyId, payload)
      : api.patch(`/admin/companies/${companyId}`, payload),
  listPlacements: (params = {}) =>
    MOCKS_ENABLED
      ? Promise.resolve(paginate([], params))
      : api.get(`/admin/placements${toQueryString(params)}`),
};

function filterStudents(params) {
  const search = String(params.search ?? "").toLowerCase();

  return demoStudents.filter((student) => {
    const matchesSearch =
      !search ||
      `${student.name} ${student.prn}`.toLowerCase().includes(search);
    const matchesBranch = !params.branch || student.branch === params.branch;
    const matchesYear =
      !params.year || String(student.year) === String(params.year);
    const matchesPlacement =
      !params.placementStatus ||
      student.placementStatus === params.placementStatus;
    return matchesSearch && matchesBranch && matchesYear && matchesPlacement;
  });
}

function createMockCompany(payload) {
  if (!payload.name?.trim())
    return mockError("COMPANY_NAME_REQUIRED", "Company name is required.", 422);
  if (
    demoCompanies.some(
      (company) =>
        company.name.toLowerCase() === payload.name.trim().toLowerCase(),
    )
  ) {
    return mockError(
      "COMPANY_ALREADY_EXISTS",
      "A company with this name already exists.",
    );
  }
  const company = { id: `company-${Date.now()}`, ...payload, drives: 0 };
  demoCompanies.push(company);
  return Promise.resolve(company);
}

function updateMockCompany(companyId, payload) {
  const company = demoCompanies.find((item) => item.id === companyId);
  if (company) Object.assign(company, payload);
  return Promise.resolve(company ?? { id: companyId, ...payload });
}

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
