# Licious News Pro

Inshorts-style Hindi short-news app with:
- Live-news API adapter + fallback demo news
- AI summarization endpoint
- Admin panel for publishing short news
- Expo push-token registration and notification-ready backend
- Hindi categories, save, share and original-source links

## Architecture
Mobile (Expo/React Native) -> Node/Express API -> News provider + AI provider + database
Admin panel -> API

## Run backend
cd backend
npm install
copy .env.example .env
npm start

## Run mobile
cd mobile
npm install
npx expo start

The current mobile API URL is a placeholder in mobile/App.js:
https://YOUR-DOMAIN.com/api
Replace it with your deployed backend URL.

## Important
The demo includes safe fallbacks. Real news and AI require API credentials and a server-side integration. Do not put provider API keys inside the mobile app.

Expo's current SDK documentation recommends the latest stable Expo/React Native pairing; push notifications can be integrated through expo-notifications with Expo Push Service or directly through FCM/APNs.
