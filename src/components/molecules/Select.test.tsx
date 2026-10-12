import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Select, type SelectOptionItem } from "./Select";

const countries: SelectOptionItem[] = [
  { value: "PE", label: "Perú", code: "PE" },
  { value: "PT", label: "Portugal", code: "PT" },
  { value: "PR", label: "Puerto Rico", code: "PR", disabled: true },
  { value: "PA", label: "Panamá", code: "PA" },
];

function Controlled(props: { searchable?: boolean; initial?: string | null; onChange?: (value: string) => void }) {
  const [value, setValue] = useState<string | null>(props.initial ?? null);
  const change = (next: string) => {
    setValue(next);
    props.onChange?.(next);
  };
  return (
    <Select aria-label="País" options={countries} value={value} onChange={change} searchable={props.searchable} name="country" />
  );
}

describe("Select", () => {
  it("shows the placeholder and opens on click", async () => {
    render(<Controlled />);

    const control = screen.getByRole("combobox", { name: "País" });
    expect(control).toHaveTextContent("Seleccionar…");
    expect(control).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(control);

    expect(control).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(4);
  });

  it("selects with the mouse and closes", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.hover(screen.getByRole("option", { name: /Portugal/ }));
    await userEvent.click(screen.getByRole("option", { name: /Portugal/ }));

    expect(onChange).toHaveBeenCalledWith("PT");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Portugal");
    expect(document.querySelector('input[name="country"]')).toHaveValue("PT");
  });

  it("ignores disabled options", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: /Puerto Rico/ }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("navigates with the keyboard skipping disabled options", async () => {
    const onChange = vi.fn();
    render(<Controlled initial="PT" onChange={onChange} />);
    const control = screen.getByRole("combobox");
    control.focus();

    await userEvent.keyboard("{ArrowDown}");
    expect(control).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-1"));
    expect(screen.getByRole("option", { name: /Portugal/ })).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowDown}");
    expect(control).toHaveAttribute("aria-activedescendant", expect.stringContaining("option-3"));

    await userEvent.keyboard("{ArrowDown}{ArrowUp}{ArrowUp}{Home}{End}{Enter}");
    expect(onChange).toHaveBeenCalledWith("PA");

    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens and chooses with Enter and Space", async () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    screen.getByRole("combobox").focus();

    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith("PE");

    await userEvent.keyboard(" ");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.keyboard("{Tab}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("ignores Home, End and Escape while closed", async () => {
    render(<Controlled />);
    screen.getByRole("combobox").focus();

    await userEvent.keyboard("{Home}{End}{Escape}{Tab}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes when clicking outside and toggles from the control", async () => {
    render(
      <>
        <Controlled />
        <button type="button">Fuera</button>
      </>,
    );

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("listbox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Fuera" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters by name ignoring accents and by code when searchable", async () => {
    const onChange = vi.fn();
    render(<Controlled searchable initial="PE" onChange={onChange} />);
    const control = screen.getByRole("combobox");
    expect(control).toHaveValue("Perú");

    await userEvent.click(control);
    expect(control).toHaveValue("");
    expect(control).toHaveAttribute("placeholder", "Perú");

    await userEvent.type(control, "panama");
    expect(screen.getAllByRole("option")).toHaveLength(1);

    await userEvent.clear(control);
    await userEvent.type(control, "pt");
    expect(screen.getByRole("option", { name: /Portugal/ })).toBeInTheDocument();

    await userEvent.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("PT");
  });

  it("shows the empty text and types spaces when searchable", async () => {
    render(<Controlled searchable />);
    const control = screen.getByRole("combobox");
    control.focus();

    await userEvent.keyboard("zz z");

    expect(control).toHaveValue("zz z");
    expect(screen.getByText("Sin resultados")).toBeInTheDocument();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("does not open when disabled and marks the error state", async () => {
    render(<Select aria-label="País" options={countries} value={null} onChange={vi.fn()} disabled state="error" />);

    await userEvent.click(screen.getByRole("combobox"));

    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("flips the menu above when there is no room below and follows scroll", async () => {
    const spy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 700,
      bottom: 740,
      left: 20,
      right: 340,
      width: 320,
      height: 40,
      x: 20,
      y: 700,
      toJSON: () => ({}),
    });
    const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(200);
    render(<Controlled />);

    await userEvent.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    expect(listbox.style.top).toBe("494px");

    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    fireEvent(window, new Event("resize"));
    expect(listbox.style.width).toBe("320px");

    spy.mockRestore();
    height.mockRestore();
  });
});
