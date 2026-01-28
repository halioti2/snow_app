// Minimal client-side app for creating/displaying jobs (localStorage-backed MVP)

(function () {
  const JOBS_KEY = 'sj_jobs_v1'
  const WORKERS_KEY = 'sj_workers_v1'

  function uuid() {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
  }

  function loadJobs() {
    return JSON.parse(localStorage.getItem(JOBS_KEY) || '[]')
  }
  function saveJobs(jobs) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs))
  }

  function loadWorkers() {
    return JSON.parse(localStorage.getItem(WORKERS_KEY) || '[]')
  }
  function saveWorkers(ws) {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(ws))
  }

  function ensureSampleWorkers() {
    let ws = loadWorkers()
    if (ws.length === 0) {
      ws = [
        { id: 'worker-1', name: 'Alex', borough: 'Brooklyn', job_types: ['driveway', 'sidewalk'], rating: 4.8 },
        { id: 'worker-2', name: 'Sam', borough: 'Queens', job_types: ['sidewalk'], rating: 4.6 },
      ]
      saveWorkers(ws)
    }
    return ws
  }

  function renderWorkers() {
    const ws = ensureSampleWorkers()
    const ul = document.getElementById('workerList')
    ul.innerHTML = ''
    const sel = document.getElementById('workerSelect')
    sel.innerHTML = '<option value="">-- none --</option>'
    ws.forEach(w => {
      const li = document.createElement('li')
      li.className = 'list-group-item d-flex justify-content-between align-items-start'
      li.innerHTML = `<div><strong>${w.name}</strong><div class="text-muted small">${w.borough} — ${w.job_types.join(', ')}</div></div><span class="badge bg-secondary rounded-pill">${w.rating}</span>`
      ul.appendChild(li)

      const opt = document.createElement('option')
      opt.value = w.id
      opt.textContent = `${w.name} — ${w.borough}`
      sel.appendChild(opt)
    })
  }

  function renderJobs() {
    const jobs = loadJobs()
    const container = document.getElementById('jobsContainer')
    container.innerHTML = ''
    if (jobs.length === 0) {
      container.innerHTML = '<div class="text-muted">No jobs yet.</div>'
      return
    }

    jobs.slice().reverse().forEach(job => {
      const card = document.createElement('div')
      card.className = 'card'
      const body = document.createElement('div')
      body.className = 'card-body'
      body.innerHTML = `
        <h5 class="card-title">${job.job_types.join(', ')} — $${job.price}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${job.location} • ${job.date || 'ASAP'}</h6>
        <p class="card-text">Status: <strong>${job.status}</strong></p>
      `
      if (job.worker_id) {
        const w = loadWorkers().find(x => x.id === job.worker_id)
        body.innerHTML += `<p class="mb-0">Assigned: <strong>${w ? w.name : job.worker_id}</strong></p>`
      } else {
        body.innerHTML += `<div class="mt-3"><button class="btn btn-sm btn-outline-primary btn-assign" data-id="${job.id}">Assign Worker</button></div>`
      }

      card.appendChild(body)
      container.appendChild(card)
    })

    // bind assign buttons
    document.querySelectorAll('.btn-assign').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id
        showAssignModal(id)
      })
    })
  }

  function showAssignModal(jobId) {
    const workers = loadWorkers()
    const name = prompt('Enter worker id to assign (available: ' + workers.map(w=>w.id).join(', ') + ')')
    if (!name) return
    const jobs = loadJobs()
    const j = jobs.find(x => x.id === jobId)
    if (!j) return alert('job not found')
    j.worker_id = name
    j.status = 'assigned'
    saveJobs(jobs)
    renderJobs()
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderWorkers()
    renderJobs()

    document.getElementById('jobForm').addEventListener('submit', e => {
      e.preventDefault()
      const types = Array.from(document.querySelectorAll('input[name="jobType"]:checked')).map(i=>i.value)
      const location = document.getElementById('location').value
      const price = parseFloat(document.getElementById('price').value || 0)
      const date = document.getElementById('date').value
      const worker = document.getElementById('workerSelect').value || null

      if (types.length === 0) return alert('Select at least one job type')

      const jobs = loadJobs()
      const job = {
        id: uuid(),
        job_types: types,
        location,
        price,
        worker_id: worker,
        client_id: 'client-local',
        date: date || null,
        status: worker ? 'assigned' : 'open',
        pictures: [],
        created_at: new Date().toISOString()
      }
      jobs.push(job)
      saveJobs(jobs)
      e.target.reset()
      renderJobs()
    })
  })

})();
