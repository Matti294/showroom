import { useState, useEffect, useRef } from 'react';
import { PROJECTS, AUTHORS } from './projects';
import { getComments, addComment, isSupabaseConfigured } from './supabase';
import './index.css';

const STATUS_LABEL = {
  live:  { text: 'Live',      classes: 'bg-green-100 text-green-700' },
  wip:   { text: 'In Arbeit', classes: 'bg-amber-100 text-amber-700' },
  draft: { text: 'Entwurf',   classes: 'bg-gray-100  text-gray-500'  },
};

// ── Projekt-Kachel ──────────────────────────────────────────────────────────
function ProjectCard({ project, onOpen }) {
  const badge = STATUS_LABEL[project.status] ?? STATUS_LABEL.draft;
  return (
    <button
      onClick={() => onOpen(project)}
      className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-left transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-violet-400"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-900 leading-snug">{project.name}</h2>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${badge.classes}`}>
          {badge.text}
        </span>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{project.description}</p>
      <div className="mt-auto pt-2 flex items-center gap-2 text-sm text-violet-600 font-medium">
        <span>💬</span>
        <span>Kommentare &amp; Details ansehen</span>
      </div>
    </button>
  );
}

// ── Kommentar-Eintrag ───────────────────────────────────────────────────────
function CommentItem({ comment }) {
  const time = new Date(comment.created_at).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-800 text-sm">{comment.author}</span>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}

// ── Detail-Modal ─────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }) {
  const [comments, setComments]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [author,   setAuthor]     = useState('');
  const [body,     setBody]       = useState('');
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getComments(project.slug)
      .then(setComments)
      .catch(() => setError('Kommentare konnten nicht geladen werden.'))
      .finally(() => setLoading(false));
  }, [project.slug]);

  // Modal mit Escape schließen
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!author.trim()) { setError('Bitte wähle einen Namen aus.'); return; }
    if (!body.trim())   { setError('Bitte schreib etwas in den Kommentar.'); return; }
    setError('');
    setSaving(true);
    try {
      const newComment = await addComment(project.slug, author.trim(), body.trim());
      setComments((prev) => [...prev, newComment]);
      setBody('');
      textareaRef.current?.focus();
    } catch {
      setError('Konnte nicht gespeichert werden. Bitte nochmal versuchen.');
    } finally {
      setSaving(false);
    }
  }

  const badge = STATUS_LABEL[project.status] ?? STATUS_LABEL.draft;
  const isLive = project.url && project.url !== '#';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}>
                {badge.text}
              </span>
            </div>
            <p className="text-sm text-gray-500">{project.description}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* App öffnen */}
        <div className="px-6 py-4 border-b border-gray-100">
          {isLive ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 transition-colors"
            >
              🚀 App öffnen & ausprobieren
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 text-sm font-medium text-gray-400 cursor-default">
              ⏳ Noch nicht online
            </div>
          )}
        </div>

        {/* Kommentare */}
        <div className="flex flex-col gap-4 p-6">
          <h3 className="font-semibold text-gray-800">Kommentare</h3>

          {!isSupabaseConfigured && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Lokaler Testmodus — Kommentare werden nur auf diesem Gerät gespeichert.
              Nach der Supabase-Einrichtung werden sie für alle geteilt.
            </p>
          )}

          {loading ? (
            <p className="text-sm text-gray-400">Lade Kommentare …</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Noch keine Kommentare — schreib den ersten! 👇</p>
          ) : (
            <div className="flex flex-col gap-2">
              {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
            </div>
          )}

          {/* Formular */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2 border-t border-gray-100 mt-2">
            <p className="text-sm font-medium text-gray-700">Wer schreibt?</p>
            <div className="flex flex-wrap gap-2">
              {AUTHORS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setAuthor(name)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    author === name
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Was denkst du über dieses Projekt? …"
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 transition-shadow"
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="self-end rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Speichern …' : '✓ Abschicken'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">🎨 Showroom</h1>
          <p className="mt-2 text-lg text-gray-500">Unsere Projekte — anklicken, anschauen, kommentieren</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.slug} project={project} onOpen={setSelected} />
          ))}
        </div>
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
