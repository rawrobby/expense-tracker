import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "./dashboard";
export default function Home() {
  return HomeAsync();
}
async function HomeAsync() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }
  return <Dashboard userEmail={user.email ?? ""} />;
}
