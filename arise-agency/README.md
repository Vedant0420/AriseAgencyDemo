# Arise Agency Website

A full-stack agency website for content-creator management and video-editing services, built with Next.js and Firebase.

## Features

- **Frontend Pages**: Home, Services, Portfolio, About, Contact, Booking
- **Contact Form**: Collects name, email, platform, message
- **Booking Form**: Scheduling with name, email, date, time, notes
- **Portfolio**: Embedded videos and images
- **Admin Panel**: Secure access via email authentication for viewing submissions
- **Backend**: Firebase Firestore for data storage

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Firebase project and add config to `.env.local`
4. Set admin email in `.env.local`
5. Run development server: `npm run dev`

## Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

## Firebase Security Rules

Set Firestore rules to allow read/write only for authenticated admin user.

## Deployment

Deploy to Vercel or any hosting platform supporting Next.js.
echo "# Updated" >> README.md
