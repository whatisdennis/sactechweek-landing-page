/**
 * Recover the plaintext members calendar from the committed ciphertext.
 * Useful if members-src/calendar-data.json is lost (it's gitignored) — the
 * encrypted js/members-data.js is the only published artifact, so this
 * decrypts it back to editable JSON using the password.
 *
 * Usage:
 *   STW_MEMBERS_PASSWORD="your-password" node tools/decrypt-members.mjs
 *   # writes the JSON to members-src/calendar-data.json (pass --stdout to print instead)
 */
import crypto from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IN = join(ROOT, "js", "members-data.js");
const OUT = join(ROOT, "members-src", "calendar-data.json");

const password = process.env.STW_MEMBERS_PASSWORD || process.argv[2];
if (!password) {
  console.error("Missing password. Set STW_MEMBERS_PASSWORD or pass it as an argument.");
  process.exit(1);
}

const file = readFileSync(IN, "utf8");
const json = file.slice(file.indexOf("{"), file.lastIndexOf("}") + 1);
const p = JSON.parse(json);

const salt = Buffer.from(p.salt, "base64");
const iv = Buffer.from(p.iv, "base64");
const ctFull = Buffer.from(p.ct, "base64");
const tag = ctFull.subarray(ctFull.length - 16);
const ct = ctFull.subarray(0, ctFull.length - 16);

const key = crypto.pbkdf2Sync(password, salt, p.kdf.iterations, 32, "sha256");
const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(tag);

let plaintext;
try {
  plaintext = Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
} catch {
  console.error("Decryption failed — wrong password?");
  process.exit(1);
}

if (process.argv.includes("--stdout")) {
  process.stdout.write(plaintext + "\n");
} else {
  writeFileSync(OUT, plaintext, "utf8");
  console.log("Recovered plaintext -> " + OUT);
}
