# Ryan Frankel — Portfolio (Firebase + Vite + React)

A full-featured mechanical engineering portfolio rebuilt from Replit into a production-ready open-source stack.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Data fetching | TanStack React Query |
| Database | Firebase Firestore |
| File storage | Firebase Storage (resume PDF) |
| Auth | Firebase Authentication (Email/Password) |
| Hosting | Vercel / Netlify / Firebase Hosting |

---

## One-Time Firebase Setup (~15 min)

### 1. Create a Firebase Project
1. Go to https://console.firebase.google.com
2. **Add project** → name it → Continue → Create project

### 2. Enable Firestore
Build → Firestore Database → **Create database** → Production mode → pick a region → Enable

### 3. Enable Storage
Build → Storage → **Get started** → Done

### 4. Enable Authentication + Create Admin User
Build → Authentication → **Get started** → Sign-in method → Enable **Email/Password** → Save
Then go to the **Users** tab → **Add user** → enter your admin email + password.

### 5. Register a Web App
Project Settings (gear icon) → Your apps → **</>** Web → register → copy the `firebaseConfig` values.

### 6. Set Environment Variables
```bash
cp .env.example .env
# Then fill in your Firebase values
```

### 7. Deploy Firestore + Storage Rules
```bash
npm install -g firebase-tools
firebase login
firebase init        # choose Firestore + Storage, link your project
firebase deploy --only firestore:rules,storage
```

---

## Local Development
```bash
npm install
npm run dev          # http://localhost:5173
```

## Production Build
```bash
npm run build        # output → dist/
```

### Vercel (recommended)
```bash
npx vercel --prod
# Add VITE_FIREBASE_* vars in Vercel dashboard → Settings → Environment Variables
```

### Netlify
Drag `dist/` to app.netlify.com. Add a `public/_redirects` file:
```
/*  /index.html  200
```

### Firebase Hosting
```bash
firebase init hosting   # public dir = "dist", configure as SPA
npm run build
firebase deploy --only hosting
```

---

## Admin Panel
Visit `/admin/login` — sign in with the Firebase Auth email/password you created.
From the dashboard you can add/edit/delete projects and upload your resume PDF.

---

## Project Structure
```
src/
├── lib/
│   ├── firebase.ts      Firebase app init
│   ├── db.ts            All Firestore + Storage operations
│   ├── auth.tsx         Auth context (Firebase Email/Password)
│   └── queries.ts       TanStack React Query hooks
├── components/
│   ├── Layout.tsx       Nav + Footer
│   └── ui/Button.tsx
└── pages/
    ├── Home / Projects / ProjectDetail / About / Contact / Resume
    ├── Minigames / AdminLogin / AdminDashboard / AdminProjectForm
    └── games/  Pong · Tetris · CarDodge · Leaderboard
```

## Firestore Collections
| Collection | Purpose |
|---|---|
| `projects` | Portfolio projects |
| `leaderboard` | Highway Run scores |
| `resume_meta` | Stores the Storage download URL for the PDF |
