import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stamp } from "lucide-react";
import { Modal, type ModalIntent } from "./Modal";

describe("Modal", () => {
  it("renders nothing while closed", () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Aprobar comisión" />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it.each<ModalIntent>(["neutral", "success", "warning", "danger"])("renders the %s intent", (intent) => {
    render(<Modal isOpen onClose={vi.fn()} title="Aprobar comisión" intent={intent} size="lg" />);

    expect(screen.getByRole("dialog", { name: "Aprobar comisión" })).toBeInTheDocument();
  });

  it("describes the dialog, renders the body and runs its actions", async () => {
    const onApprove = vi.fn();
    render(
      <Modal
        isOpen
        onClose={vi.fn()}
        title="Aprobar comisión"
        description="Se asigna el número de resolución al confirmar."
        icon={Stamp}
        actions={[
          { label: "Cancelar", variant: "outline" },
          { label: "Aprobar", onClick: onApprove },
        ]}
      >
        <input aria-label="Fecha" />
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleDescription("Se asigna el número de resolución al confirmar.");
    expect(screen.getByRole("textbox", { name: "Fecha" })).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Aprobar" }));

    expect(onApprove).toHaveBeenCalledOnce();
  });

  it("focuses the first action when there is no body", () => {
    render(<Modal isOpen onClose={vi.fn()} title="Eliminar comisión" actions={[{ label: "Cancelar" }]} />);

    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
  });

  it("focuses the panel when only the close button exists", () => {
    render(<Modal isOpen onClose={vi.fn()} title="Detalle" />);

    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("closes with the close button, Escape and the backdrop", async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Cambiar rol" actions={[{ label: "Cambiar" }]} />);

    await userEvent.click(screen.getByRole("button", { name: "Cerrar" }));
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByTestId("modal-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("can ignore backdrop clicks", async () => {
    const onClose = vi.fn();
    render(<Modal isOpen onClose={onClose} title="Cambiar rol" closeOnBackdropClick={false} />);

    await userEvent.click(screen.getByTestId("modal-backdrop"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("traps the focus inside the panel", async () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Cambiar rol" actions={[{ label: "Cancelar" }, { label: "Cambiar" }]} />,
    );
    const close = screen.getByRole("button", { name: "Cerrar" });
    const lastAction = screen.getByRole("button", { name: "Cambiar" });

    lastAction.focus();
    await userEvent.tab();
    expect(close).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(lastAction).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();

    await userEvent.keyboard("a");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("locks the page scroll and restores the focus when it closes", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(<Modal isOpen onClose={vi.fn()} title="Cambiar rol" />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<Modal isOpen={false} onClose={vi.fn()} title="Cambiar rol" />);
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
