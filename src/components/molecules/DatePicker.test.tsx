import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import axe from "axe-core";
import { DatePicker, type DatePickerProps } from "./DatePicker";
import { DateRangePicker, type DateRange, type DateRangePickerProps } from "./DateRangePicker";
import {
  WEEKDAYS,
  addMonths,
  clampDate,
  dayLabel,
  formatDate,
  isIsoDate,
  monthDays,
  monthLabel,
} from "../../utils/dates";

type SinglePickerProps = Partial<DatePickerProps> & { initial?: string };
type RangePickerProps = Partial<DateRangePickerProps> & { initial?: DateRange };

function SinglePicker({ initial = "", onChange, ...props }: SinglePickerProps) {
  const [value, setValue] = useState(initial);
  const change = (next: string) => {
    setValue(next);
    onChange?.(next);
  };
  return <DatePicker aria-label="Fecha de salida" {...props} value={value} onChange={change} />;
}

function RangePicker({ initial = { from: "", to: "" }, onChange, ...props }: RangePickerProps) {
  const [range, setRange] = useState(initial);
  const change = (next: DateRange) => {
    setRange(next);
    onChange?.(next);
  };
  return (
    <DateRangePicker
      aria-label="Fechas de la comisión"
      placeholder="Fechas de la comisión"
      {...props}
      from={range.from}
      to={range.to}
      onChange={change}
    />
  );
}

function field(name: RegExp = /^Fecha de salida/) {
  return screen.getByRole("button", { name });
}

function day(name: string) {
  return screen.getByRole("button", { name });
}

function cell(name: string) {
  return day(name).closest("td") as HTMLTableCellElement;
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 17, 9));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("date helpers", () => {
  it("validates, formats and names ISO dates in Spanish", () => {
    expect(isIsoDate("2026-11-16")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("16/11/2026")).toBe(false);
    expect(isIsoDate("")).toBe(false);
    expect(formatDate("2026-11-16")).toBe("16/11/2026");
    expect(formatDate("2026-13-01")).toBe("");
    expect(monthLabel("2026-11-16")).toBe("noviembre 2026");
    expect(dayLabel("2026-11-16")).toBe("lunes, 16 de noviembre de 2026");
    expect(dayLabel("2026-11-22")).toBe("domingo, 22 de noviembre de 2026");
  });

  it("moves across months and clamps to the limits", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
    expect(monthDays("2028-02-10")).toHaveLength(29);
    expect(clampDate("2026-11-01", "2026-11-10", "2026-11-20")).toBe("2026-11-10");
    expect(clampDate("2026-11-30", "2026-11-10", "2026-11-20")).toBe("2026-11-20");
    expect(clampDate("2026-11-15")).toBe("2026-11-15");
  });
});

