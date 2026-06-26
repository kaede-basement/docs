import footnote from "markdown-it-footnote";
import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/docs/",
  srcDir: "src",
  title: "Documentation",
  description: "A comprehensive documentation on Kaede",
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    ru: {
      label: "Русский",
      lang: "ru", // optional, will be added  as `lang` attribute on `html` tag
      link: "/ru/", // shows on navbar translations menu, can be external
    },
  },
  markdown: {
    config: (md) => {
      md.use(footnote);
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Get Started", link: "/get-started" },
      { text: "Live Preview", link: "https://kaede-basement.github.io/kaede/" },
    ],

    sidebar: [
      {
        text: "For Users",
        items: [{ text: "Get Started", link: "/get-started" }],
      },
      {
        text: "Architecture / Design",
        items: [
          {
            text: "Project Requirements",
            link: "/design/project-requirements",
          },
          { text: "Markdown Examples", link: "/markdown-examples" },
        ],
      },
      {
        text: "Technical",
        items: [{ text: "Runtime API Examples", link: "/api-examples" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/kaede-basement/docs" },
    ],
  },
});
