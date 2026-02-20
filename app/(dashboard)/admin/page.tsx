import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const quickLinks = [
    {
      title: "จัดการผู้ใช้",
      description: "ดูและจัดการบัญชีผู้ใช้ทั้งหมด",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "คำร้องขอ",
      description: "อนุมัติหรือปฏิเสธคำร้องขอ",
      icon: FileText,
      href: "/admin/requests",
      color: "text-amber-600 bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h2>
        <p className="text-sm text-gray-500">ภาพรวมระบบและการจัดการ</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-all hover:shadow-md hover:border-blue-200 cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.color}`}
                >
                  <link.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{link.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
