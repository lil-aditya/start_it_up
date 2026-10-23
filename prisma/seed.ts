import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set to seed PostgreSQL.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const INDIAN_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
  "Krishna", "Ishaan", "Ananya", "Diya", "Myra", "Sara", "Aanya", "Aadhya",
  "Isha", "Priya", "Kavya", "Riya", "Rahul", "Amit", "Sneha", "Neha",
  "Pooja", "Rohit", "Vikram", "Mohit", "Deepak", "Rakesh",
];

const INDIAN_LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Shah", "Mehta",
  "Joshi", "Reddy", "Nair", "Iyer", "Rao", "Das", "Mishra", "Dubey",
  "Pandey", "Tiwari", "Agarwal", "Bansal",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "88", "87", "86", "85"];
  return `+91${randomItem(prefixes)}${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function randomDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo));
  d.setHours(Math.floor(Math.random() * 14) + 8); // 8 AM to 10 PM
  d.setMinutes(Math.floor(Math.random() * 60));
  return d;
}

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.conversionEvent.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  // ─── Business 1: Coaching Institute ───────────────────────────

  const coaching = await prisma.business.create({
    data: {
      name: "Apex Coaching Institute",
      slug: "apex-coaching",
      industryType: "coaching",
      phone: "+919876543210",
      email: "info@apexcoaching.in",
      website: "https://apexcoaching.in",
      aiPersona: `You are a friendly admissions counselor at Apex Coaching Institute, one of the top JEE/NEET coaching centers in Kota. 
You help students and parents with information about courses, fees, batch timings, demo classes, and the admission process.
Be warm, encouraging, and professional. Use Hindi words naturally when appropriate.
Key facts: JEE batches start monthly, NEET crash course available, fees range from ₹45,000 to ₹1,20,000 per year depending on the program.
Demo classes are available every Saturday.`,
      faqDocument: `Q: What courses do you offer?
A: We offer JEE Main, JEE Advanced, NEET UG, Foundation (Class 9-10), and Board + JEE/NEET integrated programs.

Q: What are the fees?
A: JEE Main: ₹45,000/year, JEE Advanced: ₹75,000/year, NEET: ₹60,000/year, Foundation: ₹35,000/year

Q: When do batches start?
A: New batches start on the 1st and 15th of every month. Crash courses start in January and June.

Q: Is there a demo class?
A: Yes! Free demo classes are held every Saturday from 10 AM to 12 PM. Walk-in or register online.

Q: What is the selection rate?
A: Last year, 85% of our JEE students cleared Mains and 23 students got into IITs. 156 students qualified NEET.

Q: Is hostel available?
A: Yes, we have AC and non-AC hostel options. AC: ₹8,000/month, Non-AC: ₹5,000/month including meals.`,
      escalationKeywords: "refund,money back,complaint,fraud,legal,lawyer",
      followUpSequence: "24,72,168",
      supportedLanguages: "en,hi",
      subscriptionStatus: "active",
      plan: "growth",
    },
  });

  const coachingOwner = await prisma.user.create({
    data: {
      email: "rajesh@apexcoaching.in",
      name: "Rajesh Sharma",
      role: "OWNER",
      businessId: coaching.id,
    },
  });

  const coachingStaff = await prisma.user.create({
    data: {
      email: "priya@apexcoaching.in",
      name: "Priya Gupta",
      role: "STAFF",
      businessId: coaching.id,
    },
  });

  // ─── Business 2: Gym / Fitness Studio ─────────────────────────

  const gym = await prisma.business.create({
    data: {
      name: "IronForge Fitness",
      slug: "ironforge-fitness",
      industryType: "gym",
      phone: "+919876543211",
      email: "hello@ironforge.fit",
      website: "https://ironforge.fit",
      aiPersona: `You are a friendly fitness consultant at IronForge Fitness, a premium gym and fitness studio.
