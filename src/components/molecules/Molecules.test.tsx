import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderOpen, Stamp } from "lucide-react";
import { Input } from "../atoms/Input";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Dropdown } from "./Dropdown";
import { DropdownAcademicUnit } from "./DropdownAcademicUnit";
import { EmptyState } from "./EmptyState";
import { FormField } from "./FormField";
import { MultiSelectChips } from "./MultiSelectChips";
import { Pagination } from "./Pagination";
import { PhoneInput } from "./PhoneInput";
import { SelectionSummaryCard } from "./SelectionSummaryCard";
import { SummaryCard } from "./SummaryCard";
import { TableSkeleton } from "./TableSkeleton";
import { countryName, countryOptions, formatPhone, joinPhone, phoneError, splitPhone } from "../../utils/phone";

const choices = [
  { value: "physics", label: "Instituto de Física" },
  { value: "math", label: "Instituto de Matemáticas" },
  { value: "biology", label: "Instituto de Biología" },
];

describe("CollapsiblePanel", () => {
  it("toggles the body and displays the error and action", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <CollapsiblePanel
        index={2}
        title="Reserva"
        subtitle="Espacio"
        collapsed={false}
        onToggle={onToggle}
        error="Horario requerido"
        actions={<button type="button">Editar</button>}
      >
        <p>Detalle de reserva</p>
      </CollapsiblePanel>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Horario requerido");
    await user.click(screen.getByRole("button", { name: "Minimizar" }));
    expect(onToggle).toHaveBeenCalledOnce();
    rerender(
      <CollapsiblePanel index={2} title="Reserva" subtitle="Espacio" collapsed onToggle={onToggle}>
        <p>Detalle de reserva</p>
      </CollapsiblePanel>,
    );
    expect(screen.queryByText("Detalle de reserva")).not.toBeInTheDocument();
  });

  it("keeps the body visible when the toggle is hidden", () => {
    render(
      <CollapsiblePanel index={1} title="Aula" subtitle="Bloque 1" collapsed onToggle={vi.fn()} hideToggle>
        <p>Contenido fijo</p>
      </CollapsiblePanel>,
    );
    expect(screen.getByText("Contenido fijo")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Expandir" })).not.toBeInTheDocument();
  });
});

