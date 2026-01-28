# Snow Shoveling Jobs — MVP

A lightweight marketplace for snow-shoveling jobs. Clients post jobs, workers find and accept them. Built with HTML/CSS/Bootstrap (front-end) and Supabase (backend) for production.

## What this contains
- `index.html`: Bootstrap-based UI to create and view jobs and simple worker profile examples.
- `css/styles.css`: minimal styles.
- `js/app.js`: app logic using localStorage to persist jobs and user profiles (MVP).
- `js/supabaseClient.js`: Supabase integration layer (auth, DB, storage helpers).
- `PRD.md`: product requirements document.
- `DEPLOY.md`: detailed Netlify + Supabase setup guide.
- `sql/schema.sql`: Postgres schema for Supabase.
- `netlify.toml`: build configuration to inject env vars.

## Tech stack
- HTML + CSS
- Bootstrap 5 (via CDN)
- Vanilla JavaScript (ES6)
- Supabase (Postgres, Auth, Storage) — for production

## Git setup

### Initialize & commit locally (already done)
\`\`\`bash
git init
git add .
git commit -m "chore: initial scaffold for snow shoveling jobs app"
\`\`\`

### Push to remote
\`\`\`bash
# Add your remote (replace with your repo URL)
git remote add origin git@github.com:yourusername/snow_app.git
# or use HTTPS:
# git remote add origin https://github.com/yourusername/snow_app.git

# Push main branch
git push -u origin main
\`\`\`

### Branching strategy (recommended)
- \`main\`: stable, production-ready code.
- \`feature/*\`: feature branches, e.g., \`feature/chat-ui\`, \`feature/auth-integration\`.
- Create a PR for review before merging to \`main\`.

Example workflow:
\`\`\`bash
git checkout -b feature/my-feature
# Make changes, commit
git add .
git commit -m "feat: add my feature"
git push -u origin feature/my-feature
# Open a PR on GitHub
\`\`\`

## Run locally (static dev)
This is a static site with localStorage. You can open \`index.html\` directly or use a simple server.

Python 3 server:
\`\`\`bash
python3 -m http.server 8000
# open http://localhost:8000
\`\`\`

Or use Node.js:
\`\`\`bash
npx http-server
\`\`\`

## Next: integrate Supabase for production
See \`DEPLOY.md\` for step-by-step instructions to:
1. Create a Supabase project and get credentials.
2. Set up database schema and auth.
3. Deploy to Netlify with environment variables.

## Notes
This is an MVP scaffold. For production you'll need to:
- Wire the front-end to Supabase (see \`DEPLOY.md\`).
- Implement Row Level Security (RLS) policies (see \`sql/schema.sql\` comments).
- Add payment processing (Stripe/PayPal) and escrow logic.
- Build moderation and reporting features.
- Verify workers and clients (identity checks, background checks).

See \`PRD.md\` for feature details and future improvements.
