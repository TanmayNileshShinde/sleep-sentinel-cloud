const cron = require('node-cron');
const twilio = require('twilio');
const admin = require('firebase-admin');

// 1. Initialize Firebase
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// 2. Twilio Config (Paste your actual SID and Token from your screenshot)
const accountSid = "AC68ef1ccb77ff8af04eda..."; // Your SID
const authToken = "4b8d8b13aacda29b65051aee56b9d13c"; // Your Token
const client = twilio(accountSid, authToken);

const MOMS_PHONE = "whatsapp:+919082601302"; // Replace with your mom's WhatsApp number

console.log("🚀 Sentinel is LIVE. Checking every 1 minute...");

// 3. The Test Loop (Checks every 60 seconds)
cron.schedule('* * * * *', async () => {
  const doc = await db.collection("status").doc("tanmay").get();
  const data = doc.data();

  const lastCheckIn = data.lastCheckIn.toDate().getTime();
  const diffInMins = Math.round((Date.now() - lastCheckIn) / 60000);

  console.log(`[${new Date().toLocaleTimeString()}] Tanmay idle for: ${diffInMins} mins.`);

  // If idle for more than 60 mins and we haven't sent the warning yet
  if (diffInMins >= 60 && !data.stage1Sent) {
    await client.messages.create({
      body: "🤖 *[Sentinel]* Tanmay has been unresponsive for 1 hour. Vitals are stable but sleep is likely.",
      from: "whatsapp:++12292139074", // Twilio Sandbox Number
      to: MOMS_PHONE
    });
    await db.collection("status").doc("tanmay").update({ stage1Sent: true });
    console.log("✅ Stage 1 Message Sent!");
  }
});