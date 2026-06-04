import { supabase } from '../services/supabase';

const STORAGE_KEY = 'phytnova_detections';

function getLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setLocal(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function saveDetection(detection, user) {
  const entry = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
    user_id: user?.id || 'anonymous',
    image_url: detection.image_url || '',
    disease: detection.disease || 'Unknown',
    confidence: detection.confidence ?? 0,
    treatment: detection.treatment || '',
    created_at: new Date().toISOString(),
  };

  // Always save to localStorage first (reliable fallback)
  const local = getLocal();
  setLocal([entry, ...local]);

  // Try Supabase — capture error properly
  let supabaseError = null;
  if (supabase && user?.id) {
    const { error } = await supabase.from('detections').insert({
      user_id: user.id,
      image_url: entry.image_url,
      disease: entry.disease,
      confidence: entry.confidence,
      treatment: entry.treatment,
    });
    if (error) {
      console.error('[detectionsStore] Supabase insert failed:', error.message);
      supabaseError = error.message;
    }
  }

  return { entry, supabaseError };
}

export async function getDetections(userId) {
  const local = getLocal().filter((d) => d.user_id === (userId || 'anonymous'));

  if (!supabase || !userId) {
    return { data: local, source: 'local' };
  }

  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error('[detectionsStore] Supabase fetch failed:', error?.message);
    return { data: local, source: 'local' };
  }

  // Merge Supabase + local, deduplicate by id
  const map = new Map();
  [...data, ...local].forEach((d) => map.set(d.id, d));
  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return { data: merged, source: 'supabase' };
}

export function clearLocalDetections() {
  localStorage.removeItem(STORAGE_KEY);
}