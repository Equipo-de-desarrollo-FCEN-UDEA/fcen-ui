import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { DocumentViewer, documentKind, type DocumentViewerProps } from "./DocumentViewer";

const mocks = vi.hoisted(() => ({
  getDocument: vi.fn(),
  renderAsync: vi.fn(),
  workerLoaded: vi.fn(),
}));

vi.mock("pdfjs-dist", () => ({ VerbosityLevel: { ERRORS: 0 }, getDocument: mocks.getDocument }));
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs", () => {
  mocks.workerLoaded();
  return {};
});
vi.mock("docx-preview", () => ({ renderAsync: mocks.renderAsync }));

const WORD_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function fileOf(type: string): Blob {
  return Object.assign(new Blob(["contenido"], { type }), {
    arrayBuffer: async () => new ArrayBuffer(9),
  });
}

function pdfOf(numPages: number) {
  const render = vi.fn(() => ({ promise: Promise.resolve() }));
  const page = {
    getViewport: ({ scale }: { scale: number }) => ({ width: 600 * scale, height: 800 * scale }),
    render,
  };
  const destroy = vi.fn(async () => undefined);
  const task = { promise: Promise.resolve({ numPages, getPage: vi.fn(async () => page) }), destroy };
  mocks.getDocument.mockReturnValue(task);
  return { render, destroy };
}

function Viewer(props: Partial<DocumentViewerProps>) {
  return <DocumentViewer open onClose={vi.fn()} fileName="carta.pdf" file={null} {...props} />;
}

beforeEach(() => {
  mocks.getDocument.mockReset();
  mocks.renderAsync.mockReset();
});

describe("documentKind", () => {
  it("reads the type first and falls back to the extension", () => {
    expect(documentKind("sin-extension", "application/pdf")).toBe("pdf");
    expect(documentKind("foto", "image/jpeg")).toBe("image");
    expect(documentKind("informe", WORD_TYPE)).toBe("docx");
    expect(documentKind("CARTA.PDF", "application/octet-stream")).toBe("pdf");
    expect(documentKind("afiche.webp", "")).toBe("image");
    expect(documentKind("informe.docx", "")).toBe("docx");
    expect(documentKind("acta.doc", "application/msword")).toBe("other");
    expect(documentKind("dibujo.svg", "image/svg+xml")).toBe("other");
    expect(documentKind("archivo.constructor", "")).toBe("other");
    expect(documentKind("archivo", "")).toBe("other");
  });
});

