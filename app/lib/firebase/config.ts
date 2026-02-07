import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

// Only initialize if API key is available
if (firebaseConfig.apiKey) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()

  // Configure Google Provider
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  })
}

export { app, auth, googleProvider }
