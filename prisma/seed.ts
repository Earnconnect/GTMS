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

  // Job placements — realistic openings across every role family on the platform.
  const jobs = [
    // Customer Support
    { title: "Customer Support Specialist", department: "Operations", location: "Remote", type: "FULL_TIME" as const, description: "Support our customers over chat and email, resolve issues, and keep satisfaction high.", responsibilities: "Own a daily ticket queue, hit response-time and CSAT targets, escalate complex issues, and contribute to the help center.", salaryMinCents: 2500_00, salaryMaxCents: 3500_00 },
    { title: "Senior Customer Support Specialist", department: "Operations", location: "Remote", type: "FULL_TIME" as const, description: "Handle escalations, mentor newer agents, and improve support playbooks.", responsibilities: "Resolve escalated tickets, run QA on peers, maintain macros and playbooks, and report weekly trends.", salaryMinCents: 3500_00, salaryMaxCents: 4800_00 },
    { title: "Live Chat Support Agent", department: "Operations", location: "Remote", type: "PART_TIME" as const, description: "Cover the live chat queue and deliver fast, friendly first responses.", responsibilities: "Keep first-response time under 2 minutes, resolve or route chats, and flag recurring problems.", salaryMinCents: 1600_00, salaryMaxCents: 2200_00 },
    { title: "Customer Success Associate", department: "Growth", location: "Hybrid", type: "FULL_TIME" as const, description: "Onboard new customers, drive adoption, and reduce churn.", responsibilities: "Run onboarding calls, monitor account health, surface upsell signals, and own renewals for a book of accounts.", salaryMinCents: 3200_00, salaryMaxCents: 4500_00 },
    // Quality Assurance
    { title: "Quality Assurance Reviewer", department: "Quality", location: "Remote", type: "CONTRACT" as const, description: "Review completed work for accuracy and provide structured feedback.", responsibilities: "Score work against the QA rubric, flag misses with clear reasons, and summarize improvement themes.", salaryMinCents: 2000_00, salaryMaxCents: 2800_00 },
    { title: "QA Analyst", department: "Quality", location: "Remote", type: "FULL_TIME" as const, description: "Run calibration, track quality metrics, and coach teams to a higher bar.", responsibilities: "Sample work across teams, apply the rubric consistently, compile calibration reports, and recommend coaching.", salaryMinCents: 3000_00, salaryMaxCents: 4200_00 },
    // Operations
    { title: "Team Lead — Operations", department: "Operations", location: "Hybrid", type: "FULL_TIME" as const, description: "Lead a small team, own KPIs, and coach new hires through onboarding.", responsibilities: "Own team KPIs, run stand-ups, coach new hires, and remove blockers day to day.", salaryMinCents: 4000_00, salaryMaxCents: 5500_00 },
    { title: "Operations Associate", department: "Operations", location: "Remote", type: "FULL_TIME" as const, description: "Keep daily operations running smoothly across systems and queues.", responsibilities: "Run daily checklists, process verifications, reconcile reports, and escalate anomalies.", salaryMinCents: 2400_00, salaryMaxCents: 3200_00 },
    { title: "Operations Coordinator", department: "Operations", location: "Remote", type: "CONTRACT" as const, description: "Coordinate schedules, vendors, and cross-team handoffs.", responsibilities: "Manage schedules, track vendor deliverables, and keep process documentation current.", salaryMinCents: 2200_00, salaryMaxCents: 3000_00 },
    // Data
    { title: "Data Entry Specialist", department: "Data", location: "Remote", type: "FULL_TIME" as const, description: "Enter, verify, and standardize data with a high accuracy bar.", responsibilities: "Enter and validate records, deduplicate, and maintain 99%+ accuracy against source documents.", salaryMinCents: 1800_00, salaryMaxCents: 2500_00 },
    { title: "Data Labeling Associate", department: "Data", location: "Remote", type: "CONTRACT" as const, description: "Label images and text to a taxonomy for our data pipelines.", responsibilities: "Apply labels per the taxonomy, skip ambiguous items with notes, and keep accuracy above the QA bar.", salaryMinCents: 1700_00, salaryMaxCents: 2400_00 },
    { title: "Data Analyst", department: "Data", location: "Hybrid", type: "FULL_TIME" as const, description: "Turn operational data into dashboards and insights.", responsibilities: "Build and maintain dashboards, run ad-hoc analyses, and present findings to team leads.", salaryMinCents: 3800_00, salaryMaxCents: 5200_00 },
    // Sales / Growth
    { title: "Sales Development Representative", department: "Growth", location: "Remote", type: "FULL_TIME" as const, description: "Prospect, qualify, and book demos for the sales team.", responsibilities: "Work outbound and warm leads, personalize outreach, log activity in the CRM, and hit meeting targets.", salaryMinCents: 2600_00, salaryMaxCents: 3800_00 },
    { title: "Account Executive", department: "Growth", location: "Hybrid", type: "FULL_TIME" as const, description: "Own the full sales cycle from qualified lead to close.", responsibilities: "Run discovery and demos, manage pipeline, negotiate, and close against a quota.", salaryMinCents: 4500_00, salaryMaxCents: 7000_00 },
    // Content / Marketing
    { title: "Content Writer", department: "Marketing", location: "Remote", type: "CONTRACT" as const, description: "Write clear, on-brand articles and help-center content.", responsibilities: "Draft blog posts and FAQs from briefs, match our voice, and revise from editorial feedback.", salaryMinCents: 2200_00, salaryMaxCents: 3400_00 },
    { title: "Social Media Coordinator", department: "Marketing", location: "Remote", type: "PART_TIME" as const, description: "Plan, schedule, and engage across our social channels.", responsibilities: "Build the content calendar, schedule posts, respond to comments, and report on engagement.", salaryMinCents: 1800_00, salaryMaxCents: 2600_00 },
    // People / General
    { title: "Recruiting Coordinator", department: "People", location: "Remote", type: "FULL_TIME" as const, description: "Keep hiring moving — scheduling, candidate comms, and pipeline hygiene.", responsibilities: "Coordinate interviews, keep candidates informed, and maintain the applicant pipeline.", salaryMinCents: 2600_00, salaryMaxCents: 3600_00 },
    { title: "Onboarding Specialist", department: "People", location: "Hybrid", type: "FULL_TIME" as const, description: "Give every new hire a smooth first 30 days.", responsibilities: "Run orientation, verify documents, set up accounts, and track onboarding to completion.", salaryMinCents: 2800_00, salaryMaxCents: 3800_00 },
    { title: "Customer Support Intern", department: "Operations", location: "Remote", type: "INTERNSHIP" as const, description: "Learn the ropes of support while helping real customers.", responsibilities: "Shadow senior agents, handle starter tickets, and complete the support bootcamp.", salaryMinCents: 1200_00, salaryMaxCents: 1600_00 },
    // Technical & IT
    { title: "Technical Support Engineer", department: "Support", location: "Remote", type: "FULL_TIME" as const, description: "Troubleshoot technical issues and work closely with engineering.", responsibilities: "Diagnose bugs, reproduce issues, write clear tickets for engineering, and keep customers updated.", salaryMinCents: 3800_00, salaryMaxCents: 5500_00 },
    { title: "IT Helpdesk Technician", department: "IT", location: "Hybrid", type: "FULL_TIME" as const, description: "Keep the team productive by resolving internal IT requests.", responsibilities: "Handle access requests, set up accounts and devices, and resolve helpdesk tickets to SLA.", salaryMinCents: 2600_00, salaryMaxCents: 3600_00 },
    { title: "Junior Software Developer", department: "Engineering", location: "Remote", type: "FULL_TIME" as const, description: "Build and maintain internal tools alongside a senior team.", responsibilities: "Ship small features, fix bugs, write tests, and participate in code review.", salaryMinCents: 4500_00, salaryMaxCents: 6500_00 },
    { title: "QA Automation Tester", department: "Engineering", location: "Remote", type: "CONTRACT" as const, description: "Write and maintain automated tests for our web apps.", responsibilities: "Author end-to-end tests, triage failures, and report coverage to the team.", salaryMinCents: 3500_00, salaryMaxCents: 5000_00 },
    // Finance
    { title: "Payroll Specialist", department: "Finance", location: "Remote", type: "FULL_TIME" as const, description: "Run accurate, on-time payroll for our growing team.", responsibilities: "Process pay runs, resolve discrepancies, maintain records, and answer employee pay questions.", salaryMinCents: 3200_00, salaryMaxCents: 4400_00 },
    { title: "Accounts Payable Clerk", department: "Finance", location: "Remote", type: "FULL_TIME" as const, description: "Own invoices and vendor payments end to end.", responsibilities: "Process invoices, reconcile statements, and keep the AP ledger clean.", salaryMinCents: 2400_00, salaryMaxCents: 3200_00 },
    { title: "Bookkeeper", department: "Finance", location: "Remote", type: "PART_TIME" as const, description: "Keep the books tidy and month-end on schedule.", responsibilities: "Categorize transactions, reconcile accounts, and prep month-end reports.", salaryMinCents: 2000_00, salaryMaxCents: 3000_00 },
    { title: "Risk & Fraud Analyst", department: "Risk", location: "Remote", type: "FULL_TIME" as const, description: "Protect the platform by spotting and stopping fraud.", responsibilities: "Review flagged activity, investigate patterns, and tune detection rules.", salaryMinCents: 3600_00, salaryMaxCents: 5200_00 },
    { title: "Compliance Associate", department: "Risk", location: "Hybrid", type: "FULL_TIME" as const, description: "Help keep the company on the right side of regulations.", responsibilities: "Run KYC reviews, maintain compliance records, and support audits.", salaryMinCents: 3000_00, salaryMaxCents: 4200_00 },
    // Content & Design
    { title: "Content Moderator", department: "Trust & Safety", location: "Remote", type: "FULL_TIME" as const, description: "Keep the community safe by reviewing reported content.", responsibilities: "Review reports against policy, action violations, and escalate edge cases.", salaryMinCents: 2000_00, salaryMaxCents: 2800_00 },
    { title: "Graphic Designer", department: "Marketing", location: "Remote", type: "CONTRACT" as const, description: "Create on-brand visuals for web, social, and product.", responsibilities: "Design assets from briefs, maintain the brand kit, and iterate from feedback.", salaryMinCents: 2800_00, salaryMaxCents: 4200_00 },
    { title: "Email Marketing Specialist", department: "Marketing", location: "Remote", type: "FULL_TIME" as const, description: "Own lifecycle email and drive engagement.", responsibilities: "Build campaigns, segment audiences, run A/B tests, and report on performance.", salaryMinCents: 2800_00, salaryMaxCents: 4000_00 },
    // People / Admin
    { title: "HR Generalist", department: "People", location: "Hybrid", type: "FULL_TIME" as const, description: "Support the team across the full employee lifecycle.", responsibilities: "Handle HR queries, maintain records, and support onboarding and offboarding.", salaryMinCents: 3200_00, salaryMaxCents: 4600_00 },
    { title: "Learning & Development Specialist", department: "People", location: "Remote", type: "FULL_TIME" as const, description: "Design and run training that levels up the team.", responsibilities: "Build course content, run bootcamps, and measure learning outcomes.", salaryMinCents: 3400_00, salaryMaxCents: 4800_00 },
    { title: "Executive Assistant", department: "People", location: "Remote", type: "FULL_TIME" as const, description: "Keep leadership organized and effective.", responsibilities: "Manage calendars, coordinate travel, and prep briefings and notes.", salaryMinCents: 3000_00, salaryMaxCents: 4400_00 },
    { title: "Virtual Assistant", department: "Operations", location: "Remote", type: "PART_TIME" as const, description: "Provide flexible admin support across teams.", responsibilities: "Handle scheduling, data entry, research, and inbox management.", salaryMinCents: 1600_00, salaryMaxCents: 2400_00 },
    { title: "Dispatch Coordinator", department: "Logistics", location: "On-site", type: "FULL_TIME" as const, description: "Coordinate drivers and deliveries to keep things moving.", responsibilities: "Assign routes, track deliveries, and resolve issues in real time.", salaryMinCents: 2400_00, salaryMaxCents: 3400_00 },
    { title: "Inventory Associate", department: "Logistics", location: "On-site", type: "FULL_TIME" as const, description: "Keep inventory accurate and orders flowing.", responsibilities: "Receive stock, run counts, and reconcile discrepancies.", salaryMinCents: 2000_00, salaryMaxCents: 2800_00 },
  ];
  for (const j of jobs) {
    const exists = await db.jobPosting.findFirst({ where: { title: j.title } });
    if (!exists) await db.jobPosting.create({ data: { ...j, status: "OPEN", postedById: admin.id } });
  }

  // Realistic assignment catalog — ready-made work tagged by role/job family.
  const templates: {
    title: string;
    brief: string;
    role: string;
    department: string;
    estimatedHours: number;
    difficulty: string;
  }[] = [
    // Customer Support
    { role: "Customer Support", department: "Operations", difficulty: "Easy", estimatedHours: 4, title: "Clear the inbound support queue", brief: "Work through the 15 oldest open tickets in the inbound queue. Respond in a warm, clear tone, resolve what you can, and escalate anything that needs a specialist with a clean summary. Log the outcome on each ticket." },
    { role: "Customer Support", department: "Operations", difficulty: "Medium", estimatedHours: 5, title: "Resolve the escalations backlog", brief: "Review the 8 escalated tickets assigned to you. Reproduce the issue, coordinate with the right team, and drive each to resolution. Post a short root-cause note on every ticket you close." },
    { role: "Customer Support", department: "Operations", difficulty: "Easy", estimatedHours: 3, title: "Refresh 5 help-center articles", brief: "Using themes from recent tickets, update or draft 5 help-center FAQ articles. Keep them concise, accurate, and skimmable. Submit the links to the updated articles." },
    { role: "Customer Support", department: "Operations", difficulty: "Medium", estimatedHours: 4, title: "Live chat coverage — 4-hour shift", brief: "Cover the live chat queue for a 4-hour block. Keep first-response time under 2 minutes, resolve or route each chat, and note any recurring problems you spot for the team." },
    // Quality Assurance
    { role: "Quality Assurance", department: "Quality", difficulty: "Medium", estimatedHours: 4, title: "Audit 20 resolved tickets", brief: "Score 20 recently resolved tickets against the QA rubric (accuracy, tone, resolution). Flag any that miss the bar with a specific reason, and summarize the top 3 improvement themes." },
    { role: "Quality Assurance", department: "Quality", difficulty: "Hard", estimatedHours: 6, title: "Weekly QA calibration report", brief: "Sample resolved work across the team, apply the rubric consistently, and compile a calibration report with scores, examples, and coaching recommendations. Submit the report." },
    // Operations
    { role: "Operations", department: "Operations", difficulty: "Easy", estimatedHours: 2, title: "Complete the daily operations checklist", brief: "Run the opening operations checklist across all systems: confirm queues are healthy, integrations are green, and overnight jobs succeeded. Note and escalate any anomalies." },
    { role: "Operations", department: "Operations", difficulty: "Medium", estimatedHours: 4, title: "Reconcile the weekly vendor report", brief: "Reconcile this week's vendor report against internal records. Identify discrepancies, document each with evidence, and propose corrections. Submit a summary of what you found." },
    { role: "Operations", department: "Operations", difficulty: "Medium", estimatedHours: 5, title: "Process 30 order verifications", brief: "Review and verify 30 pending orders against our checklist (details, eligibility, flags). Approve the clean ones, hold the exceptions with a reason, and summarize the batch." },
    // Data
    { role: "Data", department: "Data", difficulty: "Easy", estimatedHours: 3, title: "Label 100 product images", brief: "Categorize 100 product images per the labeling taxonomy. Apply the closest category and main-object label, skip anything unclear with a note, and keep accuracy above the 95% bar." },
    { role: "Data", department: "Data", difficulty: "Medium", estimatedHours: 4, title: "Clean the contacts dataset", brief: "Deduplicate and standardize the contacts dataset: normalize names, fix formatting, merge duplicates, and drop invalid rows. Submit a before/after record count and notes on your rules." },
    // Sales / CRM
    { role: "Sales", department: "Growth", difficulty: "Medium", estimatedHours: 4, title: "Follow up with 25 warm leads", brief: "Reach out to 25 warm leads in the CRM using the approved outreach template. Personalize the first line, log every touch, and book demos where there's interest. Report replies and meetings booked." },
    // Content
    { role: "Content", department: "Marketing", difficulty: "Medium", estimatedHours: 5, title: "Draft 3 blog posts from the content brief", brief: "Write 3 short blog posts (500–700 words) from the provided briefs. Match our voice, include a clear takeaway, and add suggested titles. Submit the drafts for editorial review." },
    // General / onboarding
    { role: "General", department: "People", difficulty: "Easy", estimatedHours: 2, title: "Complete your onboarding checklist", brief: "Finish every step in your onboarding: verify documents, set up your tools, and complete New-Hire Orientation. Submit a note confirming each item is done." },
    { role: "General", department: "People", difficulty: "Easy", estimatedHours: 3, title: "Shadow a senior teammate", brief: "Shadow a senior teammate for a session, take notes on how they handle real work, and write a short reflection on 3 things you learned and 1 question you still have." },
    { role: "General", department: "People", difficulty: "Medium", estimatedHours: 4, title: "Write your 30-day plan", brief: "Draft your first 30-day plan: goals, the skills you'll build, and how you'll measure progress. Keep it concrete and submit it for your manager's feedback." },
  ];
  for (const t of templates) {
    const exists = await db.assignmentTemplate.findFirst({ where: { title: t.title } });
    if (!exists) await db.assignmentTemplate.create({ data: t });
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

  // Demo: a work assignment the employee can start doing.
  const hasAssignment = await db.jobAssignment.findFirst({ where: { employeeId: employee.id } });
  if (!hasAssignment) {
    await db.jobAssignment.create({
      data: {
        employeeId: employee.id,
        jobId: firstJob?.id ?? null,
        title: "Onboarding task — clear your first support queue",
        brief:
          "Work through 10 sample support tickets in the practice queue. Respond with the right tone, resolve or escalate each one, and note anything unclear. When you're done, submit a short summary of how it went.",
        assignedById: admin.id,
      },
    });
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
  const hasMethod = await db.withdrawalMethod.findUnique({ where: { userId: employee.id } });
  if (!hasMethod) {
    await db.withdrawalMethod.create({
      data: {
        userId: employee.id,
        type: "BANK",
        accountName: "Wanda Employee",
        institution: "First National Bank",
        accountLast4: "4291",
        country: "United States",
        currency: "USD",
      },
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
