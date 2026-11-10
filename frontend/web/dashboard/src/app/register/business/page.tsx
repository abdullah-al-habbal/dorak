import type { Metadata } from "next";
import { connection } from "next/server";

import { RegisterBusinessScreen } from "@/components/register/register-business-screen";
import { fetchPublicCurrencies } from "@/services/api/public/public-currencies";

export const metadata: Metadata = { title: "Register your business" };

/** Public, outside the guarded `/dashboard` tree: nobody is signed in yet. */
export default async function RegisterBusinessPage() {
  await connection();
  return <RegisterBusinessScreen currencies={await fetchPublicCurrencies()} />;
}
