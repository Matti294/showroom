// Hält das Supabase-Free-Tier-Projekt aktiv, damit es nicht nach ~7 Tagen
// Inaktivität pausiert. Wird per Vercel-Cron (siehe vercel.json) täglich aufgerufen
// und stellt eine minimale Anfrage an die Datenbank (echte DB-Aktivität).
export default async function handler(req, res) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'Supabase-Env fehlt' });
  }
  try {
    const r = await fetch(`${url}/rest/v1/comments?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return res.status(200).json({ ok: r.ok, status: r.status, at: new Date().toISOString() });
  } catch (e) {
    return res.status(502).json({ ok: false, error: String(e) });
  }
}
