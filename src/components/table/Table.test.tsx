import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn } from "./DataTable";
import { Table, TableRow } from "./Table";
import { TablePerson, TableText, TableTitle } from "./TableCells";

type TestRow = { name: string; count: number };
const dataTableColumns: DataTableColumn<TestRow>[] = [
  { key: "name", header: "Nombre", sortable: true },
  { key: "count", header: "Cantidad", align: "right", render: (row) => `${row.count} unidades` },
];

describe("DataTable", () => {
  it("renders columns and rows, sorts, and renders row actions", async () => {
    const onSort = vi.fn();
    render(
      <DataTable
        title="Unidades"
        subtitle="Catálogo"
        columns={dataTableColumns}
        data={[{ name: "Física", count: 3 }]}
        sortBy="name"
        sortDir="asc"
        onSort={onSort}
        rowKey={(row) => row.name}
        rowActions={(row) => <button type="button">Abrir {row.name}</button>}
      />,
    );
    expect(screen.getByRole("table", { name: "Unidades" })).toBeInTheDocument();
    expect(screen.getByText("3 unidades")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Nombre/ })).toHaveAttribute("aria-sort", "ascending");
    await userEvent.click(screen.getByRole("button", { name: /Nombre/ }));
    expect(onSort).toHaveBeenCalledWith("name");
    expect(screen.getByRole("button", { name: "Abrir Física" })).toBeInTheDocument();
  });

  it("renders empty and loading states", () => {
    const { rerender, container } = render(<DataTable columns={dataTableColumns} data={[]} emptyMessage="Sin unidades" />);
    expect(screen.getByText("Sin unidades")).toBeInTheDocument();
    rerender(<DataTable columns={dataTableColumns} data={[]} loading />);
    expect(container.querySelector("tbody")).toHaveAttribute("aria-busy", "true");
    expect(document.querySelectorAll("tbody .animate-pulse")).toHaveLength(10);
  });
});

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

  it("wraps the names on narrow tables instead of cutting them", () => {
    render(
      <>
        <TablePerson name="Ricardo Antonio Alzate Cano" detail="Profesor · Instituto de Física" />
        <TableTitle title="Congreso de Física Médica" subtitle="Ciudad de México, Ciudad de México, México" />
      </>,
    );

    for (const text of ["Ricardo Antonio Alzate Cano", "Profesor · Instituto de Física", "Congreso de Física Médica", "Ciudad de México, Ciudad de México, México"]) {
      expect(screen.getByText(text)).toHaveClass("@5xl:truncate");
      expect(screen.getByText(text)).not.toHaveClass("truncate");
    }
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
