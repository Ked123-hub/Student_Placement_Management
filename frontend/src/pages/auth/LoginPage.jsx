import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/useAuth";
import { DEMO_AUTH_ENABLED } from "../../config/env";
import AuthShell from "../../components/auth/AuthShell";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { user } = await login(form);
      const destination = location.state?.from?.pathname;
      navigate(destination || getHomePath(user.role), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      description="Use your college account to continue."
    >
      {DEMO_AUTH_ENABLED && (
        <div className="mt-4 rounded-lg bg-primary-50 p-3 text-xs text-primary-800">
          <p className="font-semibold">Temporary demo accounts</p>
          <p className="mt-1">Student: student@demo.local / demo123</p>
          <p>TPO: tpo@demo.local / demo123</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="College email"
          name="email"
          type="email"
          value={form.email}
          onChange={updateField}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={updateField}
          autoComplete="current-password"
          required
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button className="w-full" type="submit" isLoading={isSubmitting}>
          Sign in
        </Button>
        <p className="text-center text-sm text-surface-500">
          New student?{" "}
          <Link
            to="/register"
            className="font-medium text-primary-600 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function getHomePath(role) {
  return role === "TPO" ? "/tpo/dashboard" : "/student/dashboard";
}
