import { useEffect, useState } from "react";
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
  if (!profile && !error)
    return <LoadingScreen message="Loading your profile..." />;
  if (error) return <ErrorPanel message={error} />;
  const save = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const updated = await studentService.updateMe({
        phone,
        cgpa: Number(cgpa),
      });
      setProfile(updated);
      setMessage("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Your account</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          My profile
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Academic records are controlled by the placement cell.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Personal and academic details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input label="Full name" value={profile.name} disabled />
          <Input label="College email" value={profile.email} disabled />
          <Input label="PRN" value={profile.prn} disabled />
          <Input label="Roll number" value={profile.rollNumber} disabled />
          <Input label="Branch" value={profile.branch} disabled />
          <Input label="Year" value={profile.year} disabled />
          <Input
            label="Phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <Input
            label="CGPA"
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={cgpa}
            onChange={(event) => setCgpa(event.target.value)}
          />
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
          <Input label="Backlogs" value={profile.backlogs} disabled />
          <div className="md:col-span-2">
            <p className="text-xs text-surface-500">
              Locked academic fields can only be changed by authorized backend
              workflows.
            </p>
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button onClick={save} isLoading={isSaving}>
              Save changes
            </Button>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
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
