# Showroom

Übersichts-Seite aller Projekte für den Review-Prozess.

## Lokal starten

```bash
npm install
npm run dev
```

## Neues Projekt hinzufügen

Datei `src/projects.js` öffnen und einen Eintrag ergänzen:

```js
{
  slug: 'projektname',
  name: 'Anzeigename',
  description: 'Kurz worum es geht',
  url: 'https://...',        // Vercel-URL des Projekts
  status: 'wip',             // 'live' | 'wip' | 'draft'
},
```

Dann `git add . && git commit -m "add [projektname]" && git push` → Vercel deployt automatisch.

## Tech Stack

Vite + React + Tailwind CSS
