import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar, MapPin, Undo2 } from "lucide-react";
import { RecordCard } from "./RecordCard";
import { RecordRow } from "./RecordRow";
import { RecordTableHeader } from "./RecordTableHeader";

describe("RecordCard", () => {
  it("shows the status, code, meta, progress, note and footer and opens on click", async () => {
    const onClick = vi.fn();
    const { container } = render(
      <RecordCard
        title="Congreso Latinoamericano de Física Estadística"
        status={{ label: "Devuelta", tone: "warning" }}
        code="Sin número"
        meta={[
          { icon: MapPin, text: "Lima, Perú" },
          { icon: Calendar, text: "14 – 18 nov 2026 · 5 días" },
        ]}
        progress={{ reached: 1, total: 4 }}
        note={{ icon: Undo2, text: "Corregir y reenviar" }}
        footer="Actualizada hace 2 h"
        onClick={onClick}
        order={2}
      />,
    );

    const card = screen.getByRole("button", { name: /Congreso Latinoamericano/ });
    expect(card).toHaveTextContent("Devuelta");
    expect(screen.getByText("Sin número")).toBeInTheDocument();
    expect(screen.getByText("Lima, Perú")).toBeInTheDocument();
    expect(screen.getByText("Corregir y reenviar")).toBeInTheDocument();
    expect(screen.getByText("Actualizada hace 2 h")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-grow-x, [class*='animate-grow-x']")).toHaveLength(1);

    await userEvent.click(card);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is a static card without click, code, meta, progress or note", () => {
    render(<RecordCard title="Taller" status={{ label: "Solicitada", tone: "info" }} note={{ icon: Undo2, text: "Nota", tone: "info" }} />);

    expect(screen.getByRole("button", { name: /Taller/ })).toBeDisabled();
    expect(screen.queryByText("Sin número")).not.toBeInTheDocument();
  });
});

describe("RecordRow", () => {
  it("shows the person, subject, place, dates, waiting time and status", async () => {
    const onClick = vi.fn();
    render(
      <RecordRow
        person={{ name: "Juan Giraldo", detail: "Profesor · Instituto de Física" }}
        title="Congreso Latinoamericano de Física Estadística"
        place={{ icon: MapPin, text: "Lima, Perú" }}
        dates={{ primary: "14 – 18 nov 2026", secondary: "5 días" }}
        waiting="Hace 3 días"
        status={{ label: "Solicitada", tone: "info" }}
        onClick={onClick}
        order={1}
      />,
    );

    const row = screen.getByRole("button", { name: /Juan Giraldo/ });
    expect(row).toHaveTextContent("Profesor · Instituto de Física");
    expect(row).toHaveTextContent("Lima, Perú");
    expect(row).toHaveTextContent("5 días");
    expect(row).toHaveTextContent("Hace 3 días");
    expect(row).toHaveTextContent("Solicitada");

    await userEvent.click(row);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("leaves the person out when there is none", () => {
    render(<RecordRow title="Escuela de Física Computacional" status={{ label: "Finalizada", tone: "neutral" }} onClick={vi.fn()} />);

    const row = screen.getByRole("button", { name: /Escuela de Física Computacional/ });
    expect(row.style.getPropertyValue("--record-columns")).toBe("4px minmax(0,1fr) 10rem 8rem 8rem auto");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("counts the documents in their own column", () => {
    render(
      <>
        <RecordRow person={{ name: "Juan Giraldo" }} title="Con dos" status={{ label: "Aprobada", tone: "success" }} documents={2} />
        <RecordRow title="Con uno" status={{ label: "Aprobada", tone: "success" }} documents={1} />
        <RecordRow title="Sin documentos" status={{ label: "Finalizada", tone: "neutral" }} documents={0} />
        <RecordRow title="Sin conteo" status={{ label: "Solicitada", tone: "info" }} documents={null} />
      </>,
    );

    const withTwo = screen.getByRole("button", { name: /Con dos/ });
    expect(withTwo).toHaveTextContent("2 documentos");
    expect(withTwo.style.getPropertyValue("--record-columns")).toBe(
      "4px minmax(0,16rem) minmax(0,1fr) 10rem 8rem 8rem 6rem auto",
    );
    expect(screen.getByRole("button", { name: /Con uno/ })).toHaveTextContent("1 documento");
    expect(screen.getByRole("button", { name: /Sin documentos/ })).toHaveTextContent("—");
    expect(screen.getByRole("button", { name: /Sin conteo/ })).not.toHaveTextContent("documento");
  });

  it("renders the minimum without click", () => {
    render(<RecordRow person={{ name: "Ana Ruiz" }} title="Curso" status={{ label: "Finalizada", tone: "neutral" }} dates={{ primary: "1 dic 2026" }} />);

    expect(screen.getByRole("button", { name: /Ana Ruiz/ })).toBeDisabled();
    expect(screen.queryByText("Hace 3 días")).not.toBeInTheDocument();
  });
});

describe("RecordRow as a table row", () => {
  it("lines the header up with the rows", () => {
    render(
      <>
        <RecordTableHeader labels={{ person: "Profesor", title: "Asunto", dates: "Fechas", status: "Estado", documents: "Documentos" }} />
        <RecordRow
          variant="table"
          person={{ name: "Juan Giraldo" }}
          title="Congreso de Física Médica"
          place={{ icon: MapPin, text: "Bogotá, Colombia" }}
          dates={{ primary: "2 – 5 dic 2025" }}
          status={{ label: "Aprobada", tone: "success" }}
          documents={2}
          onClick={vi.fn()}
        />
      </>,
    );

    const row = screen.getByRole("button", { name: /Congreso de Física Médica/ });
    const header = screen.getByText("Profesor").parentElement as HTMLElement;
    expect(header).toHaveTextContent("ProfesorAsuntoFechasEstadoDocumentos");
    expect(header.style.getPropertyValue("--record-columns")).toBe(row.style.getPropertyValue("--record-columns"));
    expect(row.style.getPropertyValue("--record-columns")).toBe("220px minmax(0,1fr) 220px 140px 120px");
    expect(row).toHaveTextContent("Bogotá, Colombia");
    expect(row).toHaveTextContent("2 documentos");
  });

  it("leaves the person, the waiting time and the documents out unless named", () => {
    render(
      <>
        <RecordTableHeader labels={{ title: "Asunto", dates: "Fechas", waiting: "Espera", status: "Estado" }} />
        <RecordRow variant="table" title="Taller" status={{ label: "Devuelta", tone: "warning" }} waiting="Hace 2 días" />
      </>,
    );

    const row = screen.getByRole("button", { name: /Taller/ });
    expect(row.style.getPropertyValue("--record-columns")).toBe("minmax(0,1fr) 220px 8rem 140px");
    expect(row).toHaveTextContent("Hace 2 días");
    expect(row).toBeDisabled();
  });

  it("stripes and mutes the rows that ask for it", () => {
    render(
      <RecordRow variant="table" title="Carga histórica" status={{ label: "Finalizada", tone: "neutral" }} striped muted onClick={vi.fn()} />,
    );

    const row = screen.getByRole("button", { name: /Carga histórica/ });
    expect(row.className).toContain("bg-slate-50");
    expect(screen.getByText("Carga histórica").parentElement?.className).toContain("text-gray-500");
  });
});