describe("Dropdown", () => {
  it("expands nested options and returns the selected option", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <Dropdown
        title="Seleccionar"
        options={[{ value: "faculty", label: "Facultad", children: [{ value: "physics", label: "Física" }] }]}
        onSelect={onSelect}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Seleccionar" }));
    await user.click(screen.getByRole("button", { name: "Ver subunidades de Facultad" }));
    await user.click(screen.getByRole("menuitem", { name: "Física" }));
    expect(onSelect).toHaveBeenCalledWith("physics", { value: "physics", label: "Física" });
    expect(screen.getByRole("button", { name: "Seleccionar" })).toHaveAttribute("aria-expanded", "false");
  });

  it("shows empty options", async () => {
    const user = userEvent.setup();
    render(<Dropdown title="Vacío" options={[]} onSelect={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Vacío" }));
    expect(screen.getByText("Sin datos disponibles")).toBeInTheDocument();
  });

  it("triggers lazy expansion, shows loading and closes outside", async () => {
    const onExpand = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Dropdown
          title="Unidades"
          options={[{ value: "root", label: "Raíz", expandable: true }]}
          onSelect={vi.fn()}
          onExpand={onExpand}
          loadingId="root"
        />
        <button type="button">Fuera</button>
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Unidades" }));
    await user.click(screen.getByRole("button", { name: "Ver subunidades de Raíz" }));
    expect(onExpand).toHaveBeenCalledWith("root");
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fuera" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("does not open when disabled", async () => {
    render(<Dropdown title="Bloqueado" options={[]} onSelect={vi.fn()} disabled />);
    const trigger = screen.getByRole("button", { name: "Bloqueado" });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("DropdownAcademicUnit", () => {
  const units = [{ id: "faculty", name: "Facultad", children: [{ id: "physics", name: "Física" }] }];

  it("receives its options and reports both selected ID and label", async () => {
    const onSelect = vi.fn();
    const onSelectWithLabel = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownAcademicUnit
        units={units}
        value=""
        onSelect={onSelect}
        onSelectWithLabel={onSelectWithLabel}
        placeholder="Unidad"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Unidad" }));
    await user.click(screen.getByRole("button", { name: "Ver subunidades de Facultad" }));
    await user.click(screen.getByRole("menuitem", { name: "Física" }));
    expect(onSelect).toHaveBeenCalledWith("physics");
    expect(onSelectWithLabel).toHaveBeenCalledWith("physics", "Física");
  });

  it("uses the supplied selected label when there is no matching option", () => {
    render(<DropdownAcademicUnit units={[]} value="missing" selectedLabel="Unidad seleccionada" onSelect={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Unidad seleccionada" })).toBeInTheDocument();
  });

  it("does not keep a cached selection label after the selection is cleared", async () => {
    const user = userEvent.setup();
    const options = [{ id: "physics", name: "Instituto de Física" }];
    const props = { units: options, onSelect: vi.fn(), selectedLabel: "Seleccionar unidad" };
    const { rerender } = render(<DropdownAcademicUnit {...props} value="physics" />);
    await user.click(screen.getByRole("button", { name: "Instituto de Física" }));
    await user.click(screen.getByRole("menuitem", { name: "Instituto de Física" }));
    rerender(<DropdownAcademicUnit {...props} value="" />);
    expect(screen.getByRole("button", { name: "Seleccionar unidad" })).toBeInTheDocument();
  });
});

describe("MultiSelectChips", () => {
  it("adds an available option and removes selected chips", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MultiSelectChips label="Unidades" options={choices} selected={["physics"]} onChange={onChange} />);
    await user.click(screen.getByRole("combobox", { name: "Unidades" }));
    await user.click(screen.getByRole("option", { name: "Instituto de Matemáticas" }));
    expect(onChange).toHaveBeenCalledWith(["physics", "math"]);
    await user.click(screen.getByRole("button", { name: "Quitar Instituto de Física" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe("PhoneInput and phone helpers", () => {
  it("normalizes, formats and validates international phone numbers", () => {
    const parsed = splitPhone("573052451024");
    expect(parsed).toEqual({ country: "CO", national: "3052451024" });
    expect(joinPhone(parsed)).toBe("573052451024");
    expect(formatPhone("573052451024")).toBe("57 305 245 1024");
    expect(phoneError(parsed)).toBeNull();
    expect(phoneError({ country: "CO", national: "12" })).toMatch(/Colombia/);
    expect(phoneError({ country: "CO", national: "" })).toBeNull();
    expect(countryName("CO")).toBe("Colombia");
    expect(countryOptions[0].country).toBe("CO");
  });

  it("updates the calling code and validates user-entered digits", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PhoneInput label="Teléfono" defaultValue="573052451024" onChange={onChange} />);
    const phone = screen.getByRole("textbox", { name: "Teléfono" });
    expect(phone).toHaveValue("305 245 1024");
    await user.clear(phone);
    await user.type(phone, "5551234567");
    expect(onChange).toHaveBeenLastCalledWith("575551234567");

    const country = screen.getByRole("combobox", { name: "País" });
    await user.click(country);
    await user.type(country, "Estados Unidos");
    await user.click(screen.getByRole("option", { name: /Estados Unidos/ }));
    expect(onChange).toHaveBeenLastCalledWith("15551234567");
  });

  it("handles editing the grouping separator and disabled controls", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<PhoneInput label="Contacto" onChange={onChange} />);
    const phone = screen.getByRole("textbox", { name: "Contacto" });
    fireEvent.change(phone, { target: { value: "305 245 1024", selectionStart: 5 } });
    expect(onChange).toHaveBeenCalled();
    rerender(<PhoneInput label="Contacto" onChange={onChange} disabled />);
    expect(screen.getByRole("textbox", { name: "Contacto" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "País" })).toBeDisabled();
  });
});

describe("SelectionSummaryCard", () => {
  it("renders a summary with and without a label", () => {
    const { rerender } = render(<SelectionSummaryCard label="Unidad:">Física</SelectionSummaryCard>);
    expect(screen.getByText("Unidad:")).toBeInTheDocument();
    expect(screen.getByText("Física")).toBeInTheDocument();
    rerender(<SelectionSummaryCard>Matemáticas</SelectionSummaryCard>);
    expect(screen.getByText("Matemáticas")).toBeInTheDocument();
  });
});

describe("TableSkeleton", () => {
  it("renders the requested dimensions and handles empty dimensions", () => {
    const { rerender, container } = render(<TableSkeleton rows={2} columns={3} />);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(9);
    rerender(<TableSkeleton rows={-1} columns={0} />);
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(0);
  });
});

describe("FormField", () => {
  it("links the label and the helper text to its control", () => {
    render(
      <FormField label="Asunto" helperText="Máximo 200 caracteres" required>
        {(control) => <Input {...control} />}
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: /Asunto/ });
    expect(input).toHaveAccessibleDescription("Máximo 200 caracteres");
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("shows the error instead of the helper text", () => {
    render(
      <FormField label="Asunto" helperText="Máximo 200 caracteres" error="El asunto es obligatorio" id="subject">
        {(control) => <Input {...control} />}
      </FormField>,
    );

    const input = screen.getByRole("textbox", { name: "Asunto" });
    expect(input).toHaveAttribute("id", "subject");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("El asunto es obligatorio");
    expect(screen.queryByText("Máximo 200 caracteres")).not.toBeInTheDocument();
  });

  it("renders without a message", () => {
    render(<FormField label="Asunto">{(control) => <Input {...control} />}</FormField>);

    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-describedby");
  });
});

describe("EmptyState", () => {
  it("renders the title, message, icon and action", () => {
    render(
      <EmptyState
        title="Sin comisiones por revisar"
        message="Las nuevas solicitudes aparecen aquí."
        icon={FolderOpen}
        action={<button type="button">Refrescar</button>}
      />,
    );

    expect(screen.getByText("Sin comisiones por revisar")).toBeInTheDocument();
    expect(screen.getByText("Las nuevas solicitudes aparecen aquí.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refrescar" })).toBeInTheDocument();
  });

  it("has a compact version without message or action", () => {
    render(<EmptyState title="Sin resultados" compact />);

    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("SummaryCard", () => {
  it("renders the label and the value", () => {
    render(<SummaryCard label="Resolución" value="C-0001-2026" icon={Stamp} />);

    expect(screen.getByText("Resolución")).toBeInTheDocument();
    expect(screen.getByText("C-0001-2026")).toBeInTheDocument();
  });
});

describe("Pagination", () => {
  it("summarises the range and moves between pages", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={24} onPageChange={onPageChange} />);

    expect(screen.getByText("Mostrando 11–20 de 24")).toBeInTheDocument();
    expect(screen.getByText("de 3")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Anterior" }));
    await userEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    await userEvent.click(screen.getByRole("combobox", { name: "Página" }));
    await userEvent.click(screen.getByRole("option", { name: "3" }));

    expect(onPageChange.mock.calls).toEqual([[1], [3], [3]]);
    expect(screen.queryByRole("combobox", { name: "Por página" })).not.toBeInTheDocument();
  });

  it("disables the edges and changes the page size", async () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination page={1} pageSize={10} total={0} onPageChange={vi.fn()} onPageSizeChange={onPageSizeChange} />,
    );

    expect(screen.getByText("Mostrando 0–0 de 0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();

    await userEvent.click(screen.getByRole("combobox", { name: "Por página" }));
    await userEvent.click(screen.getByRole("option", { name: "20" }));

    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it("lists every page but shows five at a time", async () => {
    render(<Pagination page={120} pageSize={10} total={3667} onPageChange={vi.fn()} />);

    expect(screen.getByText("Mostrando 1.191–1.200 de 3.667")).toBeInTheDocument();
    expect(screen.getByText("de 367")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("combobox", { name: "Página" }));

    const list = screen.getByRole("listbox", { name: "Página" });
    expect(list.style.maxHeight).toBe("172px");
    expect(screen.getAllByRole("option")).toHaveLength(367);
    expect(screen.getByRole("option", { name: "120" })).toHaveAttribute("aria-selected", "true");
  });

  it("moves through the pages with the keyboard", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={120} pageSize={10} total={3667} onPageChange={onPageChange} />);
    const trigger = screen.getByRole("combobox", { name: "Página" });
    const active = () => document.getElementById(trigger.getAttribute("aria-activedescendant") ?? "")?.textContent;

    trigger.focus();
    await userEvent.keyboard("a");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(active()).toBe("120");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}");
    expect(active()).toBe("121");
    await userEvent.keyboard("{End}");
    expect(active()).toBe("367");
    await userEvent.keyboard("{Home}");
    expect(active()).toBe("1");
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.keyboard(" {ArrowDown}{Enter}");
    expect(onPageChange).toHaveBeenCalledWith(121);
  });

  it("closes without changing the page on the same page or outside", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageSize={10} total={24} onPageChange={onPageChange} />);
    const trigger = screen.getByRole("combobox", { name: "Página" });

    await userEvent.click(trigger);
    await userEvent.hover(screen.getByRole("option", { name: "3" }));
    expect(trigger.getAttribute("aria-activedescendant")).toMatch(/-2$/);
    await userEvent.click(screen.getByRole("option", { name: "2" }));
    await userEvent.click(trigger);
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    await userEvent.click(document.body);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("opens upwards when there is room above the pagination", async () => {
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ top: 600 } as DOMRect);
    render(<Pagination page={1} pageSize={10} total={24} onPageChange={vi.fn()} />);

    await userEvent.click(screen.getByRole("combobox", { name: "Página" }));

    expect(screen.getByRole("listbox", { name: "Página" }).className).toContain("bottom-full");
    rect.mockRestore();
  });
});
