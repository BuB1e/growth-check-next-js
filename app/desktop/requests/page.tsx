import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LocationCreateRequestAction } from "@/actions/LocationCreateRequestAction";
import { ChildTransferRequestAction } from "@/actions/ChildTransferRequestAction";
import { UserAction } from "@/actions/UserAction";
import { ChildAction } from "@/actions/ChildAction";
import { LocationAction } from "@/actions/LocationAction";
import type {
  LocationCreateRequestResponse,
  ChildTransferRequestResponse,
  PaginatedMetaDTO,
} from "@/dto";
import { Request_status } from "@/types/Enums";
import { RequestsTable } from "@/components/features/desktop/RequestsTable";

export const metadata = {
  title: "คำร้องขอ",
};

// Combined request type for unified table
export type CombinedRequest = 
  | ({ type: "location"; userName?: string } & LocationCreateRequestResponse)
  | ({ 
      type: "transfer"; 
      userName?: string; 
      childName?: string;
      fromLocationName?: string;
      toLocationName?: string;
    } & ChildTransferRequestResponse);

// Unified response type
export interface UnifiedRequestsResponse {
  data: CombinedRequest[];
  meta: PaginatedMetaDTO;
}

export default function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">คำร้องขอ</h2>
          <p className="text-muted-foreground mt-1">
            รายการคำร้องขอทั้งหมด — การสร้างสถานที่และการย้ายเด็ก
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการคำร้องขอ</CardTitle>
          <CardDescription>
            คลิกที่รายการเพื่อดูรายละเอียดคำร้องขอ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TableLoadingSkeleton />}>
            <RequestsDataWrapper searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground animate-pulse">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary opacity-50" />
      <p>กำลังโหลดข้อมูลคำร้องขอ...</p>
    </div>
  );
}

