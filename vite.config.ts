import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ssrCjsDeps = [
  'set-cookie-parser',
  'cookie',
  'react-router',
  'react-router/dom',
  'react-router-dom',
  'rxjs',
  'react-redux',
  'use-sync-external-store',
  'use-sync-external-store/with-selector',
  'use-sync-external-store/shim',
  'use-sync-external-store/shim/with-selector',
  'redux',
  'redux-logger',
  'redux-persist',
  'redux-persist/integration/react',
  'redux-persist/lib/storage',
  'react-toastify',
  'react-cookie',
  '@apollo/client',
  '@apollo/client/react',
  '@africasokoni/react-image-magnifiers',
  '@studio-freight/lenis',
  'axios',
  'isomorphic-fetch',
  'graphql-tag',
  'nuka-carousel',
  'react-icons',
  'react-icons/ai',
  'react-icons/bs',
  'react-icons/fa',
  'react-icons/fi',
  'react-icons/gr',
  'react-icons/hi',
  'react-icons/hi2',
  'react-icons/io5',
  'react-icons/vsc',
];

export default defineConfig({
  plugins: [hydrogen(), oxygen(), reactRouter(), tsconfigPaths()],
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: ssrCjsDeps,
    },
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
  resolve: {
    alias: {
      'next/link': path.resolve(__dirname, 'app/next-compat/link.tsx'),
      'next/router': path.resolve(__dirname, 'app/next-compat/router.ts'),
      'next/head': path.resolve(__dirname, 'app/next-compat/head.tsx'),
      'next/script': path.resolve(__dirname, 'app/next-compat/script.tsx'),
    },
  },
});
