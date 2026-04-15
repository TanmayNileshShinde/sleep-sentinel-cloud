const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const twilio = require('twilio');

// --- VAULT 1: 60 MINUTES (Early Rest) ---
// Focus: "Tanmay is okay, he's resting, focus on you, he'll text soon."
const earlyVault = [
  (mins) => `Hii Tanmay's Sunflower! 🌻✨ Just wanted to let you know that Tanmay has been quiet for ${mins}m ☁️ He is doing perfectly okay and is just resting a bit! ❤️ Please stay happy and focus on your things; he'll message you the very second he's back! 🧸💖🎀🌷✨`,
  (mins) => `Heyy Sunflower! 🌻 Tanmay is doing great! He's been away for ${mins}m, likely just resting his eyes for a bit 😴✨ Keep smiling and stay focused on your work; he'll contact you ASAP!! 🥰💫🌷🎀💕`,
  (mins) => `Tanmay is safe and sound, just taking a little break for the last ${mins}m 🧸☁️ Please stay happy and focus on your pretty self, Sunflower; he'll reach out to you so soon! ✨🌻💖🍬🌸`,
  (mins) => `I'm keeping an eye on Tanmay for you, Sunflower! 🌻👀 He's been idle for ${mins}m and is totally fine! Just keep doing your thing and he'll be back to talk to you ASAP! 🎀💕✨🍭🌷`,
  (mins) => `Tanmay is perfectly healthy, just a bit quiet for the last ${mins}m ☁️🌷 Don't stress at all! Focus on your day and he'll contact you the second he's up, Sunflower! 🌻❤️💫🎀🧸`,
  (mins) => `Tanmay is just in cozy mode right now for ${mins}m 🧸✨ He's doing great, so please stay happy and don't worry, Sunflower! He'll text you very soon! 🌻🎀💖🌷🍭`,
  (mins) => `It's been ${mins}m since Tanmay used his laptop, but he's 100% okay ☁️🥰 Please focus on yourself right now and stay happy, Sunflower; he'll text you ASAP! 🌻✨💕🍬🌸`,
  (mins) => `Tanmay is just recharging his batteries for ${mins}m 🔋✨ He's safe and doing so well! Keep that beautiful smile on your face, Sunflower; he'll reach out soon! 🌻🌷💖🎀🧸`,
  (mins) => `I've got Tanmay covered for you! 🛡️❤️ He's been resting for ${mins}m and is perfectly healthy! Don't worry about him, Sunflower, just focus on you and expect a text ASAP! 🌻✨🎀🍭🌷`,
  (mins) => `Tanmay is safe and sound, just having some quiet time for ${mins}m 🧸☁️ Please stay happy and don't overthink, Sunflower; he will contact you shortly! 🌻💕✨🌸🍬`,
  (mins) => `Hii Sunflower! 🌻 Tanmay hasn't moved the mouse for ${mins}m but he is totally fine! 💖 Go focus on your beautiful goals and he'll message you the moment he wakes! ✨🎀🌷🍭`,
  (mins) => `Just a gentle update for Tanmay's Sunflower 🌻 Tanmay is resting perfectly for the last ${mins}m! 🥰 Please stay happy and productive; he'll be back to talk to you very soon! 🧸💖✨🌸`,
  (mins) => `Tanmay is 100% okay and healthy! 💖 He's been quiet for ${mins}m, just taking a break ☁️ Stay happy and keep doing your thing, Sunflower! He'll text ASAP! 🌻✨🎀🌷`,
  (mins) => `No need to worry, Sunflower! 🌻 Tanmay is just relaxing for ${mins}m 🧸✨ He is safe and sound! Focus on your day and he'll contact you the second he can! 💖🎀🍭🌸`,
  (mins) => `Everything is wonderful with Tanmay! 🥰 He's been away for ${mins}m, just resting up ☁️ Stay focused on your things, Sunflower, and expect a sweet text soon! 🌻✨💖🎀🌷`
  // (You can copy and slightly vary these to reach 100)
];

