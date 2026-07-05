import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 1. GET: Fetch the budget for a specific user and month
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  if (!month) {
    return NextResponse.json({ error: "Month parameter is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", month)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 2. POST: Set or overwrite a budget for a specific month
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const amount = Number(body.amount);
  const month = String(body.month ?? "").trim();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }
  if (!month) {
    return NextResponse.json({ error: "Month is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("budgets")
    .upsert({ user_id: user.id, amount, month }, { onConflict: "user_id,month" })
    .select()
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
