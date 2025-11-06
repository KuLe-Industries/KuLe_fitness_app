# Google Sheets Integration Setup

## Overview
KuLe Fitness can sync all your workout data to Google Sheets for backup, analysis, and sharing.

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### 2. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you'll need this later)
4. (Optional) Restrict the API key to only Google Sheets API for security

### 3. Create a Google Spreadsheet

1. Create a new Google Spreadsheet in Google Drive
2. Copy the Spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - The `SPREADSHEET_ID` is the long string between `/d/` and `/edit`

### 4. Prepare Your Spreadsheet

Your spreadsheet needs the following sheets (tabs):
- **Users** - Column headers: `ID`, `Display Name`, `Preferences`, `Created At`
- **Exercises** - Column headers: `ID`, `Name`, `Muscle Groups`, `Equipment`, `Tags`, `Instructions`, `Created At`
- **Plans** - Column headers: `ID`, `Name`, `Description`, `Blocks`, `Schedule`, `Created At`, `Updated At`, `Is Favorite`
- **Sessions** - Column headers: `ID`, `User ID`, `Plan ID`, `Started At`, `Ended At`, `Notes`, `Items`, `Created At`

The app will automatically add headers if they don't exist.

### 5. Configure in KuLe Fitness

1. Open the app and go to **Settings**
2. Scroll to "Google Sheets Integration"
3. Enable "Enable Google Sheets Sync"
4. Enter your API Key
5. Enter your Spreadsheet ID
6. Click "Save Google Sheets Config"

## Data Flow

- **Local First**: Data is still stored locally for offline use
- **Sync on Save**: When Google Sheets is enabled, data syncs to Sheets whenever it's saved
- **Read from Sheets**: When enabled, the app reads from Google Sheets instead of local storage

## Security Notes

- Your API key is stored locally in your browser
- Never share your API key publicly
- Consider restricting your API key to only allow Google Sheets API access
- The spreadsheet should be private or shared only with trusted users

## Troubleshooting

### "Google Sheets API error"
- Check that the Google Sheets API is enabled in your Google Cloud project
- Verify your API key is correct
- Ensure the API key has permission to access Google Sheets

### "Spreadsheet not found"
- Verify the Spreadsheet ID is correct
- Ensure the spreadsheet exists and is accessible
- Check that the spreadsheet has the required sheets (tabs)

### Data not syncing
- Check your internet connection
- Verify the API key and Spreadsheet ID are correct
- Check browser console for error messages

## Disabling Google Sheets

To switch back to local-only storage:
1. Go to Settings
2. Uncheck "Enable Google Sheets Sync"
3. Save the settings

The app will continue using local storage for all operations.

