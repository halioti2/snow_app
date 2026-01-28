// env.js — Load environment variables for the browser
// For local development: copy .env.example to .env and fill in your Supabase credentials
// For production on Netlify: netlify.toml will generate this file from Netlify env vars

(async function() {
  // Default values (will be overridden if window variables are already set)
  window.SUPABASE_URL = window.SUPABASE_URL || 'https://your-project.supabase.co'
  window.SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'your-anon-public-key-here'
  window.APP_NAME = window.APP_NAME || 'SnowJobs'

  // For local development, attempt to fetch .env.local (if available)
  // Note: this is optional; netlify.toml will generate env.js on deploy
  if (typeof process !== 'undefined' && process.env.SUPABASE_URL) {
    window.SUPABASE_URL = process.env.SUPABASE_URL
    window.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
  }

  console.log('[env.js] Loaded environment:', {
    SUPABASE_URL: window.SUPABASE_URL,
    APP_NAME: window.APP_NAME,
    // Don't log the key for security
  })
})()
