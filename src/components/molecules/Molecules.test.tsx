import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FolderOpen, Stamp } from "lucide-react";
import { Input } from "../atoms/Input";
import { EmptyState } from "./EmptyState";
import { FormField } from "./FormField";
import { Pagination } from "./Pagination";
import { SummaryCard } from "./SummaryCard";

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
