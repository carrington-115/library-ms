■ WhatsApp Messaging API Utility (/util/waba.js)

## Prerequisites

Before using this module, ensure you have a .env file in your project root with the following
variables:

```
# .env
WHATSAPP_TOKEN="YOUR_PERMANENT_ACCESS_TOKEN"
PHONE_NUMBER_ID="YOUR_PHONE_NUMBER_ID"
```

## Core Function: sendPdfWithUrl()

This function sends a PDF document to a recipient using a publicly accessible URL.
It handles the authentication and request structure for the WhatsApp Graph API.
**Usage:**

```javascript
const { sendPdfWithUrl } = require("./util/waba.js");
// 1. The WhatsApp number to send to (must include country code)
const recipientNumber = "919876543210";
// 2. A public URL pointing to the PDF file
const pdfLink = "https://storage.googleapis.com/your-bucket/invoice-123.pdf";
// 3. The desired filename for the user
const fileName = "Your August Invoice.pdf";
// 4. Call the function to send the message
sendPdfWithUrl(recipientNumber, pdfLink, fileName)
  .then((response) => {
    console.log("Message sent successfully!", response);
  })
  .catch((error) => {
    console.error("Failed to send message:", error);
  });
```

## Arguments

| Parameter            | Type   | Description                                                     |
| -------------------- | ------ | --------------------------------------------------------------- |
| recipientPhoneNumber | String | The recipient's full WhatsApp number with country code.         |
| pdfUrl               | String | A public URL where the PDF is hosted (e.g., from GCS).          |
| fileName             | String | The filename that the recipient will see (e.g., "Invoice.pdf"). |

## ■ Our Workflow: From User Input to WhatsApp Message

Our application follows a modern, scalable process to generate and deliver documents without
overloading the server.
The workflow is broken down into four distinct steps:

1. **Receive User Data**
   The process begins when a user submits information, likely through a web form.
   This data (e.g., customer details, order items) is sent to our Node.js server to initiate document
   creation.
2. **Generate PDF in Memory**
   Instead of creating a physical file on the server's disk, we use a library like pdfkit to generate
   the invoice or document directly in the server's memory. This is highly efficient and avoids disk I/O
   operations.
3. **Stream to Cloud Storage**
   The generated PDF data is immediately "piped" or streamed to a cloud storage provider like Google
   Cloud Storage.
   This is a critical step for scalability, as it uploads the file directly from memory to the cloud,
   creating a secure, publicly accessible URL for the document.
4. **Send via WhatsApp API**
   With a public URL for the newly uploaded document, our server calls the sendPdfWithUrl
   function from the waba.js utility. This function makes the final request to the WhatsApp
   Business API, telling it to fetch the document from the provided URL and deliver it to the end-user,
   who receives the PDF directly in their chat.
