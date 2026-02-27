"use client";

import * as React from "react";
import { format, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { th } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from search params or default to last 30 days
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : subDays(new Date(), 30),
    to: toParam ? new Date(toParam) : new Date(),
  });

  // Keep state in sync with URL
  React.useEffect(() => {
    if (fromParam)
      setDate((prev) => ({ from: new Date(fromParam), to: prev?.to }));
    if (toParam)
      setDate((prev) => ({ from: prev?.from, to: new Date(toParam) }));
  }, [fromParam, toParam]);

  const handleSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);

    // Create new search params to preserve others
    const params = new URLSearchParams(searchParams.toString());

    if (newDate?.from) {
      params.set("from", newDate.from.toISOString());
    } else {
      params.delete("from");
    }

    if (newDate?.to) {
      params.set("to", newDate.to.toISOString());
    } else {
      params.delete("to");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal bg-white",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: th })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: th })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: th })
              )
            ) : (
              <span>เลือกช่วงเวลา</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={th}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
