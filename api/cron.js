const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const twilio = require('twilio');

export default async function handler(req, res) {
  try {
    // 1. We grab the key from Vercel's memory, NOT a file
    if (!getApps().length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      initializeApp({ credential: cert(serviceAccount) });
    }

    const db = getFirestore();
    const doc = await db.collection("status").doc("tanmay").get();
    const data = doc.data();

    // Sentinel Logic
    const lastCheckIn = data.lastCheckIn.toDate().getTime();
    const diffInMins = Math.round((Date.now() - lastCheckIn) / 60000);

    if (diffInMins >= 60 && !data.stage1Sent) {
      const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `🤖 *[Sentinel]* Tanmay has been idle for ${diffInMins}m.`,
        from: "whatsapp:+14155238886", 
        to: "whatsapp:+919082601302" 
      });
      await db.collection("status").doc("tanmay").update({ stage1Sent: true });
    }

    res.status(200).send(`Sentinel Check Complete. Idle: ${diffInMins}m`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Cloud Error: " + err.message);
  }
}