// --- VAULT 2: 120 MINUTES (Deep Rest) ---
// Focus: "Tanmay is fast asleep, healthy, don't worry, keep smiling, he'll text when he wakes."
const deepSleepVault = [
  (mins) => `Hii Sunflower! 🌻 Tanmay is officially fast asleep after ${mins}m of quiet time 😴✨ He is perfectly fine and healthy! Focus on your stuff and stay happy—he'll text you the second he wakes up! ❤️☁️🧸💖🎀`,
  (mins) => `Confirming that Tanmay is having a deep rest for ${mins}m 😴💖 He's doing great! Don't worry at all, Sunflower, stay happy and he will contact you ASAP! 🌻✨🌷🍭🌸`,
  (mins) => `Tanmay has been resting for exactly ${mins}m and he's perfectly safe 🧸☁️ Focus on your work and keep smiling, Sunflower; he'll text when he's up! 🌻💖✨🎀🌷`,
  (mins) => `Tanmay is definitely sleeping now after being away for ${mins}m! 😴✨ He is totally fine, Sunflower, so please don't worry! He'll reach out the moment his eyes open! 🌻❤️💫🎀🧸`,
  (mins) => `Tanmay is getting some really good rest for ${mins}m 🧸☁️ Don't worry about him at all! Focus on your day, Sunflower, and he'll text you ASAP! 🌻✨💕🍭🌸`,
  (mins) => `Tanmay is healthy and sleeping soundly for the last ${mins}m 😴🌷 Stay happy and don't stress, Sunflower; he'll contact you soon! 🌻🎀💖✨🍭`,
  (mins) => `Tanmay is 100% asleep and perfectly okay after ${mins}m 🧸✨ Focus on your own things right now, Sunflower; he will ping you the second he wakes! 🌻💕✨🌷🎀`,
  (mins) => `Tanmay is safe and completely knocked out for ${mins}m 😴☁️ Please stay happy and don't worry, Sunflower; he'll text you ASAP! 🌻💖🌷🌸🍬`,
  (mins) => `Tanmay is definitely asleep and doing perfectly fine for ${mins}m 😴✨ Keep smiling, Sunflower; he'll contact you right when he wakes! 🌻❤️💫🎀🍭`,
  (mins) => `Tanmay is safe and snuggly asleep for ${mins}m 🧸☁️ You focus on yourself and stay happy, Sunflower; he will message you ASAP! 🌻✨🎀🌷🍭`,
  (mins) => `Sweet dreams for Tanmay! 😴 He's been sleeping for ${mins}m and is 100% okay 💖 Stay happy and focus on your day, Sunflower; he'll reach out the second he's awake! 🌻✨🎀🌸`,
  (mins) => `Tanmay is having a deep, peaceful rest for ${mins}m 🧸☁️ He is totally fine, Sunflower! Please don't worry. Keep smiling and he'll text you ASAP! 🌻💖✨🍭🌷`,
  (mins) => `Confirming Tanmay is in dreamland for ${mins}m 😴✨ He's safe and sound! Focus on your goals today, Sunflower, and wait for his good morning text! 🌻❤️🎀🌸`,
  (mins) => `Tanmay is safe, snug, and officially asleep for ${mins}m 🧸☁️ Don't worry about him at all, Sunflower! Stay happy and he will text you very soon! 🌻✨💖🎀🌷`,
  (mins) => `It's been a long rest for Tanmay (${mins}m), but he is doing great! 😴💖 Stay focused on yourself, Sunflower, and expect his text the moment he wakes! 🌻✨🎀🍭🌸`
  // (You can copy and slightly vary these to reach 100)
];

export default async function handler(req, res) {
  try {
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

    const lastCheckIn = data.lastCheckIn.toDate().getTime();
    const diffInMins = Math.round((Date.now() - lastCheckIn) / 60000);
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    let actionTaken = "No action needed";

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

    res.status(200).send(`Sentinel Check Complete. Idle: ${diffInMins}m. Action: ${actionTaken}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Cloud Error: " + err.message);
  }
}