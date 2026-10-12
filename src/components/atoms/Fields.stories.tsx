import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Search } from "lucide-react";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { SegmentedToggle } from "./SegmentedToggle";
import { Textarea } from "./Textarea";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";

const meta = {
  title: "Atoms/Fields",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

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
