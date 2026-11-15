import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CalendarDays, Check, FlaskConical, RefreshCw, Stamp, Undo2, UserRoundCog, X } from "lucide-react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Textarea } from "../atoms/Textarea";
import { EntityPickerModal } from "../organisms/EntityPickerModal";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Dropdown } from "./Dropdown";
import { DropdownAcademicUnit } from "./DropdownAcademicUnit";
import { EmptyState } from "./EmptyState";
import { FormField } from "./FormField";
import { Modal, type ModalIntent } from "./Modal";
import { MultiSelectChips } from "./MultiSelectChips";
import { Pagination } from "./Pagination";
import { Select, type SelectOptionItem } from "./Select";
import { SelectionSummaryCard } from "./SelectionSummaryCard";
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

const people: SelectOptionItem[] = [
  { value: "andres.rios", label: "andres.rios", description: "Director y profesor del Instituto de Física" },
  { value: "juan.giraldo", label: "juan.giraldo", description: "Profesor de planta del Instituto de Física" },
  { value: "laura.toro", label: "laura.toro", description: "Secretaria de la Decanatura" },
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
  const [person, setPerson] = useState<string | null>(null);
  return (
    <div className="grid max-w-3xl grid-cols-2 gap-6">
      <FormField label="País">
        {(control) => <Select {...control} options={countries} value={country} onChange={setCountry} searchable />}
      </FormField>
      <FormField label="Idioma">
        {(control) => <Select {...control} options={languages} value={language} onChange={setLanguage} />}
      </FormField>
      <FormField label="Persona" helperText="Cada opción con su descripción en una segunda línea">
        {(control) => <Select {...control} options={people} value={person} onChange={setPerson} searchable />}
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
  const [entityPickerOpen, setEntityPickerOpen] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [entityType, setEntityType] = useState("all");
  const current = intents.find((item) => item.intent === openIntent);
  const close = () => setOpenIntent(null);
  const entities = [
    { id: "lab-104", type: "laboratory", label: "Laboratorio 104", detail: "Bloque 6 · 24 puestos", icon: FlaskConical },
    { id: "classroom-301", type: "classroom", label: "Aula 301", detail: "Bloque 3 · 36 puestos", icon: CalendarDays },
  ];
  const visibleEntities = entities.filter((entity) => entityType === "all" || entity.type === entityType);
  const selectedEntity = entities.find((entity) => entity.id === selectedEntityId);
  return (
    <div className="flex gap-3">
      {intents.map((item) => (
        <Button key={item.intent} label={item.title} variant="outline" onClick={() => setOpenIntent(item.intent)} />
      ))}
      <Button label="Seleccionar espacio" variant="outline" onClick={() => setEntityPickerOpen(true)} />
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
      <EntityPickerModal
        isOpen={entityPickerOpen}
        onClose={() => setEntityPickerOpen(false)}
        title="Seleccionar espacio"
        description="Busca y elige el espacio que necesitas."
        filters={
          <Select
            options={[
              { value: "all", label: "Todos los espacios" },
              { value: "laboratory", label: "Laboratorios" },
              { value: "classroom", label: "Aulas" },
            ]}
            value={entityType}
            onChange={setEntityType}
            searchable
            aria-label="Filtrar espacios"
          />
        }
        selectedSummary={
          <SelectionSummaryCard label="Espacio seleccionado:">
            {selectedEntity?.label ?? "Ninguno"}
          </SelectionSummaryCard>
        }
        selectedEntityId={selectedEntityId}
        chooseLabel="Elegir espacio"
        onChoose={() => setEntityPickerOpen(false)}
      >
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {visibleEntities.map(({ id, label, detail, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={selectedEntityId === id}
              onClick={() => setSelectedEntityId(id)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 dark:text-gray-200 dark:hover:bg-slate-800"
            >
              <Icon size={16} aria-hidden />
              <span className="flex-1">{label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{detail}</span>
            </button>
          ))}
        </div>
      </EntityPickerModal>
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

function ManyPagesDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  return (
    <div className="pt-52">
      <Pagination page={page} pageSize={pageSize} total={3667} onPageChange={setPage} onPageSizeChange={setPageSize} />
    </div>
  );
}

export const PaginationWithManyPages: Story = {
  render: () => <ManyPagesDemo />,
};

function CardPaginationDemo({ width }: Readonly<{ width: number }>) {
  const [page, setPage] = useState(120);
  const [pageSize, setPageSize] = useState(10);
  return (
    <div className="pt-52">
      <div
        style={{ width }}
        className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
      >
        <Pagination page={page} pageSize={pageSize} total={3667} onPageChange={setPage} onPageSizeChange={setPageSize} />
      </div>
    </div>
  );
}

export const PaginationInAPhoneCard: Story = {
  render: () => <CardPaginationDemo width={343} />,
};

export const PaginationInATabletCard: Story = {
  render: () => <CardPaginationDemo width={640} />,
};

export const PaginationInAWideCard: Story = {
  render: () => <CardPaginationDemo width={960} />,
};

function CollapsiblePanelDemo() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <CollapsiblePanel
      index={1}
      title="Reserva de laboratorio"
      subtitle="Información del espacio"
      collapsed={collapsed}
      onToggle={() => setCollapsed((value) => !value)}
      error="Revisa el horario seleccionado."
      actions={<Button label="Editar" variant="outline" size="sm" />}
    >
      <p className="text-sm text-gray-700 dark:text-gray-200">Laboratorio de Física · Bloque 6</p>
    </CollapsiblePanel>
  );
}

export const CollapsiblePanels: Story = {
  render: () => <CollapsiblePanelDemo />,
};

function DropdownDemo() {
  const [room, setRoom] = useState("Seleccionar espacio");
  const [unit, setUnit] = useState("fisica");
  return (
    <div className="grid max-w-3xl grid-cols-2 gap-6">
      <Dropdown
        title={room}
        options={[
          { value: "block-6", label: "Bloque 6", children: [
            { value: "lab-104", label: "Laboratorio 104" },
            { value: "lab-105", label: "Laboratorio 105" },
          ] },
          { value: "block-3", label: "Bloque 3" },
        ]}
        onSelect={(_value, option) => setRoom(option?.label ?? "Seleccionar espacio")}
      />
      <DropdownAcademicUnit
        units={[
          { id: "facultad", name: "Facultad", children: [
            { id: "fisica", name: "Instituto de Física" },
            { id: "matematicas", name: "Instituto de Matemáticas" },
          ] },
        ]}
        value={unit}
        onSelect={setUnit}
      />
    </div>
  );
}

export const Dropdowns: Story = {
  render: () => <DropdownDemo />,
};

function MultiSelectChipsDemo() {
  const [selected, setSelected] = useState(["fisica"]);
  return (
    <div className="max-w-md">
      <MultiSelectChips
        label="Unidades académicas"
        options={[
          { value: "fisica", label: "Instituto de Física" },
          { value: "matematicas", label: "Instituto de Matemáticas" },
          { value: "biologia", label: "Instituto de Biología" },
        ]}
        selected={selected}
        onChange={setSelected}
      />
    </div>
  );
}

export const MultiSelects: Story = {
  render: () => <MultiSelectChipsDemo />,
};

export const SelectionSummaries: Story = {
  render: () => (
    <SelectionSummaryCard label="Espacio seleccionado:">
      Laboratorio de Física
    </SelectionSummaryCard>
  ),
};

export const SummaryCards: Story = {
  render: () => <SummaryCard label="Resolución" value="C-0001-2026" icon={Stamp} />,
};
