import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";
import { Download, FileText, FileX } from "lucide-react";
import clsx from "clsx";
import { Button } from "../atoms/Button";
import { Spinner } from "../atoms/Spinner";
import { EmptyState } from "../molecules/EmptyState";
import { Modal } from "../molecules/Modal";

export type DocumentKind = "pdf" | "image" | "docx" | "other";

export type DocumentViewerProps = {
  open: boolean;
  onClose: () => void;
  fileName: string;
  file: Blob | null;
  loading?: boolean;
  error?: string;
  onDownload?: () => void;
};

type PreviewProps = {
  file: Blob;
  fileName: string;
  onReady: (file: Blob, pages?: number) => void;
  onFail: (file: Blob) => void;
};

type Shown = { file: Blob; pages: number };

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_PIXEL_RATIO = 2;
const RESIZE_DELAY = 150;
const SAFE_LINK = /^(https?:|mailto:|#)/i;
const PAGE_CLASS = "block h-auto w-full rounded-md bg-white shadow-sm ring-1 ring-black/5";

const kindsByType = new Map<string, DocumentKind>([
  ["application/pdf", "pdf"],
  ["image/png", "image"],
  ["image/jpeg", "image"],
  ["image/webp", "image"],
  ["image/gif", "image"],
  [DOCX_TYPE, "docx"],
]);

const kindsByExtension = new Map<string, DocumentKind>([
  ["pdf", "pdf"],
  ["png", "image"],
  ["jpg", "image"],
  ["jpeg", "image"],
  ["webp", "image"],
  ["gif", "image"],
  ["docx", "docx"],
]);

const kindLabels: Record<DocumentKind, string> = {
  pdf: "PDF",
  image: "Imagen",
  docx: "Documento de Word",
  other: "",
};

const docxOptions = {
  inWrapper: false,
  ignoreWidth: true,
  ignoreHeight: true,
  renderComments: false,
  useBase64URL: true,
};

export function documentKind(fileName: string, type: string): DocumentKind {
  const extension = /\.([a-z0-9]+)$/i.exec(fileName)?.[1].toLowerCase() ?? "";
  return kindsByType.get(type.toLowerCase()) ?? kindsByExtension.get(extension) ?? "other";
}

function describe(kind: DocumentKind, pages: number): string {
  if (!pages) return kindLabels[kind];
  return `${kindLabels[kind]} · ${pages} ${pages === 1 ? "página" : "páginas"}`;
}

async function openPdf(file: Blob): Promise<PDFDocumentLoadingTask> {
  const [pdfjs] = await Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs")]);
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data, verbosity: pdfjs.VerbosityLevel.ERRORS });
}

async function drawPages(pdf: PDFDocumentProxy, target: HTMLElement, stale: () => boolean, onFirst: () => void) {
  const width = target.clientWidth;
  const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
  for (let number = 1; number <= pdf.numPages; number += 1) {
    const page = await pdf.getPage(number);
    const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) * ratio });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.className = PAGE_CLASS;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", `Página ${number} de ${pdf.numPages}`);
    await page.render({ canvas, viewport }).promise;
    if (stale()) return;
    const previous = target.children[number - 1];
    if (previous) previous.replaceWith(canvas);
    else target.append(canvas);
    if (number === 1) onFirst();
  }
}

function secureLinks(root: HTMLElement) {
  for (const link of Array.from(root.querySelectorAll("a"))) {
    const href = link.getAttribute("href") ?? "";
    if (!SAFE_LINK.test(href)) {
      link.removeAttribute("href");
    } else if (!href.startsWith("#")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  }
}

function PdfPreview({ file, onReady, onFail }: PreviewProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = container.current as HTMLDivElement;
    let task: PDFDocumentLoadingTask | null = null;
    let pdf: PDFDocumentProxy | null = null;
    let closed = false;
    let generation = 0;
    let width = 0;
    let timer = 0;
    const fail = () => {
      if (!closed) onFail(file);
    };
    const draw = (loaded: PDFDocumentProxy) => {
      const current = ++generation;
      width = target.clientWidth;
      return drawPages(
        loaded,
        target,
        () => closed || current !== generation,
        () => onReady(file, loaded.numPages),
      );
    };
    const redraw = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (pdf && target.clientWidth !== width) draw(pdf).catch(fail);
      }, RESIZE_DELAY);
    };
    openPdf(file)
      .then(async (opened) => {
        task = opened;
        if (closed) return opened.destroy();
        pdf = await opened.promise;
        return draw(pdf);
      })
      .catch(fail);
    window.addEventListener("resize", redraw);
    return () => {
      closed = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", redraw);
      task?.destroy();
    };
  }, [file, onReady, onFail]);

  return <div ref={container} className="flex flex-col gap-4" />;
}

