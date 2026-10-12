import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar, MapPin, Undo2 } from "lucide-react";
import { RecordCard } from "./RecordCard";
import { RecordRow } from "./RecordRow";

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

  it("renders the minimum without click", () => {
    render(<RecordRow person={{ name: "Ana Ruiz" }} title="Curso" status={{ label: "Finalizada", tone: "neutral" }} dates={{ primary: "1 dic 2026" }} />);

    expect(screen.getByRole("button", { name: /Ana Ruiz/ })).toBeDisabled();
    expect(screen.queryByText("Hace 3 días")).not.toBeInTheDocument();
  });
});
