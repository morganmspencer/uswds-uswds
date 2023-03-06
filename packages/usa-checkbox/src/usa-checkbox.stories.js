import Component from "./usa-checkbox.twig";
import Tile from "./usa-checkbox--tile.twig";
import TestComponent from "./test/test-patterns/test-usa-checkbox.twig";

export default {
  title: "Components/Form Inputs/Checkbox",
  argTypes: {
    disabled_state: {
      name: "Disabled state",
      control: { type: "radio" },
      options: ["none", "disabled", "aria-disabled"],
      defaultValue: "none",
    },
  },
};

const Template = (args) => Component(args);
const TileTemplate = (args) => Tile(args);
const TestTemplate = (args) => TestComponent(args);

export const Default = Template.bind({});

export const Disabled = Template.bind({});
Disabled.args = {
  disabled_state: "disabled",
};

export const AriaDisabled = Template.bind({});
AriaDisabled.args = {
  disabled_state: "aria-disabled",
};

export const CheckboxTile = TileTemplate.bind({});

export const DisabledTile = TileTemplate.bind({});
DisabledTile.args = {
  disabled_state: "disabled",
};

export const AriaDisabledTile = TileTemplate.bind({});
AriaDisabledTile.args = {
  disabled_state: "aria-disabled",
};

export const Test = TestTemplate.bind({});
Test.argTypes = {
  aria_disabled: {
    table: { disable: true },
  },
};