describe("DocumentViewer", () => {
  it("shows the spinner while loading and the header actions", async () => {
    const onClose = vi.fn();
    const onDownload = vi.fn();
    const user = userEvent.setup();
    render(<Viewer loading file={fileOf("application/pdf")} onClose={onClose} onDownload={onDownload} />);

    const dialog = screen.getByRole("dialog", { name: "carta.pdf" });
    expect(within(dialog).getByRole("status", { name: "Cargando documento" })).toBeInTheDocument();
    expect(mocks.getDocument).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Descargar carta.pdf" }));
    expect(onDownload).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps the spinner while there is no file yet and renders nothing when closed", () => {
    const { rerender } = render(<Viewer />);
    expect(screen.getByRole("status", { name: "Cargando documento" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Descargar/ })).not.toBeInTheDocument();

    rerender(<Viewer open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders every PDF page on a canvas and redraws when the width changes", async () => {
    const pdf = pdfOf(2);
    let width = 600;
    const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
    const file = fileOf("application/pdf");
    render(<Viewer file={file} />);

    expect(await screen.findByRole("img", { name: "Página 2 de 2" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Página 1 de 2" })).toHaveAttribute("width", "600");
    expect(screen.getByText("PDF · 2 páginas")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(mocks.workerLoaded).toHaveBeenCalled();
    expect(mocks.getDocument).toHaveBeenCalledWith({ data: expect.any(Uint8Array), verbosity: 0 });
    expect(pdf.render).toHaveBeenCalledTimes(2);

    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(pdf.render).toHaveBeenCalledTimes(2);

    width = 300;
    act(() => {
      window.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("resize"));
    });
    await waitFor(() => expect(pdf.render).toHaveBeenCalledTimes(4));
    await waitFor(() => expect(screen.getByRole("img", { name: "Página 2 de 2" })).toHaveAttribute("width", "300"));
    expect(screen.getAllByRole("img")).toHaveLength(2);
    clientWidth.mockRestore();
  });

  it("counts a single page", async () => {
    pdfOf(1);
    render(<Viewer file={fileOf("application/pdf")} />);

    expect(await screen.findByText("PDF · 1 página")).toBeInTheDocument();
  });

  it("stops the PDF when the viewer closes", async () => {
    const pdf = pdfOf(2);
    const file = fileOf("application/pdf");
    const { rerender } = render(<Viewer file={file} />);
    rerender(<Viewer file={file} open={false} />);

    await waitFor(() => expect(pdf.destroy).toHaveBeenCalled());
    expect(pdf.render).not.toHaveBeenCalled();

    rerender(<Viewer file={file} />);
    await screen.findByRole("img", { name: "Página 1 de 2" });
    rerender(<Viewer file={file} open={false} />);
    expect(pdf.destroy).toHaveBeenCalledTimes(2);
  });

  it("falls back with the download button when the PDF cannot be read", async () => {
    const onDownload = vi.fn();
    const user = userEvent.setup();
    mocks.getDocument.mockReturnValue({ promise: Promise.reject(new Error("dañado")), destroy: vi.fn() });
    render(<Viewer file={fileOf("application/pdf")} onDownload={onDownload} />);

    expect(await screen.findByText("No se puede mostrar este archivo")).toBeInTheDocument();
    expect(screen.queryByText(/^PDF/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Descargar" }));
    expect(onDownload).toHaveBeenCalledOnce();
  });

  it("renders a Word document and disarms unsafe links", async () => {
    mocks.renderAsync.mockImplementation(async (_file: Blob, host: HTMLElement) => {
      host.innerHTML = [
        '<section class="docx"><p>Informe de comisión</p>',
        '<a href="javascript:alert(1)">peligroso</a>',
        '<a href="https://www.udea.edu.co">sitio</a>',
        '<a href="#anexo">anexo</a></section>',
      ].join("");
    });
    const file = fileOf(WORD_TYPE);
    render(<Viewer fileName="informe.docx" file={file} />);

    expect(await screen.findByText("Informe de comisión")).toBeInTheDocument();
    expect(screen.getByText("Documento de Word")).toBeInTheDocument();
    expect(mocks.renderAsync).toHaveBeenCalledWith(
      file,
      expect.any(HTMLDivElement),
      expect.any(HTMLDivElement),
      expect.objectContaining({ inWrapper: false, ignoreWidth: true }),
    );
    expect(screen.getByText("peligroso")).not.toHaveAttribute("href");
    expect(screen.getByRole("link", { name: "sitio" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "sitio" })).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "anexo" })).not.toHaveAttribute("target");
  });

  it("falls back when the Word document fails and ignores a render that ends after closing", async () => {
    mocks.renderAsync.mockRejectedValueOnce(new Error("dañado"));
    const { rerender } = render(<Viewer fileName="informe.docx" file={fileOf("")} />);
    expect(await screen.findByText("No se puede mostrar este archivo")).toBeInTheDocument();

    let finish = () => undefined as void;
    mocks.renderAsync.mockImplementationOnce(
      (_file: Blob, host: HTMLElement) =>
        new Promise<void>((resolve) => {
          finish = () => {
            host.textContent = "tarde";
            resolve();
          };
        }),
    );
    const late = fileOf(WORD_TYPE);
    rerender(<Viewer fileName="informe.docx" file={late} />);
    await waitFor(() => expect(mocks.renderAsync).toHaveBeenCalledTimes(2));
    rerender(<Viewer fileName="informe.docx" file={late} open={false} />);
    await act(async () => finish());
    rerender(<Viewer fileName="informe.docx" file={late} />);
    expect(screen.queryByText("tarde")).not.toBeInTheDocument();

    mocks.renderAsync.mockRejectedValueOnce(new Error("tarde"));
    rerender(<Viewer fileName="informe.docx" file={late} open={false} />);
    expect(screen.queryByText("No se puede mostrar este archivo")).not.toBeInTheDocument();
  });

  it("shows an image that fits the width and releases its address", async () => {
    const createObjectURL = vi.fn(() => "blob:afiche");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL }));
    const { rerender } = render(<Viewer fileName="afiche.png" file={fileOf("image/png")} />);

    const image = screen.getByRole("img", { name: "afiche.png" });
    expect(image).toHaveAttribute("src", "blob:afiche");
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.load(image);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByText("Imagen")).toBeInTheDocument();

    rerender(<Viewer fileName="afiche.png" file={fileOf("image/png")} />);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:afiche");
    fireEvent.error(screen.getByRole("img", { name: "afiche.png" }));
    expect(screen.getByText("No se puede mostrar este archivo")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("offers only the download for other files and shows the error it receives", async () => {
    const onDownload = vi.fn();
    const { rerender } = render(
      <Viewer fileName="acta.doc" file={fileOf("application/msword")} onDownload={onDownload} />,
    );

    expect(screen.getByText("No se puede mostrar este archivo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar acta.doc" })).toBeInTheDocument();

    rerender(<Viewer fileName="acta.doc" file={null} error="No se encontró el archivo" />);
    expect(screen.getByText("No se encontró el archivo")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Descargar/ })).not.toBeInTheDocument();
  });

  it("has no axe violations while showing a document or the fallback", async () => {
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const options = { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } };
    mocks.renderAsync.mockImplementation(async (_file: Blob, host: HTMLElement) => {
      host.innerHTML = '<section class="docx"><p>Informe</p></section>';
    });
    const { rerender } = render(<Viewer fileName="informe.docx" file={fileOf(WORD_TYPE)} onDownload={vi.fn()} />);
    await screen.findByText("Informe");

    expect((await axe.run(document.body, options)).violations.map((violation) => violation.id)).toEqual([]);

    rerender(<Viewer fileName="acta.doc" file={fileOf("application/msword")} onDownload={vi.fn()} />);
    expect((await axe.run(document.body, options)).violations.map((violation) => violation.id)).toEqual([]);
    canvas.mockRestore();
  });
});
