const express = require('express');
const app = express();
app.use(express.json());

const SHOPIFY_STORE = 'thehomelycloset.myshopify.com';
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN;

app.post('/track-share', async (req, res) => {
  const { platform, product_id, product_title, timestamp } = req.body;
  if (!platform || !product_id) return res.status(400).json({ error: 'Missing fields' });

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
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': SHOPIFY_TOKEN },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  res.json(data);
});

app.get('/', (req, res) => res.send('Share Click Tracker is running!'));
app.listen(3000, () => console.log('Server running on port 3000'));
