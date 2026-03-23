"use client";

import { useState } from "react";
import { ChildResponse } from "@/dto";
import { Sex, SexToThai } from "@/types";
import { MeasurementDrawer } from "./MeasurementDrawer";
import { UserCircle2, Plus } from "lucide-react";
import Link from "next/link";
import { formatAgeThai } from "@/lib/date-utils";

export function MobileChildListItem({ child }: { child: ChildResponse }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sexText = SexToThai[child.sex] ?? "ไม่ระบุ";

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] ring-1 ring-gray-200/50 transition-all active:scale-[0.98] cursor-pointer flex">
        {/* Main Content Area routes to detail view */}
        <Link
          href={`/mobile/staff/child_${child.id}`}
          className="flex-1 p-4 flex items-center gap-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50/80 text-blue-600 shrink-0">
            <UserCircle2 className="h-7 w-7" />
          </div>

          <div className="flex flex-col w-full">
            <div className="flex flex-row justify-between w-full items-center">
              <h3 className="font-semibold text-gray-900 text-xl leading-tight mb-1.5 line-clamp-1 truncate">
                {child.firstName} {child.lastName}
              </h3>
              <span
                className={`
                  text-[11px] rounded-lg px-2 py-1
                  font-medium border
                  ${child.sex == Sex.MALE ? "border-green-600 bg-green-200 text-green-800" : "border-pink-300 bg-pink-200 text-pink-600"}`}
              >
                {sexText}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              อายุ: {formatAgeThai(child.birthDate)}
            </p>
          </div>
        </Link>

        {/* Quick Action Button for Drawer */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDrawerOpen(true);
          }}
          className="w-14 items-center justify-center bg-gray-50 hover:bg-gray-100 flex transition-colors border-l border-gray-100 shrink-0"
          aria-label="บันทึกพัฒนาการ"
        >
          <Plus className="h-6 w-6 text-gray-500" strokeWidth={2.5} />
        </button>
      </div>

      <MeasurementDrawer
        childId={child.id}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}
