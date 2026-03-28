"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Info, Check, X, Loader2 } from "lucide-react";
import type { DevelopmentResponse } from "@/dto";
import { updateDevelopmentSuggestionAction } from "./actions";
import { DevelopmentStatusToThai, DevelopmentStatus } from "@/types/Enums";

interface DevelopmentGridProps {
  defaultDevelopments: DevelopmentResponse[];
}

export function DevelopmentGrid({ defaultDevelopments }: DevelopmentGridProps) {
  const [data, setData] = useState<DevelopmentResponse[]>(defaultDevelopments);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Track currently editing cell
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Track save status per row
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set());
  const [successIds, setSuccessIds] = useState<Set<number>>(new Set());
  const [errorIds, setErrorIds] = useState<Set<number>>(new Set());
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const filteredData = data.filter((item) =>
    item.suggestion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.metric.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (dev: DevelopmentResponse) => {
    setEditingId(dev.id);
    setEditValue(dev.suggestion || "");
    setErrorIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(dev.id);
      return newSet;
    });
  };

  const handleSave = useCallback(async (id: number, newValue: string) => {
    // If no change or empty, just exit edit mode if empty
    const originalItem = data.find((d) => d.id === id);
    if (!originalItem || originalItem.suggestion === newValue) {
      setEditingId(null);
      return;
    }

    if (!newValue.trim()) {
      // Revert if empty string is not allowed or handle it.
      // Handoff said min 1 char
      setErrorIds((prev) => new Set(prev).add(id));
      setEditingId(null);
      return;
    }

    setEditingId(null);
    setSavingIds((prev) => new Set(prev).add(id));
    
    // Optimistic update
    setData((prev) =>
      prev.map((d) => (d.id === id ? { ...d, suggestion: newValue } : d))
    );

    const result = await updateDevelopmentSuggestionAction(String(id), newValue);

    setSavingIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });

    if (result.success) {
      setSuccessIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setSuccessIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 2000); // clear success mark after 2 seconds
    } else {
      setErrorIds((prev) => new Set(prev).add(id));
      // Revert optimistic update
      setData((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, suggestion: originalItem.suggestion } : d
        )
      );
    }
  }, [data]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave(id, editValue);
      
      // Auto-move to next row (Excel-like)
      const currentIndex = filteredData.findIndex((d) => d.id === id);
      if (currentIndex !== -1 && currentIndex + 1 < filteredData.length) {
        const nextDev = filteredData[currentIndex + 1];
        // Cannot literally focus next row synchronously because of React state batching,
        // but we can schedule the edit state to change.
        setTimeout(() => startEditing(nextDev), 50);
      }
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 relative">
      <div className="p-3 border-b flex justify-between bg-white z-10 sticky top-0 items-center gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ค้นหาข้อความ, เกณฑ์, หรือสถานะ..."
            className="pl-9 bg-slate-100 border-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center text-xs text-slate-500 gap-1.5 flex-wrap">
          <Info className="h-4 w-4" />
          <span>คลิกที่เซลล์ &quot;คำแนะนำ&quot; หรือใช้คีย์บอร์ด (Tab/Enter) เพื่อแก้ไข และกด Enter เพื่อบันทึก</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white" style={{ minHeight: "400px" }}>
        <table className="w-full text-sm text-left relative border-collapse">
          <thead className="text-xs text-slate-600 bg-slate-100 uppercase sticky top-0 z-10 shadow-sm">
            <tr>
              <th scope="col" className="px-4 py-3 border-r border-b w-16 text-center font-semibold">ID</th>
              <th scope="col" className="px-4 py-3 border-r border-b w-24 font-semibold">Metric</th>
              <th scope="col" className="px-4 py-3 border-r border-b w-40 font-semibold">สถานะเกณฑ์</th>
              <th scope="col" className="px-4 py-3 border-r border-b w-36 text-center font-semibold">อายุ (เดือน)</th>
              <th scope="col" className="px-4 py-3 border-b font-semibold bg-blue-50/50">คำแนะนำ (SUGGESTION)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-500 bg-white">
                  ไม่พบข้อมูลคำแนะนำ
                </td>
              </tr>
            ) : (
              filteredData.map((dev) => {
                const isEditing = editingId === dev.id;
                const isSaving = savingIds.has(dev.id);
                const isSuccess = successIds.has(dev.id);
                const isError = errorIds.has(dev.id);

                return (
                  <tr
                    key={dev.id}
                    className="border-b hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-4 py-2 border-r text-center text-slate-400 font-mono">
                      {dev.id}
                    </td>
                    <td className="px-4 py-2 border-r font-medium">
                      {dev.metric}
                    </td>
                    <td className="px-4 py-2 border-r">
                      <Badge variant="outline" className="font-normal truncate max-w-full inline-block">
                        {DevelopmentStatusToThai[dev.status as DevelopmentStatus] || dev.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 border-r text-center text-slate-600 whitespace-nowrap space-x-1">
                      <span className="inline-block bg-slate-100 rounded px-1.5 py-0.5">{dev.minAge}</span>
                      <span>–</span>
                      <span className="inline-block bg-slate-100 rounded px-1.5 py-0.5">{dev.maxAge}</span>
                    </td>
                    <td
                      className={`px-0 py-0 relative cursor-text group-hover:bg-blue-50/30 transition-colors ${
                        isError ? "bg-red-50" : isSuccess ? "bg-emerald-50" : ""
                      }`}
                      onClick={() => {
                        if (!isEditing && !isSaving) {
                          startEditing(dev);
                        }
                      }}
                    >
                      <div className="w-full h-full flex items-center px-4 min-h-[44px]">
                        {isEditing ? (
                          <div className="absolute inset-0 z-20 shadow-[0_0_0_2px_#3b82f6] bg-white flex items-center p-1">
                            <Input
                              ref={inputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSave(dev.id, editValue)}
                              onKeyDown={(e) => handleKeyDown(e, dev.id)}
                              className="w-full h-full border-0 focus-visible:ring-0 rounded-none shadow-none text-sm px-3"
                            />
                            <div className="text-xs text-slate-400 absolute right-3 bottom-1">
                              Enter ↵
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 text-slate-700 text-wrap pr-8">
                            {dev.suggestion || <span className="text-slate-400 italic">เพิ่มคำแนะนำ...</span>}
                          </div>
                        )}
                        
                        {/* Status Icons Indicator */}
                        <div className="absolute right-3 flex items-center justify-center pointer-events-none w-5 h-5">
                          {isSaving && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                          {isSuccess && <Check className="w-4 h-4 text-emerald-500" />}
                          {isError && <X className="w-4 h-4 text-red-500" />}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
