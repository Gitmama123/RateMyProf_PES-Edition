# RateMyProf – PES Edition

An anonymous professor rating platform built for PES University students. Students sign in with their PESU credentials, verified against the PESU Academy portal.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (mongoose) |
| Auth | JWT, PESU-Auth API, PESU Academy scraper |
| Deployment | Render (server), Vercel (client) |

---

## Project Structure

```
RateMyProf_PES-Edition/
├── client/                  # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── page.js          # Home / professor catalog
│   │   ├── login/           # Login page (PESU SSO)
│   │   ├── admin/           # Admin dashboard
│   │   └── professor/[id]/  # Professor detail page
│   ├── components/          # Reusable UI components
│   └── lib/                 # API client, auth helpers
│
└── server/                  # Express backend
    ├── index.js             # Server entry point
    ├── scrape_all.js        # One-time scraper to populate professor DB
    ├── models/              # Mongoose schemas (Professor, Review, User, ProfessorRequest)
    ├── routes/              # Express route handlers
    ├── services/            # Scraper and PESU Academy integration
    ├── middleware/          # JWT auth, profanity filter
    └── utils/               # Fuzzy matcher, aggregate calculator
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- A MongoDB Atlas cluster (free tier works)
- A copy of `server/.env` (see below)

### Environment Variables

Create a file at `server/.env` with the following:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
PORT=5000
JWT_SECRET=<a_long_random_secret_string>
```

### Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Run in Development

Open two terminals:

```bash
# Terminal 1 – Backend
cd server
npm run dev

# Terminal 2 – Frontend
cd client
npm run dev
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:3000`.

---

## Populating the Professor Database

The professor directory is scraped from [staff.pes.edu](https://staff.pes.edu). 
Run this once after setting up your database:

```bash
node server/scrape_all.js
```

This iterates over all departments on both EC and RR campuses and upserts professor records into MongoDB. The server will also trigger a small auto-seed on first startup if the collection is empty.

---

## Authentication Flow

1. Student enters their PESU SRN and password on the login page.
2. The backend verifies credentials via the [PESU-Auth API](https://pesu-auth.onrender.com).


## Review Verification

All review text is run through a **profanity filter** before submission. The filter checks against a curated word list using word-boundary matching, and rejects any review containing inappropriate language with a `400` error.

## Admin Access

Admin credentials are seeded automatically on first startup. To log in as admin, go to `/login` and use the admin username/password configured in your database seed.

Admins can:
- View and moderate professor addition requests
- Approve or reject community-submitted professor entries
- Delete inappropriate reviews

---

## Key Scripts

| Script | Description |
|---|---|
| `node server/scrape_all.js` | Scrapes staff.pes.edu and populates the professor collection |
| `npm run dev` (server) | Starts the Express dev server with hot reload |
| `npm run dev` (client) | Starts the Next.js dev server |
| `npm run build` (client) | Builds the production Next.js bundle |
