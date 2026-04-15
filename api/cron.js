const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const twilio = require('twilio');

// --- VAULT 1: 60 MINUTES (Early Rest / Inactive) ---
// Focus: "He's okay, resting, don't worry, focus on you, he'll text soon."
const earlyVault = [
  (mins) => `🤖 *[Sentinel]* Hey! Tanmay has been quiet for ${mins}m. His vitals are perfectly stable. He is totally okay! Please stay happy and focus on your things; he'll text you the moment he is back! ❤️`,
  (mins) => `✨ *[System Check]* Zero keyboard activity for ${mins}m. He's fine and healthy! Don't worry at all. Keep smiling and he will contact you ASAP! 😊`,
  (mins) => `🩺 *[Vitals: Good]* Gentle bot update! Tanmay hasn't moved the mouse in ${mins}m. He's safe and resting. Focus on your tasks and stay happy, he'll text you soon!`,
  (mins) => `👀 *[Sentinel]* Keeping an eye on your boy. ${mins} minutes idle. He's perfectly okay. You just keep smiling and he will reach out ASAP!`,
  (mins) => `🤍 *[Status Update]* Activity paused for ${mins} minutes. Don't worry, he's completely fine. Focus on your day and he'll contact you the second he's up!`,
  (mins) => `🧸 *[Cozy Mode]* System detects ${mins}m of inactivity. Vitals are steady—he's just resting. Stay happy, don't stress, he will text you soon! 🌸`,
  (mins) => `🧘‍♂️ *[Rest Mode]* It's been ${mins} minutes since his last click. Health is 100%. He is okay, so please focus on yourself right now. He'll text ASAP!`,
  (mins) => `🔋 *[Recharging]* Tanmay's battery is winding down. ${mins}m idle. He's good and safe. Keep that smile on your face, he'll reach out soon!`,
  (mins) => `🛡️ *[Sentinel On Duty]* I've got him. ${mins}m of quiet time. He's perfectly healthy. Don't worry about him, focus on you, and expect a text ASAP! ❤️`,
  (mins) => `☕ *[Break Time]* ${mins} minutes of AFK time. He's safe and sound. Please stay happy and don't overthink; he will contact you shortly!`,
  (mins) => `📊 *[Telemetry]* Idle time: ${mins}m. Status: Perfectly healthy. Action: You stay focused and happy, he'll text you the moment he's back online!`,
  (mins) => `🕊️ *[Peaceful]* It's been ${mins} minutes of silence. All is well! Please don't worry. Keep doing your thing and he'll message you ASAP.`,
  (mins) => `🌟 *[Bot Ping]* Tanmay hasn't typed in ${mins}m. He's doing great and resting! Stay happy, focus on your work, and wait for his text!`,
  (mins) => `🛌 *[Winding Down]* System shows ${mins} minutes idle. He's safe, vitals are constant. Be happy and don't worry, he'll contact you the second he can!`,
  (mins) => `🚦 *[All Clear]* ${mins}m of inactivity. Everything is perfectly fine! Focus on your goals today and he will text you ASAP. 🤍`,
  (mins) => `🎧 *[Do Not Disturb]* Tanmay is resting for the last ${mins} minutes. He's healthy! Keep smiling and he'll be in touch soon.`,
  (mins) => `🛋️ *[Lounge Mode]* ${mins} minutes since the last keystroke. Your boy is safe. Don't worry at all, just focus on you. He'll message ASAP!`,
  (mins) => `🌸 *[Gentle Ping]* Just letting you know Tanmay is perfectly fine! (${mins}m idle). Stay happy and productive, he will text you very soon!`,
  (mins) => `💓 *[Heartbeat Check]* Steady vitals, ${mins}m of rest. He is completely okay. Please focus on your own stuff and don't worry. He'll text ASAP!`,
  (mins) => `📱 *[Away]* He stepped away ${mins} minutes ago. He is 100% fine. Keep that beautiful smile and he'll contact you the second he's back! 😊`,
  (mins) => `🛡️ *[Guard Dog]* ${mins}m of zero activity. I'm watching him, he's perfectly fine! Go focus on your tasks and stay happy, he'll ping you ASAP.`,
  (mins) => `🪴 *[Calm]* It's been ${mins} minutes. He's safe and resting his eyes. Please don't worry. Focus on yourself and expect a text soon!`,
  (mins) => `🔋 *[Power Saving]* Tanmay is in rest mode (${mins}m). He's doing great! Stay happy, don't stress, and he'll be right back to text you.`,
  (mins) => `🩺 *[Check-in]* ${mins}m offline. He is safe, healthy, and doing well. Focus on your happiness right now, he'll reach out the second he's ready!`,
  (mins) => `✨ *[Automated Love]* ${mins}m away. He wanted you to know he's perfectly okay. Keep smiling and doing your thing, he'll text ASAP! ❤️`,
  (mins) => `🤖 *[System]* ${mins} minutes of peace. He is completely fine. Please don't worry about him, focus on your day, and he will message you soon!`,
  (mins) => `🧸 *[Safe]* He hasn't moved the mouse in ${mins}m. Vitals are amazing. You stay happy and focused, he'll be texting you very shortly!`,
  (mins) => `🤍 *[Update]* ${mins}m AFK. He is perfectly healthy and just resting. Please don't stress! Focus on you, and he'll contact you ASAP.`,
  (mins) => `📊 *[Scan Complete]* ${mins}m idle. Status: 100% okay. Stay happy and don't overthink it, he'll message you the moment he is back!`,
  (mins) => `🛡️ *[Secure]* ${mins} minutes down. Tanmay is safe and resting. Focus your energy on yourself right now, he will reach out ASAP! 🌸`
];

