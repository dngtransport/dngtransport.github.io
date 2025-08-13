// server.js
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure Google Auth - USE YOUR SERVICE ACCOUNT CREDENTIALS
const auth = new google.auth.GoogleAuth({
  credentials: {
    "type": "service_account",
    "project_id": "sheets-bridge-468902",
    "private_key_id": "401ccb5651d6ca183b552d90040f3028ad04c233",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDHHC1kYdYog3O4\nXUuNBoTYpxe/1DX39JaW/Fcjg/er8lGDgL79nRtezyTwxBhRqoOf7nV0d8sIaAyN\nZD2/IdNChDMaJMRqss03WP+HMXhpbGrUBHdhXAo3wmGH38ubzB7ViGjuH0F0F2WN\neVQNcaMOcvcEO7RnEftzPMLes+KLv8R40O1JDIImxqiB5XV2RyOI9ZgxtJ/dyqY9\nyGz7wgxQfPeqrTVoUF5BferZYQiQey1wwWnWmrKGJvEULXalWMocP+0FcUx/hODh\nLeNoY34vbZhdH8DeGiogKy6CEgt69CRyYxq97WmRlyPiecoDmKZvG1oYcne/cTZk\nCpIU0jitAgMBAAECggEAQGm3r5VNFG8uNRMNeXKF8Jbhwn+y8+PPAcphoE41hg1O\n3IV+hApay+mkcDVoDqdkjI02tzZ32uDaSrWGmjoln4uoAompd0EfzYt/outYonZd\n+vf07Oy7K325Up0OP/khcn/+PiajZJybEFETZYQBNY/wpJByFLQHDik2e5hjLkUJ\n+XkEBp9RaqnZQ63tnNAK4FDsxrSBs+Imeot3NmU1xY4oxvlPmE8FbSccukhpTcmd\nb8a5Zz1QIBZNEWSkpTZuna9o7+23JTsunfJWmYyDWX91dohunBl1/Ox3XTQKqZPv\nYiAvY0r8QDkw6CymPpQJPF1Rint+gsTTZ4e9p+F2ewKBgQDneUXGLDUevDQe/Ogc\nkYERc5OwstIuca1qnqmIQlEsDP7tKIU+lzYMLaCO6OQX65LxaB65gGN1y6+YMs59\nJvKlXnj9/sKGUsJ0KjWQmhLBZ2PoLBKkMTBIn8TGXEcbdMy8VFLc73KHRhC0FfMK\nKq1IquYFjLkWdmgDR4kYnKiNywKBgQDcNQpPgz32NSg6InPQVsGYPw3pgSayKWXN\nkjatZnDhSvYZ2okDVjS5l1hAAACTkhPpZwPKbKdhwaOweSuoMOjBuNUMJV/iOxmk\nNtKYg5imJ0dZBmk1nXzHlCkjAZ5JizcMwpjuldPTN6OSOayXnKnmYsomq7KCeB3p\nXH/dxx4EZwKBgCnhxYAv64SeJQgeVpkksqfHs8da87C3nNsXzjD7XtiLmWyr0kAa\n+AqIDu8MsIirdTD81+JUmqprql/tgXMfovPM/jNm7yeCvfBq2rpJRm98F5Wgs9bF\nl6jsT5xcgfkzzv+ceknDgYN8Z/VNq2YBhs0JLwl+BtdLoVJGlUXAwra1AoGAHiSY\ni7fQZIJ0RjjvF4a4q2l+Mwd9z4eBKvmnyGasbvp+450Zgj5rqzf/WYtmiMzHMvzp\n9OyYoPYLvR1pD3XadqIhb68yB9rFMMhcXYot/BiGWLZa8n7jVMKAOw1+qFyJJZMB\nsi8KNvB30I1ahcppK2M8frykC937YjVKP4aBImMCgYEAsxcMbZb4rSAYE6G1EgSe\n/7QKyjAPFOPx4SODIB9d8YwAxidbimMmBuiwWsV9HHGccB246LmIbzqYIxyFC7h2\nB3W0JhWHoRSEG6BPYKjuxMNofmWYuLw4fxyStH/zR3+vbV06wocxGXuFTsJgCX5b\n522+Enk25KLXKLWEeOomgMU=\n-----END PRIVATE KEY-----\n",
    "client_email": "sheets-bridge@sheets-bridge-468902.iam.gserviceaccount.com",
    "client_id": "111731917736952864268",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/sheets-bridge%40sheets-bridge-468902.iam.gserviceaccount.com"
  },
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

// Replace with your Google Sheet ID
const SPREADSHEET_ID = '1bYFCkDn6OMfBfDXS0VP8ulOa91cknvnChs95_qwhCk0';

// GET endpoint - Read data from sheet
app.get('/data', async (req, res) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Read all data from Sheet1 (adjust range as needed)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:Z',
    });
    
    res.json(response.data.values);
  } catch (error) {
    console.error('Error reading sheet:', error);
    res.status(500).send(error.message);
  }
});

// POST endpoint - Append data to sheet
app.post('/data', async (req, res) => {
  try {
    const { values } = req.body;
    
    if (!values || !Array.isArray(values)) {
      return res.status(400).send('Bad request: Expected array of values');
    }

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Append data to Sheet1
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [values] }, // Wrap in array for single row
    });

    res.send('Data saved to Google Sheet!');
  } catch (error) {
    console.error('Error writing to sheet:', error);
    res.status(500).send(error.message);
  }
});

// Serve static files (for your frontend)
app.use(express.static('public'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access data endpoints at http://localhost:${PORT}/data`);
});