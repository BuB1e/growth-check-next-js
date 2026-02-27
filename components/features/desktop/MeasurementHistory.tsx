"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface MeasurementHistoryProps {
  childId: number;
}

// Temporary Mock for demonstration until real measurement history API drops
const mockHistory = [
  {
    date: new Date("2023-01-10"),
    weight: 22.5,
    height: 110,
    status: "In_Area",
    examiner: "นพ. สมเกียรติ",
  },
  {
    date: new Date("2023-04-12"),
    weight: 23.2,
    height: 112,
    status: "In_Area",
    examiner: "พญ. รักษ์ธรรม",
  },
  {
    date: new Date("2023-08-05"),
    weight: 25.1,
    height: 114,
    status: "Out_Area",
    examiner: "นพ. สมเกียรติ",
  },
  {
    date: new Date("2023-12-15"),
    weight: 26.8,
    height: 118,
    status: "Unknown",
    examiner: "พญ. รักษ์ธรรม",
  },
].reverse();

export function MeasurementHistory({
  childId: _childId,
}: MeasurementHistoryProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>วันที่ตรวจ</TableHead>
            <TableHead className="text-right">น้ำหนัก (กิโลกรัม)</TableHead>
            <TableHead className="text-right">ส่วนสูง (เซนติเมตร)</TableHead>
            <TableHead>ผู้ประเมิน</TableHead>
            <TableHead>เกณฑ์พัฒนาการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockHistory.length ? (
            mockHistory.map((record, index) => (
              <TableRow
                key={index}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="py-3">
                  {format(record.date, "d MMM yyyy", { locale: th })}
                </TableCell>
                <TableCell className="py-3 text-right font-medium">
                  {record.weight}
                </TableCell>
                <TableCell className="py-3 text-right font-medium">
                  {record.height}
                </TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {record.examiner}
                </TableCell>
                <TableCell className="py-3">
                  {record.status === "In_Area" && (
                    <div className="flex items-center text-green-600 font-medium">
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> สมส่วน
                    </div>
                  )}
                  {record.status === "Out_Area" && (
                    <div className="flex items-center text-yellow-500 font-medium">
                      <AlertCircle className="mr-1.5 h-4 w-4" /> สูงกว่าเกณฑ์
                    </div>
                  )}
                  {record.status === "Unknown" && (
                    <div className="flex items-center text-red-500 font-medium">
                      <XCircle className="mr-1.5 h-4 w-4" /> ต่ำกว่าเกณฑ์
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-24 text-center text-muted-foreground"
              >
                ไม่พบประวัติการประเมิน
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