You help people with membership details, class schedules, personal training packages, and trial visits.
Be motivating and enthusiastic. Use a mix of English and Hindi naturally.
Key facts: Monthly membership ₹2,500, quarterly ₹6,000, annual ₹20,000. 
Personal training: ₹1,500/session or ₹12,000 for 10 sessions.
Classes: Yoga, Zumba, CrossFit, Kickboxing available.
Free trial class available on request.`,
      faqDocument: `Q: What are membership prices?
A: Monthly: ₹2,500, Quarterly: ₹6,000 (save ₹1,500), Annual: ₹20,000 (save ₹10,000)

Q: What classes are available?
A: Yoga (6AM & 6PM), Zumba (7AM & 7PM), CrossFit (5:30PM), Kickboxing (8PM). All included in membership.

Q: Is personal training available?
A: Yes! ₹1,500/session or ₹12,000 for a 10-session pack. Certified trainers with 5+ years experience.

Q: Can I get a free trial?
A: Absolutely! Come in any day for a free trial workout. Just bring your ID and wear comfortable clothes.

Q: What are the gym timings?
A: 5 AM to 11 PM, 7 days a week. Closed on national holidays.`,
      escalationKeywords: "injury,hurt,medical,refund,cancel membership",
      followUpSequence: "24,48,120",
      supportedLanguages: "en,hi",
      subscriptionStatus: "active",
      plan: "starter",
    },
  });

  const gymOwner = await prisma.user.create({
    data: {
      email: "vikram@ironforge.fit",
      name: "Vikram Rathore",
      role: "OWNER",
      businessId: gym.id,
    },
  });

  // ─── Leads for Coaching ───────────────────────────────────────

  const statuses = ["NEW", "ENGAGED", "QUALIFIED", "CONVERTED", "LOST"];
  const sources = ["WHATSAPP", "WEB_FORM", "INSTAGRAM", "PHONE", "WALK_IN"];
  const coachingValues = [45000, 60000, 75000, 120000, 35000];

  const coachingLeads = [];
  for (let i = 0; i < 25; i++) {
    const firstName = randomItem(INDIAN_FIRST_NAMES);
    const lastName = randomItem(INDIAN_LAST_NAMES);
    const status = randomItem(statuses);
    const createdAt = randomDate(30);

    const lead = await prisma.lead.create({
      data: {
        name: `${firstName} ${lastName}`,
        phone: randomPhone(),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
        source: randomItem(sources),
        status,
        estimatedValue: randomItem(coachingValues),
        businessId: coaching.id,
        assignedToId: Math.random() > 0.5 ? coachingStaff.id : null,
        lastInteractionAt: randomDate(Math.floor(Math.random() * 7)),
        createdAt,
        notes: status === "LOST" ? "Did not respond after 3 follow-ups" :
               status === "CONVERTED" ? "Enrolled in JEE Advanced batch" :
               status === "QUALIFIED" ? "Interested in NEET program, demo class attended" : null,
      },
    });
    coachingLeads.push(lead);
  }

  // ─── Leads for Gym ────────────────────────────────────────────

  const gymValues = [2500, 6000, 12000, 20000];
  const gymLeads = [];
  for (let i = 0; i < 15; i++) {
    const firstName = randomItem(INDIAN_FIRST_NAMES);
    const lastName = randomItem(INDIAN_LAST_NAMES);
    const status = randomItem(statuses);
    const createdAt = randomDate(30);

    const lead = await prisma.lead.create({
      data: {
        name: `${firstName} ${lastName}`,
        phone: randomPhone(),
        source: randomItem(sources),
        status,
        estimatedValue: randomItem(gymValues),
        businessId: gym.id,
        lastInteractionAt: randomDate(Math.floor(Math.random() * 7)),
        createdAt,
      },
    });
    gymLeads.push(lead);
  }

  // ─── Conversations & Messages for Coaching ────────────────────

  const coachingConversations = [
    {
      leadIndex: 0,
      messages: [
        { direction: "INBOUND", senderType: "LEAD", content: "Hi, I want to know about JEE coaching fees" },
        { direction: "OUTBOUND", senderType: "AI", content: "Namaste! 🙏 Welcome to Apex Coaching Institute. We offer several JEE programs:\n\n📚 JEE Main: ₹45,000/year\n📚 JEE Advanced: ₹75,000/year\n📚 Board + JEE Integrated: ₹1,20,000/year\n\nWould you like to know more about any specific program? Or would you like to attend a free demo class this Saturday?" },
        { direction: "INBOUND", senderType: "LEAD", content: "JEE Advanced ka batch kab start hoga?" },
        { direction: "OUTBOUND", senderType: "AI", content: "JEE Advanced ka next batch 1st November se start ho raha hai! 🎯\n\nBatch details:\n⏰ Morning batch: 7 AM - 12 PM\n⏰ Evening batch: 2 PM - 7 PM\n\nSeats limited hain — abhi sirf 12 seats bachi hain morning batch mein.\n\nKya aap Saturday ko demo class attend karna chahenge? Main aapke liye slot book kar deta hoon." },
        { direction: "INBOUND", senderType: "LEAD", content: "Saturday theek hai, book kar do" },
        { direction: "OUTBOUND", senderType: "AI", content: "Done! ✅ Aapka demo class book ho gaya hai:\n\n📅 Date: This Saturday\n⏰ Time: 10 AM - 12 PM\n📍 Location: Apex Coaching, Vigyan Nagar, Kota\n\nPlease apna ID proof lekar aayein. Koi bhi sawal ho toh yahan puchh sakte hain. Best of luck! 💪" },
      ],
    },
    {
      leadIndex: 1,
      messages: [
        { direction: "INBOUND", senderType: "LEAD", content: "Hello, my daughter wants to prepare for NEET. What all do you offer?" },
        { direction: "OUTBOUND", senderType: "AI", content: "Hello! Thank you for reaching out to Apex Coaching. 😊\n\nWe have an excellent NEET preparation program:\n\n🔬 NEET Regular: ₹60,000/year (2 year program)\n🔬 NEET Crash Course: ₹35,000 (6 months intensive)\n\nLast year, 156 of our students qualified NEET! Our faculty includes ex-AIIMS professors.\n\nWhich class is your daughter currently in?" },
        { direction: "INBOUND", senderType: "LEAD", content: "She is in 12th right now. When is the next crash course?" },
        { direction: "OUTBOUND", senderType: "AI", content: "Perfect timing! Our NEET Crash Course starts in January 2027. It's an intensive 6-month program covering:\n\n✅ Complete Physics, Chemistry & Biology syllabus\n✅ 200+ practice tests\n✅ Weekly mock exams\n✅ One-on-one doubt sessions\n\nI'd recommend she attends our free demo class this Saturday to experience our teaching style. Shall I connect you with our NEET counselor for a detailed discussion?" },
        { direction: "INBOUND", senderType: "LEAD", content: "Yes please connect me" },
        { direction: "OUTBOUND", senderType: "HUMAN", content: "Hello! This is Priya from Apex Coaching. I'm our NEET program counselor. I'd love to help your daughter with her preparation. Can I call you at a convenient time to discuss the program in detail?" },
      ],
    },
    {
      leadIndex: 2,
      messages: [
        { direction: "INBOUND", senderType: "LEAD", content: "fees bahut zyada hai, kuch discount milega kya?" },
        { direction: "OUTBOUND", senderType: "AI", content: "Main samajh sakta hoon! 🙏 Fees ke baare mein — hum kuch options provide karte hain:\n\n💰 Early bird discount: 10% off (if you enroll before month end)\n💰 Sibling discount: 15% off for second child\n💰 Merit scholarship: Up to 50% off based on entrance test\n\nAap hamare scholarship test de sakte hain — next test 25th ko hai. Score ke basis pe scholarship milti hai.\n\nKya aap scholarship test ke liye register karna chahenge?" },
      ],
    },
  ];

  for (const convData of coachingConversations) {
    const lead = coachingLeads[convData.leadIndex];
    const conv = await prisma.conversation.create({
      data: {
        channel: "WHATSAPP",
        leadId: lead.id,
        businessId: coaching.id,
      },
    });

    for (let i = 0; i < convData.messages.length; i++) {
      const msg = convData.messages[i];
      await prisma.message.create({
        data: {
          direction: msg.direction,
          senderType: msg.senderType,
          content: msg.content,
          conversationId: conv.id,
          sentByUserId: msg.senderType === "HUMAN" ? coachingStaff.id : null,
          sentAt: new Date(Date.now() - (convData.messages.length - i) * 3600000),
        },
      });
    }
  }

  // ─── Follow-ups ───────────────────────────────────────────────

  const followUpTemplates = [
    "Hi {name}! 👋 Just checking in — did you have any more questions about our program?",
    "Hey {name}, reminder: Our demo class is this Saturday at 10 AM. See you there? 😊",
    "Hi {name}, limited seats remaining for the new batch starting next month. Don't miss out! 🎯",
    "Hey {name}! Our scholarship test is on the 25th. Register now and get up to 50% off! 💰",
  ];

  for (let i = 0; i < 8; i++) {
    const lead = randomItem(coachingLeads);
    const template = randomItem(followUpTemplates);
    const hoursFromNow = Math.floor(Math.random() * 72) - 24; // -24h to +48h
    const scheduledAt = new Date(Date.now() + hoursFromNow * 3600000);

    await prisma.followUp.create({
      data: {
        scheduledAt,
        messageContent: template.replace("{name}", lead.name.split(" ")[0]),
        status: hoursFromNow < 0 ? (Math.random() > 0.3 ? "SENT" : "FAILED") : "PENDING",
        sentAt: hoursFromNow < 0 ? scheduledAt : null,
        attemptCount: hoursFromNow < 0 ? 1 : 0,
        leadId: lead.id,
        businessId: coaching.id,
      },
    });
  }

  // ─── Conversion Events ────────────────────────────────────────

  const convertedCoachingLeads = coachingLeads.filter((l) => l.status === "CONVERTED");
  for (const lead of convertedCoachingLeads) {
    await prisma.conversionEvent.create({
      data: {
        eventType: "ENROLLMENT",
        revenueAmount: lead.estimatedValue,
        description: "Student enrolled in coaching program",
        leadId: lead.id,
        businessId: coaching.id,
        convertedAt: randomDate(14),
      },
    });
  }

  const convertedGymLeads = gymLeads.filter((l) => l.status === "CONVERTED");
  for (const lead of convertedGymLeads) {
    await prisma.conversionEvent.create({
      data: {
        eventType: "ENROLLMENT",
        revenueAmount: lead.estimatedValue,
        description: "Member enrolled in gym membership",
        leadId: lead.id,
        businessId: gym.id,
        convertedAt: randomDate(14),
      },
    });
  }

  // ─── Summary ──────────────────────────────────────────────────

  const totalLeads = await prisma.lead.count();
  const totalConversations = await prisma.conversation.count();
  const totalMessages = await prisma.message.count();
  const totalFollowUps = await prisma.followUp.count();
  const totalConversions = await prisma.conversionEvent.count();

  console.log("✅ Database seeded successfully!\n");
  console.log(`📊 Summary:`);
  console.log(`   Businesses: 2 (Apex Coaching + IronForge Fitness)`);
  console.log(`   Users: 3 (2 owners + 1 staff)`);
  console.log(`   Leads: ${totalLeads}`);
  console.log(`   Conversations: ${totalConversations}`);
  console.log(`   Messages: ${totalMessages}`);
  console.log(`   Follow-ups: ${totalFollowUps}`);
  console.log(`   Conversions: ${totalConversions}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
