import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// El dominio que sirve GitHub Pages es www.konte.es (konte.es redirige ahí).
// Las URLs canónicas y el sitemap tienen que usar exactamente ese dominio.
export default defineConfig({
  site: 'https://www.konte.es',
  trailingSlash: 'always',
  integrations: [
    tailwind(),
    react(),
    sitemap({
      filter: (page) => !/\/404|\/turnero-online-gratis\/(app|pantalla)\//.test(page),
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
});
