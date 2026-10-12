import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast, type ToastTone } from "./Toast";
import { Toaster } from "./Toaster";
import { DEFAULT_TOAST_DURATION, getToasts, toast } from "./toastStore";

describe("Toast", () => {
  it.each<[ToastTone, "status" | "alert"]>([
    ["success", "status"],
    ["info", "status"],
    ["error", "alert"],
    ["warning", "alert"],
  ])("renders the %s tone with the %s role", (tone, role) => {
    render(<Toast tone={tone} title="Comisión enviada" message="Queda en Solicitada." />);

    expect(screen.getByRole(role)).toHaveTextContent("Comisión enviada");
    expect(screen.getByText("Queda en Solicitada.")).toBeInTheDocument();
  });

  it("renders without message, close button or timer by default", () => {
    render(<Toast title="Sesión por vencer" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("toast-timer")).not.toBeInTheDocument();
  });

  it("closes from its button and expires when the timer ends", async () => {
    const onClose = vi.fn();
    const onExpire = vi.fn();
    render(<Toast title="Guardado" duration={2500} onClose={onClose} onExpire={onExpire} />);

    await userEvent.click(screen.getByRole("button", { name: "Cerrar aviso" }));
    const timer = screen.getByTestId("toast-timer");
    fireEvent.animationEnd(timer);

    expect(onClose).toHaveBeenCalledOnce();
    expect(onExpire).toHaveBeenCalledOnce();
    expect(timer).toHaveStyle({ animationDuration: "2500ms" });
  });
});

describe("toast store and Toaster", () => {
  afterEach(() => {
    act(() => toast.clear());
  });

  it("shows every kind of toast with its options", () => {
    render(<Toaster />);

    act(() => {
      toast.success("Comisión enviada", { message: "Queda en Solicitada." });
      toast.error("No se pudo enviar");
      toast.warning("Faltan documentos");
      toast.info("Sesión por vencer", { duration: 9000 });
    });

    expect(screen.getByRole("region", { name: "Avisos" })).toBeInTheDocument();
    expect(screen.getByText("Comisión enviada")).toBeInTheDocument();
    expect(screen.getByText("Queda en Solicitada.")).toBeInTheDocument();
    expect(screen.getByText("No se pudo enviar")).toBeInTheDocument();
    expect(screen.getByText("Faltan documentos")).toBeInTheDocument();
    expect(getToasts().map((item) => item.duration)).toEqual([
      DEFAULT_TOAST_DURATION,
      DEFAULT_TOAST_DURATION,
      DEFAULT_TOAST_DURATION,
      9000,
    ]);
  });

  it("keeps only the four most recent toasts", () => {
    act(() => {
      for (const title of ["uno", "dos", "tres", "cuatro", "cinco"]) toast.info(title);
    });

    expect(getToasts().map((item) => item.title)).toEqual(["dos", "tres", "cuatro", "cinco"]);
  });

  it("removes a toast when it is closed or expires", async () => {
    render(<Toaster label="Notificaciones" />);
    act(() => {
      toast.success("Primero");
      toast.success("Segundo");
    });

    await userEvent.click(screen.getAllByRole("button", { name: "Cerrar aviso" })[0]);
    expect(screen.queryByText("Primero")).not.toBeInTheDocument();

    fireEvent.animationEnd(screen.getByTestId("toast-timer"));
    expect(screen.queryByText("Segundo")).not.toBeInTheDocument();
  });

  it("ignores dismissing an unknown toast", () => {
    let id = 0;
    act(() => {
      id = toast.info("Único");
    });
    const before = getToasts();

    act(() => toast.dismiss(id + 100));

    expect(getToasts()).toBe(before);
  });
});
