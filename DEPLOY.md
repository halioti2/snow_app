# Deploying to Netlify + Supabase — Guide

This document walks through setting up Supabase (backend) and deploying the static front-end to Netlify. It includes database schema, authentication, storage, environment variables, and recommended policies.

Summary (high-level)
- Create a Supabase project (get `SUPABASE_URL` and `SUPABASE_ANON_KEY`).
- Create database tables (run `sql/schema.sql` in Supabase SQL editor).
- Create a storage bucket for images (e.g., `job-images`).
- Configure authentication (enable email sign-ups) and add redirect URLs.
- Add environment variables in Netlify and connect the Git repo.
- Deploy the site to Netlify. The `netlify.toml` included will generate `env.js` at build time to expose client keys safely.

Important: The Supabase "anon" key is intended for client usage (public). Never put service_role keys in client-side code.

## 1) Create a Supabase project
1. Go to https://supabase.com and sign in.
2. Create a new project and choose a strong password.
3. Note the Project API URL (SUPABASE_URL) and the anon public API key (SUPABASE_ANON_KEY) from Project Settings -> API.

## 2) Create tables & basic policies
Open the SQL editor in Supabase and run the SQL in `sql/schema.sql` (file included in this repo). It will create tables for `profiles`, `jobs`, `reviews`, `chats`, and `messages`.

After creating tables, enable Row Level Security (RLS) on tables where appropriate and add policies. Example policy ideas (high-level):
- `profiles`: allow `INSERT` for authenticated users; allow `UPDATE` only for `auth.uid() = id`.
- `jobs`: allow `INSERT` for authenticated users (client_id = auth.uid()); `UPDATE` only for the client who created it or assigned worker for status changes.
- `reviews`: allow insert only after job is completed and only by the job's client.

See `sql/schema.sql` for comments and suggested sample policies.

## 3) Create storage bucket
In Supabase Dashboard -> Storage -> Create bucket named `job-images`.
- For MVP you can leave it public, but for production prefer private and use signed URLs for downloads.
- You can add CORS settings if needed.

## 4) Configure Auth
- In Supabase Auth settings, enable Email signups.
- Configure JWT expiry and any external OAuth providers if desired (Google, GitHub).
- Add Redirect URLs for Netlify (e.g., `https://your-site.netlify.app` if you plan to enable third-party OAuth callbacks).

## 5) Prepare your frontend to use Supabase
The front-end will expect `env.js` with two global variables:

```js
window.SUPABASE_URL = 'https://xyz.supabase.co'
window.SUPABASE_ANON_KEY = 'public-anon-key'
```

`netlify.toml` in the repo writes this `env.js` at build time using environment variables set in Netlify.

Locally, you can create `env.js` manually in the project root for testing.

## 6) Add env vars to Netlify
1. Push this repo to GitHub (or Git provider).
2. In Netlify, "New site from Git" and connect your repo.
3. In Site Settings -> Build & Deploy -> Environment, add the variables:
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_ANON_KEY` = your anon key

Netlify will run the build command (see `netlify.toml`) to generate `env.js` and publish the site.

## 7) Deploy
- Connect repo and trigger deploy. After build, your site will contain `env.js` and can initialize the Supabase client on the browser using those variables.

## 8) Security notes
- Anon keys are safe for public client use for standard operations, but any privileged operations (direct DB writes that bypass RLS) must only use service role keys from server-side functions.
- Use RLS policies to restrict who can read/write rows.
- For image uploads, prefer using signed uploads or set bucket policies and use storage.signUrl for access.
- Always implement reporting/blocking flows for chats.

## 9) Useful local development tips
- Create `env.js` in the repo root (not committed to git if it contains keys) for testing locally:

```js
// env.js (local dev only)
window.SUPABASE_URL = 'https://xyz.supabase.co'
window.SUPABASE_ANON_KEY = 'public-anon-key'
```

- Run a local static server:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## 10) Next steps and production hardening
- Implement RLS policies for all tables.
- Move reviews/image moderation to a moderation queue.
- Implement a server-side layer (Netlify Functions / Supabase Edge Functions) for operations requiring the `service_role` key.
- Add automated backups and monitoring.


If you want, I can:
- Create `index.html`, `css/styles.css`, and a minimal `js/app.js` and wire them to `js/supabaseClient.js`.
- Provide example RLS policy snippets for each table.
- Configure Netlify deploy settings and test a deploy (I can provide commands to run locally to simulate the build step).
