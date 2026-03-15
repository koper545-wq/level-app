import { HorizonsView } from "@/components/horizons/horizons-view";
import { createClient } from "@/lib/supabase/server";

export default async function HorizonsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: goals } = await supabase
    .from("goals")
    .select("*, area:areas(*)")
    .eq("user_id", user!.id)
    .eq("status", "active")
    .order("is_boss", { ascending: false });

  return <HorizonsView initialGoals={goals ?? []} />;
}
