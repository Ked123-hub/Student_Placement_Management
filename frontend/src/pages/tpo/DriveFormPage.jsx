import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { EligibilityBuilder } from "../../components/ui/EligibilityBuilder";
import { Input } from "../../components/ui/Input";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { adminService } from "../../services/adminService";
import { driveService } from "../../services/driveService";
import DriveOperationsPanel from "./DriveOperationsPanel";

const emptyForm = {
  companyId: "",
  jobRole: "",
  package: "",
  internshipStipend: "",
  location: "",
  joiningDate: "",
  openings: "",
  applicationDeadline: "",
  jobDescription: "",
  requiredSkills: "",
  selectionProcess: "",
  criteria: [],
};

export default function DriveFormPage() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const isNew = !driveId || driveId === "new";
  const [form, setForm] = useState(emptyForm);
  const [companies, setCompanies] = useState([]);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      adminService.listCompanies(),
      isNew ? Promise.resolve(null) : driveService.admin.getById(driveId),
    ])
      .then(([companyResponse, drive]) => {
        setCompanies(companyResponse.items);
        if (drive) setForm(toForm(drive));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [driveId, isNew]);

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setIsSaving(true);
    setError("");

    const payload = {
      ...form,
      package: Number(form.package),
      internshipStipend: form.internshipStipend
        ? Number(form.internshipStipend)
        : null,
      openings: Number(form.openings),
      requiredSkills: splitValues(form.requiredSkills),
      selectionProcess: splitValues(form.selectionProcess),
    };

    try {
      const saved = isNew
        ? await driveService.admin.create(payload)
        : await driveService.admin.update(driveId, payload);

      if (isNew && saved.id) {
        await Promise.all(
          form.criteria.map((criterion) =>
            driveService.admin.addEligibilityCriterion(saved.id, criterion),
          ),
        );
        navigate(`/tpo/drives/${saved.id}`, { replace: true });
      } else {
        setForm(toForm({ ...form, ...saved }));
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const calculate = async () => {
    try {
      setEligibilityResult(
        await driveService.admin.calculateEligibility(driveId),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const finalize = async () => {
    try {
      setEligibilityResult(
        await driveService.admin.finalizeEligibility(driveId),
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const runAction = async (action) => {
    try {
      await action(driveId);
      navigate("/tpo/drives");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  if (isLoading) return <LoadingScreen message="Loading drive..." />;
  if (error && !form.jobRole) {
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/tpo/drives")}
        className="inline-flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-900"
      >
        <ArrowLeft size={16} />
        Back to drives
      </button>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary-600">
            {isNew ? "New opportunity" : "Drive configuration"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-surface-900">
            {isNew ? "Create placement drive" : form.jobRole}
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Configure the opportunity before publishing it to students.
          </p>
        </div>
        <Button onClick={save} isLoading={isSaving}>
          <Save size={17} />
          Save draft
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drive details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Company"
                value={form.companyId}
                onChange={(event) => update("companyId", event.target.value)}
                options={companies.map((company) => ({
                  value: company.id,
                  label: company.name,
                }))}
                placeholder="Select company"
              />
              <Input
                label="Job role"
                value={form.jobRole}
                onChange={(event) => update("jobRole", event.target.value)}
                placeholder="Software Engineer"
              />
              <Input
                label="Package (LPA)"
                type="number"
                min="0"
                step="0.1"
                value={form.package}
                onChange={(event) => update("package", event.target.value)}
              />
              <Input
                label="Internship stipend"
                type="number"
                min="0"
                value={form.internshipStipend}
                onChange={(event) =>
                  update("internshipStipend", event.target.value)
                }
              />
              <Input
                label="Location"
                value={form.location}
                onChange={(event) => update("location", event.target.value)}
              />
              <Input
                label="Openings"
                type="number"
                min="1"
                value={form.openings}
                onChange={(event) => update("openings", event.target.value)}
              />
              <Input
                label="Joining date"
                type="date"
                value={form.joiningDate}
                onChange={(event) => update("joiningDate", event.target.value)}
              />
              <Input
                label="Application deadline"
                type="datetime-local"
                value={form.applicationDeadline?.slice(0, 16)}
                onChange={(event) =>
                  update("applicationDeadline", event.target.value)
                }
              />
              <div className="sm:col-span-2">
                <Textarea
                  label="Job description"
                  value={form.jobDescription}
                  onChange={(event) =>
                    update("jobDescription", event.target.value)
                  }
                  rows={4}
                />
              </div>
              <Input
                label="Required skills"
                value={form.requiredSkills}
                onChange={(event) =>
                  update("requiredSkills", event.target.value)
                }
                placeholder="React, SQL, JavaScript"
              />
              <Input
                label="Selection process"
                value={form.selectionProcess}
                onChange={(event) =>
                  update("selectionProcess", event.target.value)
                }
                placeholder="Assessment, Interview, HR"
              />
            </CardContent>
          </Card>

          <EligibilityBuilder
            value={form.criteria}
            onChange={(criteria) => update("criteria", criteria)}
            disabled={form.eligibilityStatus === "FINALIZED"}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-surface-500">
                Calculate candidates after saving criteria, then finalize the
                snapshot before publishing.
              </p>
              {eligibilityResult && (
                <div className="rounded-lg bg-primary-50 p-4 text-sm text-primary-900">
                  <p className="font-semibold">
                    {eligibilityResult.status === "FINALIZED"
                      ? "Eligibility finalized"
                      : "Calculation complete"}
                  </p>
                  <p className="mt-1">
                    Eligible students:{" "}
                    {eligibilityResult.eligibleStudents ??
                      eligibilityResult.eligible}
                  </p>
                </div>
              )}
              <div className="grid gap-2">
                <Button
                  variant="secondary"
                  onClick={calculate}
                  disabled={isNew}
                >
                  <CheckCircle2 size={16} />
                  Calculate eligibility
                </Button>
                <Button variant="outline" onClick={finalize} disabled={isNew}>
                  <CheckCircle2 size={16} />
                  Finalize eligibility
                </Button>
              </div>
            </CardContent>
          </Card>

          {!isNew && (
            <Card>
              <CardHeader>
                <CardTitle>Drive actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button
                  onClick={() => runAction(driveService.admin.publish)}
                  disabled={form.status === "OPEN"}
                >
                  Publish drive
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => runAction(driveService.admin.close)}
                >
                  Close drive
                </Button>
                <Button
                  variant="danger"
                  onClick={() => runAction(driveService.admin.cancel)}
                >
                  Cancel drive
                </Button>
              </CardContent>
            </Card>
          )}

          {!isNew && <DriveOperationsPanel driveId={driveId} />}
        </div>
      </div>
    </div>
  );
}

function splitValues(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(drive) {
  return {
    ...emptyForm,
    ...drive,
    package: drive.package ?? "",
    internshipStipend: drive.internshipStipend ?? "",
    requiredSkills: Array.isArray(drive.requiredSkills)
      ? drive.requiredSkills.join(", ")
      : (drive.requiredSkills ?? ""),
    selectionProcess: Array.isArray(drive.selectionProcess)
      ? drive.selectionProcess.join(", ")
      : (drive.selectionProcess ?? ""),
    criteria: drive.criteria ?? [],
    applicationDeadline: drive.applicationDeadline ?? "",
  };
}
