# Booking App

React booking form for limo/car service with Google Maps Places autocomplete, live route preview, form validation, and a three-step booking flow.

## Features

- **One-way / Hourly** trip types
- **Location / Airport** toggle for pickup and drop-off autocomplete
- **Google Places Autocomplete** for pickup, drop-off, and up to 3 intermediate stops
- **Live map preview** with:
  - Driving route drawn via the **Google Routes API** (pickup → stops → drop-off)
  - Markers labeled **P** (pickup), **A/B/C** (stops), **D** (drop-off)
- **Form validation** (date, time, locations, phone, passengers) with react-hook-form + Zod
- **Mock phone lookup** — known numbers skip extra contact fields
- **Confirmation & success pages** with booking summary and map

## Booking Flow

1. **`/`** — Fill out the booking form (trip details, locations, contact info)
2. **`/confirmation`** — Review summary and confirm
3. **`/success`** — Booking confirmed with confirmation number

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your Google Maps API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

3. Enable these APIs in [Google Cloud Console](https://console.cloud.google.com/):

   - Maps JavaScript API
   - Places API
   - **Routes API** (required for route lines on the map)

4. Start the dev server:

```bash
npm run dev
```

### Troubleshooting the map

- **Map does not load** — Check that `VITE_GOOGLE_MAPS_API_KEY` is set and Maps JavaScript API is enabled.
- **Markers show but no route line** — Enable **Routes API** in Google Cloud Console. Check the browser console for `[computeRoute]` logs.
- **Autocomplete not working** — Enable **Places API** and ensure billing is active on your Google Cloud project.

## Demo Phone Numbers

These numbers are recognized as existing customers (no extra contact fields required):

- `+1 774 415 3244`
- `+1 978 706 6226`

Any other valid phone number will prompt for first name, last name, and email.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   ├── booking/       # Form sections (stops, contact, date/time)
│   ├── layout/        # Page shell and trip type toggle
│   ├── maps/          # Google Maps provider, autocomplete, route map
│   └── ui/            # Shared UI components
├── context/           # Booking form state (React context)
├── lib/               # Validation, route computation, mock APIs
├── pages/             # Booking, confirmation, success pages
└── types/             # Shared TypeScript types
```

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn-style UI components
- React Router, react-hook-form, Zod
- @react-google-maps/api + Google Routes API
- react-phone-number-input
