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
