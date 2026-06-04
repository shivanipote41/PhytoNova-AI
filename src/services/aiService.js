import { api } from './api';

const HF_MODEL = import.meta.env.VITE_HF_MODEL || 'facebook/deit-base-distilled-patch16-224';
const HF_TOKEN = import.meta.env.VITE_HF_API_TOKEN;
const isValidToken = HF_TOKEN && HF_TOKEN !== 'your_huggingface_token' && HF_TOKEN.startsWith('hf_');

/** Return base64-encoded data URL for a File/blob. */
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Deterministic mock prediction for when the HF token is absent. */
function mockPrediction() {
  const mockResults = [
    { label: 'Tomato___Early_blight', confidence: 0.87 },
    { label: 'Tomato___Late_blight', confidence: 0.82 },
    { label: 'Grape___Esca', confidence: 0.79 },
    { label: 'Apple___Apple_scab', confidence: 0.91 },
    { label: 'Potato___Early_blight', confidence: 0.85 },
    { label: 'Cucumber___Downy_mildew', confidence: 0.88 },
  ];
  const pick = mockResults[Math.floor(Math.random() * mockResults.length)];
  return { ...pick, source: 'mock' };
}

/**
 * Analyse a plant-image file using Hugging Face Inference API.
 * @param {File} file
 * @returns {Promise<{ label: string, confidence: number }>}
 */
export async function analyzeImage(file) {
  if (!isValidToken) {
    console.warn(
      '[aiService] VITE_HF_API_TOKEN is not set or invalid. Using mock prediction.'
    );
    await new Promise((r) => setTimeout(r, 800));
    return mockPrediction();
  }

  const base64 = await toBase64(file);
  // Strip data URL prefix so API accepts it cleanly
  const body = base64.split(',')[1];

  try {
    const data = await api.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      { inputs: body },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Hugging Face returns an array of [{ label, score }]
    const top = data[0];
    const label = top.label ?? 'Unknown';
    const confidence = top.score ?? 0;

    return { label, confidence, source: 'huggingface' };
  } catch (err) {
    // Return user-friendly error message for network failures
    const message = err.response?.data?.error || err.message || 'Network error. Please try again.';
    throw new Error(message);
  }
}