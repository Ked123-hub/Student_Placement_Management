import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../contexts/useAuth";
import { DEMO_AUTH_ENABLED } from "../../config/env";

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
    <main className="flex min-h-screen items-center justify-center bg-surface-50 p-4">
      <section className="w-full max-w-md rounded-2xl border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary-600">
            Placement Cell
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-surface-900">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Use your college account to continue.
          </p>

          {DEMO_AUTH_ENABLED && (
            <div className="mt-4 rounded-lg bg-primary-50 p-3 text-xs text-primary-800">
              <p className="font-semibold">Temporary demo accounts</p>
              <p className="mt-1">Student: student@demo.local / demo123</p>
              <p>TPO: tpo@demo.local / demo123</p>
            </div>
          )}
        </div>

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
        </form>
      </section>
    </main>
  );
}

function getHomePath(role) {
  return role === "TPO" ? "/tpo/dashboard" : "/student/dashboard";
}
