require('dotenv').config();
const { google } = require('googleapis');

function normalizeKey(key) {
  if (!key) return undefined;
  return key.includes('\\n')
    ? key.replace(/\\n/g, '\n')
    : key.replace(/\n/g, '\n');
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: normalizeKey(process.env.GOOGLE_PRIVATE_KEY),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
module.exports = { sheets };
