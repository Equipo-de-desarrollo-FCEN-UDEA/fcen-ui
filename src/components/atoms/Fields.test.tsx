import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "lucide-react";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { SearchableMultiSelect } from "./SearchableMultiSelect";
import { SearchableSelect } from "./SearchableSelect";
import { Textarea } from "./Textarea";

const choices = [
  { value: "physics", label: "Instituto de Física" },
  { value: "math", label: "Instituto de Matemáticas" },
  { value: "biology", label: "Instituto de Biología" },
];

describe("SearchableSelect", () => {
  it("filters accent-insensitively and selects with the keyboard", async () => {
    const onChange = vi.fn();
    render(<SearchableSelect label="Unidad" options={choices} value="" onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "Unidad" });
    await userEvent.click(input);
    await userEvent.type(input, "matematicas");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("math");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("reports no matches, closes on Escape or an outside click, and supports disabled", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchableSelect options={choices} value="" onChange={vi.fn()} placeholder="Buscar unidad" />
        <button type="button">Fuera</button>
      </>,
    );
    const input = screen.getByRole("combobox", { name: "Buscar unidad" });
    await user.click(input);
    await user.type(input, "inexistente");
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Fuera" }));
    expect(input).toHaveAttribute("aria-expanded", "false");

    const { rerender } = render(<SearchableSelect options={choices} value="" onChange={vi.fn()} disabled />);
    expect(screen.getAllByRole("combobox")[1]).toBeDisabled();
    rerender(<SearchableSelect options={choices} value="physics" onChange={vi.fn()} />);
  });

  it("retains the loan app's outline, size, and validation options", async () => {
    const user = userEvent.setup();
    render(
      <SearchableSelect
        label="Unidad"
        options={choices}
        value=""
        onChange={vi.fn()}
        variant="outline"
        size="lg"
        state="error"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Unidad" }));
    expect(screen.getByRole("combobox", { name: "Unidad" })).toHaveAttribute("aria-invalid", "true");
  });
});

describe("SearchableMultiSelect", () => {
  it("adds options by keyboard, removes chips, and removes the last item with Backspace", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <SearchableMultiSelect label="Unidades" options={choices} values={["physics"]} onChange={onChange} />,
    );
    const input = screen.getByRole("combobox", { name: "Unidades" });
    await user.click(input);
    await user.type(input, "instituto de matematicas");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(["physics", "math"]);

    await user.click(screen.getByRole("button", { name: "Eliminar Instituto de Física" }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    rerender(<SearchableMultiSelect options={choices} values={["physics"]} onChange={onChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("shows an empty result message and closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchableMultiSelect options={choices} values={[]} onChange={vi.fn()} helperText="Elige unidades" />
        <button type="button">Fuera</button>
      </>,
    );
    const input = screen.getByRole("combobox");
    await user.click(input);
    await user.type(input, "ninguna");
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fuera" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByText("Elige unidades")).toBeInTheDocument();
  });
});

describe("Input", () => {
  it("accepts typing", async () => {
    render(<Input aria-label="Asunto" />);

    await userEvent.type(screen.getByRole("textbox", { name: "Asunto" }), "Congreso");

    expect(screen.getByRole("textbox")).toHaveValue("Congreso");
  });

  it("marks the error state as invalid", () => {
    render(<Input aria-label="Asunto" state="error" size="sm" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("is valid by default", () => {
    render(<Input aria-label="Asunto" />);

    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("makes room for both icons", () => {
    render(<Input aria-label="Buscar" leftIcon={<Search data-testid="left" />} rightIcon={<Search data-testid="right" />} />);

    expect(screen.getByRole("textbox")).toHaveClass("pl-10", "pr-10");
    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Input aria-label="Asunto" disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});

describe("Textarea", () => {
  it("accepts typing and defaults to four rows", async () => {
    render(<Textarea aria-label="Justificación" />);

    const textarea = screen.getByRole("textbox", { name: "Justificación" });
    await userEvent.type(textarea, "Ponencia");

    expect(textarea).toHaveValue("Ponencia");
    expect(textarea).toHaveAttribute("rows", "4");
  });

  it("marks the error state as invalid", () => {
    render(<Textarea aria-label="Justificación" state="error" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Checkbox", () => {
  it("toggles from its label", async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Archivadas" onChange={onChange} />);

    await userEvent.click(screen.getByText("Archivadas"));

    expect(screen.getByRole("checkbox", { name: "Archivadas" })).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("does not toggle when disabled", async () => {
    render(<Checkbox label="Archivadas" disabled />);

    await userEvent.click(screen.getByText("Archivadas"));

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("renders without a label", () => {
    render(<Checkbox aria-label="Seleccionar" defaultChecked />);

    expect(screen.getByRole("checkbox", { name: "Seleccionar" })).toBeChecked();
  });
});
