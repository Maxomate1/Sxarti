"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    if (resetError) {
      setError("შეცდომა დაფიქსირდა. სცადეთ თავიდან.");
      setLoading(false);
      return;
    }

    setSuccess("აღდგენის ბმული გამოგზავნილია თქვენს ელ-ფოსტაზე.");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Logo />
      </div>

      <h1 className="text-center text-2xl font-bold text-on-surface">
        პაროლის აღდგენა
      </h1>

      <p className="text-center text-sm text-muted-foreground">
        შეიყვანეთ ელ-ფოსტა და გამოგიგზავნით პაროლის აღდგენის ბმულს.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">ელ-ფოსტა</Label>
          <Input
            id="email"
            type="email"
            placeholder="info@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          აღდგენის ბმულის გაგზავნა
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        გახსოვთ პაროლი?{" "}
        <Link
          href="/login"
          className="text-primary hover:underline underline-offset-4"
        >
          შესვლა
        </Link>
      </p>
    </div>
  );
}
