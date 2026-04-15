const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const twilio = require('twilio');

export default async function handler(req, res) {
  try {
    // 1. Double check the Environment Variable exists
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(500).send("Error: FIREBASE_SERVICE_ACCOUNT is not set in Vercel.");
    }

    // 2. Initialize using the Environment Variable string
    if (!getApps().length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // Fix formatting for the private key
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      initializeApp({ credential: cert(serviceAccount) });
    }

    const db = getFirestore();
    const doc = await db.collection("status").doc("tanmay").get();

    if (doc.exists) {
      res.status(200).send("✅ SENTINEL ONLINE: Cloud connected successfully.");
    } else {
      res.status(200).send("⚠️ Cloud connected, but 'tanmay' document missing in DB.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Runtime Error: " + err.message);
  }
}