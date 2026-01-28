/*
  Starter Supabase client for the Snow Shoveling Jobs app.

  Usage notes:
  - This file expects `env.js` to define `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`.
  - Include supabase-js via CDN in `index.html`:
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
    <script src="/env.js"></script>
    <script src="js/supabaseClient.js"></script>
*/

const supabase = supabaseJs.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)

// Authentication
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  return supabase.auth.signOut()
}

export function getUser() {
  return supabase.auth.getUser()
}

// Profiles
export async function upsertProfile(profile) {
  // profile should include id = auth.user().id
  return supabase.from('profiles').upsert(profile)
}

export async function getProfile(userId) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

// Jobs
export async function createJob(job) {
  // job: { id, type, location, price, worker_id, date, status, client_id, pictures }
  return supabase.from('jobs').insert(job)
}

export async function assignWorker(jobId, workerId) {
  return supabase.from('jobs').update({ worker_id: workerId, status: 'assigned' }).eq('id', jobId)
}

export async function updateJobStatus(jobId, status) {
  return supabase.from('jobs').update({ status }).eq('id', jobId)
}

export async function getOpenJobs(borough) {
  let query = supabase.from('jobs').select('*').eq('status', 'open')
  if (borough) query = query.eq('location', borough)
  return query.order('date', { ascending: true })
}

// Reviews
export async function addReview(review) {
  // review: { job_id, reviewer_id, rating, comment, pictures }
  return supabase.from('reviews').insert(review)
}

export async function getReviewsForWorker(workerId) {
  return supabase.from('reviews').select('*').eq('worker_id', workerId)
}

// Chat & Messages
export async function createChat(chat) {
  // chat: { id, participants: [clientId, workerId] }
  return supabase.from('chats').insert(chat)
}

export async function sendMessage(message) {
  // message: { chat_id, sender_id, text, attachments }
  return supabase.from('messages').insert(message)
}

export async function getMessages(chatId) {
  return supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at', { ascending: true })
}

// Storage: images
export async function uploadImage(bucket, path, file) {
  // file is a File object from <input type=file>
  const { data, error } = await supabase.storage.from(bucket).upload(path, file)
  return { data, error }
}

export async function getPublicUrl(bucket, path) {
  const { data } = await supabase.storage.from(bucket).getPublicUrl(path)
  return data
}

// Utility: helper to get current user id
export async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser()
  return data?.user?.id
}

// Export the raw client in case other modules want to use it
export { supabase }
