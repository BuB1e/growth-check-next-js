"use client";

import { useState } from "react";
import { UserCreateStatusResponse } from "@/dto";
import type { TeamResponse } from "@/dto";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatBE } from "@/lib/date-utils";
import { UserCreateStatusAction } from "@/actions/UserCreateStatusAction";
import { Loader2, X, MapPin, Calendar, Clock } from "lucide-react";

interface ModalProps {
  request: UserCreateStatusResponse;
  teams: TeamResponse[];
  onClose: () => void;
  onSuccess: () => void;
}

export function UserRequestDetailsModal({ request, teams, onClose, onSuccess }: ModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<"NONE" | "APPROVE" | "REJECT">("NONE");
  
  // Approve states
  const [role, setRole] = useState("USER"); // Default: Staff
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [searchTeam, setSearchTeam] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Reject state
  const [rejectReason, setRejectReason] = useState("");

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchTeam.toLowerCase())
  );

  const reqObj: any = request;
  const fullName = reqObj.user?.firstName 
    ? `${reqObj.user.firstName} ${reqObj.user.lastName || ""}`
    : reqObj.firstName 
      ? `${reqObj.firstName} ${reqObj.lastName || ""}` 
      : "ไม่ระบุชื่อ";
  
  const originalTeamName = reqObj.team?.name || reqObj.teamId?.toString() || "ไม่ระบุเขต";

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      
      const payload: any = {
        requestStatus: "APPROVED",
        role: role,
        // Since the prompt doesn't strictly specify updatedBy from session here, 
        // we omit it or assume standard auth behavior if not provided.
        // We'll pass updatedBy as empty or undefined to let backend handle it from session
      };

      if (selectedTeam) {
        payload.teamId = Number(selectedTeam);
      }

      await UserCreateStatusAction.updateStatus(request.id.toString(), payload);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการอนุมัติคำร้อง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("กรุณากรอกเหตุผลในการปฏิเสธ");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload: any = {
        requestStatus: "REJECTED",
        rejectReason: rejectReason,
      };

      await UserCreateStatusAction.updateStatus(request.id.toString(), payload);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการปฏิเสธคำร้อง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">รายละเอียดคำร้อง</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-gray-500">ชื่อ-นามสกุล / Name</Label>
              <div className="text-lg font-semibold text-gray-900 mt-1">{fullName}</div>
              {request.userId && <div className="text-sm text-gray-400">ID: {request.userId}</div>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-500">วันที่ส่งคำร้อง / Date</Label>
                <div className="flex items-center text-gray-900 mt-1 font-medium">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  {formatBE(request.createdAt, "d MMM yyyy")}
                </div>
              </div>
              
              <div>
                <Label className="text-gray-500">สถานะ / Status</Label>
                <div className="flex items-center text-gray-900 mt-1 font-medium">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  {request.requestStatus === "WAITING" ? "รอดำเนินการ" : 
                   request.requestStatus === "APPROVED" ? "อนุมัติแล้ว" : "ปฏิเสธ"}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-gray-500">เขต/ทีมที่ขอ / Requested Area</Label>
              <div className="flex items-center text-gray-900 mt-1 font-medium">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                {originalTeamName}
              </div>
            </div>
          </div>

          {/* Action Areas based on choice */}
          {request.requestStatus === "WAITING" && actionType === "NONE" && (
            <div className="pt-4 flex gap-3">
              <Button 
                onClick={() => setActionType("REJECT")}
                variant="outline" 
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                ปฏิเสธบัญชี
              </Button>
              <Button 
                onClick={() => setActionType("APPROVE")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                ดำเนินการอนุมัติ
              </Button>
            </div>
          )}

          {actionType === "APPROVE" && (
            <div className="space-y-4 pt-4 border-t animate-in slide-in-from-top-2 p-4 bg-green-50/50 rounded-xl border border-green-100">
              <h3 className="font-bold text-green-800">ข้อมูลการอนุมัติ</h3>
              
              <div className="space-y-3">
                <Label>กำหนดบทบาท (Role)</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="เลือกบทบาท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">พนักงาน (Staff)</SelectItem>
                    <SelectItem value="HEAD">หัวหน้า (Head)</SelectItem>
                    <SelectItem value="ADMIN">แอดมิน (Admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 relative">
                <Label>แก้ไขเขต/ทีม (Team Area) - ตัวเลือกเสริม</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input 
                    placeholder="พิมพ์เพื่อค้นหาเพื่อเปลี่ยนเขต..." 
                    value={isDropdownOpen ? searchTeam : (teams.find(t => t.id.toString() === selectedTeam)?.name || searchTeam)}
                    onFocus={() => {
                      setIsDropdownOpen(true);
                      setSearchTeam("");
                    }}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    onChange={(e) => {
                      setSearchTeam(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="pl-9 bg-white cursor-text"
                  />
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 max-h-48 overflow-y-auto z-50">
                      {filteredTeams.length > 0 ? (
                        filteredTeams.map((team) => (
                          <div
                            key={team.id}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedTeam(team.id.toString());
                              setSearchTeam(team.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {team.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center">ไม่พบผลลัพธ์</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  disabled={isSubmitting} 
                  onClick={() => setActionType("NONE")} 
                  variant="ghost" 
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button 
                  disabled={isSubmitting} 
                  onClick={handleApprove} 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  ยืนยันการอนุมัติ
                </Button>
              </div>
            </div>
          )}

          {actionType === "REJECT" && (
            <div className="space-y-4 pt-4 border-t animate-in slide-in-from-top-2 p-4 bg-red-50/50 rounded-xl border border-red-100">
              <h3 className="font-bold text-red-800">ข้อมูลการปฏิเสธ</h3>
              
              <div className="space-y-3">
                <Label className="text-red-800">เหตุผลประกอบการปฏิเสธ <span className="text-red-500">*</span></Label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="กรุณาระบุเหตุผลให้ผู้ใช้ทราบ เช่น ข้อมูลไม่ครบถ้วน..."
                  className="w-full h-24 p-3 border border-red-200 rounded-lg focus:ring-4 focus:ring-red-100 focus:outline-hidden resize-none bg-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  disabled={isSubmitting} 
                  onClick={() => setActionType("NONE")} 
                  variant="ghost" 
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button 
                  disabled={isSubmitting || !rejectReason.trim()} 
                  onClick={handleReject} 
                  variant="destructive"
                  className="flex-1"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  ยืนยันการปฏิเสธ
                </Button>
              </div>
            </div>
          )}
          
          {(request.requestStatus === "APPROVED" || request.requestStatus === "REJECTED") && (
            <div className="pt-2 flex">
               <Button onClick={onClose} variant="outline" className="w-full">ปิดหน้าต่าง</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
