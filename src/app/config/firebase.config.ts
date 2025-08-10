import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Firebase configuration
// 🔧 TO ENABLE FIREBASE: Replace these placeholder values with your actual Firebase project config
// You can get these values from your Firebase project settings in the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBZ-5dV69zwzqGn4CiGE75x9vMlKtzz-YQ",
  authDomain: "dk-portfolio-management.firebaseapp.com",
  projectId: "dk-portfolio-management",
  storageBucket: "dk-portfolio-management.firebasestorage.app",
  messagingSenderId: "57739749423",
  appId: "1:57739749423:web:4996fcbfd4b83248c9beda",
  measurementId: "G-762MYXMRV9",
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

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

try {
  // Initialize Firebase only if valid config is provided
  if (
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "your-project-id"
  ) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("✅ Firebase initialized successfully");
  } else {
    console.warn("⚠️ Firebase not configured. Using sample data mode.");
    console.log(
      "📖 See Firebase setup instructions in the app or check src/app/config/firebase.config.ts",
    );
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.log(
    "📖 Please check your Firebase configuration in src/app/config/firebase.config.ts",
  );
}

export { db, auth };
