import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import {
  demoPlacement,
  demoStudentDashboard,
  demoStudentProfile,
} from "../mocks/studentData";
import { mockError } from "../mocks/utils";

export const studentService = {
  getMe: () =>
    MOCKS_ENABLED
      ? Promise.resolve(demoStudentProfile)
      : api.get("/students/me"),
  updateMe: (payload) => {
    if (MOCKS_ENABLED) {
      if (payload.phone && !/^\+?[0-9 ()-]{10,15}$/.test(payload.phone)) {
        return mockError("INVALID_PHONE", "Enter a valid phone number.", 422);
      }
      if (
        payload.cgpa !== undefined &&
        (payload.cgpa < 0 || payload.cgpa > 10)
      ) {
        return mockError("INVALID_CGPA", "CGPA must be between 0 and 10.", 422);
      }
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
    if (MOCKS_ENABLED) {
      if (file.type !== "application/pdf")
        return mockError(
          "INVALID_FILE_TYPE",
          "Only PDF resumes are allowed.",
          422,
        );
      if (file.size > 5 * 1024 * 1024)
        return mockError(
          "FILE_TOO_LARGE",
          "Resume must be smaller than 5 MB.",
          422,
        );
      const resume = {
        id: "resume-demo",
        fileName: file.name,
        fileSizeBytes: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
      };
      demoStudentProfile.resume = resume;
      return Promise.resolve(resume);
    }
    return api.post("/students/me/resumes", body);
  },
  getResume: () =>
    MOCKS_ENABLED
      ? Promise.resolve(demoStudentProfile.resume)
      : api.get("/students/me/resume"),
};
