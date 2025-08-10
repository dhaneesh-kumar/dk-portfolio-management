import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// 🔧 TO ENABLE FIREBASE: Replace these placeholder values with your actual Firebase project config
// You can get these values from your Firebase project settings in the Firebase Console
const firebaseConfig = {
  apiKey: "your-api-key-here",                    // Your Firebase API key
  authDomain: "your-project-id.firebaseapp.com", // Your Firebase Auth domain
  projectId: "your-project-id",                  // Your Firebase project ID (required for Firestore)
  storageBucket: "your-project-id.appspot.com",  // Your Firebase Storage bucket
  messagingSenderId: "123456789",                // Your Firebase messaging sender ID
  appId: "your-app-id"                          // Your Firebase app ID
};

// 🚀 SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project or select existing one
// 3. Enable Firestore Database
// 4. Go to Project Settings > General > Your apps
// 5. Copy the config object and replace the values above
// 6. Set up Firestore security rules (start with test mode for development)

// ⚠️ SECURITY NOTE: For production applications:
// - Use environment variables for sensitive configuration
// - Set up proper Firestore security rules
// - Consider using Firebase Authentication

let app;
let db;

try {
  // Initialize Firebase only if valid config is provided
  if (firebaseConfig.projectId && firebaseConfig.projectId !== "your-project-id") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not configured. Using sample data mode.');
    console.log('📖 See Firebase setup instructions in the app or check src/app/config/firebase.config.ts');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.log('📖 Please check your Firebase configuration in src/app/config/firebase.config.ts');
}

export { db };
