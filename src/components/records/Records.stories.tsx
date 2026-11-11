import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, FileUp, MapPin, Undo2 } from "lucide-react";
import { RecordCard, type RecordCardProps } from "./RecordCard";
import { RecordRow } from "./RecordRow";
import type { Tone } from "../../theme/tones";

const meta = {
  title: "Records",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function ignore() {}

const place = { icon: MapPin, text: "Lima, Perú" };
const dates = { icon: Calendar, text: "14 – 18 nov 2026 · 5 días" };

const cards: { label: string; tone: Tone; code: string; reached: number; note?: RecordCardProps["note"] }[] = [
  { label: "Solicitada", tone: "info", code: "Sin número", reached: 1 },
  { label: "Visto bueno", tone: "review", code: "Sin número", reached: 2 },
  { label: "Devuelta", tone: "warning", code: "Sin número", reached: 1, note: { icon: Undo2, text: "Corregir y reenviar" } },
  { label: "Aprobada", tone: "success", code: "C-0012-2026", reached: 3, note: { icon: FileUp, text: "Cumplido pendiente" } },
  { label: "Rechazada", tone: "danger", code: "Sin número", reached: 2 },
  { label: "Finalizada", tone: "neutral", code: "C-0012-2026", reached: 4 },
];

export const Cards: Story = {
  render: () => (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, index) => (
        <RecordCard
          key={card.label}
          title="Congreso Latinoamericano de Física Estadística"
          status={{ label: card.label, tone: card.tone }}
          code={card.code}
          meta={[place, dates]}
          progress={{ reached: card.reached, total: 4 }}
          note={card.note}
          footer="Actualizada hace 2 h"
          onClick={ignore}
          order={index}
        />
      ))}
    </div>
  ),
};

export const Rows: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {cards.map((card, index) => (
        <RecordRow
          key={card.label}
          person={{ name: "Juan Giraldo", detail: "Profesor · Instituto de Física" }}
          title="Congreso Latinoamericano de Física Estadística"
          place={place}
          dates={{ primary: "14 – 18 nov 2026", secondary: "5 días" }}
          waiting="Hace 3 días"
          status={{ label: card.label, tone: card.tone }}
          onClick={ignore}
          order={index}
        />
      ))}
    </div>
  ),
};

export const RowsWithDocuments: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <RecordRow
        person={{ name: "Juan Giraldo" }}
        title="Congreso de Física Médica"
        place={{ icon: MapPin, text: "Bogotá, Colombia" }}
        dates={{ primary: "2 – 5 dic 2025" }}
        status={{ label: "Aprobada", tone: "success" }}
        documents={2}
        onClick={ignore}
      />
      <RecordRow
        title="Taller de Óptica No Lineal"
        place={{ icon: MapPin, text: "Medellín, Colombia" }}
        dates={{ primary: "3 – 7 jul 2023" }}
        status={{ label: "Devuelta", tone: "warning" }}
        documents={1}
        onClick={ignore}
        order={1}
      />
      <RecordRow
        title="Carga histórica"
        dates={{ primary: "Resolución del 12 ago 2019" }}
        status={{ label: "Finalizada", tone: "neutral" }}
        documents={0}
        onClick={ignore}
        order={2}
      />
    </div>
  ),
};
