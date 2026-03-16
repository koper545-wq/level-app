import { createClient } from "@/lib/supabase/client";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

async function getValidToken(userId: string): Promise<string | null> {
  const supabase = createClient();
  const { data: user } = await supabase
    .from("users")
    .select("google_calendar_token, google_calendar_refresh")
    .eq("id", userId)
    .single();

  if (!user?.google_calendar_token) return null;

  // Try current token
  const testResponse = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary",
    { headers: { Authorization: `Bearer ${user.google_calendar_token}` } }
  );

  if (testResponse.ok) return user.google_calendar_token;

  // Refresh if we have a refresh token
  if (!user.google_calendar_refresh) return null;

  const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: user.google_calendar_refresh,
      grant_type: "refresh_token",
    }),
  });

  const tokens = await refreshResponse.json();
  if (!tokens.access_token) return null;

  // Save new token
  await supabase
    .from("users")
    .update({ google_calendar_token: tokens.access_token })
    .eq("id", userId);

  return tokens.access_token;
}

export async function syncTaskToCalendar(
  userId: string,
  task: { title: string; scheduled_date: string | null; id: string }
): Promise<boolean> {
  if (!task.scheduled_date) return false;

  const token = await getValidToken(userId);
  if (!token) return false;

  const event = {
    summary: `[LEVEL] ${task.title}`,
    start: { date: task.scheduled_date },
    end: { date: task.scheduled_date },
    description: `Task from LEVEL app (ID: ${task.id})`,
  };

  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  return response.ok;
}

export async function isCalendarConnected(userId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("google_calendar_token")
    .eq("id", userId)
    .single();

  return !!data?.google_calendar_token;
}

export async function disconnectCalendar(userId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("users")
    .update({
      google_calendar_token: null,
      google_calendar_refresh: null,
    })
    .eq("id", userId);
}
