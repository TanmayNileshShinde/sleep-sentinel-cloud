const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

export default async function handler(req, res) {
  try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(500).send("Error: Missing FIREBASE_SERVICE_ACCOUNT variable in Vercel.");
    }

    if (!getApps().length) {
      // This line fixes the common "Private Key" formatting error
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      initializeApp({ credential: cert(serviceAccount) });
    }

    const db = getFirestore();
    const doc = await db.collection("status").doc("tanmay").get();

    if (doc.exists) {
      res.status(200).send("✅ SENTINEL ONLINE: Cloud connected to Firebase successfully.");
    } else {
      res.status(200).send("⚠️ Cloud connected, but could not find the 'tanmay' document.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Crash Report: " + err.message);
  }
}