require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML file
app.use(express.static('public'));

// PayHere notify_url handler
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
        console.log('✅ Payment SUCCESS for order:', order_id);
        // ✅ Save to DB or perform post-payment actions here
    } else {
        console.log('❌ Invalid payment or signature mismatch for:', order_id);
    }

    // Respond with 200 OK so PayHere knows we received it
    res.sendStatus(200);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));