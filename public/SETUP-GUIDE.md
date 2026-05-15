# 🚀 CNG Flow - Complete Setup Guide (Step by Step)

## 📋 What You'll Need:
- A Google Account (Gmail)
- 15-20 minutes of time
- A computer/laptop (easier than phone)

---

## PART 1: CREATE GOOGLE SPREADSHEET (Database)

### Step 1.1: Open Google Sheets
1. Open your browser (Chrome recommended)
2. Go to: **https://sheets.google.com**
3. Sign in with your Google account

### Step 1.2: Create New Spreadsheet
1. Click the **"+ Blank"** button (big plus sign)
2. A new spreadsheet opens
3. Click on "Untitled spreadsheet" at the top
4. Rename it to: **CNG Flow Database**
5. Press Enter to save

### Step 1.3: Copy Your Spreadsheet ID
1. Look at the URL in your browser address bar
2. It looks like this:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123xyz.../edit#gid=0
   ```
3. Copy ONLY the part between `/d/` and `/edit`
   - Example: `1ABC123xyz456def789`
4. Save this somewhere - you might need it later!

✅ **DONE! Your database spreadsheet is ready.**

---

## PART 2: CREATE GOOGLE DRIVE FOLDERS (Media Storage)

### Step 2.1: Open Google Drive
1. Go to: **https://drive.google.com**
2. Sign in (same Google account)

### Step 2.2: Create Main Folder
1. Click **"+ New"** button (top left)
2. Click **"New folder"**
3. Name it: **CNG Flow Media**
4. Click **"Create"**

### Step 2.3: Open the New Folder
1. Double-click on **"CNG Flow Media"** folder
2. You're now inside the folder

### Step 2.4: Create Subfolders
Create these 4 folders inside "CNG Flow Media":

1. Click **"+ New"** → **"New folder"** → Name: **Videos** → Create
2. Click **"+ New"** → **"New folder"** → Name: **PumpPhotos** → Create
3. Click **"+ New"** → **"New folder"** → Name: **ReceiptPhotos** → Create
4. Click **"+ New"** → **"New folder"** → Name: **OdometerPhotos** → Create

Your folder structure should look like this:
```
📁 CNG Flow Media/
   ├── 📁 Videos/
   ├── 📁 PumpPhotos/
   ├── 📁 ReceiptPhotos/
   └── 📁 OdometerPhotos/
```

✅ **DONE! Your Drive folders are ready.**

---

## PART 3: CREATE GOOGLE APPS SCRIPT (Backend API)

### Step 3.1: Open Google Apps Script
1. Go to: **https://script.google.com**
2. Sign in (same Google account)

### Step 3.2: Create New Project
1. Click **"New project"** button
2. A code editor opens
3. Click "Untitled project" at the top
4. Rename to: **CNG Flow Backend API**
5. Click **"Rename"**

### Step 3.3: Copy the Backend Code
1. Go back to the CNG Flow app
2. Open the file: `public/google-apps-script.gs`
3. Select ALL the code (Ctrl+A or Cmd+A)
4. Copy it (Ctrl+C or Cmd+C)

### Step 3.4: Paste in Apps Script
1. Go back to Apps Script
2. Select ALL the default code in the editor
3. Delete it (press Delete key)
4. Paste the copied code (Ctrl+V or Cmd+V)
5. Click **"Save"** (floppy disk icon) or Ctrl+S

### Step 3.5: Run Initial Setup
1. In the code editor, find the dropdown that says "select function"
2. Click it and select: **setupSheets**
3. Click the **"Run"** button (▶️ play button)
4. A popup asks for permission - click **"Review permissions"**
5. Select your Google account
6. Click **"Advanced"** (bottom left)
7. Click **"Go to CNG Flow Backend API (unsafe)"**
8. Click **"Allow"**

**This creates the required sheet tabs automatically!**

### Step 3.6: Deploy as Web App
1. Click **"Deploy"** button (top right)
2. Click **"New deployment"**
3. Click the gear icon ⚙️
4. Select **"Web app"**
5. Fill in:
   - Description: **CNG Flow API v1**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **"Deploy"**
7. A popup shows your **Web App URL**
8. **COPY THIS URL** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```
9. Click **"Done"**

