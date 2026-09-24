import { Link } from "react-router-dom";

export default function AuthShell({ eyebrow, title, description, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-50 p-4">
      <section className="w-full max-w-md rounded-lg border border-surface-200 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/login" className="text-sm font-semibold text-primary-600">
          Placement Cell
        </Link>
        <div className="mb-6 mt-6">
          <p className="text-sm font-medium text-primary-600">{eyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold text-surface-900">
            {title}
          </h1>
          <p className="mt-1 text-sm leading-6 text-surface-500">
            {description}
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}
