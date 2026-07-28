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
