const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const SHOPIFY_STORE = 'thehomelycloset.myshopify.com';
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getAccessToken() {
  const res = await fetch(`https://${SHOPIFY_STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const data = await res.json();
  return data.access_token;
}

app.post('/track-share', async (req, res) => {
  const { platform, product_id, product_title, timestamp } = req.body;
  if (!platform || !product_id) return res.status(400).json({ error: 'Missing fields' });

  try {
    const token = await getAccessToken();
    const query = `
      mutation {
        metaobjectCreate(metaobject: {
          type: "sidekick_share_click_event"
          fields: [
            { key: "platform", value: "${platform}" }
            { key: "product_id", value: "${product_id}" }
            { key: "product_title", value: "${product_title}" }
            { key: "timestamp", value: "${timestamp}" }
          ]
        }) {
          metaobject { id }
          userErrors { field message }
        }
      }`;

    const response = await fetch(`https://${SHOPIFY_STORE}/admin/api/2026-04/graphql.json`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'X-Shopify-Access-Token': token 
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.send('Share Click Tracker is running!'));
app.listen(3000, () => console.log('Server running on port 3000'));
