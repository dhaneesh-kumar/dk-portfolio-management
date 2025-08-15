import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-firebase-setup",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
      <div class="flex items-start">
        <svg
          class="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="flex-1">
          <h3 class="text-blue-800 font-semibold mb-2">
            Database Connected
          </h3>
          <p class="text-blue-700 text-sm mb-4">
            Firebase Firestore is configured and ready for data persistence.
            All portfolio data is stored in the database.
          </p>

          <details class="text-sm">
            <summary
              class="text-blue-800 font-medium cursor-pointer hover:text-blue-900"
            >
              📋 Setup Instructions
            </summary>
            <div class="mt-3 pl-4 border-l-2 border-blue-200">
              <ol class="list-decimal list-inside space-y-2 text-blue-700">
                <li>
                  Create a Firebase project at
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    class="underline"
                    >console.firebase.google.com</a
                  >
                </li>
                <li>Enable Firestore Database in your Firebase project</li>
                <li>Get your Firebase configuration from Project Settings</li>
                <li>
                  Update
                  <code class="bg-blue-100 px-1 rounded"
                    >src/app/config/firebase.config.ts</code
                  >
                  with your Firebase config
                </li>
                <li>
                  Set up Firestore security rules (start with test mode for
                  development)
                </li>
              </ol>

              <div class="mt-4 p-3 bg-blue-100 rounded-lg">
                <p class="font-medium text-blue-800 mb-2">
                  Sample Firebase Config:
                </p>
                <pre
                  class="text-xs text-blue-700 overflow-x-auto"
                ><code>{{'{'}}<br>  apiKey: "your-api-key-here",<br>  authDomain: "your-project.firebaseapp.com",<br>  projectId: "your-project-id",<br>  storageBucket: "your-project.appspot.com",<br>  messagingSenderId: "123456789",<br>  appId: "your-app-id"<br>{{'}'}} </code></pre>
              </div>

              <div
                class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p class="text-sm text-yellow-800">
                  <strong>🔒 Security Note:</strong> For production, configure
                  proper Firestore security rules and use environment variables
                  for sensitive configuration.
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  `,
})
export class FirebaseSetupComponent {}
