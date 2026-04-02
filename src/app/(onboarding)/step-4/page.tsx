"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  Check,
  Sparkles,
  Trash2,
  Edit2,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Plus,
  Truck,
  Clock,
  Coins,
  Package,
  Zap,
  X,
} from "lucide-react";
import { useSupabase } from "@/hooks/use-supabase";
import { useTenant } from "@/hooks/use-tenant";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatGEL } from "@/lib/utils/currency";
import type { DeliveryZone } from "@/types/database";

const STEPS = [
  { label: "ბიზნეს პროფილი", num: 1 },
  { label: "Facebook", num: 2 },
  { label: "პროდუქტები", num: 3 },
  { label: "მიწოდება", num: 4 },
  { label: "გადახდა", num: 5 },
];
const CURRENT_STEP = 4;

const DEFAULT_ZONES = [
  { zone_name: "თბილისი (ცენტრი)", fee: 5.0, estimated_days: "1 დღე" },
  { zone_name: "თბილისი (გარეუბანი)", fee: 8.0, estimated_days: "1-2 დღე" },
  { zone_name: "ბათუმი", fee: 12.0, estimated_days: "2-3 დღე" },
  { zone_name: "ქუთაისი", fee: 10.0, estimated_days: "2-3 დღე" },
  { zone_name: "რეგიონები", fee: 15.0, estimated_days: "3-5 დღე" },
];

const QUICK_SUGGESTIONS = [
  { zone_name: "თბილისი (ცენტრი)", fee: 5.0, estimated_days: "1 დღე" },
  { zone_name: "ბათუმი", fee: 12.0, estimated_days: "2-3 დღე" },
  { zone_name: "ქუთაისი", fee: 10.0, estimated_days: "2 დღე" },
  { zone_name: "რეგიონები", fee: 15.0, estimated_days: "3-5 დღე" },
];

const zoneSchema = z.object({
  zone_name: z.string().min(1, "ზონის სახელი სავალდებულოა"),
  fee: z
    .number({ invalid_type_error: "მიუთითეთ ფასი" })
    .positive("ფასი უნდა იყოს > 0"),
  estimated_days: z.string().min(1, "მიუთითეთ ვადა"),
});

