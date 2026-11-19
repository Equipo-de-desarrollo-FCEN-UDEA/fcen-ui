import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { PdfFirstPage } from "./PdfFirstPage";

const mocks = vi.hoisted(() => ({ getDocument: vi.fn() }));

vi.mock("pdfjs-dist", () => ({ VerbosityLevel: { ERRORS: 0 }, getDocument: mocks.getDocument }));
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs", () => ({}));

function pdfFile(): Blob {
  return Object.assign(new Blob(["%PDF"], { type: "application/pdf" }), {
    arrayBuffer: async () => new ArrayBuffer(4),
  });
}

function pdfOf(numPages: number) {
  const render = vi.fn(() => ({ promise: Promise.resolve() }));
  const page = {
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
    render,
  };
  const getPage = vi.fn(async () => page);
  const destroy = vi.fn(async () => undefined);
  mocks.getDocument.mockReturnValue({ promise: Promise.resolve({ numPages, getPage }), destroy });
  return { getPage, destroy };
}

beforeEach(() => {
  mocks.getDocument.mockReset();
});

describe("PdfFirstPage", () => {
  it("draws only the first page with the given label", async () => {
    const { getPage } = pdfOf(3);

    render(<PdfFirstPage file={pdfFile()} label="Vista previa de la resolución" />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: "Vista previa de la resolución" })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(getPage).toHaveBeenCalledTimes(1);
    expect(getPage).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("says when the file cannot be shown", async () => {
    mocks.getDocument.mockReturnValue({ promise: Promise.reject(new Error("roto")), destroy: vi.fn() });

    render(<PdfFirstPage file={pdfFile()} label="Vista previa" errorMessage="No se pudo generar la vista previa" />);

    expect(await screen.findByText("No se pudo generar la vista previa")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("falls back to a general message", async () => {
    mocks.getDocument.mockReturnValue({ promise: Promise.reject(new Error("roto")), destroy: vi.fn() });

    render(<PdfFirstPage file={pdfFile()} label="Vista previa" />);

    expect(await screen.findByText("No se puede mostrar este archivo")).toBeInTheDocument();
  });

  it("frees the document when it goes away", async () => {
    const { destroy } = pdfOf(1);

    const { unmount } = render(<PdfFirstPage file={pdfFile()} label="Vista previa" />);
    await screen.findByRole("img", { name: "Vista previa" });
    unmount();

    expect(destroy).toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    pdfOf(1);

    const { container } = render(<PdfFirstPage file={pdfFile()} label="Vista previa" />);
    await screen.findByRole("img", { name: "Vista previa" });

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
