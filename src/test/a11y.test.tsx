import type { ComponentType } from "react";
import { render } from "@testing-library/react";
import { composeStories, setProjectAnnotations } from "@storybook/react-vite";
import axe from "axe-core";
import preview from "../../.storybook/preview";

type StoryModule = Parameters<typeof composeStories>[0];

setProjectAnnotations(preview);

const modules = import.meta.glob<StoryModule>("../components/**/*.stories.tsx", { eager: true });

const axeOptions: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
  },
};

function describeViolation(violation: axe.Result): string {
  return `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(" | ")}`;
}

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

for (const [path, module] of Object.entries(modules)) {
  const stories = composeStories(module) as Record<string, ComponentType>;
  describe(`a11y ${path.replace("../components/", "")}`, () => {
    for (const [name, Story] of Object.entries(stories)) {
      it(`${name} has no violations`, async () => {
        render(<Story />);
        const result = await axe.run(document.body, axeOptions);
        expect(result.violations.map(describeViolation)).toEqual([]);
      });
    }
  });
}
