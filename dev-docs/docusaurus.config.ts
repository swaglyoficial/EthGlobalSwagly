import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Swagly Docs',
  tagline: 'Pasaporte Web3, misiones y merch',
  favicon: 'img/LogoSwagly.png',

  future: {
    v4: true,
  },

  url: 'https://docs.swagly.com',
  baseUrl: '/',

  organizationName: 'swaglyoficial',
  projectName: 'swagly',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/swaglyoficial/SwaglyENS/tree/main/dev-docs',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/LogoSwagly.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Swagly Docs',
      logo: {
        alt: 'Swagly',
        src: 'img/LogoSwagly.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {
          href: 'https://github.com/swaglyoficial/SwaglyENS',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Swagly',
          items: [
            { label: 'Inicio', to: '/docs/intro' },
            { label: 'Setup', to: '/docs/setup' },
          ],
        },
        {
          title: 'Comunidad',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/',
            },
            {
              label: 'X/Twitter',
              href: 'https://x.com/',
            },
          ],
        },
        {
          title: 'Código',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/swaglyoficial/SwaglyENS',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Swagly. Hecho con Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
