import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/parcours', (req, res) => {
  res.sendFile(path.join(__dirname, 'parcours.html'));
});

app.get('/videos', (req, res) => {
  res.sendFile(path.join(__dirname, 'videos.html'));
});

app.get('/voyages', (req, res) => {
  res.sendFile(path.join(__dirname, 'voyages.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
