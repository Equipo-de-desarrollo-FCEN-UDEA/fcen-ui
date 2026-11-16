import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Briefcase, Building2, MonitorSmartphone } from "lucide-react";
import { EntityPickerModal } from "./EntityPickerModal";
import { AppShell, Footer, PageHeader } from "./Layout";
import { TopBar } from "./TopBar";
import { UserMenu } from "./UserMenu";

const capacities = [
  { value: "director", label: "Director", detail: "Instituto de Física", icon: Building2 },
  { value: "professor", label: "Profesor", icon: Briefcase },
];

describe("EntityPickerModal", () => {
  it("renders the filters, summary, errors and actions without fetching data", async () => {
    const onChoose = vi.fn();
    const onClose = vi.fn();
    render(
      <EntityPickerModal
        isOpen
        onClose={onClose}
        title="Elegir espacio"
        description="Elige un espacio disponible."
        filters={<label>Filtro <input /></label>}
        selectedSummary={<p>Espacio elegido</p>}
        hasError
        errorMessage="No fue posible cargar los espacios."
        selectedEntityId="room-1"
        chooseLabel="Elegir"
        onChoose={onChoose}
      >
        <p>Laboratorio 104</p>
      </EntityPickerModal>,
    );
    const dialog = screen.getByRole("dialog", { name: "Elegir espacio" });
    expect(within(dialog).getByRole("alert")).toHaveTextContent("No fue posible cargar los espacios.");
    expect(within(dialog).getByText("Laboratorio 104")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Cerrar" })).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Elegir" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));
    expect(onChoose).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders nothing while closed and hides choose until an entity is selected", () => {
    const { rerender } = render(
      <EntityPickerModal isOpen={false} onClose={vi.fn()} title="Elegir" chooseLabel="Elegir" onChoose={vi.fn()}>
        <p>Contenido</p>
      </EntityPickerModal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    rerender(
      <EntityPickerModal isOpen onClose={vi.fn()} title="Elegir" chooseLabel="Elegir" onChoose={vi.fn()}>
        <p>Contenido</p>
      </EntityPickerModal>,
    );
    expect(screen.getByRole("dialog", { name: "Elegir" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Elegir" })).not.toBeInTheDocument();
  });
});

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

describe("TopBar and UserMenu on narrow screens", () => {
  it("keep the buttons named and the menu inside the screen", () => {
    render(
      <>
        <TopBar name="Juan Giraldo" onToggleTheme={vi.fn()} onSignOut={vi.fn()} />
        <UserMenu name="Juan Giraldo" options={capacities} value="director" onChange={vi.fn()} />
      </>,
    );

    expect(screen.getByRole("button", { name: "Salir" })).toHaveClass("max-sm:[&_.truncate]:sr-only");
    expect(screen.getByText("Claro")).toHaveClass("max-sm:sr-only");
    expect(screen.getByText("Juan Giraldo", { selector: "div > div > span" }).closest(".w-80")).toHaveClass(
      "max-w-[calc(100vw-2rem)]",
    );
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