// --- VAULT 2: 120 MINUTES (Deep Sleep) ---
// Focus: "He's fast asleep, vitals constant, don't worry, keep smiling, he'll text you when he wakes."
const deepSleepVault = [
  (mins) => `🌙 *[Sentinel Update]* ${mins}m of deep rest. Vitals are perfectly constant. He is completely fine and asleep. Focus on your stuff and stay happy—he'll text you the second he wakes up! ❤️`,
  (mins) => `💤 *[System Logs]* Confirming ${mins}m of deep idle. All systems green, vitals perfect. He's knocked out! Don't worry, stay happy, and he will contact you ASAP! 😊`,
  (mins) => `🩺 *[Health Check]* Tanmay has been resting for exactly ${mins} minutes. Breathing is steady, he is perfectly safe. Focus on you and keep smiling, he'll text when he's up!`,
  (mins) => `🌌 *[Dreamland]* ${mins} minutes of zero activity. He is definitely sleeping! He is totally fine, so please don't worry. He'll reach out the moment his eyes open.`,
  (mins) => `🛌 *[Sleep Confirmed]* It's been ${mins}m. Heart rate stable. Don't worry about him, he's getting good rest! Focus on your day and he'll text ASAP. 🤍`,
  (mins) => `🧸 *[Deep Rest]* He hasn't moved a muscle in ${mins} minutes. He is healthy and sleeping soundly. Stay happy and don't stress, he'll contact you soon!`,
  (mins) => `🛡️ *[Night Watch]* ${mins} minutes idle. He is 100% asleep and perfectly okay. Focus on your own things right now, he will ping you the second he wakes!`,
  (mins) => `📊 *[Health Metrics]* Time AFK: ${mins}m. Conclusion: He is safe and completely knocked out. Please stay happy and don't worry, he'll text ASAP! 🌸`,
  (mins) => `😴 *[REM Cycle]* ${mins} minutes of inactivity. He's definitely asleep and his vitals are perfectly steady. Keep smiling, he'll contact you right when he wakes!`,
  (mins) => `🌟 *[Deep Peace]* ${mins}m of silence. He is safe, snug, and asleep. You focus on yourself and stay happy, he will message you ASAP! ❤️`,
  (mins) => `🔋 *[Fully Recharging]* It's been a solid ${mins} minutes. He is heavily asleep and doing perfectly fine. Don't worry, just wait for his text when he's up!`,
  (mins) => `🕊️ *[Resting]* ${mins} minutes of pure rest. Vitals are wonderful. He's sleeping like a baby. Stay happy, don't overthink, he'll text you ASAP!`,
  (mins) => `💤 *[Zzz...]* ${mins}m without a single click. He is healthy, safe, and lost in sleep. Please focus on your tasks, he will reach out the second he's awake!`,
  (mins) => `🌃 *[Sleep Ping]* Confirming Tanmay has been asleep for ${mins} minutes. Everything is great. Keep that beautiful smile and he'll text you ASAP! 😊`,
  (mins) => `📈 *[Sleep Metrics]* Inactivity at ${mins}m. He is perfectly okay and deep in sleep! Don't stress at all, focus on you. He'll message soon!`,
  (mins) => `🧸 *[Snug]* ${mins} minutes away. He's safe, warm, and definitely sleeping. You stay happy and focus on your goals, he'll contact you ASAP!`,
  (mins) => `🩺 *[Doc Bot]* Vitals check: 100%. Sleep status: Confirmed (${mins}m). Don't worry about a thing! Keep smiling and expect a text when he wakes up!`,
  (mins) => `🌙 *[Rest Confirmed]* System detects ${mins}m of continuous rest. He is perfectly healthy. Please focus on yourself, he will text you the moment he's up! 🤍`,
  (mins) => `🛰️ *[Offline]* Tanmay has been asleep for ${mins} minutes. He's perfectly safe! Don't worry, stay happy, and he will text you ASAP.`,
  (mins) => `🛡️ *[Sentinel]* He's been resting for ${mins}m. Vitals are steady, he is safe. Please don't overthink, focus on your day, and he'll contact you soon! 🌸`,
  (mins) => `🧘‍♂️ *[Zen]* ${mins}m of deep sleep. He is 100% fine and healthy. Keep your focus on your own happiness right now, he'll text you the second he can!`,
  (mins) => `🤍 *[Automated Reassurance]* ${mins} minutes asleep. Tanmay is totally okay. Don't worry at all! Stay happy and he will reach out ASAP when he wakes.`,
  (mins) => `🧸 *[Safe & Sound]* ${mins}m of rest. His vitals are perfect. Please focus on your own stuff and stay smiling, he will message you ASAP!`,
  (mins) => `🛌 *[Deep Sleep]* He's been knocked out for ${mins}m. Completely safe and healthy. Don't stress, focus on you, and wait for his good morning text! ❤️`,
  (mins) => `✨ *[All Good]* ${mins}m asleep. Everything is absolutely fine here. Keep yourself happy and busy, he will contact you the moment his eyes open!`,
  (mins) => `🤖 *[System Safe]* ${mins} minutes of sleep. Vitals are constant. Please don't worry about him, stay focused on you, he'll text ASAP!`,
  (mins) => `🩺 *[Vitals: Perfect]* ${mins}m of slumber. He is doing amazingly well. Focus on your own day and stay happy, he will reach out the second he's awake!`,
  (mins) => `💤 *[Out Cold]* ${mins}m of inactivity. Tanmay is safe and heavily asleep. Don't overthink! Keep smiling and expect his text ASAP.`,
  (mins) => `🛡️ *[Guard Active]* I'm watching over him. (${mins}m asleep). He's perfectly fine! Focus your energy on yourself, he will text you very soon! 🌸`,
  (mins) => `🌟 *[Peace]* ${mins}m down. Tanmay is safe, resting deeply, and healthy. Please stay happy and don't worry, he'll contact you the second he wakes up! 🤍`
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