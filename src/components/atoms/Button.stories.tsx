import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArrowRight, Plus } from "lucide-react";
import { Button, type ButtonVariant } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: { label: "Guardar", variant: "primary", size: "md" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const variants: ButtonVariant[] = ["primary", "secondary", "outline", "text", "ghost", "danger"];

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {variants.map((variant) => (
        <div key={variant} className="flex items-center gap-6">
          <span className="w-24 text-sm text-gray-500">{variant}</span>
          <Button variant={variant} size="sm" label="Guardar" iconLeft={<Plus size={16} />} />
          <Button variant={variant} label="Guardar" iconLeft={<Plus size={18} />} />
          <Button variant={variant} label="Siguiente" iconRight={<ArrowRight size={18} />} />
          <Button variant={variant} label="Guardar" disabled />
        </div>
      ))}
    </div>
  ),
};

export const Loading: Story = {
  args: { isLoading: true, loadingText: "Enviando" },
};

export const IconOnly: Story = {
  args: { label: "", "aria-label": "Agregar", variant: "ghost", iconLeft: <Plus size={18} /> },
};
