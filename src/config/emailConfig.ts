/**
 * FOLD STUDIO — Inquiry Form Configuration
 *
 * The START A PROJECT form posts to the FOLD backend (server/inquiries), which saves
 * the inquiry and emails it to the studio inbox. No email credentials live in the browser.
 *
 * If the frontend is hosted separately from the Express server (e.g. Netlify/Vercel),
 * set VITE_API_BASE_URL to the backend's public URL including /api,
 * e.g. https://fold-studio.onrender.com/api
 */

const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '/api';

export const EMAIL_CONFIG = {
  // Official inquiry email recipient (shown to visitors as a direct-email fallback)
  RECIPIENT_EMAIL: 'enquiryfoldstudio@gmail.com',

  // Backend inquiry endpoint
  BACKEND_ENDPOINT: `${API_BASE}/inquiries`,
};
