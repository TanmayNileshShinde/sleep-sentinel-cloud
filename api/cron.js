const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const twilio = require('twilio');

export default async function handler(req, res) {
  try {
    // 1. Check if the "Password" (Variable) exists in Vercel
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      return res.status(500).send("Error: Missing FIREBASE_SERVICE_ACCOUNT in Vercel settings.");
    }

    // 2. Initialize using the variable, NOT the file
    if (!getApps().length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // Fix the formatting of the private key
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
      res.status(200).send("⚠️ Connected, but document 'tanmay' was not found.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Crash Report: " + err.message);
  }
}