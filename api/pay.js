const CryptoJS = require('crypto-js');
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Header CORS agar bisa dipanggil dari domain Scallev kamu
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { name, phone, email, amount } = req.body;

    // Kredensial iPaymu milikmu
    const va = '1179002298877078'; 
    const apiKey = '50B90598-4171-4D15-9D24-09763EB294E7';

    // Gunakan https://my.ipaymu.com jika sudah Live, atau https://sandbox.ipaymu.com jika testing
    const endpoint = 'https://my.ipaymu.com/api/v2/payment'; 

    const bodyData = {
      product: ["Produk Landing Page"],
      qty: [1],
      price: [amount || 150000],
      returnUrl: "https://google.com",
      cancelUrl: "https://google.com",
      notifyUrl: "https://google.com",
      buyerName: name,
      buyerPhone: phone,
      buyerEmail: email
    };

    // Kodingan Signature HMAC iPaymu
    const jsonBody = JSON.stringify(bodyData);
    const requestBody = CryptoJS.SHA256(jsonBody).toString(CryptoJS.enc.Hex).toLowerCase();
    const stringToSign = `POST:${va}:${requestBody}:${apiKey}`;
    const signature = CryptoJS.HmacSHA256(stringToSign, apiKey).toString(CryptoJS.enc.Hex);

    const now = new Date();
    const timestamp = now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'va': va,
        'signature': signature,
        'timestamp': timestamp
      },
      body: jsonBody
    });

    const result = await response.json();
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};