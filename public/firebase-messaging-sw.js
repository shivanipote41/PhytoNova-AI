importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCao9yue41GdkrUkVQhZZ_7fPlFj-H0tx8",
  authDomain: "phytonova-ai.firebaseapp.com",
  projectId: "phytonova-ai",
  storageBucket: "phytonova-ai.firebasestorage.app",
  messagingSenderId: "610623103700",
  appId: "1:610623103700:web:0d7061c2a523c696525141",
  measurementId: "G-4KWVELN4SQ"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/favicon.ico',
  });
});