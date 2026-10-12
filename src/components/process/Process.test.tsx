import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileDrop, acceptsFile } from "./FileDrop";
import { FileItem } from "./FileItem";
import { Stepper, type StepperStep } from "./Stepper";
import { Timeline, TimelineItem } from "./TimelineItem";

function pdf(name = "carta.pdf", size = 1024) {
  const file = new File(["x"], name, { type: "application/pdf" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("Stepper", () => {
  const steps: StepperStep[] = [
    { label: "Solicitada", state: "done" },
    { label: "Visto bueno", state: "current" },
    { label: "Aprobada", state: "upcoming" },
    { label: "Finalizada", state: "upcoming" },
  ];

  it("marks the current step and numbers the upcoming ones", () => {
    render(<Stepper steps={steps} label="Estado" />);

    expect(screen.getByRole("list", { name: "Estado" })).toBeInTheDocument();
    expect(screen.getByText("Visto bueno").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("numbers the current step in the brand accent", () => {
    render(<Stepper steps={steps} accent="brand" size="md" />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows the returned and rejected states", () => {
    render(
      <Stepper
        steps={[
          { label: "Devuelta", state: "warning" },
          { label: "Rechazada", state: "danger" },
        ]}
      />,
    );

    expect(screen.getByText("Devuelta").closest("li")).toHaveAttribute("data-state", "warning");
    expect(screen.getByText("Rechazada").closest("li")).toHaveAttribute("data-state", "danger");
  });
});

describe("Timeline", () => {
  it("lists the entries with their observation", () => {
    render(
      <Timeline label="Historial">
        <TimelineItem tone="warning" status="Devuelta" date="14 oct 2026" actor="Director · Instituto de Física" observation="Adjuntar la carta firmada." />
        <TimelineItem tone="info" status="Solicitada" date="13 oct 2026" actor="Profesor · Instituto de Física" last order={1} />
      </Timeline>,
    );

    expect(screen.getByRole("list", { name: "Historial" }).children).toHaveLength(2);
    expect(screen.getByText("Observación")).toBeInTheDocument();
    expect(screen.getByText("Adjuntar la carta firmada.")).toBeInTheDocument();
    expect(screen.getByText("Profesor · Instituto de Física")).toBeInTheDocument();
  });
});

describe("acceptsFile", () => {
  it("matches extensions, exact types and wildcards", () => {
    const image = new File(["x"], "foto.PNG", { type: "image/png" });

    expect(acceptsFile(image)).toBe(true);
    expect(acceptsFile(image, ".png")).toBe(true);
    expect(acceptsFile(image, "image/*")).toBe(true);
    expect(acceptsFile(image, "application/pdf, ,.pdf")).toBe(false);
    expect(acceptsFile(pdf(), "application/pdf")).toBe(true);
  });
});

describe("FileDrop", () => {
  it("accepts a valid file from the picker", async () => {
    const onFile = vi.fn();
    render(<FileDrop onFile={onFile} accept="application/pdf" maxSizeMb={5} hint="PDF · máx. 5 MB" />);

    await userEvent.upload(screen.getByLabelText(/Arrastrar el archivo/), pdf());

    expect(onFile).toHaveBeenCalledWith(expect.objectContaining({ name: "carta.pdf" }));
    expect(screen.getByText("PDF · máx. 5 MB")).toBeInTheDocument();
  });

  it("rejects files that are too big", async () => {
    const onReject = vi.fn();
    render(<FileDrop onFile={vi.fn()} onReject={onReject} maxSizeMb={5} />);

    await userEvent.upload(screen.getByLabelText(/Arrastrar el archivo/), pdf("grande.pdf", 6 * 1024 * 1024));

    expect(onReject).toHaveBeenCalledWith("size", expect.any(File));
    expect(screen.getByRole("alert")).toHaveTextContent("Supera los 5 MB");
    expect(screen.getByText("El archivo no es válido")).toBeInTheDocument();
  });

  it("rejects files of another type and recovers with a valid drop", () => {
    const onFile = vi.fn();
    const onReject = vi.fn();
    render(<FileDrop onFile={onFile} onReject={onReject} accept=".pdf" sizeErrorMessage="Muy grande" />);
    const zone = screen.getByText(/Arrastrar el archivo/).closest("label") as HTMLLabelElement;

    fireEvent.drop(zone, { dataTransfer: { files: [new File(["x"], "foto.png", { type: "image/png" })] } });
    expect(onReject).toHaveBeenCalledWith("type", expect.any(File));
    expect(screen.getByRole("alert")).toHaveTextContent("Formato no permitido");

    fireEvent.drop(zone, { dataTransfer: { files: [pdf()] } });
    expect(onFile).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("highlights while dragging and ignores empty drops", () => {
    const onFile = vi.fn();
    render(<FileDrop onFile={onFile} />);
    const zone = screen.getByText(/Arrastrar el archivo/).closest("label") as HTMLLabelElement;

    const dragOver = createEvent.dragOver(zone);
    fireEvent(zone, dragOver);
    expect(dragOver.defaultPrevented).toBe(true);
    expect(zone).toHaveAttribute("data-state", "dragover");
    expect(screen.getByText("Soltar el archivo aquí")).toBeInTheDocument();

    fireEvent.dragLeave(zone);
    expect(zone).toHaveAttribute("data-state", "default");

    fireEvent.drop(zone, { dataTransfer: { files: [] } });
    expect(onFile).not.toHaveBeenCalled();
  });

  it("shows an external error and ignores drops when disabled", () => {
    const onFile = vi.fn();
    render(<FileDrop onFile={onFile} disabled error="Falta la carta de invitación" />);
    const zone = screen.getByText("El archivo no es válido").closest("label") as HTMLLabelElement;

    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [pdf()] } });

    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Falta la carta de invitación");
    expect(screen.getByLabelText(/El archivo no es válido/)).toBeDisabled();
  });

  it("ignores a picker closed without a file", () => {
    const onFile = vi.fn();
    render(<FileDrop onFile={onFile} />);

    fireEvent.change(screen.getByLabelText(/Arrastrar el archivo/), { target: { files: [] } });

    expect(onFile).not.toHaveBeenCalled();
  });
});

describe("FileItem", () => {
  it("shows an uploaded file and removes it", async () => {
    const onRemove = vi.fn();
    render(<FileItem name="carta.pdf" state="uploaded" detail="Carta de invitación · 1,8 MB" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole("button", { name: "Quitar carta.pdf" }));

    expect(onRemove).toHaveBeenCalledOnce();
    expect(screen.getByText("Carta de invitación · 1,8 MB")).toBeInTheDocument();
  });

  it("shows the upload progress clamped between 0 and 100", () => {
    const { rerender } = render(<FileItem name="carta.pdf" state="uploading" progress={140} />);
    expect(screen.getByRole("progressbar", { name: "Subiendo carta.pdf" })).toHaveAttribute("aria-valuenow", "100");

    rerender(<FileItem name="carta.pdf" state="uploading" progress={-5} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");

    rerender(<FileItem name="carta.pdf" state="uploading" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("shows the error with a custom remove label", () => {
    render(<FileItem name="carta.pdf" state="error" detail="Supera los 5 MB" onRemove={vi.fn()} removeLabel="Eliminar" />);

    expect(screen.getByText("Supera los 5 MB")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeInTheDocument();
  });

  it("renders without detail or remove button", () => {
    render(<FileItem name="carta.pdf" state="uploaded" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
