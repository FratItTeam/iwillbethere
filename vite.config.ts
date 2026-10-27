import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function normalizeBase(value: string): string {
  if (!value || value === '/') return '/';
  if (/^https?:\/\//.test(value)) return value.endsWith('/') ? value : `${value}/`;
  const withLeading = value.startsWith('/') ? value : `/${value}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const pagesBase =
    process.env.GITHUB_ACTIONS === 'true' && repository ? `/${repository}/` : '/';
  const base = normalizeBase(env.VITE_BASE_PATH || pagesBase);

  return {
    plugins: [react()],
    base,
  };
});
