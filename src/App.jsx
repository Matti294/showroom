import { useState, useEffect, useRef } from 'react';
import { PROJECTS, AUTHORS } from './projects';
import { getComments, getAllComments, addComment, deleteComment, getLinks, addLink, deleteLink, isSupabaseConfigured } from './supabase';
import './index.css';

const STATUS_LABEL = {
  live:  { text: 'Live',        classes: 'bg-black text-white' },
  wip:   { text: 'In Progress', classes: 'border border-black/20 text-black/50' },
  draft: { text: 'Draft',       classes: 'border border-black/10 text-black/30' },
};

// ── Projekt-Kachel ──────────────────────────────────────────────────────────
function ProjectCard({ project, index, onOpen }) {
  const badge = STATUS_LABEL[project.status] ?? STATUS_LABEL.draft;
  return (
    <button
      onClick={() => onOpen(project)}
      className="group w-full h-48 flex flex-col justify-between bg-white border border-black/8 p-7 text-left transition-all duration-300 hover:border-black/20 hover:shadow-sm focus:outline-none focus:ring-1 focus:ring-black/30"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-medium tracking-tight text-black leading-snug">{project.name}</h2>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${badge.classes}`}>
          {badge.text}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-black/25 font-light tracking-widest">Draft {index + 1}</span>
        <span className="text-xs text-black/30 group-hover:text-black/60 group-hover:translate-x-0.5 transition-all">→</span>
      </div>
    </button>
  );
}

// ── Löschen-Button mit Bestätigung ───────────────────────────────────────────
function DeleteButton({ onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy]             = useState(false);
  const [err, setErr]               = useState(false);

  async function handle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) { setConfirming(true); return; }
    setBusy(true);
    setErr(false);
    try {
      await onDelete();
    } catch {
      setErr(true);
      setBusy(false);
      setConfirming(false);
      setTimeout(() => setErr(false), 3000);
    }
  }

  if (err) return <span className="text-xs text-red-400 shrink-0">Error</span>;

  return (
    <span className="flex items-center gap-2 shrink-0">
      {confirming && !busy && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirming(false); }}
          className="text-xs text-black/40 hover:text-black transition-colors px-2 py-1 border border-black/15 hover:border-black/40"
        >Cancel</button>
      )}
      <button
        onClick={handle}
        disabled={busy}
        className={`text-xs px-2 py-1 border transition-colors disabled:opacity-30 ${
          confirming
            ? 'border-red-300 text-red-500 hover:border-red-500 hover:bg-red-50'
            : 'border-black/15 text-black/40 hover:border-black/40 hover:text-black'
        }`}
      >
        {busy ? '…' : confirming ? 'Delete?' : 'Delete'}
      </button>
    </span>
  );
}

