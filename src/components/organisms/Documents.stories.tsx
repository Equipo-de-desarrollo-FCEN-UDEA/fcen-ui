import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FileItem } from "../process/FileItem";
import { DocumentViewer } from "./DocumentViewer";
import posterUrl from "./fixtures/afiche-congreso.png?url";
import letterUrl from "./fixtures/carta-invitacion.pdf?url";
import reportUrl from "./fixtures/informe-comision.docx?url";

const meta = {
  title: "Documents",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type ViewerDemoProps = {
  name: string;
  detail: string;
  source?: string;
  initialFile?: Blob;
  error?: string;
};

const minutes = new Blob(["Acta del consejo de facultad"], { type: "application/msword" });

function save(name: string, file: Blob) {
  const href = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 0);
}

function ViewerDemo({ name, detail, source, initialFile, error }: Readonly<ViewerDemoProps>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<Blob | null>(initialFile ?? null);
  const [loading, setLoading] = useState(false);

  const view = () => {
    setOpen(true);
    if (file || !source) return;
    setLoading(true);
    fetch(source)
      .then((response) => response.blob())
      .then(setFile)
      .finally(() => setLoading(false));
  };

  const download = () => {
    if (file) save(name, file);
  };

  return (
    <div className="max-w-xl">
      <FileItem name={name} state="uploaded" detail={detail} onView={view} />
      <DocumentViewer
        open={open}
        onClose={() => setOpen(false)}
        fileName={name}
        file={file}
        loading={loading}
        error={error}
        onDownload={download}
      />
    </div>
  );
}

export const PdfDocument: Story = {
  render: () => <ViewerDemo name="carta-invitacion.pdf" detail="Carta de invitación · 2 KB" source={letterUrl} />,
};

export const ImageDocument: Story = {
  render: () => <ViewerDemo name="afiche-congreso.png" detail="Afiche · 12 KB" source={posterUrl} />,
};

export const WordDocument: Story = {
  render: () => <ViewerDemo name="informe-comision.docx" detail="Informe de comisión · 2 KB" source={reportUrl} />,
};

export const UnsupportedDocument: Story = {
  render: () => <ViewerDemo name="acta-consejo.doc" detail="Acta del consejo · 1 KB" initialFile={minutes} />,
};

export const DocumentWithError: Story = {
  render: () => <ViewerDemo name="cumplido.pdf" detail="Cumplido · 80 KB" error="No se encontró el archivo" />,
};

export const FileItemsWithActions: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <FileItem
        name="carta-invitacion.pdf"
        state="uploaded"
        detail="Carta de invitación · 2 KB"
        onView={() => undefined}
        onRemove={() => undefined}
      />
      <FileItem
        name="informe-comision.docx"
        state="uploaded"
        detail="Informe de comisión · 2 KB"
        onView={() => undefined}
      />
      <FileItem name="cumplido.pdf" state="error" detail="Supera los 5 MB" onRemove={() => undefined} />
    </div>
  ),
};
