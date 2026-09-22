import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import {
  demoPlacement,
  demoStudentDashboard,
  demoStudentProfile,
} from "../mocks/studentData";

export const studentService = {
  getMe: () =>
    MOCKS_ENABLED
      ? Promise.resolve(demoStudentProfile)
      : api.get("/students/me"),
  updateMe: (payload) => {
    if (MOCKS_ENABLED) {
      Object.assign(demoStudentProfile, payload);
      return Promise.resolve(demoStudentProfile);
    }
    return api.patch("/students/me", payload);
  },
  getDashboard: () =>
    MOCKS_ENABLED
      ? Promise.resolve(demoStudentDashboard)
      : api.get("/students/me/dashboard"),
  getPlacement: () =>
    MOCKS_ENABLED
      ? Promise.resolve(demoPlacement)
      : api.get("/students/me/placement"),
  uploadResume: (file) => {
    const body = new FormData();
    body.append("file", file);
    return MOCKS_ENABLED
      ? Promise.resolve({
          id: "resume-demo",
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        })
      : api.post("/students/me/resumes", body);
  },
  getResume: () =>
    MOCKS_ENABLED
      ? Promise.resolve(demoStudentProfile.resume)
      : api.get("/students/me/resume"),
};
