import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCao9yue41GdkrUkVQhZZ_7fPlFj-H0tx8",
  authDomain: "phytonova-ai.firebaseapp.com",
  projectId: "phytonova-ai",
  storageBucket: "phytonova-ai.firebasestorage.app",
  messagingSenderId: "610623103700",
  appId: "1:610623103700:web:0d7061c2a523c696525141",
  measurementId: "G-4KWVELN4SQ"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export function trackEvent(name, params = {}) {
  if (analytics) logEvent(analytics, name, params);
}