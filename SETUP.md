# Bru Safe Shift - setup (about 15 minutes, no paid services)

Files: index.html, data.js, data2.js, app.js (the game, hosted on GitHub Pages) and backend/Code.gs (database and email sign-in).

## 1. Publish the game link (GitHub Pages)
1. Repo Settings > Pages > Source: Deploy from a branch > main > / (root) > Save.
2. After about a minute the link is https://aitestskd-dotcom.github.io/bru-safe-shift/ . Share this link with workers.

## 2. Database (Google Sheet + Apps Script)
1. Create a Google Sheet named Safe Shift Data. Extensions > Apps Script. Paste all of backend/Code.gs. Save.
2. Project Settings > Script properties > add SUBMIT_KEY = a long random text.
3. Reload the Sheet. Menu Safe Shift > 1. Set up sheets (allow permissions).
4. Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone > Deploy. Copy the Web app URL.
5. In app.js set API to that URL and KEY to your SUBMIT_KEY. Commit the change.

## 3. Supervisors (the manager edits any time)
1. Open the Supervisors tab. Fill Name, Email and Site (a site name, or leave blank for ALL).
2. Menu Safe Shift > 2. Generate supervisor IDs. Share each SUP- ID privately.
3. To remove access set Active to NO. It applies immediately.
4. Sign-in = ID + registered email + 6-digit code emailed from the script owner's Google account.

## 4. Manager settings
- Config tab: retention_days (default 180) and consent_en / consent_hi / consent_ta. Leave consent blank to use the default wording.
- Supervisors with Site = ALL can change logo, colours, sites and shifts in the dashboard. Workers see changes on their next visit, and can also type a site that is not in the list.

## Notes
- The upload key in app.js is visible in page source. It only deters casual spam.
- Email sending uses your Google account quota. Check Google's current Apps Script email limits.
- Only upload a logo you have permission to use.
- Until step 2 is done the game works but results are not saved or shared.
