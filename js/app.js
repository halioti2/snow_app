// Client-side app for creating/displaying jobs with Supabase backend

const supabase = supabaseJs.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)

(function () {
  let currentUserId = null
  let workers = []
  let jobs = []

  // Initialize
  async function init() {
    await checkAuth()
    await loadWorkers()
    await loadJobs()
    setupEventListeners()
  }

  // Check if user is signed in
  async function checkAuth() {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      currentUserId = data.session.user.id
      document.getElementById('btnViewProfile').classList.remove('d-none')
    }
  }

  // Load workers from Supabase
  async function loadWorkers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, borough, job_types, role')
        .eq('role', 'worker')
        .limit(50)

      if (error) throw error
      workers = data || []
      renderWorkers()
    } catch (error) {
      console.error('Error loading workers:', error)
      document.getElementById('workerList').innerHTML = `<li class="list-group-item text-danger">Error loading workers</li>`
    }
  }

  // Load jobs from Supabase
  async function loadJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      jobs = data || []
      renderJobs()
    } catch (error) {
      console.error('Error loading jobs:', error)
      document.getElementById('jobsContainer').innerHTML = `<div class="alert alert-danger">Error loading jobs</div>`
    }
  }

  function renderWorkers() {
    const ul = document.getElementById('workerList')
    ul.innerHTML = ''
    const sel = document.getElementById('workerSelect')
    sel.innerHTML = '<option value="">-- none --</option>'

    if (workers.length === 0) {
      ul.innerHTML = '<li class="list-group-item text-muted">No workers yet. <a href="auth.html">Sign up as a worker</a></li>'
      return
    }

    workers.forEach(w => {
      const li = document.createElement('li')
      li.className = 'list-group-item d-flex justify-content-between align-items-start'
      const jobTypesStr = Array.isArray(w.job_types) ? w.job_types.join(', ') : 'No types'
      li.innerHTML = `<div><strong>${w.full_name}</strong><div class="text-muted small">${w.borough || 'Any'} — ${jobTypesStr}</div></div>`
      ul.appendChild(li)

      const opt = document.createElement('option')
      opt.value = w.id
      opt.textContent = `${w.full_name} — ${w.borough || 'Any'}`
      sel.appendChild(opt)
    })
  }

  function renderJobs() {
    const container = document.getElementById('jobsContainer')
    container.innerHTML = ''

    if (jobs.length === 0) {
      container.innerHTML = '<div class="text-muted">No jobs yet. Create one below!</div>'
      return
    }

    jobs.forEach(job => {
      const card = document.createElement('div')
      card.className = 'card'
      const body = document.createElement('div')
      body.className = 'card-body'

      const jobTypesStr = Array.isArray(job.job_types) ? job.job_types.join(', ') : 'General'
      body.innerHTML = `
        <h5 class="card-title">${jobTypesStr} — $${job.price}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${job.location} • ${job.date ? new Date(job.date).toLocaleDateString() : 'ASAP'}</h6>
        <p class="card-text">Status: <span class="badge bg-info">${job.status}</span></p>
      `

      if (job.worker_id) {
        const w = workers.find(x => x.id === job.worker_id)
        body.innerHTML += `<p class="mb-0">Assigned: <strong>${w ? w.full_name : 'Unknown'}</strong></p>`
      } else if (currentUserId) {
        body.innerHTML += `<div class="mt-3"><button class="btn btn-sm btn-outline-primary btn-assign" data-id="${job.id}">Assign Me</button></div>`
      }

      card.appendChild(body)
      container.appendChild(card)
    })

    // Bind assign buttons
    document.querySelectorAll('.btn-assign').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const jobId = e.currentTarget.dataset.id
        await assignWorkerToJob(jobId)
      })
    })
  }

  async function assignWorkerToJob(jobId) {
    if (!currentUserId) {
      alert('Please sign in first')
      return
    }

    try {
      const { error } = await supabase
        .from('jobs')
        .update({ worker_id: currentUserId, status: 'assigned' })
        .eq('id', jobId)

      if (error) throw error
      await loadJobs()
      alert('✅ You assigned yourself to this job!')
    } catch (error) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  function setupEventListeners() {
    const jobForm = document.getElementById('jobForm')
    jobForm.addEventListener('submit', async (e) => {
      e.preventDefault()

      if (!currentUserId) {
        alert('Please sign in first to create a job')
        window.location.href = 'auth.html'
        return
      }

      const types = Array.from(document.querySelectorAll('input[name="jobType"]:checked')).map(i => i.value)
      const location = document.getElementById('location').value
      const price = parseFloat(document.getElementById('price').value || 0)
      const date = document.getElementById('date').value
      const workerId = document.getElementById('workerSelect').value || null

      if (types.length === 0) {
        alert('Select at least one job type')
        return
      }

      try {
        const { error } = await supabase.from('jobs').insert({
          job_types: types,
          location,
          price,
          worker_id: workerId || null,
          client_id: currentUserId,
          date: date ? new Date(date).toISOString() : null,
          status: workerId ? 'assigned' : 'open',
          pictures: [],
        })

        if (error) throw error
        e.target.reset()
        await loadJobs()
        alert('✅ Job created!')
      } catch (error) {
        alert(`❌ Error creating job: ${error.message}`)
      }
    })
  }

  // Start app on page load
  window.addEventListener('load', init)
})()
