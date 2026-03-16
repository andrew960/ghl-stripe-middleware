const express = require('express');
const app = express();
app.use(express.json());

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

app.post('/charge', async (req, res) => {
  try {
    const body = req.body;
    const customData = body.customData || {};

    const amount = customData.amount || body.amount;
    const currency = customData.currency || body.currency || 'usd';
    const customer = customData.customer || body.customer;
    const description = customData.description || body.description || 'Training session';

    if (!customer) {
      return res.status(400).json({ error: 'Missing customer ID' });
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        amount,
        currency,
        customer,
        description,
        'payment_method_types[]': 'card',
        confirm: 'true',
        off_session: 'true'
      })
    });

    const data = await stripeResponse.json();
    res.status(stripeResponse.status).json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Running on port 3000'));
