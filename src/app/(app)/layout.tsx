import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Header } from "@/components/ui/header";
import { StoreInitializer } from "@/components/ui/store-initializer";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";
import { InstallPrompt } from "@/components/ui/install-prompt";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial data for stores
  const today = new Date().toISOString().split("T")[0];

  const [
    { data: profile },
    { data: areas },
    { data: tasks },
    { data: goals },
    { data: habits },
    { data: habitLog },
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("areas").select("*").eq("user_id", user.id).order("sort_order"),
    supabase
      .from("tasks")
      .select("*, area:areas(*), subtasks(*)")
      .eq("user_id", user.id)
      .in("status", ["pending", "done"])
      .order("sort_order"),
    supabase
      .from("goals")
      .select("*, area:areas(*)")
      .eq("user_id", user.id)
      .eq("status", "active"),
    supabase
      .from("habits")
      .select("*, area:areas(*)")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("habit_log")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today),
  ]);

  const needsOnboarding = profile && !profile.onboarding_completed;

  return (
    <div className="min-h-screen bg-background pb-28">
      <StoreInitializer
        user={profile}
        areas={areas ?? []}
        tasks={tasks ?? []}
        goals={goals ?? []}
        habits={habits ?? []}
        habitLog={habitLog ?? []}
      />

      {needsOnboarding ? (
        <OnboardingGate />
      ) : (
        <>
          <div className="max-w-content mx-auto px-4 md:px-8">
            <Header />
            <main>{children}</main>
          </div>
          <BottomNav />
          <InstallPrompt />
        </>
      )}
    </div>
  );
}
