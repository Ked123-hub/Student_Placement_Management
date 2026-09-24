import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authService } from "../../services/authService";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    prn: "",
    email: "",
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
      return setError("Password must contain at least 8 characters.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    setError("");
    setIsSubmitting(true);
    try {
      await authService.register(form);
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AuthShell
      eyebrow="Student registration"
      title="Create your account"
      description="Verify your college email to access the placement portal."
    >
      <form className="space-y-4" onSubmit={submit}>
        <Input label="PRN" value={form.prn} onChange={update("prn")} required />
        <Input
          label="College email"
          type="email"
          value={form.email}
          onChange={update("email")}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button className="w-full" type="submit" isLoading={isSubmitting}>
          Continue to verification
        </Button>
        <p className="text-center text-sm text-surface-500">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
