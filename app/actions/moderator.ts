'use server'

import { requireAdmin } from "@/lib/admin";
import { toggleGameVisibility } from "@/lib/redis";
import { revalidatePath } from "next/cache";

export async function toggleGameHidden(gameId: string) {
    await requireAdmin();

    await toggleGameVisibility(gameId);
    revalidatePath('/dashboard/moderator');
    revalidatePath('/dashboard/games');
}
