# Members calendar — how it works

The `/members` page shows a year-round events calendar to consortium members.
It is **encrypted at rest**: the page ships only ciphertext and decrypts in the
browser when the visitor enters the shared password. Nothing is readable in
page source without it.

## Files

| File | Committed? | What it is |
|---|---|---|
| `members-src/calendar-data.json` | **No** (gitignored) | The plaintext source of truth you edit. |
| `js/members-data.js` | Yes | Auto-generated ciphertext. The only published copy of the data. |
| `js/members.js` | Yes | Gate + decryption + calendar rendering. |
| `members.html` | Yes | The page shell (`/members`). |
| `tools/encrypt-members.mjs` | Yes | Builds the ciphertext from the source. |
| `tools/decrypt-members.mjs` | Yes | Recovers the source from the ciphertext. |

## Edit events

1. Edit `members-src/calendar-data.json` (add events, fill in `time`, `venue`,
   `blurb`, `link`; empty fields are hidden in the UI).
2. Re-encrypt with your password:

   ```sh
   # macOS / Linux
   STW_MEMBERS_PASSWORD="your-password" node tools/encrypt-members.mjs
   ```
   ```powershell
   # Windows PowerShell
   $env:STW_MEMBERS_PASSWORD="your-password"; node tools/encrypt-members.mjs
   ```
3. Commit the updated `js/members-data.js` and push.

## Change the password

Just re-run the encrypt step with the new password. Everyone uses the same
shared password; share it out-of-band (not in the repo).

## Lost the source?

`members-src/` is gitignored, so it lives only on your machine. If you lose it,
recover from the published ciphertext:

```sh
STW_MEMBERS_PASSWORD="your-password" node tools/decrypt-members.mjs
```

## Recurring event shape

```json
{ "id": "unique-id", "name": "Event name", "day": "tuesday", "week": 1,
  "time": "9:00am", "venue": "Urban Hive", "blurb": "Short description.", "link": "https://…" }
```
`day` is monday–sunday; `week` is 1–4 (the Nth occurrence of that weekday each month).

Annual one-offs use `month` (1–12) and `dateLabel` instead of `day`/`week`.
