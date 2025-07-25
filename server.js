require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // In case JSON is used
app.use(express.static(path.join(__dirname, 'public'))); // Serve HTML from public/

// ✅ 1. PayHere notify_url Handler
app.post('/notify', (req, res) => {
    const {
        merchant_id,
        order_id,
        payhere_amount,
        payhere_currency,
        status_code,
        md5sig
    } = req.body;

    const local_md5sig = crypto.createHash('md5').update(
        merchant_id + order_id + payhere_amount + payhere_currency + status_code +
        crypto.createHash('md5').update(process.env.MERCHANT_SECRET).digest('hex').toUpperCase()
    ).digest('hex').toUpperCase();

    if (local_md5sig === md5sig && status_code === '2') {
        console.log('✅ Payment SUCCESS:', { order_id, payhere_amount, payhere_currency });
        // TODO: Save to DB or take any post-payment actions
    } else {
        console.log('❌ Payment verification failed:', { order_id, status_code, md5sig });
    }

    res.sendStatus(200); // Let PayHere know we handled the callback
});

// ✅ 2. API to Generate Hash (used by checkout and recurring forms)
app.post('/generate-hash', (req, res) => {
    const { order_id, amount, currency } = req.body;

    if (!order_id || !amount || !currency) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const merchant_id = process.env.MERCHANT_ID;
    const merchant_secret = process.env.MERCHANT_SECRET;

    const secretHash = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
    const hash = crypto.createHash('md5')
        .update(merchant_id + order_id + amount + currency + secretHash)
        .digest('hex')
        .toUpperCase();

    res.json({ hash });
});

// ✅ 3. Optional: Home route to redirect to checkout
app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// ✅ 4. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
