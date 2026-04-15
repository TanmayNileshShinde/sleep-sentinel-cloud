  const { onRequest } = require("firebase-functions/v2/https");
  const twilio = require("twilio");

// --- 1. SECURE CONFIG ---
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const client = twilio(accountSid, authToken);

  // --- 2. UPDATE HER NUMBER ---
  const TWILIO_WHATSAPP_NUMBER = "whatsapp:+12292139074"; 
  const MOMS_PHONE_NUMBER = "whatsapp:+919967547919"; // Keep the 'whatsapp:' prefix!

  exports.testmessage = onRequest(async (req, res) => {
    try {
      await client.messages.create({
        body: "🤖 *[Sentinel Diagnostic]* Test successful. The AI brain is officially online and connected to WhatsApp.",
        from: TWILIO_WHATSAPP_NUMBER,
        to: MOMS_PHONE_NUMBER
      });
      
      res.send("✅ SUCCESS: Check the phone!");
    } catch (error) {
      console.error(error);
      res.status(500).send("❌ ERROR: " + error.message);
    }
  });