import hero from "./hero";
import comparison from "./comparison";
import timeline from "./timeline";
import dashboard from "./dashboard";
import quote from "./quote";
import code from "./code";
import steps from "./steps";
import table from "./table";
import callout from "./callout";
import image from "./image";


const components = [
  hero,
  comparison,
  timeline,
  dashboard,
  quote,
  code,
  steps,
  table,
  callout,
  image,

];

export const COMPONENT_LIST = components;

export const COMPONENTS = Object.fromEntries(
  components.map(component => [
    component.name.toLowerCase(),
    component,
  ])
);

export function getComponent(name) {
  if (!name) return undefined;
  return COMPONENTS[name.trim().toLowerCase()];
}

export default COMPONENTS;