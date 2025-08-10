export const AUTH_ERROR_MESSAGES: { [key: string]: string } = {
  "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
  "auth/popup-blocked":
    "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
  "auth/network-request-failed":
    "Network error. Please check your connection and try again.",
  "auth/too-many-requests":
    "Too many failed attempts. Please wait and try again later.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password should be at least 6 characters long.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/operation-not-allowed": "Email/password authentication is not enabled.",
  "auth/invalid-credential": "Invalid email or password. Please try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with the same email but different sign-in credentials.",
  "auth/credential-already-in-use":
    "This credential is already associated with a different user account.",
  "auth/email-change-needs-verification":
    "Please verify your new email address before the change takes effect.",
  "auth/invalid-continue-uri": "The continue URL provided is invalid.",
  "auth/missing-continue-uri":
    "A continue URL must be provided in the request.",
  "auth/requires-recent-login":
    "This operation requires recent authentication. Please sign in again.",
  "auth/timeout": "The request timed out. Please try again.",
};

export const AUTH_PROVIDERS = {
  GOOGLE: "google.com",
  EMAIL: "password",
} as const;

export const AUTH_SCOPES = {
  GOOGLE: {
    EMAIL: "email",
    PROFILE: "profile",
  },
} as const;
