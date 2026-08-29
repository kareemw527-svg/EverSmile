# EverSmile Backend

This folder contains the Node.js server and local appointment data.

## Run

From the project root:

```powershell
npm start
```

For automatic restarts when editing the backend, frontend, or appointment data:

```powershell
npm run dev
```

Keep this process running while developing. Refresh the browser after editing
HTML or CSS to see the updated page.

The server reads `HOST` and `PORT` from the environment. Copy `.env.example`
for reference, or set a value directly in PowerShell:

```powershell
$env:PORT=3001; npm start
```

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Create an appointment |
| PATCH | `/api/appointments/:id` | Change status to Pending, Confirmed, Cancelled, or Completed |
| DELETE | `/api/appointments/:id` | Delete an appointment |

Appointments are stored in `data/appointments.json` for local development.
Reset the local data with `npm run data:reset` from the project root.