# COD26 Website - Step-by-Step VS Code + Chrome Guide

## Step 1: Download the ZIP
Download the latest file:
- `COD26-updated-website.zip`

## Step 2: Extract the ZIP
1. Right-click the ZIP file
2. Click **Extract All**
3. Click **Extract**
4. Open the extracted folder
5. Inside it, you will see the `cod26` project folder

## Step 3: Open the project in VS Code
1. Open **Visual Studio Code**
2. Click **File > Open Folder**
3. Select the extracted `cod26` folder
4. Click **Select Folder**

## Step 4: Open Terminal in VS Code
1. Click **Terminal > New Terminal**
2. Make sure the terminal path is inside the `cod26` folder

You should see something like:
```powershell
PS C:\...\cod26>
```

## Step 5: Install packages
Run:
```bash
npm install
```

## Step 6: Start the website from VS Code
Run:
```bash
npm start
```

## Step 7: Open the website in Chrome
After `npm start`, React usually opens the website automatically in your default browser.

If Chrome does **not** open automatically:
1. Open **Google Chrome** manually
2. In the address bar type:
```text
http://localhost:3000
```
3. Press **Enter**

That will open your COD26 website running from VS Code.

## Step 8: If Chrome shows nothing
Make sure:
- VS Code terminal is still running
- `npm start` has not been stopped
- the terminal does not show errors

If the terminal is closed, the website will stop.

## Step 9: If you already have an old COD26 folder
1. Delete the old extracted `cod26` folder
2. Extract the new ZIP again
3. Open the new folder in VS Code
4. Run:
```bash
npm install
npm start
```

## Step 10: How to replace the old code manually in VS Code
If you want to replace files manually:
1. Open the old `cod26` folder in VS Code
2. Open the new extracted `cod26` folder in File Explorer
3. Copy the new files
4. Paste them into the old folder
5. Click **Replace files** if Windows asks
6. Run again:
```bash
npm install
npm start
```

## Step 11: How to push to GitHub from VS Code
### If Git is already connected
Use terminal:
```bash
git add .
git commit -m "Update COD26 website"
git push
```

### If this is a new Git folder
```bash
git init
git add .
git commit -m "Add updated COD26 website"
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## Step 12: Important notes
- Direct students must enter payment transaction ID to unlock the course.
- Partner school/college students use school code + student ID and do not use the direct payment flow.
- Assignment files can be submitted unit by unit inside the platform.
- Project files can be submitted from the project section.
- Assignment PDFs can be downloaded from the assignment sections.
- Certificates can be printed/downloaded only after eligibility conditions are completed.
- AI lesson player is clickable and works inside each unit.
- Python chatbot is available to answer Python-related questions.
