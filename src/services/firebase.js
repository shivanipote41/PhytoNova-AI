import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const envKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: envKey || "AIzaSyCao9yue41GdkrUkVQhZZ_7fPlFj-H0tx8",
  authDomain: "phytonova-ai.firebaseapp.com",
  projectId: "phytonova-ai",
  storageBucket: "phytonova-ai.firebasestorage.app",
  messagingSenderId: "610623103700",
  appId: "1:610623103700:web:0d7061c2a523c696525141",
  measurementId: "G-4KWVELN4SQ"
};

if (!envKey) {
  console.warn('[Firebase] VITE_FIREBASE_API_KEY not set. Using default config.');
}

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export function trackEvent(name, params = {}) {
  if (analytics) logEvent(analytics, name, params);
}