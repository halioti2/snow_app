# PRD — Snow Shoveling Jobs App

## Summary
A lightweight web app for clients to post shoveling jobs and for workers (shovelers) to accept/be assigned jobs. The app focuses exclusively on snow removal tasks (shoveling). This PRD describes scope, data models, user flows, acceptance criteria, and important safety/privacy considerations.

## Goals
- Provide a minimal marketplace for snow-shoveling jobs.
- Make it easy for clients to create posts and for workers to find and accept work.
- Maintain simple worker profiles and job histories.
- Include safety measures for chat and identity.

## Out of scope
- Full payment processing (optional later).
- Background checks and formal identity verification (recommended later).
- Advanced scheduling or routing.

## Users
- Client: posts jobs, reviews workers, communicates via chat.
- Worker: has a profile, accepts/assigned jobs, updates job status, receives reviews.
- Admin (future): manage disputes, moderate content.

## Key features
- Create a job post (job id, job type(s), location, price, worker id placeholder, date).
- Worker profiles (user id, job types, rates, borough, job history with ratings/reviews/pics, featured gallery).
- Chat between client and worker (safety features recommended below).
- Assign worker to a job or create job with worker preassigned.
- Add review, pictures, rating to a job.
- Job appears in both client and worker histories.

## Data models (basic)
- Job
  - id (string)
  - type(s) (array of strings, e.g., driveway, sidewalk)
  - location (borough / free text)
  - price (number)
  - workerId (nullable string)
  - date (ISO string)
  - status (open/assigned/completed/cancelled)
  - clientId
  - pictures (array of URLs)
  - reviews (array of review objects)

- User (Worker)
  - id (string)
  - name
  - role: 'worker' | 'client' (a person could be both)
  - jobTypes (array)
  - rates (map jobType -> rate)
  - location (borough)
  - jobHistory (array of job references with rating/review/pics)
  - featuredGallery (array of image URLs)

- Review
  - reviewerId
  - rating (1-5)
  - comment
  - pictures (array)
  - date

- Chat (basic)
  - id
  - participants (clientId, workerId)
  - messages [{senderId, text, timestamp, attachments}]

## User stories
- As a client I can create a job post with location, type, and price so workers can see it.
- As a worker I can list my job types and rates so clients can choose me.
- As a client I can assign a worker to a job or invite a worker to accept it.
- As a client and worker I can chat; I can report messages or block abusive users.
- As a client I can add photos and rating for a completed job; it becomes part of the worker's history.

## Acceptance criteria
- Clients can create job posts that persist in the system.
- Workers can appear in search/by-borough and have a visible profile.
- A job can be assigned to a worker and transition to completed with review and photos.
- Chat exists with a way to report/block and retain minimal audit logs.

## Edge cases
- No workers in a given borough.
- Duplicate job entries.
- Late or missing payment (out of scope but impacts UX).
- Abusive behavior in chat.

## Non-functional requirements
- Simple static front-end using HTML/CSS/Bootstrap to start.
- Data persistence: for MVP, localStorage or an in-memory store; for production, backend DB (Postgres, Firebase, etc.).
- Responsive UI (mobile-first) since workers likely use phones.

## Security & Safety (chat and platform safety)
- Minimum viable protections:
  - Authentication/authorization: require sign-in (email) before messaging or accepting jobs (MVP: email as identifier).
  - Message reporting & blocking: clients/workers can report messages and block users.
  - Chat content filtering: moderate for known abusive words via a simple filter (improve later with ML/moderation APIs).
  - Rate-limiting: throttle messages and job-post creation to prevent spam.
  - Privacy: do not expose personal contact info in public listings; use in-app messaging with masked contact info until mutually agreed.
  - Escrow or payment hold (recommended): hold funds until job completion to reduce disputes.
  - Minimal audit log: store chat metadata and report history for moderation.
  - Verification: offer optional ID/photo verification in future; require phone verification for payouts.
  - Emergency & safety guidance: show safety tips in the app for in-person meetups.

## Metrics
- Jobs posted per week
- Jobs completed
- Average worker rating
- Chats started and reports filed

## Future improvements (not in MVP)
- Payment integration (Stripe/PayPal) with escrow
- Scheduling/calendar availability for workers
- Geolocation & route optimization
- Background checks and verified badges
- Push notifications, SMS fallbacks
- Admin moderation panel

## Notes
This PRD is intentionally minimal to get a functioning MVP out quickly focused on snow shoveling. Additional pieces (payments, verification, admin) should be prioritized based on risk and regulatory needs when preparing for production.
