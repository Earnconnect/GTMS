import { db } from "@/server/db";
import { getOrCreateWallet, getSystemWallet, postTransaction, WalletError } from "./wallet.service";
import { notify } from "./notification.service";

/**
 * Manual salary payment (recruiting platform).
 *
 * An admin/HR user credits an employee's wallet by the given amount. The funds
 * come out of the company/system wallet, which is allowed to run negative in
 * simulated mode (it represents the employer, not a customer deposit).
 *
 * GUARDRAIL: money only ever flows company -> employee. There is no path for an
 * employee to pay in; SALARY is a pure credit to the employee wallet.
 */
export async function paySalary(opts: {
  adminId: string;
  employeeId: string;
  amountCents: number;
  note?: string;
}) {
  const { adminId, employeeId, amountCents, note } = opts;

  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new WalletError("Salary amount must be a positive whole number of cents.");
  }

  const employee = await db.user.findUnique({
    where: { id: employeeId },
    select: { id: true, name: true, email: true, employmentStatus: true, status: true },
  });
  if (!employee) throw new WalletError("Employee not found.");
  if (employee.employmentStatus === "TERMINATED" || employee.employmentStatus === null) {
    throw new WalletError("This person is not an active employee.");
  }
  if (employee.status === "BANNED") {
    throw new WalletError("Cannot pay a banned account.");
  }

  const companyWallet = await getSystemWallet();
  const employeeWallet = await getOrCreateWallet(employeeId);
  const description = note?.trim() || "Salary payment";

  return db.$transaction(async (tx) => {
    // Debit the company wallet (may go negative — it is the employer's account).
    await postTransaction(tx, {
      walletId: companyWallet.id,
      type: "SALARY",
      amount: -amountCents,
      allowNegative: true,
      refType: "SALARY",
      refId: employeeId,
      description: `Salary paid to ${employee.name ?? employee.email}`,
    });

    // Credit the employee.
    const credit = await postTransaction(tx, {
      walletId: employeeWallet.id,
      type: "SALARY",
      amount: amountCents,
      refType: "SALARY",
      refId: adminId,
      description,
    });

    await notify(employeeId, "SYSTEM", "You were paid", {
      body: `${description}: ${(amountCents / 100).toFixed(2)} was added to your wallet.`,
      link: "/wallet",
      tx,
    });

    return credit;
  });
}

/** Recent salary payments credited to an employee (for their pay history). */
export async function listSalaryPayments(employeeId: string, limit = 50) {
  const wallet = await db.walletAccount.findUnique({ where: { userId: employeeId } });
  if (!wallet) return [];
  return db.transaction.findMany({
    where: { walletId: wallet.id, type: "SALARY", amount: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
