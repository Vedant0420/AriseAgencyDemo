import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

dotenv.config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setupAdmin() {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('NEXT_PUBLIC_ADMIN_EMAIL environment variable is not set.');
    process.exit(1);
  }

  try {
    await setDoc(doc(db, 'config', 'admin'), {
      email: adminEmail,
      createdAt: new Date()
    });
    console.log(`Admin email set to: ${adminEmail}`);
    console.log('Admin setup complete. You can now access the admin panel at /admin');
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
