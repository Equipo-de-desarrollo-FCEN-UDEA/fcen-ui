import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Search } from "lucide-react";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { Select as NativeSelect } from "./Select";
import { SearchableMultiSelect } from "./SearchableMultiSelect";
import { SearchableSelect } from "./SearchableSelect";
import { SegmentedToggle } from "./SegmentedToggle";
import { Textarea } from "./Textarea";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";
import { PhoneInput } from "../molecules/PhoneInput";

const meta = {
  title: "Atoms/Fields",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const countries = [
  { value: "CO", label: "Colombia" },
  { value: "PE", label: "Perú" },
  { value: "US", label: "Estados Unidos" },
];

const units = [
  { value: "fisica", label: "Instituto de Física" },
  { value: "matematicas", label: "Instituto de Matemáticas" },
  { value: "biologia", label: "Instituto de Biología" },
];

export const Inputs: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-6">
      <Input aria-label="Asunto" placeholder="Escribir…" />
      <Input aria-label="Buscar" placeholder="Buscar" leftIcon={<Search size={16} />} />
      <Input aria-label="Asunto con error" placeholder="Escribir…" state="error" />
      <Input aria-label="Asunto deshabilitado" placeholder="Escribir…" disabled />
      <Input aria-label="Asunto pequeño" placeholder="Escribir…" size="sm" />
      <Input aria-label="Asunto con valor" defaultValue="Congreso de Física 2026" />
    </div>
  ),
};

function NativeSelectDemo() {
  const [value, setValue] = useState("CO");
  return (
    <div className="grid max-w-3xl grid-cols-2 gap-6">
      <NativeSelect
        label="País"
        options={countries}
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        onClear={() => setValue("")}
        helperText="El cambio se comunica con el evento nativo."
      />
      <NativeSelect label="País con error" options={countries} defaultValue="PE" state="error" helperText="Revisa el país." />
      <NativeSelect label="País válido" options={countries} defaultValue="US" state="success" />
      <NativeSelect label="País deshabilitado" options={countries} defaultValue="CO" disabled />
    </div>
  );
}

export const NativeSelects: Story = {
  render: () => <NativeSelectDemo />,
};

function SearchableSelectDemo() {
  const [unit, setUnit] = useState("fisica");
  const [selectedUnits, setSelectedUnits] = useState(["matematicas"]);
  return (
    <div className="grid max-w-3xl grid-cols-2 gap-6">
      <SearchableSelect
        label="Unidad académica"
        options={units}
        value={unit}
        onChange={setUnit}
        variant="outline"
      />
      <SearchableSelect
        label="Unidad con error"
        options={units}
        value=""
        onChange={() => undefined}
        state="error"
        helperText="Selecciona una unidad."
      />
      <SearchableMultiSelect
        label="Unidades académicas"
        options={units}
        values={selectedUnits}
        onChange={setSelectedUnits}
        helperText="Puedes elegir más de una."
      />
    </div>
  );
}

export const SearchableSelects: Story = {
  render: () => <SearchableSelectDemo />,
};

export const PhoneInputs: Story = {
  render: () => (
    <div className="max-w-xl">
      <PhoneInput label="Teléfono de contacto" defaultValue="573052451024" onChange={() => undefined} />
    </div>
  ),
};

export const Textareas: Story = {
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-6">
      <Textarea placeholder="Escribir justificación…" />
      <Textarea placeholder="Escribir justificación…" state="error" />
    </div>
  ),
};

export const Checkboxes: Story = {
  render: () => (
    <div className="flex gap-8">
      <Checkbox label="Archivadas" />
      <Checkbox label="Archivadas" defaultChecked />
      <Checkbox label="Archivadas" disabled />
      <Checkbox label="Archivadas" defaultChecked disabled />
    </div>
  ),
};

function ToggleDemo({ count }: { count: 2 | 3 }) {
  const options = [
    { value: "mine", label: "Mis comisiones" },
    { value: "review", label: "Por revisar" },
    { value: "all", label: "Todas" },
  ].slice(0, count);
  const [value, setValue] = useState(options[0].value);
  return <SegmentedToggle label="Vista" value={value} options={options} onChange={setValue} className="max-w-md" />;
}

export const SegmentedToggles: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <ToggleDemo count={2} />
      <ToggleDemo count={3} />
    </div>
  ),
};

export const Tooltips: Story = {
  render: () => (
    <div className="flex gap-6 p-16">
      <Tooltip content="Solo comisiones del instituto">
        <Button label="Arriba" variant="outline" />
      </Tooltip>
      <Tooltip content="Debe quedar al menos un administrador" position="bottom">
        <Button label="Abajo" variant="outline" />
      </Tooltip>
    </div>
  ),
};
