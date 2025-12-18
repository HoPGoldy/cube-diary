import { HtmlTagDescriptor, Plugin } from "vite";

export function viteAddBasePlugin() {
  let VITE_PATH_BASENAME = "";
  const plugin: Plugin = {
    name: "vite:add-base-el",
    enforce: "post",
    configResolved(config) {
      VITE_PATH_BASENAME = config.env.VITE_PATH_BASENAME;
    },
    transformIndexHtml(html) {
      const tags: HtmlTagDescriptor[] = [
        {
          tag: "base",
          attrs: { href: VITE_PATH_BASENAME },
          injectTo: "head-prepend",
        },
      ];
      return { html, tags };
    },
  };
  return plugin;
}
