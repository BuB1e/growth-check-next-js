"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { UserResponse } from "@/dto";
import { RoleToThai } from "@/types";
import { Mail, Shield, Users, Calendar } from "lucide-react";

import Image from "next/image";

interface ProfileCardProps {
  user: UserResponse;
  teamName?: string;
}

/**
 * Read-only profile card showing user avatar, name, role, email, and team.
 * Responsive — used in both desktop and mobile profile pages.
 */
export function ProfileCard({ user, teamName }: ProfileCardProps) {
  const initials = `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase();
  const roleThai = RoleToThai[user.role] ?? user.role;
  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <Card className="overflow-hidden">
      {/* Header gradient band */}
      <div className="h-24 bg-linear-to-r from-blue-600 to-indigo-600 sm:h-28" />

      <CardContent className="relative px-6 pb-6 pt-0">
        {/* Avatar overlapping header */}
        <div className="flex flex-col items-center -mt-14 sm:flex-row sm:items-end sm:-mt-12 sm:gap-5">
          {/* Avatar circle */}
          {user.image ? (
            <div className="relative h-24 w-24 sm:h-28 sm:w-28">
              <Image
                src={user.image}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className="rounded-full border-4 border-white object-cover shadow-md"
                priority
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-2xl font-bold text-blue-700 shadow-md sm:h-28 sm:w-28 sm:text-3xl">
              {initials}
            </div>
          )}

          {/* Name + role badge */}
          <div className="mt-3 text-center sm:mt-0 sm:pb-1 sm:text-left">
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {user.firstName} {user.lastName}
            </h2>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              <Shield className="h-3.5 w-3.5" />
              {roleThai}
            </span>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Info rows */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            label="อีเมล"
            value={user.email}
          />
          {teamName && (
            <InfoRow
              icon={<Users className="h-5 w-5 text-gray-400" />}
              label="ทีม"
              value={teamName}
            />
          )}
          <InfoRow
            icon={<Calendar className="h-5 w-5 text-gray-400" />}
            label="เข้าร่วมเมื่อ"
            value={createdDate}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="truncate text-base font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
