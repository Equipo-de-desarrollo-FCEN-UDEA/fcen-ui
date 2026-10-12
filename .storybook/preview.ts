import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import "./storybook.css";

const preview: Preview = {
  tags: ["autodocs"],
  decorators: [
    withThemeByClassName({
      themes: { claro: "", oscuro: "dark" },
      defaultTheme: "claro",
      parentSelector: "html",
    }),
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    a11y: { test: "error" },
  },
};

export default preview;
