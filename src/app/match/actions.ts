"use server";

import { createClient } from "@/lib/supabase/server";

export async function tryFinalizeMatch(itemAId: string, itemBId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_match_if_mutual", {
    p_item_a_id: itemAId,
    p_item_b_id: itemBId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as string | null;
}
