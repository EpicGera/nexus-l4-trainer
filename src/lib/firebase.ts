import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signInWithCredential, getRedirectResult, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import appletConfig from '../../firebase-applet-config.json';

// OAuth scope needed by the Google Sheets export. On web it's granted through the
// popup/redirect consent screen; on native it's requested via the native plugin
// (note: Android Credential Manager may not return an OAuth access token for it —
// see googleSignIn below).
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || (appletConfig as any).firestoreDatabaseId
};

let app: any;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Critical: Failed to initialize Firebase App with config:", firebaseConfig, error);
  // Create a minimal dummy fallback to prevent application from crashing
  app = {
    options: firebaseConfig,
    name: '[DEFAULT]'
  };
}

let dbInstance: any;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, (firebaseConfig as any).firestoreDatabaseId);
} catch (e) {
  console.warn("Failed to initialize Firestore with persistent local cache; falling back to memory/default cache:", e);
  try {
    dbInstance = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
  } catch (firestoreErr) {
    console.error("Critical: Failed to initialize standard Firestore, falling back to mock database:", firestoreErr);
    dbInstance = {
      _databaseId: { projectId: firebaseConfig.projectId },
    } as any;
  }
}

let authInstance: any;
try {
  authInstance = getAuth(app);
} catch (error) {
  console.error("Critical: Failed to get Firebase Auth instance:", error);
  // Dummy fallback auth to prevent crashes in the rest of the application
  authInstance = {
    currentUser: null,
    onAuthStateChanged: (cb: any) => {
      setTimeout(() => cb(null), 0);
      return () => {};
    },
    signOut: async () => {},
  } as any;
}

let googleProviderInstance: any;
try {
  // Default login provider = identity only (no Sheets scope) so signing in has
  // zero permission friction. The `spreadsheets` scope is requested on demand
  // by requestSheetsAccess() the first time the user links/exports a sheet.
  googleProviderInstance = new GoogleAuthProvider();
} catch (error) {
  console.error("Failed to initialize GoogleAuthProvider:", error);
  googleProviderInstance = {
    addScope: () => {}
  } as any;
}

export const db = dbInstance;
export const auth = authInstance;
export const googleProvider = googleProviderInstance;

// Cache the access token in memory.
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Complete any pending redirect sign-in. The default login no longer carries
  // the Sheets scope, so there's no access token to cache here.
  getRedirectResult(auth).catch(console.error);

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If we don't have token but user is logged in, they might need to re-authenticate
        // to get the token for Sheets, or we might not need it until they click export.
        cachedAccessToken = null; 
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  // ── NATIVE (Android / iOS via Capacitor) ───────────────────────────────
  // Inside the WebView, Google rejects OAuth popups/redirects
  // ("disallowed_useragent") and the redirect can't return to localhost, which
  // left the app stuck on a blank screen. Use the platform's native account
  // picker instead, then sign the Firebase JS SDK in with the returned
  // credential so Firestore (cloud sync) sees the same user. `signInWithCredential`
  // is a plain REST exchange — no WebView navigation, so no blank screen.
  if (Capacitor.isNativePlatform()) {
    try {
      isSigningIn = true;
      // Default login = identity only, via the smooth Credential Manager path
      // (returns an idToken, which is all Firebase auth + Firestore need). The
      // Sheets OAuth scope is requested separately by requestSheetsAccess().
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (!idToken) {
        throw new Error('Google no devolvió credenciales válidas.');
      }
      const credential = GoogleAuthProvider.credential(idToken, null);
      const userCred = await signInWithCredential(auth, credential);
      return { user: userCred.user, accessToken: '' };
    } catch (error: any) {
      console.error('Native Google sign-in failed:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  }

  // ── WEB ─────────────────────────────────────────────────────────────────
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    // Default login carries no Sheets scope — nothing to cache for Sheets here.
    return { user: result.user, accessToken: '' };
  } catch (error: any) {
    console.warn('Popup Sign in failed, falling back to Redirect:', error);
    try {
      await signInWithRedirect(auth, googleProvider);
      return null; // The redirect will reload the page
    } catch (redirectError) {
      console.error('Redirect sign in error:', redirectError);
      throw redirectError;
    }
  } finally {
    isSigningIn = false;
  }
};

/**
 * Incremental authorization: request the Google Sheets scope ON DEMAND — only
 * when the athlete links or exports a sheet. Re-runs Google consent for the
 * already-signed-in user, then caches and returns a `spreadsheets`-scoped OAuth
 * access token. Keeping this out of the default login is what makes signing in
 * friction-free. Returns null if no token was granted.
 */
export const requestSheetsAccess = async (): Promise<string | null> => {
  // ── NATIVE ────────────────────────────────────────────────────────────
  if (Capacitor.isNativePlatform()) {
    try {
      isSigningIn = true;
      // Legacy flow (useCredentialManager:false) is the one that returns a real
      // OAuth access token carrying the requested scope.
      const result = await FirebaseAuthentication.signInWithGoogle({
        scopes: [SHEETS_SCOPE],
        useCredentialManager: false,
      });
      const accessToken = result.credential?.accessToken ?? null;
      if (accessToken) cachedAccessToken = accessToken;
      return accessToken;
    } catch (error) {
      console.error('Native Sheets access request failed:', error);
      throw error;
    } finally {
      isSigningIn = false;
    }
  }

  // ── WEB ───────────────────────────────────────────────────────────────
  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    provider.addScope(SHEETS_SCOPE);
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken ?? null;
    return cachedAccessToken;
  } catch (error) {
    console.error('Sheets access request failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Drop the cached OAuth access token. Used to force a fresh sign-in when a
// Google API call rejects the token (e.g. the short-lived native token expired).
export const clearAccessToken = (): void => {
  cachedAccessToken = null;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

