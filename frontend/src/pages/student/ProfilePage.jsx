import { useEffect, useState } from "react";
import { LockKeyhole, PencilLine, RotateCcw, Save } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { studentService } from "../../services/studentService";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    studentService
      .getMe()
      .then((data) => {
        setProfile(data);
        setPhone(data.phone ?? "");
        setCgpa(data.cgpa ?? "");
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const isDirty =
    profile &&
    (phone !== (profile.phone ?? "") ||
      String(cgpa) !== String(profile.cgpa ?? ""));

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  if (!profile && !error)
    return <LoadingScreen message="Loading your profile..." />;
  if (error && !profile) return <ErrorPanel message={error} />;

  const validate = () => {
    const nextErrors = {};
    if (!/^\+?[0-9 ()-]{10,15}$/.test(phone.trim()))
      nextErrors.phone = "Enter a valid phone number.";
    const numericCgpa = Number(cgpa);
    if (!Number.isFinite(numericCgpa) || numericCgpa < 0 || numericCgpa > 10)
      nextErrors.cgpa = "CGPA must be between 0 and 10.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const save = async () => {
    setMessage("");
    if (!validate()) return;
    setIsSaving(true);
    try {
      const updated = await studentService.updateMe({
        phone: phone.trim(),
        cgpa: Number(cgpa),
      });
      setProfile(updated);
      setPhone(updated.phone ?? "");
      setCgpa(updated.cgpa ?? "");
      setMessage("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setPhone(profile.phone ?? "");
    setCgpa(profile.cgpa ?? "");
    setErrors({});
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Your account</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          My profile
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Review your records and update the fields currently available to you.
        </p>
      </div>
      {error && (
        <p className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Editable details</CardTitle>
            <p className="mt-1 text-sm text-surface-500">
              These values are submitted to the backend for validation.
            </p>
          </div>
          <Badge variant="primary">
            <PencilLine size={13} />
            Editable
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            label="Phone"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((current) => ({ ...current, phone: "" }));
            }}
            error={errors.phone}
            placeholder="9876543210"
          />
          <Input
            label="CGPA"
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={cgpa}
            onChange={(event) => {
              setCgpa(event.target.value);
              setErrors((current) => ({ ...current, cgpa: "" }));
            }}
            error={errors.cgpa}
          />
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Button onClick={save} isLoading={isSaving} disabled={!isDirty}>
              <Save size={16} />
              Save changes
            </Button>
            <Button variant="ghost" onClick={reset} disabled={!isDirty}>
              <RotateCcw size={16} />
              Discard changes
            </Button>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Verified academic record</CardTitle>
            <p className="mt-1 text-sm text-surface-500">
              These fields are locked and cannot be changed from this form.
            </p>
          </div>
          <Badge>
            <LockKeyhole size={13} />
            Locked
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input label="Full name" value={profile.name} disabled />
          <Input label="College email" value={profile.email} disabled />
          <Input label="PRN" value={profile.prn} disabled />
          <Input label="Roll number" value={profile.rollNumber} disabled />
          <Input label="Branch" value={profile.branch} disabled />
          <Input label="Year" value={profile.year} disabled />
          <Input
            label="10th percentage"
            value={profile.percentage10th}
            disabled
          />
          <Input
            label="12th percentage"
            value={profile.percentage12th}
            disabled
          />
          <Input
            label="Diploma percentage"
            value={profile.percentageDiploma ?? "Not applicable"}
            disabled
          />
          <Input label="Backlogs" value={profile.backlogs} disabled />
          <div className="rounded-lg bg-surface-50 p-3 text-xs leading-5 text-surface-500 md:col-span-2">
            CGPA editing is controlled by the academic update window. The
            backend remains the source of truth even when a field appears
            editable here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorPanel({ message }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
      {message}
    </div>
  );
}
