"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, ShieldCheck, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SiLine } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth/auth-client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check for errors in URL (e.g., from social login redirects)
  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode) {
      console.error("[Login] Error from URL:", errorCode);
      let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบหรืออาจมีบัญชีผู้ใช้อยู่แล้วในการลงทะเบียนแบบอื่น กรุณาลองเข้าสู่ระบบด้วยวิธีอื่น";
      
      switch (errorCode) {
        case "ACCOUNT_ALREADY_LINKED":
          errorMessage = "อีเมลนี้ถูกใช้งานแล้วด้วยวิธีอื่น กรุณาลองเข้าสู่ระบบด้วยวิธีเดิมที่เคยสมัครไว้";
          break;
        case "SOCIAL_PROVIDER_NOT_CONNECTED":
          errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อกับผู้ให้บริการ กรุณาลองใหม่อีกครั้ง";
          break;
        case "INVALID_EMAIL":
          errorMessage = "อีเมลไม่ถูกต้องหรือไม่ได้รับอนุญาต";
          break;
      }
      
      // Defer state update to avoid synchronous cascading render warning
      const timer = setTimeout(() => {
        setError(errorMessage);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleLogin = async (method: string) => {
    if (method === "NATIVE") {
      if (!email || !password) {
        setError("กรุณากรอกอีเมลและรหัสผ่าน");
        return;
      }

      setIsLoading(true);
      setError(null);
      const { error: loginError } = await authClient.signIn.email({
        email,
        password,
      });
      setIsLoading(false);

      if (loginError) {
        console.error("[Login] Native SignIn Error:", loginError);
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        return;
      }
      console.log("[Login] Native SignIn Success, redirecting to /mobile/staff/home");
      router.push("/mobile/staff/home");

    } else {
      setIsLoading(true);
      try {
        await authClient.signIn.social({
          provider: method.toLowerCase() as "google" | "line",
          callbackURL: window.location.origin + "/mobile/staff/home",
          errorCallbackURL: window.location.origin + "/login",
        });
      } catch (err) {
        console.error("[Login] Social SignIn Error:", err);
        setError("ไม่สามารถเริ่มการเชื่อมต่อได้ กรุณาลองใหม่อีกครั้ง");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50/50 p-4 md:p-8">
      <div className="w-full max-w-(--breakpoint-sm) space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Growth Check
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium">
            ระบบติดตามโภชนาการและพัฒนาการเด็ก
          </p>
        </div>

        <Card className="border-none shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-black/5">
          <CardHeader className="pt-10 pb-6 text-center space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900 px-2">เข้าสู่ระบบ</CardTitle>
            <CardDescription className="text-lg text-gray-500 px-4">
              เลือกวิธีเข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-8 px-6 md:px-10">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50 animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">เกิดข้อผิดพลาด</AlertTitle>
                <AlertDescription className="text-base font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Native Login Section */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin("NATIVE");
              }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <Label htmlFor="email" className="text-lg font-semibold text-gray-700 ml-1">
                  อีเมล (Email)
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="h-14 pl-16 text-lg rounded-2xl border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" title="password" className="text-lg font-semibold text-gray-700 ml-1">
                  รหัสผ่าน (Password)
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    title="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 pl-16 pr-12 text-lg rounded-2xl border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-xl font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98]"
              >
                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                {!isLoading && <ArrowRight className="ml-2 w-6 h-6" />}
              </Button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-4 text-gray-400 font-bold bg-white backdrop-blur-sm">หรือเข้าใช้งานผ่าน</span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                onClick={() => handleLogin("LINE")}
                disabled={isLoading}
                className="h-14 text-lg font-bold border-2 border-[#06C755]/10 bg-white hover:bg-[#06C755]/5 text-[#06C755] rounded-2xl transition-all group"
              >
                <SiLine className="mr-3 w-6 h-6" />
                เข้าสู่ระบบด้วย LINE
              </Button>

              <Button
                variant="outline"
                onClick={() => handleLogin("GOOGLE")}
                disabled={isLoading}
                className="h-14 text-lg font-bold border-2 border-gray-100 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl transition-all"
              >
                <FcGoogle className="mr-3 w-6 h-6" />
                เข้าสู่ระบบด้วย Google
              </Button>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50/50 justify-center py-6 border-t border-gray-100">
            <p className="text-lg text-gray-500">
              ยังไม่มีบัญชี? <span onClick={() => router.push("/register")} className="text-primary font-bold cursor-pointer hover:underline underline-offset-4 tracking-tight">ลงทะเบียนใหม่</span>
            </p>
          </CardFooter>
        </Card>

        {/* Support Info for Age Group */}
        <div className="text-center">
          <p className="text-lg font-medium text-gray-400">
            หากพบปัญหาในการเข้าสู่ระบบ กรุณาติดต่อเจ้าหน้าที่ดูแลระบบ
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-blue-50/50">กำลังโหลด...</div>}>
      <LoginContent />
    </Suspense>
  );
}
