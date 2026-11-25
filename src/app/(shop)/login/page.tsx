import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in — EXQUISITE CRAFT" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/account");

  const { next } = await searchParams;

  return (
    <section className="bg-lime py-16 lg:py-24">
      <div className="shell max-w-[480px]">
        <p className="micro">Welcome back</p>
        <h1 className="mt-5 text-[length:var(--text-h2)]">Sign in.</h1>

        <LoginForm next={next} />

        <p className="mt-8 text-[0.9375rem] tracking-[-0.02em]">
          New here?{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
