import linear from "./linear";
import apple from "./apple";
import stripe from "./stripe";
import notion from "./notion";
import github_dark from "./github-dark";
import aurora from "./aurora";
import dashboard_pro from "./dashboard-pro";
import academic from "./academic";
import cyberpunk from "./cyberpunk";
import cinema from "./cinema";

export const THEME_LIST = [
  linear,
  apple,
  aurora,
  github_dark,
  academic,
  dashboard_pro,
  cyberpunk,
  cinema,
  notion,
  stripe,
];

export const THEMES = Object.fromEntries(
  THEME_LIST.map(theme => [
    theme.id.toLowerCase(),
    theme,
  ])
);





export function getTheme(id) {
  if (!id) return undefined;
  return THEMES[id.trim().toLowerCase()];
}

export default THEMES;