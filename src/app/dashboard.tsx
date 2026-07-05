"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
type Expense = { id: string; date: string; amount: number; category: string };
const CATEGORIES = ["food", "transport", "housing", "fun", "health", "other"];
export default function Dashboard({ userEmail }: { userEmail: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [budgetInput, setBudgetInput] = useState(""); // For a form to set the budget
  const router = useRouter();
  const supabase = createClient();
useEffect(() => {
  // Fetch expenses
  fetch("/api/expenses")
    .then((res) => res.json())
    .then((data) => {
      setExpenses(data);
      setLoading(false);
    });

  // Fetch the current month's budget
  const currentMonth = new Date().toISOString().slice(0, 7);
  fetch(`/api/budget?month=${currentMonth}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.amount) {
        setBudget(Number(data.amount));
      }
    });
}, []);
  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, category, date }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setExpenses([data, ...expenses]);
    setAmount("");
  }
  async function deleteExpense(id: string) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setExpenses(expenses.filter((e) => e.id !== id));
  }
  async function updateExpense(e: React.FormEvent) {
  e.preventDefault();
  if (!editingExpense) return;

  const res = await fetch(`/api/expenses/${editingExpense.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: editingExpense.amount,
      category: editingExpense.category,
      date: editingExpense.date,
    }),
  });

  const updatedData = await res.json();

  if (!res.ok) {
    setError(updatedData.error || "Failed to update expense");
    return;
  }

  setExpenses(expenses.map((item) => (item.id === editingExpense.id ? updatedData : item)));
  setEditingExpense(null);
}
  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  const thisMonth = new Date().toISOString().slice(0, 7);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(thisMonth));
  const monthTotal = monthExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0,
  );
  const byCategory: Record<string, number> = {};
  for (const e of monthExpenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount);
  }
  return (
    <main className="mx-auto max-w-2xl p-6">
      {" "}
      <div className="mb-8 flex items-center justify-between">
        {" "}
        <h1 className="text-2xl font-bold">My Expenses</h1>{" "}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          {" "}
          <span>{userEmail}</span>{" "}
          <button
            onClick={logout}
            className="rounded-lg border px-3 py-1 hover:bg-gray-50"
          >
            {" "}
            Log out{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <div className="mb-8 rounded-xl bg-green-700 p-6 text-white">
        {" "}
        <p className="text-sm opacity-80">Spent this month</p>{" "}
        <p className="text-4xl font-bold">${monthTotal.toFixed(2)}</p>{" "}
        <div className="mt-4 flex flex-wrap gap-2">
          {" "}
          {Object.entries(byCategory).map(([cat, total]) => (
            <span
              key={cat}
              className="rounded-full bg-white/20 px-3 py-1 text-sm"
            >
              {" "}
              {cat}: ${total.toFixed(2)}{" "}
            </span>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      <form
        onSubmit={addExpense}
        className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border p-4"
      >
        {" "}
        <div>
          {" "}
          <label className="mb-1 block text-sm font-medium">
            Amount ($)
          </label>{" "}
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-28 rounded-lg border px-3 py-2"
            placeholder="12.50"
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="mb-1 block text-sm font-medium">
            Category
          </label>{" "}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-36 rounded-lg border px-3 py-2 bg-white"
          >
            {" "}
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {" "}
                {c}{" "}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="mb-1 block text-sm font-medium">Date</label>{" "}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-40 rounded-lg border px-3 py-2"
          />{" "}
        </div>{" "}
        <button
          type="submit"
          className="rounded-lg bg-green-700 px-5 py-2 font-medium text-white hover:bg-green-800"
        >
          {" "}
          Add{" "}
        </button>{" "}
        {error && <p className="w-full text-sm text-red-600">{error}</p>}{" "}
      </form>{" "}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : expenses.length === 0 ? (
        <p className="text-gray-500">
          No expenses yet. Add your first one above.
        </p>
      ) : (
        <ul className="divide-y rounded-xl border">
          {" "}
          {expenses.map((e) => {
            const isEditing = editingExpense?.id === e.id;

            return (
              <li key={e.id} className="p-4 border-b last:border-0">
                {isEditing ? (
                  /* 🛠️ EDITING ROW FORM VIEW */
                  <form onSubmit={updateExpense} className="flex flex-wrap items-end gap-3 w-full">
                    <div className="flex-1 min-w-25">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingExpense.amount}
                        onChange={(evt) => setEditingExpense({ ...editingExpense, amount: Number(evt.target.value) })}
                        className="w-full rounded-lg border px-2 py-1 text-sm bg-white text-black"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Category</label>
                      <select
                        value={editingExpense.category}
                        onChange={(evt) => setEditingExpense({ ...editingExpense, category: evt.target.value })}
                        className="rounded-lg border px-2 py-1 text-sm bg-white text-black"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Date</label>
                      <input
                        type="date"
                        value={editingExpense.date}
                        onChange={(evt) => setEditingExpense({ ...editingExpense, date: evt.target.value })}
                        className="rounded-lg border px-2 py-1 text-sm bg-white text-black"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pb-1 h-8.5 items-center">
                      <button type="submit" className="text-sm font-semibold text-green-700 hover:text-green-800 hover:underline">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingExpense(null)} className="text-sm text-gray-400 hover:text-gray-600 hover:underline">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* 📝 NORMAL ROW DISPLAY VIEW */
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <p className="font-medium capitalize text-black">{e.category}</p>
                      <p className="text-sm text-gray-500">{e.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-black">${Number(e.amount).toFixed(2)}</p>
                      <button
                        onClick={() => setEditingExpense(e)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="text-sm text-gray-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}{" "}
    </main>
  );
}
