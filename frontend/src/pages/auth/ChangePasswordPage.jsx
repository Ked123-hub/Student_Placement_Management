import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/useAuth";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, changePassword } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 8)
      return setError("New password must contain at least 8 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    setError("");
    setIsSubmitting(true);
    try {
      await changePassword(form);
      navigate(user?.role === "TPO" ? "/tpo/dashboard" : "/student/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AuthShell
      eyebrow="Account security"
      title="Change your password"
      description="Set a new password before continuing to the placement portal."
    >
      <form className="space-y-4" onSubmit={submit}>
        <Input
          label="Current password"
          type="password"
          value={form.currentPassword}
          onChange={update("currentPassword")}
          required
        />
        <Input
          label="New password"
          type="password"
          value={form.password}
          onChange={update("password")}
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button className="w-full" type="submit" isLoading={isSubmitting}>
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
