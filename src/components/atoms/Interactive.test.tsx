import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SegmentedToggle } from "./SegmentedToggle";
import { Tooltip } from "./Tooltip";

const views = [
  { value: "mine", label: "Mis comisiones" },
  { value: "review", label: "Por revisar" },
  { value: "all", label: "Todas" },
] as const;

describe("SegmentedToggle", () => {
  it("marks the active option and reports changes", async () => {
    const onChange = vi.fn();
    render(<SegmentedToggle label="Vista" value="review" options={[...views]} onChange={onChange} />);

    expect(screen.getByRole("button", { name: "Por revisar" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(screen.getByRole("button", { name: "Todas" }));

    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("moves the indicator under the active option", () => {
    const { container } = render(<SegmentedToggle value="all" options={[...views]} onChange={vi.fn()} />);

    const indicator = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(200%)");
  });

  it("keeps the indicator on the first option for an unknown value", () => {
    const { container } = render(<SegmentedToggle value={"other" as "all"} options={[...views]} onChange={vi.fn()} />);

    const indicator = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(0%)");
  });

  it("blocks every option when disabled", () => {
    render(<SegmentedToggle value="mine" options={[...views]} onChange={vi.fn()} disabled />);

    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});

function rect(top: number, left: number, width: number, height: number): DOMRect {
  return { top, left, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) };
}

function mockRects(trigger: DOMRect, tip: DOMRect) {
  const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect");
  spy.mockImplementation(function (this: HTMLElement) {
    return this.getAttribute("role") === "tooltip" ? tip : trigger;
  });
  return spy;
}

describe("Tooltip", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows on hover and hides on leave", async () => {
    render(
      <Tooltip content="Solo comisiones del instituto">
        <button type="button">Filtro</button>
      </Tooltip>,
    );

    const tooltip = screen.getByRole("tooltip", { hidden: true });
    expect(tooltip).toHaveAttribute("aria-hidden", "true");

    await userEvent.hover(screen.getByRole("button", { name: "Filtro" }));
    expect(tooltip).toHaveAttribute("aria-hidden", "false");
    expect(tooltip).toHaveClass("opacity-100");

    await userEvent.unhover(screen.getByRole("button", { name: "Filtro" }));
    expect(tooltip).toHaveClass("opacity-0");
  });

  it("shows on keyboard focus", async () => {
    render(
      <Tooltip content="Ayuda">
        <button type="button">Campo</button>
      </Tooltip>,
    );

    await userEvent.tab();

    expect(screen.getByRole("tooltip")).toHaveTextContent("Ayuda");
  });

  it("renders only the children when disabled or empty", () => {
    const { rerender } = render(
      <Tooltip content="Ayuda" disabled>
        <span>Texto</span>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();

    rerender(
      <Tooltip content="">
        <span>Texto</span>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });

  it.each([
    ["top", rect(300, 300, 100, 20), "top"],
    ["bottom", rect(300, 300, 100, 20), "bottom"],
    ["left", rect(300, 300, 100, 20), "left"],
    ["right", rect(300, 300, 100, 20), "right"],
    ["top", rect(2, 300, 100, 20), "bottom"],
    ["bottom", rect(window.innerHeight - 22, 300, 100, 20), "top"],
    ["left", rect(300, 2, 100, 20), "right"],
    ["right", rect(300, window.innerWidth - 102, 100, 20), "left"],
  ] as const)("placed %s it ends up %s when there is no room", (position, trigger, expected) => {
    mockRects(trigger, rect(0, 0, 120, 30));
    render(
      <Tooltip content="Ayuda" position={position}>
        <span>Texto</span>
      </Tooltip>,
    );

    fireEvent.mouseEnter(screen.getByText("Texto").parentElement as HTMLElement);

    expect(document.querySelector("[data-position]")).toHaveAttribute("data-position", expected);
  });

  it("follows the trigger on scroll and stops listening when hidden", () => {
    const spy = mockRects(rect(300, 300, 100, 20), rect(0, 0, 120, 30));
    render(
      <Tooltip content="Ayuda">
        <span>Texto</span>
      </Tooltip>,
    );
    const trigger = screen.getByText("Texto").parentElement as HTMLElement;

    fireEvent.mouseEnter(trigger);
    const callsWhileVisible = spy.mock.calls.length;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
    });
    expect(spy.mock.calls.length).toBeGreaterThan(callsWhileVisible);

    fireEvent.mouseLeave(trigger);
    const callsAfterHide = spy.mock.calls.length;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(spy.mock.calls.length).toBe(callsAfterHide);
  });
});
