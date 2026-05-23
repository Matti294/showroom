import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

const supabase = isSupabaseConfigured ? createClient(url, key) : null;

// localStorage-Fallback für lokales Testen ohne Supabase
const LS_KEY = 'showroom-comments';
function lsAll() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function lsSave(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
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
