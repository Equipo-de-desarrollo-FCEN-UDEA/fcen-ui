import { useEffect, type RefObject } from "react";
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from "pdfjs-dist";

const MAX_PIXEL_RATIO = 2;
const RESIZE_DELAY = 150;
const PAGE_CLASS = "block h-auto w-full rounded-md bg-white shadow-sm ring-1 ring-black/5";

export type PdfPagesOptions = {
  onReady: (file: Blob, pages: number) => void;
  onFail: (file: Blob) => void;
  lastPage?: number;
  label?: string;
};

async function openPdf(file: Blob): Promise<PDFDocumentLoadingTask> {
  const [pdfjs] = await Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs")]);
  const data = new Uint8Array(await file.arrayBuffer());
  return pdfjs.getDocument({ data, verbosity: pdfjs.VerbosityLevel.ERRORS });
}

async function drawPages(
  pdf: PDFDocumentProxy,
  target: HTMLElement,
  stale: () => boolean,
  onFirst: () => void,
  lastPage: number,
  label: string | undefined,
) {
  const width = target.clientWidth;
  const ratio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
  for (let number = 1; number <= lastPage; number += 1) {
    const page = await pdf.getPage(number);
    const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) * ratio });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.className = PAGE_CLASS;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", label ?? `Página ${number} de ${pdf.numPages}`);
    await page.render({ canvas, viewport }).promise;
    if (stale()) return;
    const previous = target.children[number - 1];
    if (previous) previous.replaceWith(canvas);
    else target.append(canvas);
    if (number === 1) onFirst();
  }
}

export function usePdfPages(
  container: RefObject<HTMLDivElement | null>,
  file: Blob,
  { onReady, onFail, lastPage, label }: PdfPagesOptions,
) {
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
        Math.min(lastPage ?? loaded.numPages, loaded.numPages),
        label,
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
  }, [container, file, onReady, onFail, lastPage, label]);
}
