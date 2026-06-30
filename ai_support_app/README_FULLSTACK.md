# ClariBot Full-Stack Web App

This project keeps the Figma-generated React UI and adds a working Express backend.

## What is included

- React + Vite frontend matching the uploaded Figma design
- Express REST API backend
- Signup, login, JWT authentication and logout
- Persistent JSON database stored at `server/data/db.json`
- AI-style support chat endpoint with saved conversations
- Lead capture from the landing page
- Admin summary API for conversations, leads, users and resolution rate

## Run locally

### 1. Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 2. Backend

Open a second terminal:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Backend runs at `http://localhost:4000`.

## First user

The first account you create becomes an `admin`. Later accounts become normal users.

## Important production notes

Before deploying, change `JWT_SECRET`, use HTTPS, and replace the JSON file store with PostgreSQL, MySQL, MongoDB, or another production database.
