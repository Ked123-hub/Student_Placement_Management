import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { authService } from "../../services/authService";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = new URLSearchParams(location.search).get("email") ?? "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (!seconds) return undefined;
    const timer = window.setInterval(
      () => setSeconds((current) => current - 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [seconds]);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await authService.verifyOtp({ email, otp });
      if (!result.verified)
        throw new Error("The verification code is invalid.");
      navigate(`/change-password?email=${encodeURIComponent(email)}`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AuthShell
      eyebrow="Email verification"
      title="Verify your email"
      description={`Enter the six-digit code sent to ${email || "your college email"}.`}
    >
      <form className="space-y-4" onSubmit={submit}>
        <Input
          label="Verification code"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          required
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button
          className="w-full"
          type="submit"
          isLoading={isSubmitting}
          disabled={otp.length !== 6}
        >
          Verify email
        </Button>
        <div className="flex items-center justify-between text-sm text-surface-500">
          <span>
            {seconds
              ? `Resend available in ${seconds}s`
              : "You can request a new code"}
          </span>
          <button
            type="button"
            disabled={seconds > 0}
            onClick={() => setSeconds(30)}
            className="font-medium text-primary-600 disabled:opacity-40"
          >
            Resend code
          </button>
        </div>
        <p className="text-center text-sm text-surface-500">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
