# COD26 Learning Platform

COD26 is a React-based learning platform for Python education.

## Main Features
- Direct student login with monthly scanner payment flow
- School-code student login with admin-created school codes
- Required student profile fields:
  - name
  - username
  - email
  - password
  - school / college
  - student ID for school-code students
- Transaction ID based access unlock for direct students
- Detailed lesson pages with:
  - concept explanations
  - highlights
  - code examples
  - quiz prompts
  - assignments
- COD26 Arena quiz challenge section
- Project submission flow
- COD26 certificate and dummy certificate preview
- Admin dashboard for:
  - school code creation
  - payment record review
  - reminder workflow

## Tech Stack
- React
- Create React App
- Firebase-ready placeholder config
- Local browser storage for demo mode

## Project Structure
```text
cod26/
├── public/
├── src/
│   ├── App.js
│   ├── App.css
│   ├── App.test.js
│   ├── firebase.js
│   ├── platformService.js
│   ├── unitdata.js
│   └── index.js
├── .env.example
├── package.json
└── VS_CODE_GUIDE.md
```

## Getting Started
Open a terminal inside the `cod26` folder and run:

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Build for Production
```bash
npm run build
```

## Deployment Ready Files
This project includes:
- `netlify.toml`
- `vercel.json`
- `DEPLOYMENT_GUIDE.md`

These help you deploy the website online more easily.

## Admin Login
```text
Email: officialcod70@gmail.com
Password: victoria@786
```

## Firebase Setup Later
If you want to connect real Firebase later:
1. Copy `.env.example`
2. Rename it to `.env`
3. Fill in your Firebase project values
4. Restart the app

For detailed setup instructions, read:
- `FIREBASE_SETUP.md`

## Notes
- Direct students must enter a valid transaction ID after payment to unlock the course.
- School-code students do not use the direct payment flow.
- Certificates unlock only after required conditions are completed.