function DocxPreview({ file, onReady, onFail }: PreviewProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = container.current as HTMLDivElement;
    const host = document.createElement("div");
    let closed = false;
    import("docx-preview")
      .then((docx) => docx.renderAsync(file, host, host, docxOptions))
      .then(() => {
        if (closed) return;
        secureLinks(host);
        target.replaceChildren(host);
        onReady(file);
      })
      .catch(() => {
        if (!closed) onFail(file);
      });
    return () => {
      closed = true;
      target.replaceChildren();
    };
  }, [file, onReady, onFail]);

  return (
    <div
      ref={container}
      className="text-gray-900 [&_section.docx]:mb-4 [&_section.docx]:rounded-md [&_section.docx]:bg-white [&_section.docx]:shadow-sm max-sm:[&_section.docx]:px-4! max-sm:[&_section.docx]:py-6!"
    />
  );
}

function ImagePreview({ file, fileName, onReady, onFail }: PreviewProps) {
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    (image.current as HTMLImageElement).src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <img
      ref={image}
      alt={fileName}
      onLoad={() => onReady(file)}
      onError={() => onFail(file)}
      className="mx-auto block h-auto max-w-full rounded-md bg-white shadow-sm ring-1 ring-black/5"
    />
  );
}

function Loading() {
  return (
    <div className="grid place-items-center py-16">
      <Spinner size={28} label="Cargando documento" />
    </div>
  );
}

export const DocumentViewer = ({
  open,
  onClose,
  fileName,
  file,
  loading = false,
  error,
  onDownload,
}: DocumentViewerProps) => {
  const [shown, setShown] = useState<Shown | null>(null);
  const [failedFile, setFailedFile] = useState<Blob | null>(null);
  const markReady = useCallback((source: Blob, pages = 0) => setShown({ file: source, pages }), []);
  const markFailed = useCallback((source: Blob) => setFailedFile(source), []);
  const kind = documentKind(fileName, file?.type ?? "");
  const waiting = loading || (!file && !error);
  const unavailable = !waiting && (Boolean(error) || kind === "other" || failedFile === file);
  const ready = shown?.file === file;
  const previewProps = { fileName, onReady: markReady, onFail: markFailed };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={fileName}
      description={waiting || unavailable ? undefined : describe(kind, ready ? (shown as Shown).pages : 0)}
      icon={FileText}
      size="xl"
      headerActions={
        onDownload && (
          <button
            type="button"
            onClick={onDownload}
            aria-label={`Descargar ${fileName}`}
            className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-[10px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-brand-300"
          >
            <Download size={16} aria-hidden />
          </button>
        )
      }
      bodyClassName={waiting || unavailable ? undefined : "bg-slate-100 p-3 sm:p-6 dark:bg-slate-950/70"}
      className={clsx("sm:max-h-[calc(100dvh-3rem)]", !unavailable && "h-[calc(100dvh-2rem)] sm:h-[calc(100dvh-3rem)]")}
    >
      {waiting && <Loading />}
      {unavailable && (
        <EmptyState
          compact
          icon={FileX}
          title="No se puede mostrar este archivo"
          message={error}
          action={
            onDownload && (
              <Button
                label="Descargar"
                variant="outline"
                size="sm"
                iconLeft={<Download size={14} aria-hidden />}
                onClick={onDownload}
              />
            )
          }
        />
      )}
      {file && !waiting && !unavailable && (
        <div className="relative mx-auto w-full max-w-3xl">
          {!ready && (
            <div className="absolute inset-x-0 top-0">
              <Loading />
            </div>
          )}
          {kind === "pdf" && <PdfPreview file={file} {...previewProps} />}
          {kind === "docx" && <DocxPreview file={file} {...previewProps} />}
          {kind === "image" && <ImagePreview file={file} {...previewProps} />}
        </div>
      )}
    </Modal>
  );
};
