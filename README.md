# EverSmile

A modern dental clinic website built with **HTML5, CSS3, and Bootstrap 5**.

## Pages
- `index.html` — Home (hero, features, testimonials, CTA)
- `services.html` — Our Services (filterable service catalog)
- `book-appointment.html` — Book Appointment (service, date/time, patient details, live summary)
- `admin-dashboard.html` — Doctor Dashboard (live patients, revenue, activity, and appointment actions)
- `assistant-dashboard.html` — Assistant Dashboard (live schedule, patient queue, and front-desk actions)

## Structure
```
ever-smile/
├── public/
│   ├── index.html
│   ├── services.html
│   ├── book-appointment.html
│   ├── admin-dashboard.html
│   ├── assistant-dashboard.html
│   ├── css/
│   │   └── style.css    # design tokens + all custom styles
│   └── js/
│       └── script.js    # frontend interactions and API calls
├── package.json            # root Node.js commands
├── node/
│   ├── package.json       # Node.js project metadata and scripts
│   ├── package-lock.json  # locked dependency state
│   ├── server.js          # dependency-free API and static file server
│   ├── README.md           # backend API guide
│   ├── .env.example       # server configuration reference
│   ├── scripts/
│   │   └── reset-data.js   # reset local appointment data
│   └── data/
│       └── appointments.json
└── README.md
```

## Tech
- Bootstrap 5.3.3 (CDN)
- Bootstrap Icons 1.11.3 (CDN)
- Chart.js 4.4.4 (CDN, dashboard only)
- Google Fonts: Sora (display), Inter (body), JetBrains Mono (data/labels)

## How to run
Run the site through Node.js:

```bash
npm start
```

Then open http://localhost:3000. Stop the server with `Ctrl+C`.

During development, use `npm run dev` for automatic server restarts. Use
`npm run data:reset` to clear locally stored appointments.

The server implementation and its npm package live in `node/`. You can also run
it directly with `cd node` followed by `npm start`.

You can still open `index.html` directly in your browser when you do not need a local server.
In VS Code, install the **Live Server** extension, right-click `index.html`,
and choose "Open with Live Server" for auto-reload while editing.

> Note: this project loads Bootstrap, icons, fonts, and demo photos from CDNs,
> so an internet connection is needed the first time each page loads.
