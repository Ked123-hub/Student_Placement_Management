import { ArrowLeft, Home, LockKeyhole, SearchX, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";

const statusContent = {
  notFound: {
    icon: SearchX,
    title: "Page not found",
    message: "The page you requested does not exist or may have moved.",
  },
  unauthorized: {
    icon: LockKeyhole,
    title: "Access restricted",
    message: "Your account does not have permission to view this page.",
  },
  network: {
    icon: WifiOff,
    title: "Connection problem",
    message:
      "We could not reach the service. Check your connection and try again.",
  },
};

export default function StatusPage({ type = "notFound" }) {
  const navigate = useNavigate();
  const content = statusContent[type] ?? statusContent.notFound;
  const Icon = content.icon;

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-md rounded-lg border border-surface-200 bg-white p-8 text-center shadow-sm">
        <Icon className="mx-auto text-primary-600" size={34} />
        <h1 className="mt-4 text-xl font-semibold text-surface-900">
          {content.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-surface-500">
          {content.message}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} />
            Go back
          </Button>
          <Button onClick={() => navigate("/")}>
            <Home size={16} />
            Go home
          </Button>
        </div>
      </section>
    </main>
  );
}
