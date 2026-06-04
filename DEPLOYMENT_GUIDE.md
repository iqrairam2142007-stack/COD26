# COD26 Deployment Guide

This project is ready for static hosting.

## Option 1: Netlify
1. Create a Netlify account
2. Click **Add new site**
3. Choose **Import an existing project** or drag-and-drop the project folder
4. Build command:
```bash
npm run build
```
5. Publish directory:
```text
build
```
6. Deploy

The included `netlify.toml` already supports React routing.

## Option 2: Vercel
1. Create a Vercel account
2. Import the project from GitHub or upload it
3. Framework preset: **Create React App**
4. Deploy

The included `vercel.json` supports React routing.

## Option 3: Local production preview
Inside VS Code terminal run:
```bash
npm run build
npx serve -s build
```
Then open the local URL shown in the terminal.

## Option 4: Open in Chrome from VS Code
1. Open the `cod26` folder in VS Code
2. Run:
```bash
npm install
npm start
```
3. Open Chrome
4. Visit:
```text
http://localhost:3000
```

## Before deployment
- Make sure the latest ZIP or latest files are used
- Test assignment submissions, project submissions, AI lesson player, and certificate flow
- If you connect Firebase later, add your environment variables before deploying
