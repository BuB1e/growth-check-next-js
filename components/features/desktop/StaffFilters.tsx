"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export default function StaffFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Local state — only pushed to URL on form submit
  const [searchValue, setSearchValue] = useState(
    searchParams.get("q") || "",
  );

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([name, value]) => {
        if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      });
      // Reset to page 1 when filters change
      params.set("page", "1");
      return params.toString();
    },
    [searchParams],
  );

  // Only push to URL when the form is explicitly submitted
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?${createQueryString({ q: searchValue })}`);
  };

  const handleRoleChange = (value: string) => {
    router.push(
      `${pathname}?${createQueryString({ role: value === "ALL" ? "" : value })}`,
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-1 min-w-0 items-center gap-2"
      >
        <div className="relative flex-1 min-w-0 space-x-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full sm:max-w-sm pl-8"
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            ค้นหา
          </Button>
        </div>
      </form>

      <Select
        defaultValue={searchParams.get("role") || "ALL"}
        onValueChange={handleRoleChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="ตำแหน่ง" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">ทั้งหมด</SelectItem>
          <SelectItem value="ADMIN">แอดมิน</SelectItem>
          <SelectItem value="HEAD">หัวหน้า</SelectItem>
          <SelectItem value="USER">ผู้ใช้งาน</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
