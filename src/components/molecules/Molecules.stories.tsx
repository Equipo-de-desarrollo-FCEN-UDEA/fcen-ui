import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Check, RefreshCw, Stamp, Undo2, UserRoundCog, X } from "lucide-react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Textarea } from "../atoms/Textarea";
import { EmptyState } from "./EmptyState";
import { FormField } from "./FormField";
import { Modal, type ModalIntent } from "./Modal";
import { Pagination } from "./Pagination";
import { Select, type SelectOptionItem } from "./Select";
import { SummaryCard } from "./SummaryCard";
import { Toast } from "./Toast";
import { Toaster } from "./Toaster";
import { toast } from "./toastStore";

const meta = {
  title: "Molecules",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FormFields: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-6">
      <FormField label="Asunto" helperText="Máximo 200 caracteres">
        {(control) => <Input {...control} placeholder="Escribir…" />}
      </FormField>
      <FormField label="Asunto" error="El asunto es obligatorio">
        {(control) => <Input {...control} placeholder="Escribir…" />}
      </FormField>
      <FormField label="Justificación" required>
        {(control) => <Textarea {...control} placeholder="Escribir justificación…" />}
      </FormField>
    </div>
  ),
};

const countries: SelectOptionItem[] = [
  { value: "PE", label: "Perú", code: "PE" },
  { value: "PT", label: "Portugal", code: "PT" },
  { value: "PR", label: "Puerto Rico", code: "PR" },
  { value: "PA", label: "Panamá", code: "PA" },
  { value: "PY", label: "Paraguay", code: "PY" },
  { value: "PL", label: "Polonia", code: "PL" },
  { value: "CO", label: "Colombia", code: "CO" },
  { value: "MX", label: "México", code: "MX" },
];

const languages: SelectOptionItem[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "pt", label: "Portugués" },
  { value: "fr", label: "Francés" },
];

function SelectDemo() {
  const [country, setCountry] = useState<string | null>("PE");
  const [language, setLanguage] = useState<string | null>(null);
  return (
    <div className="grid max-w-3xl grid-cols-2 gap-6">
      <FormField label="País">
        {(control) => <Select {...control} options={countries} value={country} onChange={setCountry} searchable />}
      </FormField>
      <FormField label="Idioma">
        {(control) => <Select {...control} options={languages} value={language} onChange={setLanguage} />}
      </FormField>
      <FormField label="Departamento o estado" error="El departamento es obligatorio">
        {(control) => <Select {...control} options={[]} value={null} onChange={setLanguage} />}
      </FormField>
      <FormField label="Ciudad">
        {(control) => <Select {...control} options={[]} value={null} onChange={setLanguage} disabled />}
      </FormField>
    </div>
  );
}

export const Selects: Story = {
  render: () => <SelectDemo />,
};

const intents: { intent: ModalIntent; title: string; description: string; action: string; icon?: typeof Check }[] = [
  {
    intent: "neutral",
    title: "Cambiar rol",
    description: "Seleccionar la calidad con la que se trabaja.",
    action: "Cambiar",
    icon: UserRoundCog,
  },
  {
    intent: "success",
    title: "Aprobar comisión",
    description: "Se asigna el número de resolución al confirmar.",
    action: "Aprobar",
  },
  {
    intent: "warning",
    title: "Devolver comisión",
    description: "Indicar qué se debe corregir.",
    action: "Devolver",
    icon: Undo2,
  },
  { intent: "danger", title: "Rechazar comisión", description: "El rechazo es definitivo.", action: "Rechazar" },
];

function ModalDemo() {
  const [openIntent, setOpenIntent] = useState<ModalIntent | null>(null);
  const current = intents.find((item) => item.intent === openIntent);
  const close = () => setOpenIntent(null);
  return (
    <div className="flex gap-3">
      {intents.map((item) => (
        <Button key={item.intent} label={item.title} variant="outline" onClick={() => setOpenIntent(item.intent)} />
      ))}
      {current && (
        <Modal
          isOpen
          onClose={close}
          intent={current.intent}
          icon={current.icon}
          title={current.title}
          description={current.description}
          actions={[
            { label: "Cancelar", variant: "outline", onClick: close },
            {
              label: current.action,
              variant: current.intent === "danger" ? "danger" : "primary",
              onClick: close,
              iconLeft: current.intent === "danger" ? <X size={18} /> : <Check size={18} />,
            },
          ]}
        >
          {current.intent === "warning" && <Textarea aria-label="Observación" placeholder="Escribir observación…" />}
        </Modal>
      )}
    </div>
  );
}

export const Modals: Story = {
  render: () => <ModalDemo />,
};

export const ToastTones: Story = {
  render: () => (
    <div className="flex max-w-sm flex-col gap-3">
      <Toast tone="success" title="Comisión enviada" message="Queda en Solicitada." onClose={toast.clear} />
      <Toast tone="error" title="No se pudo enviar" message="Revisar los campos marcados." onClose={toast.clear} />
      <Toast tone="warning" title="Faltan documentos" message="La carta de invitación es obligatoria." onClose={toast.clear} />
      <Toast tone="info" title="Sesión por vencer" message="Quedan 5 minutos." onClose={toast.clear} />
    </div>
  ),
};

function ToasterDemo() {
  const success = () => toast.success("Comisión enviada", { message: "Queda en Solicitada." });
  const error = () => toast.error("No se pudo enviar", { message: "Revisar los campos marcados." });
  const info = () => toast.info("Sesión por vencer", { message: "Quedan 5 minutos." });
  return (
    <div className="flex gap-3">
      <Toaster />
      <Button label="Éxito" onClick={success} />
      <Button label="Error" variant="danger" onClick={error} />
      <Button label="Información" variant="secondary" onClick={info} />
    </div>
  );
}

export const Toasts: Story = {
  render: () => <ToasterDemo />,
};

export const EmptyStates: Story = {
  render: () => (
    <div className="flex items-start gap-12">
      <EmptyState
        title="Sin comisiones por revisar"
        message="Las nuevas solicitudes aparecen aquí."
        action={<Button label="Refrescar" variant="outline" size="sm" iconLeft={<RefreshCw size={14} />} />}
      />
      <EmptyState
        compact
        title="Sin comisiones por revisar"
        message="Las nuevas solicitudes aparecen aquí."
        action={<Button label="Refrescar" variant="outline" size="sm" iconLeft={<RefreshCw size={14} />} />}
      />
    </div>
  ),
};

function PaginationDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return <Pagination page={page} pageSize={pageSize} total={24} onPageChange={setPage} onPageSizeChange={setPageSize} />;
}

export const Paginations: Story = {
  render: () => <PaginationDemo />,
};

export const SummaryCards: Story = {
  render: () => <SummaryCard label="Resolución" value="C-0001-2026" icon={Stamp} />,
};
