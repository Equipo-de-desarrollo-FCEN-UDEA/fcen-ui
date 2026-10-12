import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "lucide-react";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { Textarea } from "./Textarea";

describe("Input", () => {
  it("accepts typing", async () => {
    render(<Input aria-label="Asunto" />);

    await userEvent.type(screen.getByRole("textbox", { name: "Asunto" }), "Congreso");

    expect(screen.getByRole("textbox")).toHaveValue("Congreso");
  });

  it("marks the error state as invalid", () => {
    render(<Input aria-label="Asunto" state="error" size="sm" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("is valid by default", () => {
    render(<Input aria-label="Asunto" />);

    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("makes room for both icons", () => {
    render(<Input aria-label="Buscar" leftIcon={<Search data-testid="left" />} rightIcon={<Search data-testid="right" />} />);

    expect(screen.getByRole("textbox")).toHaveClass("pl-10", "pr-10");
    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Input aria-label="Asunto" disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

describe("Textarea", () => {
  it("accepts typing and defaults to four rows", async () => {
    render(<Textarea aria-label="Justificación" />);

    const textarea = screen.getByRole("textbox", { name: "Justificación" });
    await userEvent.type(textarea, "Ponencia");

    expect(textarea).toHaveValue("Ponencia");
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("marks the error state as invalid", () => {
    render(<Textarea aria-label="Justificación" state="error" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Checkbox", () => {
  it("toggles from its label", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Archivadas" onChange={onChange} />);

    await userEvent.click(screen.getByText("Archivadas"));

    expect(screen.getByRole("checkbox", { name: "Archivadas" })).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("does not toggle when disabled", async () => {
    render(<Checkbox label="Archivadas" disabled />);

    await userEvent.click(screen.getByText("Archivadas"));

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders without a label", () => {
    render(<Checkbox aria-label="Seleccionar" defaultChecked />);

    expect(screen.getByRole("checkbox", { name: "Seleccionar" })).toBeChecked();
  });
});
