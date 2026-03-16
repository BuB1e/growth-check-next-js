import { ChildDataAction } from "@/actions/ChildDataAction";
import type { ChildDataResponse } from "@/dto";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { formatBE } from "@/lib/date-utils";
import { EnvConfig } from "@/configs/BackendConfig";
import { Child_status, Child_statusToThai } from "@/types";

interface MeasurementHistoryProps {
  childId: number;
}

export async function MeasurementHistory({ childId }: MeasurementHistoryProps) {
  let records: ChildDataResponse[] = [];

  try {
    const res = await ChildDataAction.getChildDataList({
      childId,
      limit: EnvConfig.NEXT_PUBLIC_PAGINATION_LIMIT_DESKTOP_SIZE,
    });
    records = res;
  } catch (error) {
    console.error("Failed to load measurement history:", error);
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>วันที่ตรวจ</TableHead>
            <TableHead className="text-right">น้ำหนัก (กิโลกรัม)</TableHead>
            <TableHead className="text-right">ส่วนสูง (เซนติเมตร)</TableHead>
            <TableHead>ผู้บันทึก</TableHead>
            <TableHead>เกณฑ์พัฒนาการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length ? (
            records.map((record) => (
              <TableRow
                key={record.id}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="py-3">
                  {formatBE(record.heightDate, "d MMM yyyy")}
                </TableCell>
                <TableCell className="py-3 text-right font-medium">
                  {record.weight}
                </TableCell>
                <TableCell className="py-3 text-right font-medium">
                  {record.height}
                </TableCell>
                <TableCell className="py-3 text-muted-foreground">
                  {record.userCreated}
                </TableCell>
                <TableCell className="py-3">
                  {record.status === Child_status.IN_AREA && (
                    <div className="flex items-center text-green-600 font-medium">
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> {Child_statusToThai[record.status]}
                    </div>
                  )}
                  {record.status === Child_status.OUT_AREA && (
                    <div className="flex items-center text-yellow-500 font-medium">
                      <AlertCircle className="mr-1.5 h-4 w-4" /> {Child_statusToThai[record.status]}
                    </div>
                  )}
                  {(record.status === Child_status.UNKNOWN || record.status === Child_status.DIED) && (
                    <div className="flex items-center text-red-500 font-medium">
                      <XCircle className="mr-1.5 h-4 w-4" /> {Child_statusToThai[record.status]}
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
