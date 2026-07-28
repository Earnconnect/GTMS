import { PrismaClient, type EmploymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const SYSTEM_USER_EMAIL = "system@gtms.local";

async function upsertUser(opts: {
  email: string;
  name: string;
  role: "WORKER" | "REQUESTER" | "ADMIN";
  password: string;
  balance?: number;
  employment?: {
    jobTitle: string;
    department: string;
    salaryCents: number;
    status: EmploymentStatus;
  };
}) {
  const passwordHash = await bcrypt.hash(opts.password, 10);
  const employmentData = opts.employment
    ? {
        jobTitle: opts.employment.jobTitle,
        department: opts.employment.department,
        salaryCents: opts.employment.salaryCents,
        employmentStatus: opts.employment.status,
        hiredAt: new Date(),
      }
    : {};
  return db.user.upsert({
    where: { email: opts.email },
    update: { name: opts.name, role: opts.role, passwordHash, ...employmentData },
    create: {
      email: opts.email,
      name: opts.name,
      role: opts.role,
      passwordHash,
      ...employmentData,
      wallet: { create: { balance: opts.balance ?? 0 } },
    },
    include: { wallet: true },
  });
}

async function main() {
  console.log("Seeding GTMS…");

  // Company/system wallet — funds salaries and collects fees. Not loginable.
  await db.user.upsert({
    where: { email: SYSTEM_USER_EMAIL },
    update: {},
    create: {
      email: SYSTEM_USER_EMAIL,
      name: "GTMS Company",
      role: "ADMIN",
      status: "ACTIVE",
      wallet: { create: {} },
    },
  });

  const admin = await upsertUser({
    email: "admin@gtms.local",
    name: "HR Admin",
    role: "ADMIN",
    password: "admin12345",
  });

  // An active, onboarded employee — KYC pre-approved so withdrawals work.
  const employee = await upsertUser({
    email: "employee@gtms.local",
    name: "Wanda Employee",
    role: "WORKER",
    password: "employee12345",
    employment: {
      jobTitle: "Customer Support Agent",
      department: "Operations",
      salaryCents: 2000_00,
      status: "EMPLOYED",
    },
  });
  await db.user.update({
    where: { id: employee.id },
    data: { kycStatus: "APPROVED" },
  });

  // A registered account that has NOT been onboarded yet — appears in the
  // admin "Onboard a new employee" list.
  const prospect = await upsertUser({
    email: "prospect@gtms.local",
    name: "Percy Prospect",
    role: "WORKER",
    password: "prospect12345",
  });

  // ---- HR demo content ----

  // Training courses
  const courses = [
    { title: "New-Hire Orientation", summary: "Company policies, tools, and expectations for your first week.", category: "Onboarding", level: "BEGINNER" as const, durationHours: 3, moduleCount: 4 },
    { title: "Customer Support Fundamentals", summary: "Handle tickets, tone, and escalation like a pro.", category: "Support", level: "BEGINNER" as const, durationHours: 6, moduleCount: 6 },
    { title: "Data Handling & Security", summary: "Keep customer data safe and stay compliant.", category: "Compliance", level: "INTERMEDIATE" as const, durationHours: 4, moduleCount: 5 },
    { title: "Advanced Operations Playbook", summary: "Own complex workflows and mentor teammates.", category: "Operations", level: "ADVANCED" as const, durationHours: 8, moduleCount: 8 },
  ];
  for (const c of courses) {
    const exists = await db.trainingCourse.findFirst({ where: { title: c.title } });
    if (!exists) await db.trainingCourse.create({ data: c });
  }

  // Module content for each course (real lessons for the course flow).
  const moduleBlueprint: Record<string, { title: string; content: string }[]> = {
    "New-Hire Orientation": [
      { title: "Welcome & company values", content: "Learn who we are, how we work, and the standards we hold. We put our people and our customers first, communicate openly, and take ownership of outcomes." },
      { title: "Your tools & accounts", content: "Set up your workspace, notifications, and profile. Make sure your contact details are current so payroll and HR can reach you." },
      { title: "Ways of working", content: "Understand our communication norms, response-time expectations, and how we run day-to-day operations across teams." },
      { title: "Getting help", content: "Know where to go when you're stuck: your manager, the support center, and the reports tool for anything that needs escalation." },
    ],
    "Customer Support Fundamentals": [
      { title: "The support mindset", content: "Great support is empathetic, accurate, and fast. Lead with understanding, confirm the problem, and set clear expectations." },
      { title: "Handling a ticket end to end", content: "Triage, reproduce, resolve, and follow up. Document what you did so the next person has full context." },
      { title: "Tone & communication", content: "Write clearly and warmly. Avoid jargon, acknowledge frustration, and always tell the customer the next step." },
      { title: "Escalation & edge cases", content: "Recognize when an issue needs a specialist. Escalate with a clean summary and everything you've already tried." },
      { title: "Quality & consistency", content: "Follow our playbooks so every customer gets the same high standard, and flag gaps you find in the process." },
      { title: "Wrap-up & assessment", content: "Review the key principles and apply them to a few realistic scenarios before you take live tickets." },
    ],
    "Data Handling & Security": [
      { title: "Why security matters", content: "Customer trust depends on how we handle their data. A single mistake can cause real harm — treat every record with care." },
      { title: "Handling sensitive data", content: "Only access what you need for the task at hand. Never copy data to personal devices or share it outside approved tools." },
      { title: "Passwords & access", content: "Use strong, unique credentials and enable multi-factor authentication. Report anything that looks like a phishing attempt." },
      { title: "Incident response", content: "If you suspect a breach or mishandling, report it immediately through the reports tool. Fast reporting limits impact." },
      { title: "Compliance basics", content: "Understand the core rules that govern how we collect, store, and delete data, and your role in staying compliant." },
    ],
    "Advanced Operations Playbook": [
      { title: "Owning complex workflows", content: "Break large problems into clear steps, define ownership, and keep stakeholders informed throughout." },
      { title: "Metrics that matter", content: "Learn the KPIs we track, what good looks like, and how to spot early signs of trouble." },
      { title: "Coaching teammates", content: "Help new hires ramp with clear feedback, pairing, and encouragement. Great operators multiply themselves." },
      { title: "Continuous improvement", content: "Run small experiments, measure the result, and roll out what works. Document changes so the whole team benefits." },
      { title: "Escalation leadership", content: "When things go wrong, stay calm, communicate clearly, and drive to resolution with the right people in the room." },
      { title: "Playbook mastery", content: "Bring it all together and lead a workflow end to end, mentoring others along the way." },
      { title: "Operations capstone", content: "Apply everything to a realistic scenario and reflect on how you'd handle it in production." },
      { title: "Final review", content: "Recap the playbook and confirm you're ready to own operations independently." },
    ],
  };
  for (const [title, mods] of Object.entries(moduleBlueprint)) {
    const c = await db.trainingCourse.findFirst({ where: { title } });
    if (!c) continue;
    const count = await db.trainingModule.count({ where: { courseId: c.id } });
    if (count === 0) {
      await db.trainingModule.createMany({
        data: mods.map((m, i) => ({
          courseId: c.id,
          order: i + 1,
          title: m.title,
          content: m.content,
          durationMins: 12 + i * 3,
        })),
      });
      await db.trainingCourse.update({ where: { id: c.id }, data: { moduleCount: mods.length } });
    }
  }

  // Job placements
  const jobs = [
    { title: "Customer Support Specialist", department: "Operations", location: "Remote", type: "FULL_TIME" as const, description: "Support our customers over chat and email, resolve issues, and keep satisfaction high.", salaryMinCents: 2500_00, salaryMaxCents: 3500_00 },
    { title: "Quality Assurance Reviewer", department: "Quality", location: "Remote", type: "CONTRACT" as const, description: "Review completed work for accuracy and provide structured feedback.", salaryMinCents: 2000_00, salaryMaxCents: 2800_00 },
    { title: "Team Lead — Operations", department: "Operations", location: "Hybrid", type: "FULL_TIME" as const, description: "Lead a small team, own KPIs, and coach new hires through onboarding.", salaryMinCents: 4000_00, salaryMaxCents: 5500_00 },
  ];
  for (const j of jobs) {
    const exists = await db.jobPosting.findFirst({ where: { title: j.title } });
    if (!exists) await db.jobPosting.create({ data: { ...j, status: "OPEN", postedById: admin.id } });
  }

  // Demo: employee applies to a role and has an interview scheduled.
  const firstJob = await db.jobPosting.findFirst({ orderBy: { createdAt: "asc" } });
  if (firstJob) {
    const app = await db.jobApplication.upsert({
      where: { jobId_applicantId: { jobId: firstJob.id, applicantId: employee.id } },
      update: {},
      create: {
        jobId: firstJob.id,
        applicantId: employee.id,
        status: "INTERVIEW",
        coverNote: "Excited about this role — I've been ramping through the bootcamp.",
      },
    });
    const hasInterview = await db.interview.findUnique({ where: { applicationId: app.id } });
    if (!hasInterview) {
      const when = new Date();
      when.setDate(when.getDate() + 2);
      when.setHours(15, 0, 0, 0);
      await db.interview.create({
        data: {
          applicationId: app.id,
          scheduledAt: when,
          durationMins: 30,
          round: "Screening",
          meetingCode: "GTMS-DEMO",
          interviewerId: admin.id,
        },
      });
    }
  }

  // Onboarding documents + retirement plan for the active employee
  const DEFAULT_DOCS = [
    { docType: "government_id", label: "Government-issued photo ID", required: true },
    { docType: "proof_of_address", label: "Proof of address", required: true },
    { docType: "tax_form", label: "Tax form (W-4 or local equivalent)", required: true },
    { docType: "signed_offer", label: "Signed offer letter", required: true },
    { docType: "direct_deposit", label: "Direct deposit authorization", required: false },
  ];
  for (const d of DEFAULT_DOCS) {
    const exists = await db.onboardingDocument.findFirst({ where: { userId: employee.id, docType: d.docType } });
    if (!exists) await db.onboardingDocument.create({ data: { ...d, userId: employee.id } });
  }
  const hasPlan = await db.retirementPlan.findUnique({ where: { userId: employee.id } });
  if (!hasPlan) {
    await db.retirementPlan.create({
      data: { userId: employee.id, enrolled: true, contributionPct: 6, employerMatchPct: 4, balanceCents: 1250_00 },
    });
  }

  console.log("Seeded HR demo content: courses, job placements, onboarding docs.");
  console.log("Seeded users:");
  console.log("  admin@gtms.local / admin12345 (ADMIN / HR)");
  console.log("  employee@gtms.local / employee12345 (EMPLOYED, $2000 salary)");
  console.log("  prospect@gtms.local / prospect12345 (awaiting onboarding)");
  console.log({ admin: admin.id, employee: employee.id, prospect: prospect.id });
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
