import { load } from 'cheerio';
import cors from 'cors';
import express, { urlencoded } from 'express';

const app = express();

app.use(urlencoded({ extended: true }));
app.use(cors());

async function fetchAndExtractContent(url) {
  try {
    const html = await fetch(url).then((res) => res.text());
    const $ = load(html);

    const articleBody = $('div[itemprop="articleBody"].news-txt').first();
    return articleBody.html();
  } catch (error) {
    console.error('Error fetching content:', error);
    return 'Error fetching content';
  }
}

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ANSA Content Extractor</title>
    </head>
    <body>
      <h1>ANSA Content Extractor</h1>
      <form action="/fetch" method="post">
        <label for="url">URL:</label>
        <input type="url" name="url" id="url" required>
        <button type="submit">Fetch Content</button>
      </form>
      <div id="content"></div>
      <script>
        const form = document.querySelector('form');
        const contentDiv = document.getElementById('content');
        
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          const url = document.getElementById('url').value;
          
          if (!url.includes('ansa.it')) {
            contentDiv.innerHTML = 'Error: URL must contain "ansa.it".';
            return;
          }
          
          const response = await fetch('/fetch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ url }),
          });
          const content = await response.text();
          contentDiv.innerHTML = content;
        });
      </script>
    </body>
    </html>
  `);
});

app.post('/fetch', async (req, res) => {
  const { url } = req.body;
  const content = await fetchAndExtractContent(url);
  res.send(content);
});

export default app;