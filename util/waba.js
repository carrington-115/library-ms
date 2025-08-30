require("dotenv").config();
const axios = require("axios");
const messages_url = `https://graph.facebook.com/v19.0/${process.env.WABA_PHONE_ID}/messages`;

const sendPdfWithUrl = (recipientPhoneNumber, pdfUrl, fileName) => {
  const WHATSAPP_TOKEN = process.env.WABA_SYSTEM_TOKEN;
  const data = {
    messaging_product: "whatsapp",
    to: recipientPhoneNumber,
    type: "document",
    document: {
      link: pdfUrl, // A public URL to your PDF
      filename: fileName, // The name the user will see, e.g., "Invoice-Aug-2025.pdf"
    },
  };

  const headers = {
    Authorization: `Bearer ${WHATSAPP_TOKEN}`,
    "Content-Type": "application/json",
  };

  return axios.post(messages_url, data, { headers });
};
module.exports = { sendPdfWithUrl };
