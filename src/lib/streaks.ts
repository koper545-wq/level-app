import { createClient } from "@/lib/supabase/client";

export async function checkAndUpdateStreak(userId: string): Promise<{
  newStreak: number;
  shieldUsed: boolean;
  milestone: number | null;
}> {
  const supabase = createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get user data
  const { data: user } = await supabase
    .from("users")
    .select("streak_current, streak_shields, last_active_date")
    .eq("id", userId)
    .single();

  if (!user) return { newStreak: 0, shieldUsed: false, milestone: null };

  const lastActive = user.last_active_date;
  let newStreak = user.streak_current;
  let shieldUsed = false;

  if (lastActive === today) {
    // Already active today, no change
    return { newStreak, shieldUsed: false, milestone: null };
  }

  if (lastActive) {
    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day
      newStreak += 1;
    } else if (diffDays === 2 && user.streak_shields > 0) {
      // Missed one day, use shield
      newStreak += 1;
      shieldUsed = true;

      await supabase
        .from("users")
        .update({ streak_shields: user.streak_shields - 1 })
        .eq("id", userId);

      // Log shield usage for the missed day
      const missedDate = new Date(lastDate);
      missedDate.setDate(missedDate.getDate() + 1);
      await supabase.from("streak_log").upsert({
        user_id: userId,
        date: missedDate.toISOString().split("T")[0],
        was_active: false,
        shield_used: true,
      });
    } else if (diffDays > 1) {
      // Streak broken
      newStreak = 1;
    }
  } else {
    // First ever activity
    newStreak = 1;
  }

  // Log today
  await supabase.from("streak_log").upsert({
    user_id: userId,
    date: today,
    was_active: true,
    shield_used: false,
  });

  // Update user
  await supabase
    .from("users")
    .update({
      streak_current: newStreak,
      streak_longest: Math.max(newStreak, user.streak_current),
      last_active_date: today,
    })
    .eq("id", userId);

  // Check milestone
  const MILESTONES = [3, 7, 14, 30, 100];
  const milestone = MILESTONES.includes(newStreak) ? newStreak : null;

  return { newStreak, shieldUsed, milestone };
}

export function resetShieldsIfMonday() {
  const today = new Date();
  if (today.getDay() === 1) {
    // Monday — shields reset handled via cron or on-login check
    return true;
  }
  return false;
}
