import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileText, Plane, Plus, Send } from "lucide-react";
import { AnimatedCount } from "../atoms/AnimatedCount";
import { HeroNavTile } from "./HeroNavTile";
import { NavTile } from "./NavTile";
import { StatusTile } from "./StatusTile";

function mockReducedMotion(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
}

describe("NavTile and HeroNavTile", () => {
  it("navigate on click and show their detail", async () => {
    const onMine = vi.fn();
    const onNew = vi.fn();
    render(
      <>
        <NavTile label="Mis comisiones" icon={FileText} detail="2 en revisión" onClick={onMine} order={1} />
        <HeroNavTile label="Nueva comisión" icon={Plus} watermark={Plane} detail="Lista para solicitar" onClick={onNew} />
      </>,
    );

    await userEvent.click(screen.getByRole("button", { name: /Mis comisiones/ }));
    await userEvent.click(screen.getByRole("button", { name: /Nueva comisión/ }));

    expect(onMine).toHaveBeenCalledOnce();
    expect(onNew).toHaveBeenCalledOnce();
    expect(screen.getByText("2 en revisión")).toBeInTheDocument();
    expect(screen.getByText("Lista para solicitar")).toBeInTheDocument();
  });

  it("render without detail", () => {
    render(
      <>
        <NavTile label="Historial" icon={FileText} onClick={vi.fn()} />
        <HeroNavTile label="Nueva" icon={Plus} watermark={Plane} onClick={vi.fn()} />
      </>,
    );

    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});

describe("StatusTile and AnimatedCount", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the final count at once when motion is reduced", () => {
    mockReducedMotion(true);
    render(<StatusTile label="Solicitadas" count={1234} tone="info" icon={Send} />);

    expect(screen.getByText("1.234")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Solicitadas/ })).toBeDisabled();
  });

  it("counts up to the value and filters when clicked", async () => {
    mockReducedMotion(false);
    let frame: FrameRequestCallback = () => undefined;
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frame = callback;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    const onClick = vi.fn();
    render(<StatusTile label="Aprobadas" count={12} tone="success" icon={Send} onClick={onClick} selected />);

    expect(screen.getByText("0")).toBeInTheDocument();
    act(() => frame(performance.now() + 10_000));
    expect(screen.getByText("12")).toBeInTheDocument();

    const tile = screen.getByRole("button", { name: /Aprobadas/ });
    expect(tile).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(tile);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps ticking until the animation ends", () => {
    mockReducedMotion(false);
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    render(<AnimatedCount value={100} />);

    act(() => frames[0](performance.now()));

    expect(frames.length).toBeGreaterThan(1);
  });

  it("treats a missing matchMedia as reduced motion", () => {
    vi.stubGlobal("matchMedia", undefined);
    render(<AnimatedCount value={7} />);

    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
