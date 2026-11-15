import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../atoms/Button";
import { StatusBadge } from "../atoms/StatusBadge";
import { DocumentCount } from "../records/DocumentCount";
import type { Tone } from "../../theme/tones";
import { TableSkeleton } from "../molecules/TableSkeleton";
import { DataTable, type DataTableColumn } from "./DataTable";
import { Table, TableRow, type TableColumn } from "./Table";
import { TablePerson, TableText, TableTitle } from "./TableCells";

const meta = {
  title: "Table",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function ignore() {}

const commissions: {
  person: string;
  title: string;
  place: string;
  dates: string;
  label: string;
  tone: Tone;
  documents: number;
  muted?: boolean;
}[] = [
  {
    person: "Juan Giraldo",
    title: "Congreso de Física Médica",
    place: "Bogotá, Colombia",
    dates: "2 – 5 dic 2025",
    label: "Aprobada",
    tone: "success",
    documents: 2,
  },
  {
    person: "Laura Restrepo",
    title: "Escuela de Física Computacional",
    place: "Santiago, Chile",
    dates: "10 – 21 jun 2025",
    label: "Finalizada",
    tone: "neutral",
    documents: 2,
  },
  {
    person: "Sara Gómez",
    title: "Jurado de maestría en la UIS",
    place: "Bucaramanga, Colombia",
    dates: "14 – 15 mar 2024",
    label: "Finalizada",
    tone: "neutral",
    documents: 2,
  },
  {
    person: "Pablo Henao",
    title: "Taller de Óptica No Lineal",
    place: "Medellín, Colombia",
    dates: "3 – 7 jul 2023",
    label: "Devuelta",
    tone: "warning",
    documents: 1,
  },
  {
    person: "Ana Villa",
    title: "Carga histórica",
    place: "Sin lugar registrado",
    dates: "Resolución del 12 ago 2019",
    label: "Finalizada",
    tone: "neutral",
    documents: 0,
    muted: true,
  },
];

const commissionColumns: TableColumn[] = [
  { label: "Asunto" },
  { label: "Fechas", width: "220px" },
  { label: "Estado", width: "140px" },
  { label: "Documentos", width: "120px", align: "center" },
];

export const Faculty: Story = {
  render: () => (
    <Table columns={[{ label: "Profesor", width: "220px" }, ...commissionColumns]}>
      {commissions.map((row, index) => (
        <TableRow key={row.title} onClick={ignore} order={index}>
          <TablePerson name={row.person} />
          <TableTitle title={row.title} subtitle={row.place} muted={row.muted} />
          <TableText>{row.dates}</TableText>
          <span>
            <StatusBadge label={row.label} tone={row.tone} />
          </span>
          <DocumentCount count={row.documents} />
        </TableRow>
      ))}
    </Table>
  ),
};

export const Own: Story = {
  render: () => (
    <Table columns={commissionColumns}>
      {commissions.map((row, index) => (
        <TableRow key={row.title} onClick={ignore} order={index}>
          <TableTitle title={row.title} subtitle={row.place} muted={row.muted} />
          <TableText>{row.dates}</TableText>
          <span>
            <StatusBadge label={row.label} tone={row.tone} />
          </span>
          <DocumentCount count={row.documents} />
        </TableRow>
      ))}
    </Table>
  ),
};

const permissions = [
  { resource: "Mis datos y sesiones", read: "Propia", write: "Propia" },
  { resource: "Bandeja de comisiones", read: "Unidad", write: "—" },
  { resource: "SIGA anterior", read: "Unidad", write: "—" },
];

export const WithoutClick: Story = {
  render: () => (
    <Table
      columns={[
        { label: "Recurso" },
        { label: "Leer", width: "160px" },
        { label: "Escribir", width: "160px" },
      ]}
    >
      {permissions.map((row, index) => (
        <TableRow key={row.resource} order={index}>
          <TableText>{row.resource}</TableText>
          <TableText>{row.read}</TableText>
          <TableText>{row.write}</TableText>
        </TableRow>
      ))}
    </Table>
  ),
};

type Room = { name: string; building: string; capacity: number };

const roomColumns: DataTableColumn<Room>[] = [
  { key: "name", header: "Espacio", sortable: true },
  { key: "building", header: "Bloque" },
  { key: "capacity", header: "Capacidad", align: "center" },
];

const rooms: Room[] = [
  { name: "Laboratorio de Física", building: "6", capacity: 24 },
  { name: "Aula 301", building: "3", capacity: 36 },
];

export const DataTables: Story = {
  render: () => (
    <DataTable
      title="Espacios"
      subtitle="Espacios disponibles para reserva"
      columns={roomColumns}
      data={rooms}
      sortBy="name"
      sortDir="asc"
      onSort={() => undefined}
      rowKey={(room) => room.name}
      rowActions={(room) => <Button label={`Editar ${room.name}`} variant="outline" size="sm" />}
    />
  ),
};

export const DataTableLoading: Story = {
  render: () => <DataTable title="Espacios" columns={roomColumns} data={[]} loading />,
};

export const TableSkeletons: Story = {
  render: () => <TableSkeleton rows={3} columns={4} />,
};
