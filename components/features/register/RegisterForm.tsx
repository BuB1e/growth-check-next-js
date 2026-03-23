"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { completeRegistrationAction } from "@/app/register/actions";
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
import { ShieldCheck, UserCircle, Users, ArrowRight, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TeamResponse } from "@/dto";
import { authClient } from "@/lib/auth/auth-client";
import { TermsAndPrivacyModal } from "./TermsAndPrivacyModal";

interface RegisterFormProps {
  teams: TeamResponse[];
}

export function RegisterForm({ teams }: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authMethod = searchParams.get("method") || "NATIVE"; // 'NATIVE', 'LINE', 'GOOGLE'

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [searchTeam, setSearchTeam] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(true);

  // For social logins, we might already have some user data from BetterAuth
  useEffect(() => {
    const checkSession = async () => {
      const session = await authClient.getSession();
      if (session && session.data?.user) {
        const user = session.data.user;
        setCurrentUser({
          id: user.id,
          email: user.email,
          name: user.name || undefined
        });
        // Pre-fill if social
        if (authMethod !== "NATIVE") {
          const names = (user.name || "").split(" ");
          if (names.length > 0) setFirstName(names[0]);
          if (names.length > 1) setLastName(names.slice(1).join(" "));
          setEmail(user.email);
        }
      }
    };
    checkSession();
  }, [authMethod]);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTeam.toLowerCase())
  );

  const handleRegister = async (method: string) => {
    if (!firstName || !selectedTeam || (method === "NATIVE" && (!email || !password || !confirmPassword))) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (method === "NATIVE" && password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let userId: string;

      if (method === "NATIVE") {
        const { data, error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: `${firstName} ${lastName}`.trim(),
        });

        if (signUpError || !data?.user) {
          throw new Error(signUpError?.message || "ลงทะเบียนไม่สำเร็จ");
        }
        userId = data.user.id;
      } else {
        // SOCIAL logic: update existing user
        if (!currentUser) {
          throw new Error("ไม่พบข้อมูลผู้ใช้งานที่เข้าสู่ระบบด้วยโซเชียล");
        }
        userId = currentUser.id;
      }

      // 1. Update User Profile (teamId, firstName, lastName)
      // 2. Create UserCreateStatus (WAITING status)
      // We do this via a Server Action to avoid exposing server-only EnvConfig to the client
      const result = await completeRegistrationAction(userId, {
        firstName,
        lastName,
        teamId: selectedTeam,
        email: method === "NATIVE" ? email : currentUser?.email || email,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setError(null);
      
      // Clear all fields on success as requested
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setSelectedTeam(null);
      setSearchTeam("");
      
      router.push("/pending-approval");

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลงทะเบียน";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50/50 p-4 md:p-8">
      <TermsAndPrivacyModal 
        isOpen={showPolicyModal}
        onAccept={() => setShowPolicyModal(false)}
        onDecline={() => router.push("/login")}
      />
      <div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Growth Check
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium">
            ลงทะเบียนผู้ใช้งานใหม่ {authMethod !== "NATIVE" ? `(ผ่าน ${authMethod})` : ""}
          </p>
        </div>

        <Card className="border-none shadow-2xl shadow-blue-500/10 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-black/5">
          <CardHeader className="pt-10 pb-6 text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 px-2">ข้อมูลส่วนตัว</CardTitle>
            <CardDescription className="text-lg text-gray-500 px-4">
              กรุณากรอกข้อมูลเพื่อใช้ในการอนุมัติบัญชี
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pb-8 px-6 md:px-10">
            {error && (
              <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50 animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg font-bold">เกิดข้อผิดพลาด</AlertTitle>
                <AlertDescription className="text-base font-medium">
                  {error == "Password too short" ? "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร" : error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-5">

              {authMethod === "NATIVE" && (
                <div className="space-y-4 mb-2">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-lg font-semibold text-gray-700 ml-1">
                      อีเมล (Email) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 pl-16 text-lg rounded-2xl border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" title="password" className="text-lg font-semibold text-gray-700 ml-1">
                      รหัสผ่าน (Password) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        title="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" title="confirmPassword" className="text-lg font-semibold text-gray-700 ml-1">
                      ยืนยันรหัสผ่าน (Confirm Password) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        title="confirmPassword"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-14 pl-16 pr-12 text-lg rounded-2xl border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-lg font-semibold text-gray-700 ml-1">
                    ชื่อจริง <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="firstName"
                      placeholder="สมชาย"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-14 pl-16 text-lg rounded-2xl border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-lg font-semibold text-gray-700 ml-1">
                    นามสกุล
                  </Label>
                  <div className="relative group">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="lastName"
                      placeholder="ใจดี"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-14 pl-12 text-lg rounded-2xl border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 relative">
                <Label className="text-lg font-semibold text-gray-700 ml-1">
                  เขตที่จะทำงาน <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    placeholder="ค้นหาเขต/ทีมที่ต้องการทำงาน..."
                    value={isDropdownOpen ? searchTeam : (teams.find(t => t.id === selectedTeam)?.name || "")}
                    onFocus={() => {
                      setIsDropdownOpen(true);
                      setSearchTeam("");
                    }}
                    onBlur={() => {
                      // Slight delay to allow clicking on dropdown items
                      setTimeout(() => setIsDropdownOpen(false), 200);
                    }}
                    onChange={(e) => {
                      setSearchTeam(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    className="h-14 pl-16 text-lg rounded-2xl border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all cursor-text"
                  />

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50">
                      {filteredTeams.length > 0 ? (
                        filteredTeams.map((team) => (
                          <div
                            key={team.id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-lg text-gray-800 transition-colors"
                            onClick={() => {
                              setSelectedTeam(team.id);
                              setSearchTeam(team.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {team.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-lg text-gray-500 text-center">
                          ไม่พบเขตที่ค้นหา
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleRegister(authMethod)}
                disabled={isLoading}
                className="w-full h-14 mt-4 text-xl font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98]"
              >
                {isLoading ? "กำลังดำเนินการ..." : "ยืนยันเพื่อลงทะเบียน"}
                {!isLoading && <ArrowRight className="ml-2 w-6 h-6" />}
              </Button>
            </div>
          </CardContent>

          <CardFooter className="bg-gray-50/50 justify-center py-6 border-t border-gray-100">
            <p className="text-lg text-gray-500">
              มีบัญชีอยู่แล้ว?{" "}
              <span
                onClick={() => router.push("/login")}
                className="text-primary font-bold cursor-pointer hover:underline underline-offset-4 tracking-tight"
              >
                เข้าสู่ระบบ
              </span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
