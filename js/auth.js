// auth.js — Supabase authentication and user management

const supabase = supabaseJs.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)

const authForm = document.getElementById('authForm')
const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')
const fullNameInput = document.getElementById('fullName')
const roleSelect = document.getElementById('role')
const authMessage = document.getElementById('authMessage')
const userStatus = document.getElementById('userStatus')
const userEmail = document.getElementById('userEmail')
const userId = document.getElementById('userId')
const btnSignOut = document.getElementById('btnSignOut')
const btnTestDb = document.getElementById('btnTestDb')
const dbTestResult = document.getElementById('dbTestResult')
const usersList = document.getElementById('usersList')

// Sign up or sign in
authForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = emailInput.value.trim()
  const password = passwordInput.value
  const fullName = fullNameInput.value.trim()
  const role = roleSelect.value

  showMessage('⏳ Signing up/in...', 'info')

  try {
    // Try to sign up first
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError && signUpError.message.includes('already registered')) {
      // If user exists, sign in instead
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
      showMessage('✅ Signed in successfully!', 'success')
      await loadUserProfile(signInData.user.id)
    } else if (signUpError) {
      throw signUpError
    } else {
      // New user signed up - create profile in database
      const userId = signUpData.user.id
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        full_name: fullName || email,
        role,
        job_types: [],
        rates: {},
        borough: null,
      })
      if (profileError) throw profileError
      showMessage('✅ Account created and signed in!', 'success')
      await loadUserProfile(userId)
    }

    // Refresh user list
    await loadUsers()
  } catch (error) {
    showMessage(`❌ ${error.message}`, 'danger')
    console.error(error)
  }
})

// Sign out
btnSignOut.addEventListener('click', async () => {
  try {
    await supabase.auth.signOut()
    showMessage('✅ Signed out', 'success')
    userStatus.classList.add('d-none')
    authForm.reset()
  } catch (error) {
    showMessage(`❌ ${error.message}`, 'danger')
  }
})

// Test database connection
btnTestDb.addEventListener('click', async () => {
  dbTestResult.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> Testing...'
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' })
    if (error) throw error
    dbTestResult.innerHTML = `<div class="alert alert-success mb-0">✅ Database connected! Total profiles: ${data ? data.length : 0}</div>`
  } catch (error) {
    dbTestResult.innerHTML = `<div class="alert alert-danger mb-0">❌ ${error.message}</div>`
  }
})

// Load current user profile
async function loadUserProfile(userId) {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (error) throw error
    userEmail.textContent = emailInput.value
    userId.textContent = data.id
    userStatus.classList.remove('d-none')
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

// Load all users from database
async function loadUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, job_types, borough')
      .order('created_at', { ascending: false })

    if (error) throw error

    usersList.innerHTML = ''
    if (!data || data.length === 0) {
      usersList.innerHTML = '<div class="text-muted">No users yet.</div>'
      return
    }

    data.forEach((user) => {
      const li = document.createElement('div')
      li.className = 'list-group-item'
      li.innerHTML = `
        <h6 class="mb-1">${user.full_name}</h6>
        <small class="text-muted">
          <strong>ID:</strong> ${user.id} <br>
          <strong>Role:</strong> ${user.role} <br>
          ${user.borough ? `<strong>Borough:</strong> ${user.borough} <br>` : ''}
          ${user.job_types && user.job_types.length > 0 ? `<strong>Job Types:</strong> ${user.job_types.join(', ')}` : ''}
        </small>
      `
      usersList.appendChild(li)
    })
  } catch (error) {
    usersList.innerHTML = `<div class="alert alert-danger mb-0">Error loading users: ${error.message}</div>`
    console.error(error)
  }
}

// Helper to show messages
function showMessage(text, type) {
  authMessage.textContent = text
  authMessage.className = `alert alert-${type} d-block`
  setTimeout(() => {
    authMessage.classList.add('d-none')
  }, 5000)
}

// Check if already signed in on page load
async function checkAuth() {
  const { data } = await supabase.auth.getSession()
  if (data.session) {
    userEmail.textContent = data.session.user.email
    userId.textContent = data.session.user.id
    userStatus.classList.remove('d-none')
  }
  await loadUsers()
}

// Initialize on page load
window.addEventListener('load', checkAuth)
