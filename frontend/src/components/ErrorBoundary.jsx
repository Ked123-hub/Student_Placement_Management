import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-50 p-6">
        <section className="w-full max-w-md rounded-lg border border-surface-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto text-danger" size={32} />
          <h1 className="mt-4 text-xl font-semibold text-surface-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            The page encountered an unexpected error. You can try rendering it
            again.
          </p>
          <Button className="mt-6" onClick={this.handleReset}>
            <RefreshCw size={16} />
            Try again
          </Button>
        </section>
      </main>
    );
  }
}