async function RequestsDataWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const { EnvConfig } = await import("@/configs/BackendConfig");
  
  const parsedPage = Number(sp?.page);
  const parsedLimit = Number(sp?.limit);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > 0
      ? parsedLimit
      : EnvConfig.PAGINATION_LIMIT_DESKTOP_SIZE;
  const q = typeof sp?.q === "string" ? sp.q : undefined;
  const requestType = sp?.type || "all"; // "all" | "location" | "transfer"
  const requestStatus =
    sp?.status === Request_status.WAITING ||
    sp?.status === Request_status.APPROVE ||
    sp?.status === Request_status.REJECT
      ? (sp.status as Request_status)
      : undefined;

  // Fetch both request types in parallel
  const [locationRes, transferRes] = await Promise.allSettled([
    requestType === "transfer" 
      ? Promise.resolve({ data: [], meta: { total: 0, page: 1, limit, totalPages: 0 } })
      : LocationCreateRequestAction.getRequests({
          page: 1,
          limit: 1000, // Fetch all for merging
          q,
          requestStatus,
        }),
    requestType === "location"
      ? Promise.resolve({ data: [], meta: { total: 0, page: 1, limit, totalPages: 0 } })
      : ChildTransferRequestAction.getRequests({
          page: 1,
          limit: 1000, // Fetch all for merging
          q,
        }),
  ]);

  // Combine and type the results
  const locationData: LocationCreateRequestResponse[] =
    locationRes.status === "fulfilled" ? locationRes.value.data : [];
  const transferData: ChildTransferRequestResponse[] =
    transferRes.status === "fulfilled" ? transferRes.value.data : [];

  // Debug log
  console.log("[RequestsPage] Fetch results:", {
    locationCount: locationData.length,
    transferCount: transferData.length,
    requestType,
    requestStatus,
    q,
    locationError: locationRes.status === "rejected" ? locationRes.reason : null,
    transferError: transferRes.status === "rejected" ? transferRes.reason : null
  });

  // Add type discriminator
  const combinedData: CombinedRequest[] = [
    ...locationData.map((item) => ({ ...item, type: "location" as const })),
    ...transferData.map((item) => ({ ...item, type: "transfer" as const })),
  ];

  // Sort by createdAt descending (most recent first)
  combinedData.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    
    // Handle invalid dates
    const timeA = Number.isNaN(dateA) ? 0 : dateA;
    const timeB = Number.isNaN(dateB) ? 0 : dateB;
    
    return timeB - timeA;
  });

  // Apply status filter if needed (for transfer requests, check if handledBy exists)
  let filteredData = combinedData;
  if (requestStatus) {
    filteredData = combinedData.filter((item) => {
      if (item.type === "location") {
        return item.requestStatus === requestStatus;
      } else {
        // Use the actual requestStatus field if available
        if (item.requestStatus) {
          return item.requestStatus === requestStatus;
        }
        
        // Fallback: Transfer requests: WAITING = no handledBy, APPROVE/REJECT = has handledBy
        if (requestStatus === Request_status.WAITING) {
          return !item.handledBy;
        } else if (requestStatus === Request_status.APPROVE) {
          return !!item.handledBy;
        } else if (requestStatus === Request_status.REJECT) {
          // If no status and we filtered by REJECT, and we don't know if it's rejected,
          // assume no rejection can be detected without the field.
          return false; 
        }
        return true;
      }
    });
  }

  // Apply search filter
  if (q) {
    const searchLower = q.toLowerCase();
    filteredData = filteredData.filter((item) => {
      if (item.type === "location") {
        return (
          item.locationName.toLowerCase().includes(searchLower) ||
          item.sub_district.toLowerCase().includes(searchLower) ||
          item.district.toLowerCase().includes(searchLower)
        );
      } else {
        return item.childId.toString().includes(searchLower);
      }
    });
  }

  // Paginate
  // Paginate
  const total = filteredData.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const paginatedData = filteredData.slice(start, start + limit);

  // --- Enrichment: Fetch names for the paginated page only ---
  const userIds = Array.from(new Set(paginatedData.map((item: CombinedRequest) => item.userId)));
  const childIds = Array.from(new Set(
    paginatedData
      .filter((item): item is CombinedRequest & { type: "transfer" } => item.type === "transfer")
      .map(item => item.childId)
  ));
  const locationIds = Array.from(new Set(
    paginatedData
      .filter((item): item is CombinedRequest & { type: "transfer" } => item.type === "transfer")
      .flatMap(item => [item.fromLocation, item.toLocation])
  ));

  // Fetch in parallel
  const [users, children, locations] = await Promise.all([
    Promise.all(userIds.map((id: string) => UserAction.getUserById(id).catch(() => null))),
    Promise.all(childIds.map((id: number) => ChildAction.getChildById(id.toString()).catch(() => null))),
    Promise.all(locationIds.map((id: number) => LocationAction.getLocationById(id.toString()).catch(() => null))),
  ]);

  // Create lookup maps
  const userMap = new Map(users.filter(Boolean).map(u => [u!.id, `${u!.firstName} ${u!.lastName}`]));
  const childMap = new Map(children.filter(Boolean).map(c => [c!.id, `${c!.firstName} ${c!.lastName}`]));
  const locationMap = new Map(locations.filter(Boolean).map(l => [l!.id, l!.name]));

  // Attach names to paginatedData
  const enrichedData = paginatedData.map(item => {
    const newItem = { ...item } as CombinedRequest;
    newItem.userName = userMap.get(item.userId);
    if (newItem.type === "transfer") {
      newItem.childName = childMap.get(newItem.childId);
      newItem.fromLocationName = locationMap.get(newItem.fromLocation);
      newItem.toLocationName = locationMap.get(newItem.toLocation);
    }
    return newItem;
  });

  const unifiedResponse: UnifiedRequestsResponse = {
    data: enrichedData,
    meta: { total, page, limit, totalPages },
  };

  // Return the combined data to the table with requestType filter
  return <RequestsTable rawData={unifiedResponse} requestType={requestType} />;
}
