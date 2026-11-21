# Tweety Birds — Web + Android starter

This is a working starter project for the Tweety Birds aviary manager. It includes a responsive web app/PWA and a Capacitor configuration for packaging the same web app as an Android application.

## Included in this starter
- Soft Sage Green + Teal + Warm White interface
- Dashboard and navigation for Pair, Egg, Baby, Courses & Medicine, and Finance
- Pair records with independent 20-day Rest / Start Breeding controls
- One latest rest record per pair (a new rest replaces that pair's previous rest record)
- Egg records and editable status
- Baby ring number sequence and source-pair references
- Course types, medicine duration, daily checkboxes, and course completion
- Income and expense records
- Local device storage using browser localStorage
- PWA manifest and basic service worker

## Run the web app
1. Install Node.js (LTS).
2. In this folder run `npm install`.
3. Run `npm run dev` and open the local address printed by Vite.
4. For a production web build, run `npm run build`. The deployable website files will be in `dist/`.

## Prepare the Android project
1. Install Node.js LTS and Android Studio.
2. Run `npm install`.
3. Run `npm run android:add` once to generate the Android Studio project.
4. Run `npm run android:sync` after web changes.
5. Run `npm run android:open` to open the project in Android Studio.
6. In Android Studio, build and sign an APK/AAB using your own developer setup.

## Important limitations of this starter
- Records are saved only on the current device/browser. Clearing app data/browser storage can remove them.
- No cloud account, multi-device sync, remote backup, or database server is connected yet.
- The Rest dates are calculated locally. Background push notifications and reliable scheduled reminders need native notification setup and testing in the Android build.
- Course date checkboxes currently stamp the current device date; editing historical dates and richer course editing are future enhancements.
- This source package is not a signed APK and is not yet published online or in Google Play.

Back up your records before clearing browser/app data. For production use, add secure authentication, cloud database, backups, and tested notification scheduling.
