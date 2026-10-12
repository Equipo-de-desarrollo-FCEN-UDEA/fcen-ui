import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Briefcase, Building2, MonitorSmartphone } from "lucide-react";
import { AppShell, Footer, PageHeader } from "./Layout";
import { TopBar } from "./TopBar";
import { UserMenu } from "./UserMenu";

const capacities = [
  { value: "director", label: "Director", detail: "Instituto de Física", icon: Building2 },
  { value: "professor", label: "Profesor", icon: Briefcase },
];

describe("UserMenu", () => {
  it("marks the active capacity and changes it", async () => {
    const onChange = vi.fn();
    const onSessions = vi.fn();
    render(
      <UserMenu
        name="Andrés Ríos"
        username="andres.rios"
        options={capacities}
        value="director"
        onChange={onChange}
        links={[{ label: "Mis sesiones", icon: MonitorSmartphone, onClick: onSessions }]}
      />,
    );

    expect(screen.getByRole("group", { name: "Calidad activa" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Director/ })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: /Profesor/ }));
    await userEvent.click(screen.getByRole("button", { name: "Mis sesiones" }));

    expect(onChange).toHaveBeenCalledWith("professor");
    expect(onSessions).toHaveBeenCalledOnce();
  });

  it("renders only the person without options or links", () => {
    render(<UserMenu name="Juan Giraldo" />);

    expect(screen.getByText("Juan Giraldo")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("ignores changes without a handler", async () => {
    render(<UserMenu name="Juan Giraldo" options={capacities} />);

    await userEvent.click(screen.getByRole("button", { name: /Profesor/ }));

    expect(screen.getByRole("button", { name: /Profesor/ })).toHaveAttribute("aria-pressed", "false");
  });
});

describe("TopBar", () => {
  it("opens the user menu and closes it from inside, outside and with Escape", async () => {
    render(
      <>
        <TopBar
          name="Andrés Ríos"
          roleLabel="Director · Instituto de Física"
          userMenu={(close) => (
            <button type="button" onClick={close}>
              Elegir
            </button>
          )}
        />
        <p>Fuera</p>
      </>,
    );
    const trigger = screen.getByRole("button", { name: /Andrés Ríos/ });

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(screen.getByRole("button", { name: "Elegir" }));
    expect(screen.queryByRole("button", { name: "Elegir" })).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByText("Fuera"));
    expect(screen.queryByRole("button", { name: "Elegir" })).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await userEvent.keyboard("a");
    expect(screen.getByRole("button", { name: "Elegir" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("button", { name: "Elegir" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(screen.queryByRole("button", { name: "Elegir" })).not.toBeInTheDocument();
  });

  it("toggles the theme and signs out", async () => {
    const onToggleTheme = vi.fn();
    const onSignOut = vi.fn();
    const { rerender } = render(<TopBar name="Juan Giraldo" onToggleTheme={onToggleTheme} onSignOut={onSignOut} />);

    await userEvent.click(screen.getByRole("button", { name: "Claro" }));
    await userEvent.click(screen.getByRole("button", { name: "Salir" }));
    expect(onToggleTheme).toHaveBeenCalledOnce();
    expect(onSignOut).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Juan Giraldo/ })).toBeDisabled();

    rerender(<TopBar name="Juan Giraldo" theme="dark" onToggleTheme={onToggleTheme} onSignOut={onSignOut} signingOut />);
    expect(screen.getByRole("button", { name: "Oscuro" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Saliendo/ })).toBeDisabled();
  });
});

describe("Layout", () => {
  it("renders the shell with its header, content and footer", () => {
    render(
      <AppShell topBar={<TopBar name="Juan Giraldo" />}>
        <PageHeader title="Mis comisiones" subtitle="Solicitudes de comisión de servicio" actions={<button type="button">Nueva</button>} />
      </AppShell>,
    );

    expect(screen.getByRole("heading", { name: "Mis comisiones", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Solicitudes de comisión de servicio")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent(`© ${new Date().getFullYear()} Equipo de desarrollo`);
  });

  it("accepts a custom footer and a header without subtitle or actions", () => {
    render(
      <AppShell topBar={null} footer={<Footer text="SIGA" year={2026} />}>
        <PageHeader title="Inicio" />
      </AppShell>,
    );

    expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2026 SIGA");
  });
});
