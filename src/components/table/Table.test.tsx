import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table, TableRow } from "./Table";
import { TablePerson, TableText, TableTitle } from "./TableCells";

describe("Table", () => {
  it("sets the column widths once for the header and the rows", () => {
    const { container } = render(
      <Table
        columns={[{ label: "Profesor", width: "220px" }, { label: "Asunto" }, { label: "Estado", width: "140px" }]}
      >
        <TableRow>
          <TableText>Juan Giraldo</TableText>
          <TableText>Congreso</TableText>
          <TableText>Aprobada</TableText>
        </TableRow>
      </Table>,
    );

    const table = container.firstElementChild as HTMLElement;
    expect(table.style.getPropertyValue("--table-columns")).toBe("220px minmax(0,1fr) 140px");
    expect(screen.getByText("Profesor").parentElement).toHaveTextContent("ProfesorAsuntoEstado");
    expect(screen.getByText("Profesor").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("opens a row on click and leaves the others as plain rows", async () => {
    const onClick = vi.fn();
    render(
      <Table columns={[{ label: "Asunto" }]}>
        <TableRow onClick={onClick} order={2}>
          <TableText>Con clic</TableText>
        </TableRow>
        <TableRow>
          <TableText>Sin clic</TableText>
        </TableRow>
      </Table>,
    );

    const clickable = screen.getByRole("button", { name: "Con clic" });
    await userEvent.click(clickable);

    expect(onClick).toHaveBeenCalledOnce();
    expect(clickable.style.animationDelay).toBe("100ms");
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(screen.getByText("Sin clic").parentElement?.tagName).toBe("DIV");
  });
  it("centers the header and the cells of a centered column", () => {
    const { container } = render(
      <Table columns={[{ label: "Asunto" }, { label: "Documentos", width: "120px", align: "center" }]}>
        <TableRow>
          <TableText>Congreso</TableText>
          <TableText>2</TableText>
        </TableRow>
      </Table>,
    );

    const rows = container.firstElementChild?.lastElementChild as HTMLElement;
    expect(screen.getByText("Documentos").className).toContain("justify-self-center");
    expect(screen.getByText("Asunto").className).not.toContain("justify-self-center");
    expect(rows.className).toBe("@5xl:[&>*>:nth-child(2)]:justify-self-center");
  });
});

describe("Table cells", () => {
  it("shows the person with an optional detail", () => {
    render(
      <>
        <TablePerson name="Juan Giraldo" detail="Profesor · Instituto de Física" />
        <TablePerson name="Ana Villa" />
      </>,
    );

    expect(screen.getByRole("img", { name: "Juan Giraldo" })).toHaveTextContent("JG");
    expect(screen.getByText("Profesor · Instituto de Física")).toBeInTheDocument();
    expect(screen.getByText("Ana Villa").nextElementSibling).toBeNull();
  });

  it("mutes the title when asked", () => {
    render(
      <>
        <TableTitle title="Congreso de Física Médica" subtitle="Bogotá, Colombia" />
        <TableTitle title="Carga histórica" muted />
      </>,
    );

    expect(screen.getByText("Congreso de Física Médica").className).toContain("text-gray-900");
    expect(screen.getByText("Bogotá, Colombia")).toBeInTheDocument();
    expect(screen.getByText("Carga histórica").className).toContain("text-gray-500");
    expect(screen.getByText("Carga histórica").nextElementSibling).toBeNull();
  });
});
