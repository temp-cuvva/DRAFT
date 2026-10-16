import React from "react";
import Link from "next/link";
import { ArrowLeft, CircleHelp, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function TopBar({ back, close, title, help = false, logoOverride }: { back?: string; close?: string; title?: string; help?: boolean; logoOverride?: React.ReactNode }) {
  return (
    <div className="flex h-14 items-center justify-between">
      <div className="w-10">
        {back ? (
          <Link href={back} aria-label="Back" className="text-brand-soft">
            <ArrowLeft size={24} />
          </Link>
        ) : close ? (
          <Link href={close} aria-label="Close" className="text-brand-soft">
            <X size={26} />
          </Link>
        ) : null}
      </div>
      {title ? (
        <p className="text-[15px] font-bold">{title}</p>
      ) : logoOverride ? (
        <div className="rounded-md">{logoOverride}</div>
      ) : (
        <BrandLogo size={28} className="rounded-md" />
      )}
      <div className="flex w-10 justify-end">
        {help ? <CircleHelp size={22} className="text-brand-soft" aria-hidden /> : null}
      </div>
    </div>
  );
}
