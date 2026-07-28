import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/**
 * Promote an existing account to ADMIN from the CLI.
 *
 * `setUserRoleAction` requires a caller who is already an ADMIN, so this is the
 * bootstrap path when no admin exists yet (or you have been locked out).
 *
 *   npx tsx scripts/promote-admin.ts someone@example.com
 */
async function main() {
  const email = (process.argv[2] ?? "").trim().toLowerCase();
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  if (!user) {
    console.error(`No account found for ${email}.`);
    const recent = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { email: true, role: true },
    });
    console.error("Most recent accounts in this database:");
    for (const u of recent) console.error(`  ${u.email} (${u.role})`);
    process.exit(1);
  }

  console.log("Before:", user);

  const updated = await db.user.update({
    where: { id: user.id },
    data: { role: "ADMIN", status: "ACTIVE" },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  // Mirror setUserRoleAction: every role change guarantees a wallet exists.
  const wallet = await db.walletAccount.findUnique({ where: { userId: user.id } });
  if (!wallet) {
    await db.walletAccount.create({ data: { userId: user.id } });
    console.log("Created a wallet for this user.");
  }

  console.log("After: ", updated);
  console.log("\nSign out and sign back in — the JWT caches your role.");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
