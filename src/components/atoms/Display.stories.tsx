import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Chip } from "./Chip";
import { CodePill } from "./CodePill";
import { CountryFlag } from "./CountryFlag";
import { Label } from "./Label";
import { PingDot } from "./PingDot";
import { Spinner } from "./Spinner";
import { StatusBadge } from "./StatusBadge";
import type { Tone } from "../../theme/tones";

const meta = {
  title: "Atoms/Display",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const toneLabels: [Tone, string][] = [
  ["info", "Solicitada"],
  ["review", "Visto bueno"],
  ["warning", "Devuelta"],
  ["success", "Aprobada"],
  ["danger", "Rechazada"],
  ["neutral", "Finalizada"],
];

function ignoreRemove() {}

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {toneLabels.map(([tone, label]) => (
          <StatusBadge key={tone} tone={tone} label={label} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {toneLabels.map(([tone, label]) => (
          <StatusBadge key={tone} tone={tone} label={label} size="md" />
        ))}
      </div>
    </div>
  ),
};

export const PingDots: Story = {
  render: () => (
    <div className="flex gap-6">
      {toneLabels.map(([tone]) => (
        <PingDot key={tone} tone={tone} />
      ))}
    </div>
  ),
};

export const Avatars: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar name="Juan Giraldo" />
      <Avatar name="Juan Giraldo" size="sm" />
      <Avatar />
    </div>
  ),
};

export const Pills: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <CodePill code="C-0001-2026" />
      <Chip label="Física" />
      <Chip label="Física" onRemove={ignoreRemove} />
    </div>
  ),
};

export const Labels: Story = {
  render: () => (
    <div className="flex gap-8">
      <Label text="Asunto" required />
      <Label text="Notas" />
    </div>
  ),
};

export const CountryFlags: Story = {
  render: () => (
    <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-200">
      <span className="inline-flex items-center gap-2"><CountryFlag country="CO" /> Colombia</span>
      <span className="inline-flex items-center gap-2"><CountryFlag country="PE" /> Perú</span>
      <span className="inline-flex items-center gap-2"><CountryFlag country="US" /> Estados Unidos</span>
    </div>
  ),
};

export const Cards: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader><CardTitle>Laboratorio de Física</CardTitle></CardHeader>
      <CardContent>Bloque 6 · Salón 104</CardContent>
    </Card>
  ),
};

export const Spinners: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size={14} />
      <Spinner />
      <Spinner size={28} />
    </div>
  ),
};
