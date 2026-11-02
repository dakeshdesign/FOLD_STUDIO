/**
 * FOLD STUDIO — Email & Inquiry Form Configuration
 *
 * For Static Hosting (Vercel, Netlify, GitHub Pages):
 * 1. Go to https://web3forms.com
 * 2. Enter your email (enquiryfoldstudio@gmail.com) and click "Create Access Key"
 * 3. Copy the key and set it in your .env file as VITE_WEB3FORMS_ACCESS_KEY
 *    or replace 'YOUR_WEB3FORMS_ACCESS_KEY' below.
 */

export const EMAIL_CONFIG = {
  // Web3Forms access key from https://web3forms.com
  WEB3FORMS_ACCESS_KEY: ((import.meta as any).env?.VITE_WEB3FORMS_ACCESS_KEY as string) || 'YOUR_WEB3FORMS_ACCESS_KEY',
  
  // Web3Forms submission endpoint (JSON)
  WEB3FORMS_ENDPOINT: 'https://api.web3forms.com/submit',

  // Official inquiry email recipient
  RECIPIENT_EMAIL: 'enquiryfoldstudio@gmail.com',

  // Local/Fullstack backend inquiry endpoint
  BACKEND_ENDPOINT: '/api/inquiry',
};
