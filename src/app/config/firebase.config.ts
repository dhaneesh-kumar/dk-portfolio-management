import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { environment } from "../../environments/environment";

// Firebase configuration is now managed in the environment files.
const firebaseConfig = environment.firebase;

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

try {
  // Initialize Firebase only if a valid projectId is provided
  if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.projectId !== 'YOUR_PROJECT_ID') {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("✅ Firebase initialized successfully");
  } else {
    console.warn("⚠️ Firebase not configured. Database features disabled.");
    console.log(
      "📖 To enable database features, configure Firebase in your environment file (e.g., src/environments/environment.ts)",
    );
  }
} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.log(
    "📖 Please check your Firebase configuration in your environment file.",
  );
}

export { db, auth };
