import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/docs/",
  srcDir: "src",
  title: "Documentation",
  description: "A comprehensive documentation on Kaede",
  locales: {
    root: {
      label: 'English',
      lang: 'en'
    },
    ru: {
      label: 'Русский',
      lang: 'ru', // optional, will be added  as `lang` attribute on `html` tag
      link: '/ru/' // shows on navbar translations menu, can be external
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
