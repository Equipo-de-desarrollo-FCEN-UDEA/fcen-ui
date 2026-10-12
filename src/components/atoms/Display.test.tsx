import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { CodePill } from "./CodePill";
import { Label } from "./Label";
import { PingDot } from "./PingDot";
import { Spinner } from "./Spinner";
import { StatusBadge } from "./StatusBadge";
import type { Tone } from "../../theme/tones";

const allTones: Tone[] = ["info", "review", "warning", "success", "danger", "neutral"];

describe("StatusBadge", () => {
  it.each(allTones)("renders the %s tone", (tone) => {
    render(<StatusBadge label={tone} tone={tone} size="md" />);

    expect(screen.getByText(tone)).toBeInTheDocument();
  });

  it("falls back to a dash without a label", () => {
    render(<StatusBadge label="" />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("PingDot", () => {
  it("pulses by default", () => {
    render(<PingDot tone="success" />);

    expect(screen.getByTestId("ping-halo")).toBeInTheDocument();
  });

  it("can stay still", () => {
    render(<PingDot pulse={false} />);

    expect(screen.queryByTestId("ping-halo")).not.toBeInTheDocument();
  });
});

describe("Avatar", () => {
  it("shows the initials of the first and last word", () => {
    render(<Avatar name="ana maría gómez" />);

    expect(screen.getByRole("img", { name: "ana maría gómez" })).toHaveTextContent("AG");
  });

  it("shows one initial for a single word", () => {
    render(<Avatar name="Decanatura" size="sm" />);

    expect(screen.getByRole("img")).toHaveTextContent("D");
  });

  it("shows the empty state without a name", () => {
    render(<Avatar />);

    expect(screen.getByRole("img", { name: "Sin nombre" })).toHaveTextContent("—");
  });

  it("shows the empty state for a blank name", () => {
    render(<Avatar name="   " />);

    expect(screen.getByRole("img")).toHaveTextContent("—");
  });
});

describe("CodePill", () => {
  it("renders the code", () => {
    render(<CodePill code="C-0001-2026" />);

    expect(screen.getByText("C-0001-2026").tagName).toBe("CODE");
  });
});

describe("Chip", () => {
  it("renders without a remove button by default", () => {
    render(<Chip label="Física" />);

    expect(screen.getByText("Física")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onRemove from its button", async () => {
    const onRemove = vi.fn();
    render(<Chip label="Física" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole("button", { name: "Quitar Física" }));

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it("accepts a custom remove label", () => {
    render(<Chip label="Física" onRemove={vi.fn()} removeLabel="Quitar filtro" />);

    expect(screen.getByRole("button", { name: "Quitar filtro" })).toBeInTheDocument();
  });
});

describe("Label", () => {
  it("links to its field and marks it as required", () => {
    render(
      <>
        <Label text="Asunto" htmlFor="subject" required />
        <input id="subject" />
      </>,
    );

    expect(screen.getByLabelText(/Asunto/)).toHaveAttribute("id", "subject");
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("omits the mark when optional", () => {
    render(<Label text="Notas" />);

    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });
});

describe("Spinner", () => {
  it("announces loading with a custom label and size", () => {
    render(<Spinner label="Subiendo" size={24} />);

    const spinner = screen.getByRole("status", { name: "Subiendo" });
    expect(spinner).toHaveAttribute("width", "24");
  });
});