✅ **DONE! Your backend API is deployed!**

---

## PART 4: CONNECT THE APP

### Step 4.1: Open CNG Flow App
1. Open the CNG Flow app in your browser
2. Look for the **"Setup DB"** button in the header (top right)
3. Click it

### Step 4.2: Follow the Setup Wizard
1. **Step 1**: Click "Next Step" (you already created the spreadsheet)
2. **Step 2**: Click "Next Step" (you already created Drive folders)
3. **Step 3**: Click "Next Step" (you already deployed Apps Script)
4. **Step 4**: Click "Next Step" (you already have the URL)
5. **Step 5**: 
   - Paste your Web App URL in the input field
   - Click **"Save & Connect"**

### Step 4.3: Verify Connection
1. The header button should now show **"Connected"** (green)
2. If it shows red/orange, the URL might be wrong

✅ **DONE! You're connected to Google Sheets!**

---

## PART 5: TEST THE COMPLETE FLOW

### Test 1: Add a Vehicle (as Owner)
1. Login as Fleet Owner (email: owner@cng.com, password: password)
2. Go to **Home** tab
3. Fill in vehicle details and click **"Register Vehicle"**
4. Check your Google Sheets - the vehicle should appear!

### Test 2: Add a Driver (as Owner)
1. In Home tab, scroll to "Add Driver"
2. Enter driver name and a code (e.g., ABC123)
3. Click **"Generate Driver Account"**
4. Check Google Sheets - driver should appear!

### Test 3: Driver Login
1. Go back to welcome screen
2. Click **"CNG Vehicle Driver"**
3. Enter the driver code you created (ABC123)
4. Click **"Secure Login"**

### Test 4: Submit a CNG Fill
1. Click **"Start New CNG Fill Entry"**
2. Complete all 5 steps:
   - Step 1: Record video (10+ seconds)
   - Step 2: Capture pump photo
   - Step 3: Capture receipt photo
   - Step 4: Select vehicle and enter KGS/Rate
   - Step 5: Capture odometer and submit
3. Check Google Sheets "Fills" tab - record should appear!
4. Check Google Drive - photos/videos should be uploaded!

### Test 5: View on Owner Dashboard
1. Login as owner
2. Go to **Media** tab
3. You should see the fill record with all photos!
4. Click on any photo URL to view from Google Drive

✅ **EVERYTHING IS WORKING!**

---

## 🔧 TROUBLESHOOTING

### Problem: "Cannot find name" error in Apps Script
**Solution:** Make sure you copied ALL the code and saved it.

### Problem: "Access denied" when running setupSheets
**Solution:** Make sure you clicked "Advanced" and then "Go to... (unsafe)"

### Problem: Data not appearing in Google Sheets
**Solution:** 
1. Check if the Apps Script URL is correct
2. Make sure deployment is set to "Anyone"
3. Try redeploying: Deploy → Manage deployments → Edit → Version: New → Deploy

### Problem: Photos not uploading to Drive
**Solution:**
1. Make sure folder names are exact: Videos, PumpPhotos, ReceiptPhotos, OdometerPhotos
2. Check if the folders are inside "CNG Flow Media"

### Problem: "Script not found" error
**Solution:** 
1. Go to script.google.com
2. Open your "CNG Flow Backend API" project
3. Make sure it's deployed (Deploy → Manage deployments)

---

## 📱 USING ON MULTIPLE DEVICES

### For Drivers (on their phones):
1. Open the app URL in Chrome/Safari
2. Tap the three dots menu ⋮
3. Tap **"Add to Home Screen"**
4. The app now works like a native app!
5. Login with their driver code

### For Owner (on any device):
1. Open the app URL
2. Login with owner credentials
3. All driver data appears automatically!
4. View media, alerts, and reports

---

## 🎉 CONGRATULATIONS!

You now have a complete cloud-based CNG tracking system:
- ✅ Cross-device data sync via Google Sheets
- ✅ Media storage on Google Drive
- ✅ Real-time owner dashboard
- ✅ GPS verification and alerts
- ✅ Works on any phone, tablet, or computer

**Need help? Check the app's built-in setup wizard!**
