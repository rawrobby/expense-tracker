import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 1. DELETE Endpoint
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// 2. PATCH Endpoint
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const amount = Number(body.amount);
  const category = String(body.category ?? "").trim();
  const date = String(body.date ?? "");

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

// DIAGNOSTIC CHECK: Can we even read this expense row?
  const { data: testData, error: testError } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id);

  console.log("--- DEBUGGING EDIT FLOW ---");
  console.log("Expense ID from URL params:", id);
  console.log("Logged-in User ID:", user.id);
  console.log("Found rows in DB:", testData);
  if (testError) console.log("DB Select Error:", testError.message);
  console.log("---------------------------");

  // 1. Run a generic update filtering ONLY by row ID
  const { data, error } = await supabase
    .from("expenses")
    .update({ amount, category, date })
    .eq("id", id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Check if an item was actually updated
  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Expense not found or you do not have permission to edit it" },
      { status: 444 }
    );
  }

  // 3. Return the updated row item safely
  return NextResponse.json(data ? data[0] : null);
}