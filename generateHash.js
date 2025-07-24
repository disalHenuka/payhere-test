require('dotenv').config();
const crypto = require('crypto');

const merchantId = process.env.MERCHANT_ID;
const merchantSecret = process.env.MERCHANT_SECRET;
const orderId = 'ORDER123';
const amount = '1000.00';
const currency = 'LKR';

const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
const hash = crypto.createHash('md5')
  .update(merchantId + orderId + amount + currency + secretHash)
  .digest('hex')
  .toUpperCase();

console.log('✅ Generated hash:', hash);
