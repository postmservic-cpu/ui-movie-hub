# Movie Hub UI

A React frontend for the Movie Hub REST API. Browse, search, and filter movies by title, year, and category.

## Prerequisites

- Node.js 18+
- npm

## Getting Started

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=https://rest-api-movie-hub-latest.onrender.com
```

## Development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
```

Output is in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Base UI (Select components)
- React Query (TanStack Query)
- React Hook Form + Zod
- Axios
