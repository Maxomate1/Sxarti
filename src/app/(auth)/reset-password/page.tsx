"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isRecoverySessionReady, setIsRecoverySessionReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function setupRecoverySession() {
      const supabase = createClient();
      const code = new URL(window.location.href).searchParams.get("code");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError && isMounted) {
          setError("აღდგენის ბმული არასწორია ან ვადაგასულია.");
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session) {
        setError("აღდგენის ბმული არასწორია ან ვადაგასულია.");
        setIsRecoverySessionReady(false);
      } else {
        setIsRecoverySessionReady(true);
      }

      setCheckingLink(false);
    }

    void setupRecoverySession();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isRecoverySessionReady) {
      setError("აღდგენის სესია ვერ მოიძებნა. თავიდან სცადეთ.");
      return;
    }

    if (password.length < 8) {
      setError("პაროლი მინიმუმ 8 სიმბოლო უნდა იყოს");
      return;
    }

    if (password !== confirmPassword) {
      setError("პაროლები არ ემთხვევა");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("პაროლის განახლება ვერ მოხერხდა. სცადეთ თავიდან.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setSuccess("პაროლი წარმატებით განახლდა. ახლა შეგიძლიათ შესვლა.");
    setLoading(false);
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Logo />
      </div>

      <h1 className="text-center text-2xl font-bold text-on-surface">
        ახალი პაროლის დაყენება
      </h1>

      {checkingLink ? (
        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">ახალი პაროლი</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="მინიმუმ 8 სიმბოლო"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={!isRecoverySessionReady}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">გაიმეორეთ ახალი პაროლი</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="გაიმეორეთ პაროლი"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                disabled={!isRecoverySessionReady}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isRecoverySessionReady}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            პაროლის შეცვლა
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        დაბრუნება{" "}
        <Link
          href="/login"
          className="text-primary hover:underline underline-offset-4"
        >
          შესვლაზე
        </Link>
      </p>
    </div>
  );
}
