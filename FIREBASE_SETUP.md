# COD26 Firebase Setup Guide

This project already includes Firebase package support and a Firebase config file.

## Important
To make COD26 use a real Firebase backend, you must provide your own Firebase project credentials.
Without those values, the app stays in local demo mode.

## 1. Create a Firebase project
1. Open https://console.firebase.google.com/
2. Click **Create a project**
3. Enter your project name
4. Finish setup

## 2. Add a Web App
1. Inside Firebase, click **Add app**
2. Choose **Web**
3. Register the app
4. Firebase will give you config values

## 3. Enable Authentication
1. Open **Authentication**
2. Click **Get started**
3. Enable **Email/Password** sign-in

## 4. Enable Firestore Database
1. Open **Firestore Database**
2. Click **Create database**
3. Start in test mode for setup
4. Choose a region

## 5. Add environment values locally
Inside the `cod26` folder:
1. Copy `.env.example`
2. Rename the copy to `.env`
3. Paste your real Firebase values

Example:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 6. Restart the project
After saving `.env`, stop the app and run:

```bash
npm start
```

## 7. Recommended Firestore collections
You can later store these collections:
- `students`
- `schoolCodes`
- `payments`
- `projects`
- `certificates`

## 8. Current status
The project is ready for Firebase configuration, but a real live Firebase connection needs your project keys and database rules.
