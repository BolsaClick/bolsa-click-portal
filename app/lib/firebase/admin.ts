import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth, Auth } from 'firebase-admin/auth'

let adminApp: App | null = null
let adminAuth: Auth | null = null

// Only initialize if credentials are available
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

if (projectId && clientEmail && privateKey) {
  const firebaseAdminConfig = {
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  }

  // Initialize Firebase Admin
  adminApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseAdminConfig)
  adminAuth = getAuth(adminApp)
}

export { adminApp, adminAuth }
