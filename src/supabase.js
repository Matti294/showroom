import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

const supabase = isSupabaseConfigured ? createClient(url, key) : null;

// localStorage-Fallback
const LS_KEY = 'showroom-comments';
const LS_LINKS = 'showroom-links';
function lsAll() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function lsSave(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function lsLinks() {
  try { return JSON.parse(localStorage.getItem(LS_LINKS)) || []; } catch { return []; }
}
function lsSaveLinks(data) {
  localStorage.setItem(LS_LINKS, JSON.stringify(data));
}

export async function getComments(slug) {
  if (supabase) {
    const { data, error } = await supabase
      .from('comments')
      .select('id, author, body, created_at')
      .eq('project_slug', slug)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }
  const all = lsAll();
  return all[slug] || [];
}

export async function getAllComments() {
  if (supabase) {
    const { data, error } = await supabase
      .from('comments')
      .select('id, project_slug, author, body, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
  const all = lsAll();
  return Object.entries(all)
    .flatMap(([slug, comments]) => comments.map(c => ({ ...c, project_slug: slug })))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function addComment(slug, author, body) {
  if (supabase) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ project_slug: slug, author, body })
      .select('id, author, body, created_at')
      .single();
    if (error) throw error;
    return data;
  }
  const all = lsAll();
  const list = all[slug] || [];
  const comment = { id: Date.now(), author, body, created_at: new Date().toISOString() };
  list.push(comment);
  all[slug] = list;
  lsSave(all);
  return comment;
}

export async function getLinks() {
  if (supabase) {
    const { data, error } = await supabase
      .from('links')
      .select('id, url, title, description, author, created_at')
      .order('created_at', { ascending: false });
    if (!error) return data;
  }
  return lsLinks();
}

export async function deleteComment(id) {
  if (supabase) {
    const { error } = await supabase.from('comments').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const all = lsAll();
  for (const slug of Object.keys(all)) {
    all[slug] = all[slug].filter(c => c.id !== id);
  }
  lsSave(all);
}

export async function deleteLink(id) {
  if (supabase) {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (!error) return;
  }
  const list = lsLinks().filter(l => l.id !== id);
  lsSaveLinks(list);
}

export async function addLink(url, title, description, author) {
  if (supabase) {
    const { data, error } = await supabase
      .from('links')
      .insert({ url, title, description: description || null, author })
      .select('id, url, title, description, author, created_at')
      .single();
    if (!error) return data;
  }
  const list = lsLinks();
  const link = { id: Date.now(), url, title, description: description || null, author, created_at: new Date().toISOString() };
  list.unshift(link);
  lsSaveLinks(list);
  return link;
}
