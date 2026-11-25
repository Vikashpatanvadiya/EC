import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignUpForm } from "./SignUpForm";

export const metadata = { title: "Create an account — EXQUISITE CRAFT" };

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <section className="bg-lime py-16 lg:py-24">
      <div className="shell max-w-[480px]">
        <p className="micro">Join the studio</p>
        <h1 className="mt-5 text-[length:var(--text-h2)]">Create account.</h1>

        <SignUpForm />

        <p className="mt-8 text-[0.9375rem] tracking-[-0.02em]">
          Already have one?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
