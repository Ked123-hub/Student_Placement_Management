import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EligibilityBuilder } from "./EligibilityBuilder";

describe("EligibilityBuilder", () => {
  it("adds a criterion and exposes labelled controls", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EligibilityBuilder onChange={onChange} />);

    expect(screen.getByLabelText("Field")).toBeInTheDocument();
    expect(screen.getByLabelText("Operator")).toBeInTheDocument();
    expect(screen.getByLabelText("Value")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add criterion/i }));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toHaveLength(2);
  });

  it("does not remove the only criterion", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<EligibilityBuilder onChange={onChange} />);

    expect(
      screen.getByRole("button", { name: /remove eligibility criterion/i }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: /remove eligibility criterion/i }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
