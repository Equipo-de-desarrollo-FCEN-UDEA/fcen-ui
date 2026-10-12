import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  ArrowLeft,
  Ban,
  Briefcase,
  Building2,
  CircleCheck,
  FileCheck,
  FileText,
  History,
  MonitorSmartphone,
  Plane,
  Plus,
  Send,
  Signature,
  ThumbsUp,
  Undo2,
  User,
} from "lucide-react";
import { Button } from "../atoms/Button";
import { PingDot } from "../atoms/PingDot";
import { FileDrop } from "../process/FileDrop";
import { FileItem } from "../process/FileItem";
import { Stepper } from "../process/Stepper";
import { Timeline, TimelineItem } from "../process/TimelineItem";
import { HeroNavTile } from "../tiles/HeroNavTile";
import { NavTile } from "../tiles/NavTile";
import { StatusTile } from "../tiles/StatusTile";
import { AppShell, PageHeader } from "./Layout";
import { TopBar, type ThemeMode } from "./TopBar";
import { UserMenu } from "./UserMenu";

const meta = {
  title: "Screens",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const capacities = [
  { value: "director", label: "Director", detail: "Instituto de Física", icon: Building2 },
  { value: "professor", label: "Profesor", detail: "Instituto de Física", icon: Briefcase },
  { value: "employee", label: "Empleado", detail: "Decanatura", icon: User },
];

function ignore() {}

function Shell({ children }: { children: React.ReactNode }) {
  const [capacity, setCapacity] = useState("director");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const active = capacities.find((item) => item.value === capacity) ?? capacities[0];
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <div className={theme === "dark" ? "dark" : undefined}>
      <AppShell
        topBar={
          <TopBar
            name="Andrés Ríos"
            roleLabel={`${active.label} · ${active.detail}`}
            roleIcon={active.icon}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSignOut={ignore}
            userMenu={(close) => (
              <UserMenu
                name="Andrés Ríos"
                username="andres.rios"
                options={capacities}
                value={capacity}
                onChange={(value) => {
                  setCapacity(value);
                  close();
                }}
                links={[
                  { label: "Mis sesiones", icon: MonitorSmartphone, onClick: close },
                  { label: "Mi firma", icon: Signature, onClick: close },
                ]}
              />
            )}
          />
        }
      >
        {children}
      </AppShell>
    </div>
  );
}

export const Home: Story = {
  render: () => (
    <Shell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <HeroNavTile
          label="Nueva comisión"
          icon={Plus}
          watermark={Plane}
          onClick={ignore}
          detail={
            <>
              <PingDot tone="success" />
              Lista para solicitar
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <NavTile
            label="Mis comisiones"
            icon={FileText}
            onClick={ignore}
            order={1}
            detail={
              <>
                <PingDot tone="info" pulse={false} />2 en revisión
              </>
            }
          />
          <NavTile label="SIGA anterior" icon={History} onClick={ignore} order={2} />
        </div>
      </div>
    </Shell>
  ),
};

const statusTiles = [
  { label: "Solicitadas", count: 12, tone: "info", icon: Send },
  { label: "Con visto bueno", count: 4, tone: "review", icon: ThumbsUp },
  { label: "Devueltas", count: 2, tone: "warning", icon: Undo2 },
  { label: "Aprobadas", count: 31, tone: "success", icon: CircleCheck },
  { label: "Rechazadas", count: 1, tone: "danger", icon: Ban },
  { label: "Finalizadas", count: 58, tone: "neutral", icon: FileCheck },
] as const;

function StatusTilesDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {statusTiles.map((tile, index) => (
        <StatusTile
          key={tile.label}
          {...tile}
          order={index}
          selected={selected === tile.label}
          onClick={() => setSelected(selected === tile.label ? null : tile.label)}
        />
      ))}
    </div>
  );
}

export const StatusTiles: Story = {
  parameters: { layout: "padded" },
  render: () => <StatusTilesDemo />,
};

function DetailDemo() {
  const [files, setFiles] = useState<string[]>(["carta-invitacion.pdf"]);
  const addFile = (file: File) => setFiles([...files, file.name]);
  return (
    <Shell>
      <PageHeader
        title="Congreso Latinoamericano de Física Estadística"
        subtitle="Lima, Perú · 14 – 18 nov 2026 · 5 días"
        actions={<Button label="Mis comisiones" variant="outline" iconLeft={<ArrowLeft size={18} />} />}
      />
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <Stepper
          label="Estado"
          steps={[
            { label: "Solicitada", state: "done" },
            { label: "Visto bueno", state: "done" },
            { label: "Aprobada", state: "current" },
            { label: "Finalizada", state: "upcoming" },
          ]}
        />
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="font-semibold">Documentos</h2>
          {files.map((name) => (
            <FileItem key={name} name={name} state="uploaded" detail="Carta de invitación · 1,8 MB" />
          ))}
          <FileItem name="cumplido.pdf" state="uploading" progress={55} />
          <FileDrop onFile={addFile} accept="application/pdf" maxSizeMb={5} hint="PDF · máx. 5 MB" />
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 font-semibold">Historial</h2>
          <Timeline label="Historial">
            <TimelineItem tone="success" status="Aprobada" date="16 oct 2026 · 9:15 a. m." actor="Decano · Decanatura" />
            <TimelineItem tone="review" status="Visto bueno" date="15 oct 2026 · 3:20 p. m." actor="Director · Instituto de Física" order={1} />
            <TimelineItem
              tone="info"
              status="Solicitada"
              date="14 oct 2026 · 10:42 a. m."
              actor="Profesor · Instituto de Física"
              observation="Adjuntar la carta de invitación firmada."
              last
              order={2}
            />
          </Timeline>
        </section>
      </div>
    </Shell>
  );
}

export const Detail: Story = {
  render: () => <DetailDemo />,
};

export const WizardSteps: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex max-w-3xl flex-col gap-8">
      <Stepper
        accent="brand"
        size="md"
        steps={[
          { label: "Asunto", state: "done" },
          { label: "Fechas", state: "done" },
          { label: "Lugar e idioma", state: "current" },
          { label: "Justificación", state: "upcoming" },
          { label: "Documentos", state: "upcoming" },
        ]}
      />
      <Stepper
        steps={[
          { label: "Devuelta", state: "warning" },
          { label: "Visto bueno", state: "upcoming" },
          { label: "Aprobada", state: "upcoming" },
          { label: "Finalizada", state: "upcoming" },
        ]}
      />
      <Stepper
        steps={[
          { label: "Solicitada", state: "done" },
          { label: "Rechazada", state: "danger" },
          { label: "Aprobada", state: "upcoming" },
          { label: "Finalizada", state: "upcoming" },
        ]}
      />
    </div>
  ),
};
