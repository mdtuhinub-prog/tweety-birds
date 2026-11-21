# Tweety Birds — Firebase setup (মোবাইল)

এই সংস্করণে Google sign-in এবং Firestore cloud save যুক্ত করা হয়েছে।

## 1. Firebase Authentication
- Authentication > Settings > Authorized domains এ আপনার প্রকাশিত ওয়েবসাইটের domain যোগ করুন।
- Google sign-in provider Enabled থাকতে হবে।

## 2. Firestore security rules
Firebase Console > Firestore Database > Rules এ নিচের rules বসিয়ে Publish করুন:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/aviary/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

এতে প্রত্যেক Google account শুধু নিজের `users/{uid}` ডেটা পড়তে/লিখতে পারবে।

## 3. ওয়েবসাইট প্রকাশ
এই ZIP-এর source একটি Vite project। ওয়েবসাইট বানাতে project build করে hosting-এ প্রকাশ করতে হবে।
মোবাইল দিয়ে GitHub + Netlify/Vercel ব্যবহার করা যায়, তবে আগে source ফাইলগুলো GitHub-এ upload করতে হবে।
Firebase Console-এর Hosting থেকেও deploy করা যায়, কিন্তু সাধারণত CLI/build environment দরকার হয়।

## গুরুত্বপূর্ণ
- Firebase Web API key browser config-এর অংশ; এটি password নয়। নিরাপত্তা Firestore Rules দিয়ে নিশ্চিত করতে হবে।
- আগে থেকে থাকা localStorage records প্রথম Google login-এর সময় Firestore-এ migrate হবে।
- অন্য ফোনে একই Google account দিয়ে login করলে একই cloud document লোড হবে।
- একাধিক ডিভাইসে একই সময়ে পরিবর্তন করলে সর্বশেষ save আগের save-কে প্রতিস্থাপন করতে পারে। আপাতত একসাথে এক ডিভাইসে edit করা ভালো।
- Firebase Authentication-এর Google provider এবং Firestore Rules ঠিকমতো publish না করলে save হবে না।
