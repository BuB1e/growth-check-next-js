"use client";

import { useState } from "react";
import { ChildResponse } from "@/dto";
import { MeasurementDrawer } from "./MeasurementDrawer";
import { UserCircle2, Plus } from "lucide-react";
import Link from "next/link";

export function MobileChildListItem({ child }: { child: ChildResponse }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

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

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-xl leading-tight mb-1.5 line-clamp-1 truncate">
              {child.firstName} {child.lastName}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide shadow-sm ${
                  child.status === "IN_AREA"
                    ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                    : child.status === "OUT_AREA"
                      ? "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-600/20"
                      : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20"
                }`}
              >
                {child.status === "IN_AREA"
                  ? "ในเขต"
                  : child.status === "OUT_AREA"
                    ? "นอกเขต"
                    : child.status === "DIED"
                      ? "เสียชีวิต"
                      : "ไม่ทราบ"}
              </span>
            </div>
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
