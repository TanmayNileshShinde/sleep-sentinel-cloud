const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const twilio = require('twilio');

// --- VAULT 1: 60 MINUTES (Winding Down) ---
const earlyVault = [
  (mins) => `🤖 *[Sentinel]* Hey! Tanmay has been quiet for ${mins}m. Vitals are perfectly stable. He might just be reading or resting his eyes! ❤️`,
  (mins) => `✨ *[System Check]* Zero keyboard activity for ${mins}m. He's totally fine and healthy, probably just unwinding for the night.`,
  (mins) => `🩺 *[Vitals: Good]* Just a gentle bot update! Tanmay hasn't moved the mouse in ${mins}m. He's safe and likely dozing off.`,
  (mins) => `👀 *[Sentinel]* Keeping an eye on your boy. ${mins} minutes idle. He's perfectly okay, probably just got distracted or is getting sleepy.`,
  (mins) => `🤍 *[Night Watch]* Activity paused for ${mins} minutes. Don't worry, he's completely fine. Just thought you'd want to know he's resting!`,
  (mins) => `🧸 *[Cozy Mode]* System detects ${mins}m of inactivity. Don't worry, vitals are steady—he's just entering cozy mode.`,
  (mins) => `🧘‍♂️ *[Rest Mode]* It's been ${mins} minutes since his last click. Breathing steady, health is 100%. He might be falling asleep!`,
  (mins) => `🔋 *[Recharging]* Tanmay's battery is winding down. ${mins}m idle. He's good, safe, and resting.`,
  (mins) => `🛡️ *[Sentinel On Duty]* I've got him. ${mins}m of quiet time so far. He's perfectly healthy and probably just relaxing in bed.`,
  (mins) => `☕ *[Winding Down]* ${mins} minutes of AFK time. He's safe and sound, just taking it easy right now.`
];

// --- VAULT 2: 120 MINUTES (Deep Sleep) ---
const deepSleepVault = [
  (mins) => `🌙 *[Sentinel Update]* ${mins}m of peace and quiet. Vitals are steady. He is officially fast asleep. Goodnight from the bot! ✨`,
  (mins) => `💤 *[System Logs]* Confirming ${mins}m of deep idle. All systems green, vitals perfect. Your boy is out cold. 😴`,
  (mins) => `🩺 *[Vitals: Constant]* Tanmay has been resting for exactly ${mins} minutes. Breathing is steady, he is perfectly safe and sleeping deeply. ❤️`,
  (mins) => `🌌 *[Dreamland]* ${mins} minutes of zero activity. He is definitely dreaming by now. Sentinel is standing guard, he's totally fine!`,
  (mins) => `🛌 *[Sleep Confirmed]* It's been ${mins}m. Heart rate stable, sleep cycle activated. Don't worry about him, he's getting good rest!`,
  (mins) => `🧸 *[Deep Rest]* He hasn't moved a muscle in ${mins} minutes. Just an automated reassurance that he is healthy and sleeping soundly.`,
  (mins) => `🛡️ *[Night Watch]* ${mins} minutes idle. He is 100% asleep and perfectly okay. I'll keep an eye on his servers while he rests. 🤍`,
  (mins) => `📊 *[Health Check]* Time AFK: ${mins}m. Status: Deep Sleep. Conclusion: He is safe, healthy, and completely knocked out.`,
  (mins) => `😴 *[REM Cycle]* We are at ${mins} minutes of inactivity. He's definitely asleep and his vitals are perfectly steady. Have a great night!`,
  (mins) => `🌟 *[Starlight]* ${mins}m of silence. He is safe, snug, and officially asleep. You can sleep peacefully too!`
];

export default async function handler(req, res) {
  try {
    // 1. Firebase Login
    if (!getApps().length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      initializeApp({ credential: cert(serviceAccount) });
    }

    const db = getFirestore();
    const docRef = db.collection("status").doc("tanmay");
    const doc = await docRef.get();
    const data = doc.data();

    // 2. Sentinel Math
    const lastCheckIn = data.lastCheckIn.toDate().getTime();
    const diffInMins = Math.round((Date.now() - lastCheckIn) / 60000);
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    let actionTaken = "No action needed";

    // 3. TRIGGER 1: At 60 minutes (Early Message)
    if (diffInMins >= 60 && diffInMins < 120 && !data.stage1Sent) {
      const finalMessage = earlyVault[Math.floor(Math.random() * earlyVault.length)](diffInMins);
      
      await client.messages.create({
        body: finalMessage,
        from: "whatsapp:+14155238886", 
        to: "whatsapp:+919082601302" 
      });
      
      await docRef.update({ stage1Sent: true });
      actionTaken = "Stage 1 (Early) sent";
    }
    
    // 4. TRIGGER 2: At 120 minutes (Deep Sleep Message)
    else if (diffInMins >= 120 && !data.stage2Sent) {
      const finalMessage = deepSleepVault[Math.floor(Math.random() * deepSleepVault.length)](diffInMins);
      
      await client.messages.create({
        body: finalMessage,
        from: "whatsapp:+14155238886", 
        to: "whatsapp:+919082601302" 
      });
      
      await docRef.update({ stage2Sent: true });
      actionTaken = "Stage 2 (Deep Sleep) sent";
    }

    // 5. Cloud Response
    res.status(200).send(`Sentinel Check Complete. Idle: ${diffInMins}m. Action: ${actionTaken}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Cloud Error: " + err.message);
  }
}