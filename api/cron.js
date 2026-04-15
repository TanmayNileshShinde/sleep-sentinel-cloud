import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import twilio from 'twilio';
import serviceAccount from '../serviceAccountKey.json';

// Prevent double-initialization
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export default async function handler(req, res) {
  // Security check: Only let Vercel trigger this
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end('Unauthorized');
  }

  try {
    const docRef = db.collection("status").doc("tanmay");
    const doc = await docRef.get();
    const data = doc.data();

    if (!data || !data.isActive) return res.status(200).send("Disarmed.");

    const lastCheckIn = data.lastCheckIn.toDate().getTime();
    const diffInMins = Math.floor((Date.now() - lastCheckIn) / 60000);

    const accountSid = process.env.TWILIO_SID;
    const authToken = process.env.TWILIO_TOKEN;
    const client = twilio(accountSid, authToken);

    if (diffInMins >= 60 && !data.stage1Sent) {
      await client.messages.create({
        body: `⌚ *[Sentinel]* Inactivity detected (${diffInMins}m). Tanmay might be asleep.`,
        from: "whatsapp:+14155238886",
        to: "whatsapp:+919082601302"
      });
      await docRef.update({ stage1Sent: true });
    }

    res.status(200).send(`Checked. Idle: ${diffInMins}m`);
  } catch (err) {
    res.status(500).send(err.message);
  }
}