import { PROJECTS } from './projects';
import './index.css';

const STATUS_LABEL = {
  live:  { text: 'Live',      classes: 'bg-green-100 text-green-700' },
  wip:   { text: 'In Arbeit', classes: 'bg-yellow-100 text-yellow-700' },
  draft: { text: 'Entwurf',   classes: 'bg-gray-100 text-gray-500' },
};

function ProjectCard({ name, description, url, status }) {
  const badge = STATUS_LABEL[status] ?? STATUS_LABEL.draft;
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${badge.classes}`}>
          {badge.text}
        </span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        Ansehen →
      </a>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Showroom</h1>
          <p className="mt-2 text-lg text-gray-500">Projekt-Übersicht · Review</p>
        </div>

        {PROJECTS.length === 0 ? (
          <p className="text-gray-400">Noch keine Projekte eingetragen.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.slug} {...project} />
            ))}
          </div>
        )}

        <p className="mt-16 text-center text-xs text-gray-300">
          Neues Projekt? Eintrag in <code className="font-mono">src/projects.js</code> hinzufügen.
        </p>
      </div>
    </div>
  );
}
