import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHeHHsFBU3WyHfOEVJAMlblM_2LTTp0Ps",
  authDomain: "college-vote-hub.firebaseapp.com",
  projectId: "college-vote-hub",
  storageBucket: "college-vote-hub.firebasestorage.app",
  messagingSenderId: "1010432861476",
  appId: "1:1010432861476:web:7000e7187826967a54ffb1",
  measurementId: "G-RY4N11HY69",
  databaseURL: "https://college-vote-hub-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Get a reference to the database service
export const database = getDatabase(app);

export { app, analytics };
export default app;