// ── Kommentar-Eintrag (Modal) ────────────────────────────────────────────────
function CommentItem({ comment, onDelete }) {
  const time = new Date(comment.created_at).toLocaleString('de-DE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  return (
    <div className="flex flex-col gap-1.5 border-b border-black/6 pb-4">
      <div className="flex items-baseline gap-3">
        <span className="font-medium text-black text-sm tracking-tight">{comment.author}</span>
        <span className="text-xs text-black/30">{time}</span>
        <DeleteButton onDelete={() => deleteComment(comment.id).then(() => onDelete(comment.id))} />
      </div>
      <p className="text-sm text-black/70 leading-relaxed font-light whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}

// ── Kommentar-Feed (zentrale Ansicht) ───────────────────────────────────────
function CommentsView({ onOpenProject }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    setLoading(true);
    getAllComments()
      .then(setComments)
      .catch(() => setError('Could not load comments.'))
      .finally(() => setLoading(false));
  }, []);

  const projectName = (slug) => {
    const [base, ...rest] = String(slug).split('/');
    const found = PROJECTS.find((p) => p.slug === base);
    if (!found) return slug;
    return rest.length ? `${found.name} · ${rest.join('/')}` : found.name;
  };

  if (loading) return <p className="text-sm text-black/30 font-light">Loading …</p>;
  if (error)   return <p className="text-xs text-red-400">{error}</p>;

  if (comments.length === 0) {
    return (
      <p className="text-sm text-black/30 font-light italic">
        No feedback yet — open a project and write the first.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-black/6">
      {comments.map((c) => {
        const time = new Date(c.created_at).toLocaleString('en-GB', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
        const project = PROJECTS.find((p) => p.slug === String(c.project_slug).split('/')[0]);
        return (
          <div key={c.id} className="py-5 flex flex-col gap-1.5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <button
                onClick={() => project && onOpenProject(project)}
                className="text-xs font-medium tracking-widest uppercase text-black/40 hover:text-black transition-colors"
              >
                {projectName(c.project_slug)}
              </button>
              <span className="text-black/20 text-xs">·</span>
              <span className="text-sm font-medium text-black tracking-tight">{c.author}</span>
              <span className="text-xs text-black/25 ml-auto">{time}</span>
              <DeleteButton onDelete={() => deleteComment(c.id).then(() => setComments(prev => prev.filter(x => x.id !== c.id)))} />
            </div>
            <p className="text-sm text-black/70 leading-relaxed font-light whitespace-pre-wrap">{c.body}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Referenz-Links ──────────────────────────────────────────────────────────
function ReferencesView() {
  const [links, setLinks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [author, setAuthor]     = useState('');
  const [url, setUrl]           = useState('');
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    setLoading(true);
    getLinks()
      .then(setLinks)
      .catch(() => setError('Could not load references.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!author.trim()) { setError('Please select your name.'); return; }
    if (!url.trim())    { setError('Please enter a URL.'); return; }
    if (!title.trim())  { setError('Please enter a title.'); return; }
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = 'https://' + normalizedUrl;
    setError('');
    setSaving(true);
    try {
      const newLink = await addLink(normalizedUrl, title.trim(), desc.trim(), author.trim());
      setLinks((prev) => [newLink, ...prev]);
      setUrl(''); setTitle(''); setDesc('');
    } catch (e) {
      const msg = e?.message || '';
      if (msg.includes('links') || msg.includes('schema')) setError('Supabase: links table missing — run SQL first.');
      else setError('Could not be saved: ' + (msg || 'unknown error'));
    } finally {
      setSaving(false);
    }
  }

  const hostname = (rawUrl) => {
    try { return new URL(rawUrl).hostname.replace('www.', ''); } catch { return rawUrl; }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Link-Liste */}
      <div className="flex flex-col gap-px bg-black/6">
        {loading ? (
          <div className="bg-[#f5f5f5] py-4">
            <p className="text-sm text-black/30 font-light">Loading …</p>
          </div>
        ) : links.length === 0 ? (
          <div className="bg-[#f5f5f5] py-4">
            <p className="text-sm text-black/30 font-light italic">No references yet — add the first one.</p>
          </div>
        ) : links.map((l) => (
          <div key={l.id} className="group bg-white p-6 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <a href={l.url} target="_blank" rel="noopener noreferrer" className="font-medium text-black text-sm tracking-tight hover:underline flex-1">{l.title}</a>
              <div className="flex items-center gap-3 shrink-0">
                <DeleteButton onDelete={() => deleteLink(l.id).then(() => setLinks(prev => prev.filter(x => x.id !== l.id)))} />
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-xs text-black/30 hover:text-black/60 transition-colors">→</a>
              </div>
            </div>
            <span className="text-xs text-black/35 tracking-wide">{hostname(l.url)}</span>
            {l.description && (
              <p className="text-sm text-black/50 font-light leading-relaxed">{l.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-medium tracking-widest uppercase text-black/25">{l.author}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-6 border-t border-black/8">
        <h3 className="text-xs font-medium tracking-widest uppercase text-black/40">Add new reference</h3>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-black/15 px-4 py-3 text-sm text-black placeholder-black/25 font-light focus:outline-none focus:border-black/40 transition-colors bg-transparent"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title / Why is this relevant?"
            className="w-full border border-black/15 px-4 py-3 text-sm text-black placeholder-black/25 font-light focus:outline-none focus:border-black/40 transition-colors bg-transparent"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Note (optional) — what can we learn from this?"
            rows={2}
            className="w-full border border-black/15 px-4 py-3 text-sm text-black placeholder-black/25 font-light resize-none focus:outline-none focus:border-black/40 transition-colors bg-transparent"
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium tracking-widest uppercase text-black/40">From</p>
          <div className="flex flex-wrap gap-2">
            {AUTHORS.map(({ name, title: authorTitle, flag }) => (
              <button
                key={name}
                type="button"
                onClick={() => setAuthor(name)}
                className={`flex flex-col px-4 py-2.5 text-left border transition-colors ${
                  author === name
                    ? 'border-black bg-black text-white'
                    : 'border-black/15 text-black hover:border-black/40'
                }`}
              >
                <span className="text-sm font-medium leading-tight">{flag} {name}</span>
                {authorTitle && (
                  <span className={`text-[10px] tracking-wide mt-0.5 ${author === name ? 'text-white/60' : 'text-black/35'}`}>
                    {authorTitle}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start bg-black text-white px-6 py-2.5 text-xs font-medium tracking-widest uppercase hover:bg-black/80 disabled:opacity-40 transition-colors"
        >
          {saving ? 'Saving …' : 'Add →'}
        </button>
      </form>
    </div>
  );
}

// ── Architektur: ein Bildschirm mit eigenem Ideen-Thread ─────────────────────
function ScreenRow({ screen, comments, open, onToggle, onAdd, hasAuthor }) {
  const [body, setBody]     = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!hasAuthor)     { setErr('Please select your name above.'); return; }
    if (!body.trim())   { setErr('Please write something.'); return; }
    setErr('');
    setSaving(true);
    try {
      await onAdd(body.trim());
      setBody('');
    } catch {
      setErr('Could not be saved.');
    } finally {
      setSaving(false);
    }
  }

  const count = comments?.length ?? 0;

  return (
    <div className="bg-white border border-black/8">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-black/[0.02] transition-colors"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-black tracking-tight">{screen.title}</span>
          <span className="text-xs text-black/40 font-light leading-relaxed">{screen.description}</span>
        </span>
        <span className="shrink-0 flex items-center gap-2 text-xs text-black/40">
          {count > 0 && (
            <span className="rounded-full bg-black text-white px-2 py-0.5 text-[10px] leading-none">{count}</span>
          )}
          <span className="text-base leading-none">{open ? '−' : '+'}</span>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 flex flex-col gap-3 border-t border-black/6">
          {count === 0 ? (
            <p className="text-xs text-black/30 font-light italic">No ideas yet — write the first.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex flex-col gap-1 border-b border-black/6 pb-2 last:border-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-black">{c.author}</span>
                  <span className="text-[10px] text-black/30">
                    {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <p className="text-sm text-black/70 font-light whitespace-pre-wrap leading-relaxed">{c.body}</p>
              </div>
            ))
          )}

          <form onSubmit={submit} className="flex flex-col gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Idea for this screen …"
              rows={2}
              className="w-full border border-black/15 px-3 py-2 text-sm text-black placeholder-black/25 font-light resize-none focus:outline-none focus:border-black/40 transition-colors bg-transparent"
            />
            {err && <p className="text-xs text-red-500">{err}</p>}
            <button
              type="submit"
              disabled={saving}
              className="self-end bg-black text-white px-4 py-2 text-[11px] font-medium tracking-widest uppercase hover:bg-black/80 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving …' : 'Add →'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Architektur-Abschnitt (Sitemap + Ideen pro Bildschirm) ───────────────────
function ArchitectureSection({ project }) {
  const arch = project.architecture;
  const [byScreen, setByScreen] = useState({});
  const [loading, setLoading]   = useState(true);
  const [author, setAuthor]     = useState('');
  const [openId, setOpenId]     = useState(null);

  useEffect(() => {
    let active = true;
    getAllComments()
      .then((all) => {
        if (!active) return;
        const prefix = project.slug + '/';
        const grouped = {};
        for (const c of all) {
          if (typeof c.project_slug === 'string' && c.project_slug.startsWith(prefix)) {
            const sid = c.project_slug.slice(prefix.length);
            if (!grouped[sid]) grouped[sid] = [];
            grouped[sid].push(c);
          }
        }
        for (const sid of Object.keys(grouped)) {
          grouped[sid].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        setByScreen(grouped);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [project.slug]);

  async function handleAdd(screenId, bodyText) {
    const newComment = await addComment(`${project.slug}/${screenId}`, author.trim(), bodyText);
    setByScreen((prev) => ({ ...prev, [screenId]: [...(prev[screenId] ?? []), newComment] }));
  }

  return (
    <div className="flex flex-col gap-5">
      {arch.note && <p className="text-sm text-black/40 font-light leading-relaxed">{arch.note}</p>}

      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-medium tracking-widest uppercase text-black/30">Comment as</p>
        <div className="flex flex-wrap gap-2">
          {AUTHORS.map(({ name, flag }) => (
            <button
              key={name}
              type="button"
              onClick={() => setAuthor(name)}
              className={`px-3 py-1.5 text-xs border transition-colors ${
                author === name ? 'border-black bg-black text-white' : 'border-black/15 text-black hover:border-black/40'
              }`}
            >
              {flag} {name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-black/30 font-light">Loading …</p>
      ) : (
        <div className="flex flex-col gap-6">
          {arch.areas.map((area) => (
            <div key={area.id} className="flex flex-col gap-2">
              <div className="flex flex-col">
                <h4 className="text-sm font-medium text-black tracking-tight">{area.label}</h4>
                {area.hint && <span className="text-xs text-black/35 font-light">{area.hint}</span>}
              </div>
              <div className="flex flex-col gap-2">
                {area.screens.map((screen) => (
                  <ScreenRow
                    key={screen.id}
                    screen={screen}
                    comments={byScreen[screen.id]}
                    open={openId === screen.id}
                    onToggle={() => setOpenId(openId === screen.id ? null : screen.id)}
                    onAdd={(bodyText) => handleAdd(screen.id, bodyText)}
                    hasAuthor={Boolean(author)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSupabaseConfigured && (
        <p className="text-xs text-black/40 border border-black/10 px-3 py-2">
          Local mode — ideas saved on this device only.
        </p>
      )}
    </div>
  );
}

// ── Architektur-Tab (Landing Page) ──────────────────────────────────────────
function ArchitectureView() {
  const project = PROJECTS.find((p) => p.architecture);

  if (!project) {
    return (
      <p className="text-sm text-black/30 font-light italic">
        No architecture defined yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium tracking-tight text-black">{project.name} — Architecture</h2>
        <p className="text-sm text-black/40 font-light">{project.description}</p>
      </div>
      <ArchitectureSection project={project} />
    </div>
  );
}

// ── Detail-Modal ─────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [author, setAuthor]     = useState('');
  const [body, setBody]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    getComments(project.slug)
      .then(setComments)
      .catch(() => setError('Could not load comments.'))
      .finally(() => setLoading(false));
  }, [project.slug]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!author.trim()) { setError('Please select your name.'); return; }
    if (!body.trim())   { setError('Please write something.'); return; }
    setError('');
    setSaving(true);
    try {
      const newComment = await addComment(project.slug, author.trim(), body.trim());
      setComments((prev) => [...prev, newComment]);
      setBody('');
      textareaRef.current?.focus();
    } catch {
      setError('Could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const badge = STATUS_LABEL[project.status] ?? STATUS_LABEL.draft;
  const isLive = project.url && project.url !== '#';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/30 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-8 pt-8 pb-6 border-b border-black/6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-medium tracking-tight text-black">{project.name}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${badge.classes}`}>
                {badge.text}
              </span>
            </div>
            <p className="text-sm text-black/40 font-light">{project.description}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center text-black/30 hover:text-black transition-colors"
            aria-label="Schließen"
          >
            ✕
          </button>
        </div>

        {/* Seiten-Preview */}
        <div className="px-8 py-6 border-b border-black/6">
          {isLive ? (
            <div className="flex flex-col gap-4">
              <p className="text-xs font-medium tracking-widest uppercase text-black/40">Pages</p>
              <div className="grid grid-cols-2 gap-3">
                {(project.pages ?? [{ name: 'Home', path: '/' }]).map((page) => {
                  const href = project.url.replace(/\/$/, '') + page.path;
                  return (
                    <a
                      key={page.path}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col gap-2 border border-black/8 hover:border-black/25 transition-colors overflow-hidden"
                    >
                      {/* iFrame-Vorschau oder Platzhalter */}
                      <div className="relative bg-gray-100 overflow-hidden" style={{ height: '110px' }}>
                        {page.noPreview ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/3">
                            <span className="text-lg text-black/15">↗</span>
                            <span className="text-[9px] text-black/25 tracking-widest uppercase">Open page</span>
                          </div>
                        ) : (
                          <>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 border border-black/20 border-t-black/50 rounded-full animate-spin" />
                            </div>
                            <iframe
                              src={href}
                              title={page.name}
                              scrolling="no"
                              onLoad={(e) => { e.target.style.opacity = '1'; }}
                              style={{
                                width: '1280px',
                                height: '800px',
                                transform: 'scale(0.195)',
                                transformOrigin: 'top left',
                                pointerEvents: 'none',
                                border: 'none',
                                opacity: '0',
                                transition: 'opacity 0.3s ease',
                                position: 'relative',
                                zIndex: 1,
                              }}
                            />
                          </>
                        )}
                      </div>
                      {/* Label */}
                      <div className="flex items-center justify-between px-3 pb-2.5">
                        <span className="text-xs font-medium text-black tracking-tight">{page.name}</span>
                        <span className="text-[10px] text-black/25 group-hover:text-black/50 transition-colors">↗</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 border border-black/10 text-black/30 px-5 py-2.5 text-xs font-medium tracking-widest uppercase cursor-default">
              Not yet online
            </div>
          )}
        </div>

        {/* Kommentare */}
        <div className="flex flex-col gap-5 px-8 py-6">
          <h3 className="text-xs font-medium tracking-widest uppercase text-black/40">Feedback</h3>

          {!isSupabaseConfigured && (
            <p className="text-xs text-black/40 border border-black/10 px-3 py-2">
              Local mode — comments saved on this device only.
            </p>
          )}

          {loading ? (
            <p className="text-sm text-black/30 font-light">Loading …</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-black/30 font-light italic">No feedback yet — be the first.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((c) => <CommentItem key={c.id} comment={c} onDelete={(id) => setComments(prev => prev.filter(x => x.id !== id))} />)}
            </div>
          )}

          {/* Formular */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4 border-t border-black/6">
            <p className="text-xs font-medium tracking-widest uppercase text-black/40">From</p>
            <div className="flex flex-wrap gap-2">
              {AUTHORS.map(({ name, title, flag }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setAuthor(name)}
                  className={`flex flex-col px-4 py-2.5 text-left border transition-colors ${
                    author === name
                      ? 'border-black bg-black text-white'
                      : 'border-black/15 text-black hover:border-black/40'
                  }`}
                >
                  <span className="text-sm font-medium leading-tight">{flag} {name}</span>
                  {title && (
                    <span className={`text-[10px] tracking-wide mt-0.5 ${author === name ? 'text-white/60' : 'text-black/35'}`}>
                      {title}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What do you think about this project?"
              rows={3}
              className="w-full border border-black/15 px-4 py-3 text-sm text-black placeholder-black/25 font-light resize-none focus:outline-none focus:border-black/40 transition-colors bg-transparent"
            />

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={saving}
              className="self-end bg-black text-white px-6 py-2.5 text-xs font-medium tracking-widest uppercase hover:bg-black/80 disabled:opacity-40 transition-colors"
            >
              {saving ? 'Saving …' : 'Submit →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Two Dots Logo ─────────────────────────────────────────────────────────────
function TwoDotsLogo({ width = 240 }) {
  const vw = 420, vh = 105;
  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      width={width}
      height={Math.round(vh * (width / vw))}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="38"  cy="52" r="33" stroke="#000" strokeWidth="5" fill="transparent" />
      <circle cx="68"  cy="52" r="33" stroke="#000" strokeWidth="5" fill="transparent" />
      <line x1="118" y1="10" x2="118" y2="95" stroke="#000" strokeWidth="4" />
      <text
        x="133" y="65"
        fontFamily="Inter, Helvetica, Arial, sans-serif"
        fontSize="52" fontWeight="500" fill="#000"
      >TWO DOTS</text>
      <text
        x="133" y="91"
        fontFamily="Inter, Helvetica, Arial, sans-serif"
        fontSize="25" fontWeight="400" fill="#6B6B6B"
      >STUDIO</text>
    </svg>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'projekte',    label: 'Projects' },
  { id: 'architektur', label: 'Architecture' },
  { id: 'kommentare',  label: 'Comments' },
  { id: 'referenzen',  label: 'References' },
];

export default function App() {
  const [tab, setTab]           = useState('projekte');
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="mx-auto max-w-4xl px-6 py-16">

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <img
              src="/logo-cropped.png"
              alt="Two Dots"
              className="h-8"
              style={{ mixBlendMode: 'multiply' }}
            />
            <span className="text-sm font-normal" style={{ color: '#666', letterSpacing: '0.02em' }}>Studio Copenhagen</span>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-black">Showroom</h1>
          <p className="mt-2 text-sm text-black/40 font-light">Our projects — click, explore, comment</p>
        </header>

        {/* Tab-Navigation */}
        <nav className="flex gap-0 border-b border-black/10 mb-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-xs font-medium tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-black text-black'
                  : 'border-transparent text-black/30 hover:text-black/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Tab-Inhalt */}
        {tab === 'projekte' && (
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 bg-black/6">
            {PROJECTS.map((project, i) => (
              <div key={project.slug} className="bg-[#f5f5f5]">
                <ProjectCard project={project} index={i} onOpen={setSelected} />
              </div>
            ))}
          </div>
        )}

        {tab === 'architektur' && <ArchitectureView />}

        {tab === 'kommentare' && (
          <CommentsView onOpenProject={(p) => { setSelected(p); setTab('projekte'); }} />
        )}

        {tab === 'referenzen' && (
          <ReferencesView />
        )}

        <footer className="mt-16 pt-8 border-t border-black/8 flex items-center justify-between">
          <span className="text-xs text-black/25 tracking-wide">Two Dots Studio · {new Date().getFullYear()}</span>
          {/* Zwei Punkte — nachgebaut vom Logo */}
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
            <circle cx="8"  cy="12" r="7" stroke="black" strokeWidth="1.2"/>
            <circle cx="16" cy="8"  r="7" stroke="black" strokeWidth="1.2"/>
          </svg>
        </footer>
      </div>

      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
