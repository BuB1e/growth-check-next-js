"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Info
} from "lucide-react";
import termsData from "@/data/terms.json";
import policyData from "@/data/policy.json";
import { cn } from "@/lib/utils";

interface PolicyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsAndPrivacyModal({ isOpen, onAccept, onDecline }: PolicyModalProps) {
  const [currentStep, setCurrentStep] = useState<"terms" | "policy">("terms");

  if (!isOpen) return null;

  const data = currentStep === "terms" ? termsData : policyData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-white/20">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-linear-to-b from-blue-50/50 to-white">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-2xl transition-colors duration-300 shadow-sm",
              currentStep === "terms" ? "bg-blue-100 text-blue-600 outline outline- blue-200" : "bg-emerald-100 text-emerald-600 outline outline-emerald-200"
            )}>
              {currentStep === "terms" ? <FileText className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider",
                  currentStep === "terms" ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"
                )}>
                  {currentStep === "terms" ? "ส่วนที่ 1/2" : "ส่วนที่ 2/2"}
                </span>
                <p className="text-gray-400 text-sm font-bold">
                  อัปเดต: {data.lastUpdated}
                </p>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                {data.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-white min-h-[300px]">
          <div className="space-y-8 pb-8">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 text-gray-500 font-medium italic mb-6">
              <Info className="w-5 h-5 shrink-0" />
              <p className="text-sm md:text-base">
                กรุณาอ่าน{currentStep === "terms" ? "ข้อกำหนดและเงื่อนไข" : "นโยบายความเป็นส่วนตัว"}ให้ละเอียดก่อนดำเนินการต่อ
              </p>
            </div>

            {data.sections.map((section: any, idx: number) => (
              <div key={`${currentStep}-${idx}`} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-start gap-3">
                  <span className={cn(
                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black border",
                    currentStep === "terms" ? "bg-blue-50 text-blue-500 border-blue-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                  )}>
                    {idx + 1}
                  </span>
                  {section.title}
                </h3>
                
                {section.content && section.content.map((p: string, pIdx: number) => (
                  <p key={pIdx} className="text-lg text-gray-600 leading-relaxed font-medium pl-11">
                    {p}
                  </p>
                ))}

                {section.items && (
                  <ul className="space-y-3 pl-11">
                    {section.items.map((item: string, itemIdx: number) => (
                      <li key={itemIdx} className="flex items-start gap-3 text-lg text-gray-600 font-medium">
                        <CheckCircle2 className={cn("w-5 h-5 mt-1 shrink-0", currentStep === "terms" ? "text-blue-500" : "text-emerald-500")} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections && section.subsections.map((sub: any, subIdx: number) => (
                  <div key={subIdx} className="pl-11 space-y-3 mt-4">
                    <h4 className="text-lg font-bold text-gray-700 flex items-center gap-2">
                      <ChevronRight className={cn("w-5 h-5", currentStep === "terms" ? "text-blue-400" : "text-emerald-400")} />
                      {sub.title}
                    </h4>
                    <ul className="space-y-2 pl-7 text-gray-600 mt-2">
                      {(sub.items || []).map((item: string, iIdx: number) => (
                        <li key={iIdx} className="text-lg font-medium list-disc ml-4">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {section.note && (
                  <div className="mx-11 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-700 font-bold italic">
                    <Info className="w-6 h-6 shrink-0" />
                    <p>{section.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={onDecline}
            className="flex-1 h-14 md:h-16 text-xl font-bold rounded-2xl border-2 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all active:scale-[0.98]"
          >
            <XCircle className="w-6 h-6 mr-2" />
            ไม่ยอมรับ
          </Button>
          
          {currentStep === "terms" ? (
            <Button
              onClick={() => {
                setCurrentStep("policy");
                // Scroll content area back to top
                const contentArea = document.querySelector('.custom-scrollbar');
                if (contentArea) contentArea.scrollTop = 0;
              }}
              className="flex-3 h-14 md:h-16 text-xl font-black rounded-2xl shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              อ่านนโยบายความเป็นส่วนตัวต่อ
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={onAccept}
              className="flex-3 h-14 md:h-16 text-xl font-black rounded-2xl shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-6 h-6 mr-2" />
              ยอมรับและดำเนินการต่อ
            </Button>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