describe("DatePicker", () => {
  it("shows the placeholder and opens a Monday-first calendar on today", async () => {
    const user = userEvent.setup();
    render(<SinglePicker />);

    expect(field()).toHaveAccessibleName("Fecha de salida Seleccionar fecha");
    expect(field()).toHaveAttribute("aria-haspopup", "dialog");
    expect(field()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Borrar fecha" })).not.toBeInTheDocument();

    await user.click(field());

    expect(field()).toHaveAttribute("aria-expanded", "true");
    const dialog = screen.getByRole("dialog", { name: "Calendario" });
    expect(dialog.style.top).toBe("6px");
    expect(dialog.style.left).toBe("8px");
    expect(within(dialog).getByRole("grid", { name: "noviembre 2026" })).toBeInTheDocument();
    const headers = within(dialog).getAllByRole("columnheader");
    const shortNames = headers.map((header) => header.firstChild?.textContent);
    expect(shortNames).toEqual(["lu", "ma", "mi", "ju", "vi", "sá", "do"]);
    WEEKDAYS.forEach((name) => expect(within(dialog).getByRole("columnheader", { name })).toBeInTheDocument());
    expect(day("martes, 17 de noviembre de 2026")).toHaveFocus();
    expect(day("martes, 17 de noviembre de 2026")).toHaveAttribute("aria-current", "date");
    expect(day("lunes, 16 de noviembre de 2026")).not.toHaveAttribute("aria-current");
  });

  it("selects a day with the mouse, closes and returns the focus to the field", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SinglePicker initial="2026-11-16" onChange={onChange} />);

    expect(field()).toHaveTextContent("16/11/2026");
    expect(field()).toHaveAccessibleName("Fecha de salida 16/11/2026");
    await user.click(field());
    expect(day("lunes, 16 de noviembre de 2026")).toHaveFocus();
    expect(cell("lunes, 16 de noviembre de 2026")).toHaveAttribute("aria-selected", "true");
    expect(cell("martes, 17 de noviembre de 2026")).toHaveAttribute("aria-selected", "false");

    await user.click(day("viernes, 20 de noviembre de 2026"));

    expect(onChange).toHaveBeenCalledWith("2026-11-20");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(field()).toHaveFocus();
    expect(field()).toHaveTextContent("20/11/2026");
  });

  it("moves the focused day with the keyboard and selects with Enter and Space", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SinglePicker initial="2026-11-16" onChange={onChange} />);
    await user.click(field());

    await user.keyboard("{ArrowRight}");
    expect(day("martes, 17 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(day("martes, 24 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(day("lunes, 23 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(day("lunes, 16 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("{End}");
    expect(day("domingo, 22 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(day("lunes, 16 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("a");
    expect(day("lunes, 16 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("{PageDown}");
    expect(screen.getByRole("grid", { name: "diciembre 2026" })).toBeInTheDocument();
    expect(day("miércoles, 16 de diciembre de 2026")).toHaveFocus();
    await user.keyboard("{PageUp}{PageUp}");
    expect(day("viernes, 16 de octubre de 2026")).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith("2026-10-16");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(field());
    expect(day("viernes, 16 de octubre de 2026")).toHaveFocus();
    await user.keyboard("{ArrowRight} ");
    expect(onChange).toHaveBeenLastCalledWith("2026-10-17");
    expect(field()).toHaveTextContent("17/10/2026");
  });

  it("browses months with the buttons without moving the focus", async () => {
    const user = userEvent.setup();
    render(<SinglePicker />);
    await user.click(field());

    await user.click(screen.getByRole("button", { name: "Mes siguiente" }));
    expect(screen.getByRole("grid", { name: "diciembre 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mes siguiente" })).toHaveFocus();
    expect(day("jueves, 17 de diciembre de 2026")).toHaveAttribute("tabindex", "0");

    await user.click(screen.getByRole("button", { name: "Mes anterior" }));
    await user.click(screen.getByRole("button", { name: "Mes anterior" }));
    expect(screen.getByRole("grid", { name: "octubre 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mes anterior" })).toHaveFocus();
  });

  it("closes with Escape, an outside click or the field itself", async () => {
    const onParentKeyDown = vi.fn();
    const user = userEvent.setup();
    render(
      <div onKeyDown={onParentKeyDown}>
        <SinglePicker />
        <button type="button">Fuera</button>
      </div>,
    );

    await user.click(field());
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(field()).toHaveFocus();
    expect(onParentKeyDown).not.toHaveBeenCalled();

    await user.click(field());
    await user.click(screen.getByRole("grid"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Fuera" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(field());
    await user.click(field());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps Tab inside the calendar", async () => {
    const user = userEvent.setup();
    render(<SinglePicker initial="2026-11-16" />);
    await user.click(field());

    await user.tab();
    expect(screen.getByRole("button", { name: "Mes anterior" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Mes siguiente" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Mes anterior" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(day("lunes, 16 de noviembre de 2026")).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("disables the days and months outside min and max", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SinglePicker initial="2026-11-16" min="2026-11-10" max="2026-12-05" onChange={onChange} />);
    await user.click(field());

    expect(day("lunes, 9 de noviembre de 2026")).toBeDisabled();
    expect(day("martes, 10 de noviembre de 2026")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Mes anterior" })).toHaveAttribute("aria-disabled", "true");

    await user.keyboard("{PageUp}");
    expect(day("martes, 10 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(day("martes, 10 de noviembre de 2026")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    await user.click(screen.getByRole("button", { name: "Mes anterior" }));
    expect(screen.getByRole("grid", { name: "noviembre 2026" })).toBeInTheDocument();
    expect(day("miércoles, 11 de noviembre de 2026")).toHaveAttribute("tabindex", "0");
    await user.click(screen.getByRole("button", { name: "Mes siguiente" }));
    expect(screen.getByRole("button", { name: "Mes siguiente" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Mes siguiente" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Mes anterior" })).not.toHaveAttribute("aria-disabled");
    expect(day("sábado, 5 de diciembre de 2026")).toHaveAttribute("tabindex", "0");
    expect(day("domingo, 6 de diciembre de 2026")).toBeDisabled();

    await user.click(day("domingo, 6 de diciembre de 2026"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the mark of today on a selected today", async () => {
    const user = userEvent.setup();
    render(<SinglePicker initial="2026-11-17" />);
    await user.click(field());

    expect(day("martes, 17 de noviembre de 2026").querySelector("span")).toHaveClass("bg-white");
    expect(day("martes, 17 de noviembre de 2026")).toHaveClass("bg-brand-600");
  });

  it("starts on the closest allowed day when today is out of range", async () => {
    const user = userEvent.setup();
    render(<SinglePicker min="2026-12-01" />);
    await user.click(field());

    expect(day("martes, 1 de diciembre de 2026")).toHaveFocus();
  });

  it("clears the value from a sibling button", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SinglePicker initial="2026-11-16" onChange={onChange} />);
    const clear = screen.getByRole("button", { name: "Borrar fecha" });

    expect(field().contains(clear)).toBe(false);
    expect(field().parentElement).toContainElement(clear);

    await user.click(clear);

    expect(onChange).toHaveBeenCalledWith("");
    expect(field()).toHaveFocus();
    expect(field()).toHaveTextContent("Seleccionar fecha");
    expect(screen.queryByRole("button", { name: "Borrar fecha" })).not.toBeInTheDocument();
  });

  it("shows a visible label, the invalid state and its description", () => {
    render(
      <>
        <SinglePicker label="Fecha de regreso" initial="2026-11-16" invalid aria-describedby="return-error" />
        <p id="return-error">La fecha es obligatoria</p>
      </>,
    );
    const control = screen.getByRole("button", { name: "Fecha de regreso 16/11/2026" });

    expect(screen.getByText("Fecha de regreso").tagName).toBe("LABEL");
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAccessibleDescription("La fecha es obligatoria");
  });

  it("does not open nor clear when disabled", async () => {
    const user = userEvent.setup();
    render(<SinglePicker initial="2026-11-16" disabled />);

    await user.click(field());

    expect(field()).toBeDisabled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Borrar fecha" })).not.toBeInTheDocument();
  });

  it("is named by its text when no label is given and ignores invalid values", () => {
    render(<DatePicker value="mañana" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Seleccionar fecha" })).not.toHaveAttribute("aria-labelledby");
  });

  it("keeps the calendar on a narrow screen and flips it above the field", async () => {
    const user = userEvent.setup();
    const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 700,
      bottom: 740,
      left: 200,
      right: 300,
      width: 100,
      height: 40,
      x: 200,
      y: 700,
      toJSON: () => ({}),
    });
    const width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(278);
    const height = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(320);
    const screenWidth = window.innerWidth;
    window.innerWidth = 320;
    render(<SinglePicker />);

    await user.click(field());
    const dialog = screen.getByRole("dialog");
    expect(dialog.style.left).toBe("34px");
    expect(dialog.style.top).toBe(`${700 - 320 - 6}px`);

    window.innerWidth = 1280;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(dialog.style.left).toBe("200px");
    window.innerWidth = 200;
    fireEvent(window, new Event("resize"));
    expect(dialog.style.left).toBe("8px");

    window.innerWidth = screenWidth;
    rect.mockRestore();
    width.mockRestore();
    height.mockRestore();
  });
});

describe("DateRangePicker", () => {
  const rangeField = () => field(/^Fechas de la comisión/);

  it("shows the range, a partial range or the placeholder in one field", () => {
    const { rerender } = render(
      <DateRangePicker aria-label="Fechas" from="2026-10-01" to="2026-11-30" onChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /^Fechas/ })).toHaveTextContent("01/10/2026 – 30/11/2026");

    rerender(<DateRangePicker aria-label="Fechas" from="2026-10-01" to="" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /^Fechas/ })).toHaveTextContent("01/10/2026 – …");

    rerender(<DateRangePicker aria-label="Fechas" from="" to="2026-11-30" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /^Fechas/ })).toHaveTextContent("… – 30/11/2026");

    rerender(<DateRangePicker aria-label="Fechas" from="ayer" to="" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /^Fechas/ })).toHaveTextContent("Seleccionar fechas");
    expect(screen.queryByRole("button", { name: "Borrar fechas" })).not.toBeInTheDocument();
  });

  it("does not repeat the placeholder in the name when it matches the label", () => {
    render(<RangePicker />);

    expect(rangeField()).toHaveAccessibleName("Fechas de la comisión");
  });

  it("picks a range in two clicks, previews it on hover and restarts before the start", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<RangePicker onChange={onChange} />);
    await user.click(rangeField());
    expect(day("martes, 17 de noviembre de 2026")).toHaveFocus();

    await user.click(day("lunes, 9 de noviembre de 2026"));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(cell("lunes, 9 de noviembre de 2026")).toHaveAttribute("aria-selected", "true");

    await user.hover(day("jueves, 12 de noviembre de 2026"));
    expect(cell("martes, 10 de noviembre de 2026")).toHaveClass("bg-brand-50");
    expect(day("jueves, 12 de noviembre de 2026")).toHaveClass("ring-1");
    fireEvent.mouseLeave(screen.getByRole("grid"));
    expect(cell("martes, 10 de noviembre de 2026")).not.toHaveClass("bg-brand-50");

    await user.click(day("viernes, 6 de noviembre de 2026"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(cell("lunes, 9 de noviembre de 2026")).toHaveAttribute("aria-selected", "false");
    expect(cell("viernes, 6 de noviembre de 2026")).toHaveAttribute("aria-selected", "true");

    await user.click(day("viernes, 20 de noviembre de 2026"));
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith({ from: "2026-11-06", to: "2026-11-20" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(rangeField()).toHaveFocus();
    expect(rangeField()).toHaveTextContent("06/11/2026 – 20/11/2026");
  });

  it("shows the selected range and starts a new one on the next click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<RangePicker initial={{ from: "2026-11-09", to: "2026-11-20" }} onChange={onChange} />);
    await user.click(rangeField());

    expect(day("lunes, 9 de noviembre de 2026")).toHaveFocus();
    expect(cell("lunes, 9 de noviembre de 2026")).toHaveClass("rounded-l-full");
    expect(cell("domingo, 15 de noviembre de 2026")).toHaveClass("bg-brand-50", "rounded-r-full");
    expect(cell("lunes, 16 de noviembre de 2026")).toHaveClass("bg-brand-50", "rounded-l-full");
    expect(cell("viernes, 20 de noviembre de 2026")).toHaveAttribute("aria-selected", "true");
    expect(cell("sábado, 21 de noviembre de 2026")).not.toHaveClass("bg-brand-50");

    await user.click(day("viernes, 13 de noviembre de 2026"));
    expect(cell("viernes, 20 de noviembre de 2026")).toHaveAttribute("aria-selected", "false");
    await user.click(day("viernes, 13 de noviembre de 2026"));

    expect(onChange).toHaveBeenCalledWith({ from: "2026-11-13", to: "2026-11-13" });
  });

  it("completes a partial range with the keyboard", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<RangePicker initial={{ from: "2026-10-01", to: "" }} onChange={onChange} />);
    expect(rangeField()).toHaveTextContent("01/10/2026 – …");
    await user.click(rangeField());

    expect(day("jueves, 1 de octubre de 2026")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(cell("lunes, 5 de octubre de 2026")).toHaveClass("bg-brand-50");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith({ from: "2026-10-01", to: "2026-10-08" });
  });

  it("opens on the end date when only the end is set", async () => {
    const user = userEvent.setup();
    render(<RangePicker initial={{ from: "", to: "2026-11-30" }} />);
    await user.click(rangeField());

    expect(day("lunes, 30 de noviembre de 2026")).toHaveFocus();
    expect(cell("lunes, 30 de noviembre de 2026")).toHaveAttribute("aria-selected", "true");
    expect(cell("domingo, 29 de noviembre de 2026")).not.toHaveClass("bg-brand-50");
  });

  it("clears both dates", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<RangePicker initial={{ from: "2026-10-01", to: "2026-11-30" }} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Borrar fechas" }));

    expect(onChange).toHaveBeenCalledWith({ from: "", to: "" });
    expect(rangeField()).toHaveTextContent("Fechas de la comisión");
    expect(rangeField()).toHaveFocus();
  });

  it("has no axe violations while open", async () => {
    vi.useRealTimers();
    const canvas = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const user = userEvent.setup();
    render(
      <>
        <RangePicker
          initial={{ from: "2026-11-09", to: "2026-11-20" }}
          min="2026-11-03"
          invalid
          aria-describedby="error"
        />
        <p id="error">Fechas obligatorias</p>
      </>,
    );
    await user.click(rangeField());

    const result = await axe.run(document.body, {
      rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
    });

    expect(result.violations.map((violation) => violation.id)).toEqual([]);
    canvas.mockRestore();
  });
});
