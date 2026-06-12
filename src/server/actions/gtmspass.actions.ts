"use server";

import { requireWorker } from "@/server/rbac";
import { purchaseGtmsPass } from "@/server/services/gtmspass.service";
import { revalidatePath } from "next/cache";

export async function purchaseGtmsPassAction(): Promise<{ error?: string }> {
  try {
    const user = await requireWorker();
    await purchaseGtmsPass(user.id);
    revalidatePath("/browse");
    revalidatePath("/dashboard/pass");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to purchase GTMS Pass" };
  }
}