export default function Step4Page() {
  const router = useRouter();
  const supabase = useSupabase();
  const { tenant, loading, error: tenantError } = useTenant();
  const { toast } = useToast();

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [fee, setFee] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const activeZones = zones.filter((z) => z.is_active);

  const loadZones = useCallback(async () => {
    if (!tenant) return;
    const { data, error } = await supabase
      .from("delivery_zones")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: true });

    if (error) {
      toast({
        title: "შეცდომა",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data && data.length === 0) {
      const inserts = DEFAULT_ZONES.map((z) => ({
        tenant_id: tenant.id,
        zone_name: z.zone_name,
        fee: z.fee,
        estimated_days: z.estimated_days,
        is_active: true,
      }));
      const { data: inserted, error: insertError } = await supabase
        .from("delivery_zones")
        .insert(inserts)
        .select();

      if (insertError) {
        toast({
          title: "შეცდომა",
          description: insertError.message,
          variant: "destructive",
        });
      } else {
        setZones((inserted as DeliveryZone[]) || []);
      }
    } else {
      setZones((data as DeliveryZone[]) || []);
    }
    setZonesLoading(false);
  }, [tenant, supabase, toast]);

  useEffect(() => {
    if (tenant) loadZones();
  }, [tenant, loadZones]);

  function resetForm() {
    setZoneName("");
    setFee("");
    setEstimatedDays("");
    setFormErrors({});
    setEditingId(null);
  }

  function startEdit(zone: DeliveryZone) {
    setZoneName(zone.zone_name);
    setFee(zone.fee.toString());
    setEstimatedDays(zone.estimated_days || "");
    setEditingId(zone.id);
  }

  async function handleAddOrUpdate() {
    if (!tenant) {
      toast({
        title: "შეცდომა",
        description: "ბიზნეს პროფილი ვერ მოიძებნა. გთხოვთ გადატვირთოთ გვერდი.",
        variant: "destructive",
      });
      return;
    }

    const parsed = zoneSchema.safeParse({
      zone_name: zoneName,
      fee: parseFloat(fee),
      estimated_days: estimatedDays,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setFormErrors(fieldErrors);
      return;
    }
    setFormErrors({});

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("delivery_zones")
          .update({
            zone_name: zoneName,
            fee: parseFloat(fee),
            estimated_days: estimatedDays,
          })
          .eq("id", editingId)
          .select()
          .single();

        if (error) throw error;
        setZones((prev) =>
          prev.map((z) => (z.id === editingId ? (data as DeliveryZone) : z)),
        );
      } else {
        const { data, error } = await supabase
          .from("delivery_zones")
          .insert({
            tenant_id: tenant.id,
            zone_name: zoneName,
            fee: parseFloat(fee),
            estimated_days: estimatedDays,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        setZones((prev) => [...prev, data as DeliveryZone]);
      }
      resetForm();
    } catch (err) {
      toast({
        title: "შეცდომა",
        description:
          err instanceof Error ? err.message : "შენახვა ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  }

  async function handleQuickAdd(
    suggestion: (typeof QUICK_SUGGESTIONS)[number],
  ) {
    if (!tenant) return;
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .insert({
          tenant_id: tenant.id,
          zone_name: suggestion.zone_name,
          fee: suggestion.fee,
          estimated_days: suggestion.estimated_days,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      setZones((prev) => [...prev, data as DeliveryZone]);
      toast({
        title: "დამატებულია",
        description: `${suggestion.zone_name} წარმატებით დაემატა`,
      });
    } catch (err) {
      toast({
        title: "შეცდომა",
        description:
          err instanceof Error ? err.message : "დამატება ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from("delivery_zones")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setZones((prev) => prev.filter((z) => z.id !== id));
    } catch (err) {
      toast({
        title: "შეცდომა",
        description: err instanceof Error ? err.message : "წაშლა ვერ მოხერხდა",
        variant: "destructive",
      });
    }
  }

  if (loading || zonesLoading) {
    return (
      <div className="space-y-6 pb-32">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Skeleton className="h-[220px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl" />
          </div>
          <div className="space-y-6 lg:col-span-4">
            <Skeleton className="h-[180px] rounded-2xl" />
            <Skeleton className="h-[240px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (tenantError || !tenant) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-destructive">
            ბიზნეს პროფილის ჩატვირთვა ვერ მოხერხდა.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {tenantError || "პროფილი ვერ მოიძებნა"}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            თავიდან ცდა
          </Button>
        </CardContent>
      </Card>
    );
  }

  const usedZoneNames = new Set(zones.map((z) => z.zone_name));
  const availableSuggestions = QUICK_SUGGESTIONS.filter(
    (s) => !usedZoneNames.has(s.zone_name),
  );

  return (
    <div className="animate-fade-in-up space-y-8 pb-36">
      {/* ── Progress Stepper ── */}
      <nav className="mx-auto w-full max-w-xl">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300",
                    step.num < CURRENT_STEP
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : step.num === CURRENT_STEP
                        ? "bg-on-surface text-white shadow-lg shadow-on-surface/20"
                        : "bg-surface-container-high text-muted-foreground",
                  )}
                >
                  {step.num < CURRENT_STEP ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium tracking-wide",
                    step.num === CURRENT_STEP
                      ? "font-bold text-on-surface"
                      : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-[2px] w-6 rounded-full sm:w-10",
                    step.num < CURRENT_STEP
                      ? "bg-emerald-500"
                      : "bg-surface-container-high",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* ── Page Header ── */}
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-on-surface shadow-lg shadow-on-surface/10">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-georgian text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
              მიტანის ზონები
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              განსაზღვრეთ სად მიაწვდით პროდუქტებს და რა ღირს მიტანა
            </p>
          </div>
        </div>
      </header>

      {/* ── Two Column Layout ── */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* ── Left Column ── */}
        <div className="space-y-8 lg:col-span-8">
          {/* Add / Edit Zone Form */}
          <section
            className={cn(
              "relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-white p-7 shadow-ambient-sm transition-all duration-300",
              editingId && "ring-2 ring-primary/30",
            )}
          >
            {/* Decorative corner accent */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/[0.04]" />

            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    editingId
                      ? "bg-amber-100 text-amber-600"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {editingId ? (
                    <Edit2 className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-on-surface">
                  {editingId ? "ზონის რედაქტირება" : "ახალი ზონის დამატება"}
                </h3>
              </div>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-container-high hover:text-on-surface"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Zone Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  ზონის სახელი
                </label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="მაგ: თბილისი"
                  className={cn(
                    "w-full rounded-xl border-2 border-transparent bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface transition-all placeholder:text-muted-foreground/40 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10",
                    formErrors.zone_name &&
                      "border-destructive/50 bg-destructive/5",
                  )}
                />
                {formErrors.zone_name && (
                  <p className="text-[11px] font-medium text-destructive">
                    {formErrors.zone_name}
                  </p>
                )}
              </div>

              {/* Fee */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Coins className="h-3 w-3" />
                  საფასური
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="0.00"
                    className={cn(
                      "w-full rounded-xl border-2 border-transparent bg-surface-container-low px-4 py-3 pr-10 text-sm font-medium text-on-surface transition-all placeholder:text-muted-foreground/40 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10",
                      formErrors.fee &&
                        "border-destructive/50 bg-destructive/5",
                    )}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/50">
                    ₾
                  </span>
                </div>
                {formErrors.fee && (
                  <p className="text-[11px] font-medium text-destructive">
                    {formErrors.fee}
                  </p>
                )}
              </div>

              {/* Estimated Days */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  სავარაუდო ვადა
                </label>
                <input
                  type="text"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="მაგ: 2-3 დღე"
                  className={cn(
                    "w-full rounded-xl border-2 border-transparent bg-surface-container-low px-4 py-3 text-sm font-medium text-on-surface transition-all placeholder:text-muted-foreground/40 focus:border-primary/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10",
                    formErrors.estimated_days &&
                      "border-destructive/50 bg-destructive/5",
                  )}
                />
                {formErrors.estimated_days && (
                  <p className="text-[11px] font-medium text-destructive">
                    {formErrors.estimated_days}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {editingId && (
                <button
                  onClick={resetForm}
                  className="rounded-xl px-5 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-surface-container-low hover:text-on-surface"
                >
                  გაუქმება
                </button>
              )}
              <button
                onClick={handleAddOrUpdate}
                className="flex items-center gap-2 rounded-xl bg-on-surface px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-on-surface/15 transition-all hover:shadow-xl hover:shadow-on-surface/20 active:scale-[0.97]"
              >
                {editingId ? (
                  <>
                    <Check className="h-4 w-4" />
                    განახლება
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    დამატება
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Quick Suggestions */}
          {availableSuggestions.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  სწრაფი დამატება
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.zone_name}
                    onClick={() => handleQuickAdd(suggestion)}
                    className="group flex items-center gap-2 rounded-xl border border-outline-variant/20 bg-white px-4 py-2.5 text-sm transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-[0.97]"
                  >
                    <span className="font-semibold text-on-surface">
                      {suggestion.zone_name}
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="font-medium text-muted-foreground">
                      {suggestion.fee}₾
                    </span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.estimated_days}
                    </span>
                    <Plus className="ml-1 h-3.5 w-3.5 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Zones List — Card-based instead of table */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">
                არსებული ზონები
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {activeZones.length} აქტიური
                </span>
              </div>
            </div>

            {zones.length > 0 ? (
              <div className="space-y-3">
                {zones.map((zone, idx) => (
                  <div
                    key={zone.id}
                    className="group relative overflow-hidden rounded-2xl border border-outline-variant/20 bg-white p-5 shadow-ambient-sm transition-all duration-200 hover:border-outline-variant/40 hover:shadow-ambient"
                    style={{
                      animationDelay: `${idx * 60}ms`,
                    }}
                  >
                    {/* Active indicator line */}
                    {zone.is_active && (
                      <div className="absolute bottom-0 left-0 top-0 w-[3px] rounded-r-full bg-emerald-500" />
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        {/* Zone icon */}
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-surface-container text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                          <MapPin className="h-5 w-5" />
                        </div>

                        {/* Zone details */}
                        <div className="min-w-0">
                          <h4 className="font-bold text-on-surface">
                            {zone.zone_name}
                          </h4>
                          <div className="mt-1 flex items-center gap-3">
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Coins className="h-3 w-3" />
                              {formatGEL(zone.fee)}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {zone.estimated_days || "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => startEdit(zone)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                          title="რედაქტირება"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(zone.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
                          title="წაშლა"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low/30 py-16">
                <Package className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  ჯერ ზონები არ არის დამატებული
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  დაამატეთ ზონა ფორმის საშუალებით ან სწრაფი დამატებით
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ── Right Sidebar ── */}
        <aside className="sticky top-24 space-y-6 lg:col-span-4">
          {/* AI Tip Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/80 to-yellow-50/60 p-6 shadow-ambient-sm">
            {/* Decorative blob */}
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/30 blur-2xl" />

            <div className="relative">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 animate-float items-center justify-center rounded-lg bg-amber-500/15">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="text-sm font-bold text-amber-900">
                  ჭკვიანი რჩევა
                </h4>
              </div>
              <p className="text-[13px] leading-relaxed text-amber-800/80">
                მომხმარებლების 70% უპირატესობას ანიჭებს უფასო მიტანას. განიხილეთ
                &ldquo;უფასო მიტანა 100₾-დან&rdquo; აქციის დამატება კონვერტაციის
                გასაზრდელად.
              </p>
            </div>
          </div>

          {/* Coverage Summary */}
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-6 shadow-ambient-sm">
            <h4 className="mb-4 text-sm font-bold text-on-surface">
              ლოგისტიკის მიმოხილვა
            </h4>

            <div className="space-y-4">
              {/* Visual stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-container-low/80 p-3.5 text-center">
                  <p className="text-2xl font-bold text-on-surface">
                    {zones.length}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                    ზონა
                  </p>
                </div>
                <div className="rounded-xl bg-surface-container-low/80 p-3.5 text-center">
                  <p className="text-2xl font-bold text-on-surface">
                    {zones.length > 0
                      ? formatGEL(Math.min(...zones.map((z) => z.fee)))
                      : "—"}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                    მინ. ტარიფი
                  </p>
                </div>
              </div>

              {/* Visual map placeholder */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high p-6">
                {/* Decorative circles representing zones */}
                <div className="relative mx-auto h-32 w-full">
                  {/* Georgia map silhouette — abstract dots */}
                  <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-muted-foreground/15" />
                  <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-muted-foreground/10" />

                  {/* Active zone dots */}
                  {zones.slice(0, 5).map((zone, i) => {
                    const positions = [
                      { top: "45%", left: "50%" },
                      { top: "35%", left: "35%" },
                      { top: "55%", left: "25%" },
                      { top: "30%", left: "65%" },
                      { top: "65%", left: "55%" },
                    ];
                    const pos = positions[i];
                    return (
                      <div
                        key={zone.id}
                        className="absolute flex flex-col items-center"
                        style={{
                          top: pos.top,
                          left: pos.left,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        <div className="relative">
                          <div className="h-3 w-3 rounded-full bg-primary shadow-md shadow-primary/30" />
                          <div className="absolute inset-0 animate-pulse-ring rounded-full bg-primary/30" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Center label */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <MapPin className="h-6 w-6 text-muted-foreground/20" />
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-muted-foreground shadow-sm backdrop-blur-sm">
                    {activeZones.length} აქტიური ზონა
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Fixed Bottom Navigation ── */}
      <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-outline-variant/20 bg-white/90 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            onClick={() => router.push("/step-3")}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-muted-foreground transition-all hover:bg-surface-container-low hover:text-on-surface"
          >
            <ArrowLeft className="h-4 w-4" />
            უკან
          </button>

          <div className="hidden flex-col items-center gap-0.5 md:flex">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">
              შემდეგი ნაბიჯი
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              გადახდის დეტალები
            </p>
          </div>

          <div className="flex items-center gap-5">
            <span
              className={cn(
                "hidden items-center gap-1.5 text-xs font-semibold sm:inline-flex",
                zones.length > 0 ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {zones.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
              მინიმუმ 1 ზონა აუცილებელია
            </span>
            <button
              onClick={() => router.push("/step-5")}
              disabled={zones.length === 0}
              className={cn(
                "flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-bold shadow-lg transition-all",
                zones.length > 0
                  ? "bg-on-surface text-white shadow-on-surface/15 hover:shadow-xl hover:shadow-on-surface/20 active:scale-[0.97]"
                  : "cursor-not-allowed bg-muted text-muted-foreground shadow-none",
              )}
            >
              გაგრძელება
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
