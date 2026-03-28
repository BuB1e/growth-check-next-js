"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserResponse } from "@/dto";
import { Role, RoleToThai } from "@/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserCog, AlertCircle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { updateStaffRoleAction } from "./actions";

interface StaffDetailClientProps {
  user: UserResponse;
}

export default function StaffDetailClient({ user }: StaffDetailClientProps) {
  const router = useRouter();
  const session = authClient.useSession();
  
  const currentUserRole = (session.data?.user as any)?.role as Role | undefined;
  const isAdmin = currentUserRole === Role.ADMIN;
  
  const [selectedRole, setSelectedRole] = useState<Role>(user.role as Role);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Dialog visibility states
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  
  const handleRoleChangeAttempt = (newRole: string) => {
    const roleVal = newRole as Role;
    if (roleVal === user.role) return;
    
    setPendingRole(roleVal);
    setShowConfirm1(true);
  };

  const handleFirstConfirm = () => {
    setShowConfirm1(false);
    
    // If target role is ADMIN, trigger second warning
    if (pendingRole === Role.ADMIN) {
      setShowConfirm2(true);
    } else {
      executeRoleChange();
    }
  };

  const executeRoleChange = async () => {
    if (!pendingRole) return;
    
    setIsUpdating(true);
    try {
      const result = await updateStaffRoleAction(String(user.id), pendingRole);
      
      if (result.success) {
        setSelectedRole(pendingRole);
        router.refresh();
      } else {
        alert(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUpdating(false);
      setPendingRole(null);
      setShowConfirm2(false);
    }
  };

  return (
    <Card className="shadow-sm border-blue-100 bg-blue-50/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-blue-600" />
          สิทธิ์การใช้งาน
        </CardTitle>
        <CardDescription>จัดการตำแหน่งและหน้าที่รับผิดชอบในระบบ</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500">สิทธิ์ปัจจุบัน</label>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              user.role === Role.ADMIN ? "bg-red-100 text-red-700" :
              user.role === Role.HEAD ? "bg-orange-100 text-orange-700" :
              "bg-green-100 text-green-700"
            }`}>
              {RoleToThai[user.role as Role] || user.role}
            </span>
            {user.role === Role.ADMIN && <ShieldCheck className="h-4 w-4 text-red-500" />}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-blue-100">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">ปรับเปลี่ยนสิทธิ์ (Position Change)</label>
            <div className="flex items-center gap-3">
              <Select 
                value={selectedRole} 
                onValueChange={handleRoleChangeAttempt}
                disabled={!isAdmin || isUpdating}
              >
                <SelectTrigger className="w-full h-12 text-md">
                  <SelectValue placeholder="เลือกตำแหน่ง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Role.USER}>{RoleToThai[Role.USER]}</SelectItem>
                  <SelectItem value={Role.HEAD}>{RoleToThai[Role.HEAD]}</SelectItem>
                  <SelectItem value={Role.ADMIN}>{RoleToThai[Role.ADMIN]} (สิทธิ์สูงสุด)</SelectItem>
                </SelectContent>
              </Select>
              {isUpdating && <Loader2 className="h-5 w-5 animate-spin text-blue-500 shrink-0" />}
            </div>
          </div>
          
          {!isAdmin && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5 bg-amber-50 p-2 rounded border border-amber-100">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถปรับเปลี่ยนสิทธิ์ได้
            </p>
          )}

          {isAdmin && (
            <p className="text-xs text-slate-400 italic">
              * การเปลี่ยนสิทธิ์จะมีผลทันทีหลังจากกดบันทึกและระบบทำการยืนยัน
            </p>
          )}
        </div>
      </CardContent>

      {/* Confirmation Dialog 1: General Change */}
      <AlertDialog open={showConfirm1} onOpenChange={setShowConfirm1}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">ยืนยันการเปลี่ยนสิทธิ์การใช้งาน?</AlertDialogTitle>
            <AlertDialogDescription className="text-md py-2">
              คุณแน่ใจหรือไม่ที่จะเปลี่ยนสิทธิ์การใช้งานของ คุณ {user.firstName} {user.lastName} 
              จากเดิม <span className="font-bold text-slate-900">{RoleToThai[user.role as Role]}</span> 
              เป็น <span className="font-bold text-blue-600">{pendingRole ? RoleToThai[pendingRole] : ""}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleFirstConfirm} className="bg-blue-600 hover:bg-blue-700">
              ดำเนินการต่อ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog 2: Escalation to ADMIN */}
      <AlertDialog open={showConfirm2} onOpenChange={setShowConfirm2}>
        <AlertDialogContent className="border-red-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-red-600 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              คำเตือน: ยืนยันการมอบสิทธิ์สูงสุด?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-md py-2 space-y-3" asChild>
              <div>
                <p>
                  คุณกำลังตรวจสอบปรับเปลี่ยนสิทธิ์ผู้ใช้นี้เป็น <span className="font-bold">Admin (สิทธิ์สูงสุด)</span> ยืนยันใช่หรือไม่?
                </p>
                <p className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                  การมอบสิทธิ์ Admin จะทำให้บัญชีนี้มีสิทธิ์เทียบเท่าคุณและสามารถจัดการระบบได้ทั้งหมด รวมถึงการจัดการสมาชิกและข้อมูลสำคัญ คุณแน่ใจที่จะดำเนินการขั้นสุดท้ายหรือไม่?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating} onClick={() => setPendingRole(null)}>ยกเลิกรายการ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeRoleChange}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              ยืนยันมอบสิทธิ์แอดมิน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
