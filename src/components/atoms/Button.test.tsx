import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Plus } from "lucide-react";
import { Button, type ButtonVariant } from "./Button";

describe("Button", () => {
  it("renders its label and fires clicks", async () => {
    const onClick = vi.fn();
    render(<Button label="Guardar" onClick={onClick} />);

    await userEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it.each<ButtonVariant>(["primary", "secondary", "outline", "text", "ghost", "danger"])(
    "renders the %s variant",
    (variant) => {
      render(<Button label={variant} variant={variant} />);

      expect(screen.getByRole("button", { name: variant })).toBeInTheDocument();
    },
  );

  it("shows the loading text, a spinner and blocks clicks while loading", async () => {
    const onClick = vi.fn();
    render(<Button label="Enviar" loadingText="Enviando" isLoading onClick={onClick} />);

    const button = screen.getByRole("button", { name: /Enviando/ });
    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status", { name: "Enviando" })).toBeInTheDocument();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps the label while loading without a loading text", () => {
    render(<Button label="Enviar" isLoading size="sm" />);

    expect(screen.getByRole("status", { name: "Cargando" })).toBeInTheDocument();
    expect(screen.getByText("Enviar")).toBeInTheDocument();
  });

  it("renders the icons and hides them while loading", () => {
    const { rerender } = render(
      <Button label="Nueva" size="lg" iconLeft={<Plus data-testid="left" />} iconRight={<Plus data-testid="right" />} />,
    );

    expect(screen.getByTestId("left")).toBeInTheDocument();
    expect(screen.getByTestId("right")).toBeInTheDocument();

    rerender(<Button label="Nueva" isLoading iconLeft={<Plus data-testid="left" />} iconRight={<Plus data-testid="right" />} />);

    expect(screen.queryByTestId("left")).not.toBeInTheDocument();
    expect(screen.queryByTestId("right")).not.toBeInTheDocument();
  });

  it("supports an icon only button with an accessible name", () => {
    render(<Button label="" aria-label="Cerrar" iconLeft={<Plus />} />);

    expect(screen.getByRole("button", { name: "Cerrar" })).toHaveClass("gap-0");
  });

  it("respects the disabled attribute", () => {
    render(<Button label="Aprobar" disabled />);

    expect(screen.getByRole("button", { name: "Aprobar" })).toBeDisabled();
  });
});
