/**
 * Client-side image analysis for demo mode.
 * Analyses pixel colours to produce a plausible plant-disease diagnosis
 * when no Hugging Face API token is configured.
 */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function analysePixels(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 128; // Downsample for speed
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(img, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  let total = 0;
  let green = 0;
  let brown = 0;
  let yellow = 0;
  let white = 0;
  let dark = 0;
  let hash = 2166136261;

  for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel for speed
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    total++;

    // Build deterministic hash from sampled pixels
    hash ^= r;
    hash = (hash * 16777619) >>> 0;
    hash ^= g;
    hash = (hash * 16777619) >>> 0;
    hash ^= b;
    hash = (hash * 16777619) >>> 0;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    const lightness = (max + min) / 2 / 255;

    // White / very light
    if (lightness > 0.85 && chroma < 30) {
      white++;
      continue;
    }

    // Dark / black spots
    if (lightness < 0.15) {
      dark++;
      continue;
    }

    // Green dominant
    if (g > r + 15 && g > b + 15) {
      green++;
      continue;
    }

    // Yellow / orange
    if (r > 150 && g > 120 && b < 80) {
      yellow++;
      continue;
    }

    // Brown / dark orange
    if (r > 80 && g > 40 && g < 130 && b < 60) {
      brown++;
      continue;
    }

    // Dark brown / necrotic
    if (r > 40 && r < 120 && g > 20 && g < 80 && b < 40) {
      brown++;
      continue;
    }
  }

  return { total, green, brown, yellow, white, dark, hash };
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function chooseBySeed(seed, items) {
  return items[seed % items.length];
}

const DIAGNOSES = [
  {
    id: 'healthy',
    label: 'Healthy',
    confidenceBoost: 0.92,
    check: (r) => r.green / r.total > 0.55 && r.brown / r.total < 0.08 && r.white / r.total < 0.05,
  },
  {
    id: 'powdery_mildew',
    label: 'Powdery_mildew',
    confidenceBoost: 0.84,
    check: (r) => r.white / r.total > 0.12 || (r.white / r.total > 0.06 && r.green / r.total < 0.4),
  },
  {
    id: 'bacterial_spot',
    label: 'Bacterial_spot',
    confidenceBoost: 0.79,
    check: (r) => r.yellow / r.total > 0.15 && r.brown / r.total < 0.2,
  },
  {
    id: 'tomato_early_blight',
    label: 'Tomato___Early_blight',
    confidenceBoost: 0.81,
    check: (r) => r.brown / r.total > 0.12 && r.dark / r.total > 0.05 && r.yellow / r.total < 0.25,
  },
  {
    id: 'tomato_late_blight',
    label: 'Tomato___Late_blight',
    confidenceBoost: 0.83,
    check: (r) => r.brown / r.total > 0.15 && r.dark / r.total > 0.08,
  },
  {
    id: 'cucumber_downy_mildew',
    label: 'Cucumber___Downy_mildew',
    confidenceBoost: 0.77,
    check: (r) => r.yellow / r.total > 0.12 && r.brown / r.total > 0.08,
  },
];

/**
 * Analyse a plant image client-side and return a mock diagnosis.
 * @param {Blob|File} file
 * @returns {Promise<{label: string, confidence: number, source: string}>}
 */
export async function smartDemoAnalyse(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const ratios = analysePixels(img);
    const random = seededRandom(ratios.hash);

    const candidates = DIAGNOSES.filter((diag) => diag.check(ratios));
    if (candidates.length > 0) {
      const chosen = chooseBySeed(ratios.hash, candidates);
      const noise = (random() - 0.5) * 0.06;
      const confidence = Math.min(0.97, Math.max(0.65, chosen.confidenceBoost + noise));
      return { label: chosen.label, confidence, source: 'demo' };
    }

    const { green, brown, yellow, white } = ratios;
    const maxSignal = Math.max(green, brown, yellow, white);
    const fallbackGroup = [];

    if (maxSignal === green) {
      fallbackGroup.push('Healthy');
    }
    if (maxSignal === brown) {
      fallbackGroup.push('Tomato___Early_blight', 'Tomato___Late_blight');
    }
    if (maxSignal === yellow) {
      fallbackGroup.push('Bacterial_spot', 'Cucumber___Downy_mildew');
    }
    if (maxSignal === white) {
      fallbackGroup.push('Powdery_mildew');
    }

    const label = fallbackGroup.length > 0 ? chooseBySeed(ratios.hash, fallbackGroup) : 'Healthy';
    const confidence = 0.65 + random() * 0.3;
    return { label, confidence, source: 'demo' };
  } finally {
    URL.revokeObjectURL(url);
  }
}
