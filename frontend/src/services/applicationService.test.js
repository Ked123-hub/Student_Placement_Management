import { beforeEach, describe, expect, it } from "vitest";
import { applicationService } from "./applicationService";
import { demoApplications } from "../mocks/studentData";

describe("applicationService mock behavior", () => {
  beforeEach(() => {
    demoApplications.splice(2);
    demoApplications[0].status = "SHORTLISTED";
    demoApplications[1].status = "REJECTED";
  });

  it("rejects duplicate applications with a business error", async () => {
    await expect(applicationService.apply("drive-1")).rejects.toMatchObject({
      code: "ALREADY_APPLIED",
    });
  });

  it("persists a valid withdrawal", async () => {
    const application = await applicationService.apply("drive-new");
    const result = await applicationService.withdraw(application.id);
    expect(result.status).toBe("WITHDRAWN");
  });
});
