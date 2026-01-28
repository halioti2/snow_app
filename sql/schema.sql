-- Database schema for Snow Shoveling Jobs app (Supabase/Postgres)
-- Run this in Supabase SQL editor

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles (users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  role text DEFAULT 'worker', -- 'worker' | 'client' (users may be both)
  job_types jsonb DEFAULT '[]', -- e.g. ["driveway","sidewalk"]
  rates jsonb DEFAULT '{}', -- map jobType -> rate
  borough text,
  featured_gallery jsonb DEFAULT '[]', -- array of image paths
  created_at timestamptz DEFAULT now()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_types jsonb NOT NULL, -- e.g. ["driveway","sidewalk"]
  location text NOT NULL,
  price numeric,
  worker_id uuid REFERENCES profiles(id),
  client_id uuid REFERENCES profiles(id),
  date timestamptz,
  status text DEFAULT 'open', -- open | assigned | completed | cancelled
  pictures jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id),
  worker_id uuid REFERENCES profiles(id),
  reviewer_id uuid REFERENCES profiles(id),
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text,
  pictures jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Chats
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants jsonb NOT NULL, -- e.g. [clientId, workerId]
  created_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id),
  text text,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Suggested RLS / policy examples (apply in dashboard UI as needed):
-- Example: allow authenticated users to insert into profiles with id = auth.uid()
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Profiles - insert own" ON profiles FOR INSERT USING (auth.uid() IS NOT NULL) WITH CHECK (id = auth.uid());

-- Example: allow job inserts for authenticated users where client_id = auth.uid()
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Jobs - insert by authenticated" ON jobs FOR INSERT USING (auth.uid() IS NOT NULL) WITH CHECK (client_id = auth.uid());

-- Note: adapt policies to your auth flow. Supabase's `auth.uid()` returns the user's id.
