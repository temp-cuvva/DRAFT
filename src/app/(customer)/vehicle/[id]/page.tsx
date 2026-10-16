import type { ReactNode } from "react";
import { after } from "next/server";
import { Car, Check, Cog, Fuel, User, X as XIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Screen } from "@/components/ui/screen";
import { StickyFooter } from "@/components/ui/sticky-footer";
import { TopBar } from "@/components/ui/top-bar";
import MakeLogo from "@/components/MakeLogo";
import { requireOnboardedCustomer } from "@/lib/auth";
import type { Vehicle } from "@/lib/db-types";
import { formatEngine } from "@/lib/format";
import { formatReg } from "@/lib/reg";
import { BODY_OPTIONS, FUEL_OPTIONS, TRANSMISSION_OPTIONS, type EditableVehicleField } from "@/lib/vehicle/form";
import { EditableValue } from "./editable-value";
import { VehicleForm } from "./vehicle-form";
import { rowOrNotFound } from "@/lib/db";
import { markVehicleViewed } from "@/lib/vehicle/viewed";

function StatusChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${ok ? "bg-ok/15 text-ok" : "bg-danger/15 text-danger"}`}>
      {ok ? <Check size={12} /> : <XIcon size={12} />} {label}
    </span>
  );
}

function Spec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="pt-1 text-white/70">{label}</span>
      {children}
    </div>
  );
}

export default async function VehiclePage(props: PageProps<"/vehicle/[id]">) {
  const { id } = await props.params;
  const { edit } = await props.searchParams;
  const { supabase, userId } = await requireOnboardedCustomer();
  const vehicle = rowOrNotFound(await supabase.from("vehicles").select("*").eq("id", id).maybeSingle<Vehicle>());
  after(() => markVehicleViewed(userId, vehicle.id));
  const ev = (field: EditableVehicleField, label: string, current: string | number | null, shown: string, options?: string[], inputMode?: "numeric") => (
    <EditableValue vehicleId={vehicle.id} field={field} label={label} initial={current == null ? "" : String(current)} options={options} inputMode={inputMode}>
      <span className="font-semibold">{shown}</span>
    </EditableValue>
  );
  const editing = edit === "1" || !vehicle.make || !vehicle.model;

  return (
    <Screen>
      <TopBar close="/get-insured" logoOverride={<MakeLogo make={vehicle.make} model={vehicle.model} size={28} />} />
      <h1 className="text-2xl font-bold">{[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Your vehicle"}</h1>
      <p className="text-white/60">{formatReg(vehicle.registration)}</p>
      {vehicle.mot_status || vehicle.tax_status ? (
        <div className="mt-3 flex gap-2">
          {vehicle.mot_status ? <StatusChip label="MOT" ok={vehicle.mot_status === "Valid"} /> : null}
          {vehicle.tax_status ? <StatusChip label="Tax" ok={vehicle.tax_status === "Taxed"} /> : null}
        </div>
      ) : null}

      {editing ? (
        <div className="mt-6">
          <p className="mb-4 text-sm text-white/70">Some details aren&apos;t available from DVLA. Please check and complete them.</p>
          <VehicleForm vehicle={vehicle} />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-4 gap-2 border-y border-line py-5 text-center text-sm">
            <div className="flex flex-col items-center gap-2"><Cog size={24} />{ev("transmission", "Gearbox", vehicle.transmission, vehicle.transmission ?? "—", TRANSMISSION_OPTIONS)}</div>
            <div className="flex flex-col items-center gap-2"><Fuel size={24} />{ev("fuel", "Fuel", vehicle.fuel, vehicle.fuel ?? "—", FUEL_OPTIONS)}</div>
            <div className="flex flex-col items-center gap-2"><User size={24} />{ev("seats", "Seats", vehicle.seats, vehicle.seats ? `${vehicle.seats} seats` : "—", undefined, "numeric")}</div>
            <div className="flex flex-col items-center gap-2"><Car size={24} />{ev("body_type", "Body type", vehicle.body_type, vehicle.body_type ?? "—", BODY_OPTIONS)}</div>
          </div>
          <section className="mt-5">
            <h2 className="font-bold">Specs</h2>
            <Spec label="Make">{ev("make", "Make", vehicle.make, vehicle.make ?? "—")}</Spec>
            <Spec label="Model">{ev("model", "Model", vehicle.model, vehicle.model ?? "—")}</Spec>
            <Spec label="Variant">{ev("variant", "Variant", vehicle.variant, vehicle.variant ?? "—")}</Spec>
            <Spec label="Year">{ev("year", "Year", vehicle.year, String(vehicle.year ?? "—"), undefined, "numeric")}</Spec>
            <Spec label="Colour">{ev("colour", "Colour", vehicle.colour, vehicle.colour ?? "—")}</Spec>
            <Spec label="Doors">{ev("doors", "Doors", vehicle.doors, vehicle.doors ? `${vehicle.doors} Doors` : "—", undefined, "numeric")}</Spec>
            <Spec label="Engine">
              <EditableValue vehicleId={vehicle.id} field="engine_cc" label="Engine size in litres" initial={vehicle.engine_cc ? String(vehicle.engine_cc / 1000) : ""} inputMode="decimal">
                <span className="font-semibold">{vehicle.engine_cc ? formatEngine(vehicle.engine_cc) : "—"}</span>
              </EditableValue>
            </Spec>
          </section>
          <StickyFooter>
            <ButtonLink href={`/quote/${vehicle.id}`}>Get a quote</ButtonLink>
          </StickyFooter>
        </>
      )}
    </Screen>
  );
}
