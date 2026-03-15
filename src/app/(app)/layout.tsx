import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Header } from "@/components/ui/header";
import { StoreInitializer } from "@/components/ui/store-initializer";

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
  const [
    { data: profile },
    { data: areas },
    { data: tasks },
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("areas").select("*").eq("user_id", user.id).order("sort_order"),
    supabase
      .from("tasks")
      .select("*, area:areas(*)")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("sort_order"),
  ]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <StoreInitializer
        user={profile}
        areas={areas ?? []}
        tasks={tasks ?? []}
      />
      <div className="max-w-content mx-auto px-4 md:px-8">
        <Header />
        <main>{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
