"use client";

import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import type { IBranch } from "@/services/api/dashboard/branch/types/ibranch.types";

interface IBranchPickerProps {
  label: string;
  branches: readonly IBranch[];
  value: string | undefined;
  onChange: (branchId: string) => void;
}

export function BranchPicker({
  label,
  branches,
  value,
  onChange,
}: IBranchPickerProps) {
  return (
    <label className="grid max-w-sm gap-2 text-sm text-text-100">
      <span>{label}</span>
      <Select value={value ?? ""} onChange={(key) => onChange(String(key))}>
        <SelectTrigger>
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent>
          {branches.map((branch) => (
            <SelectItem id={branch.id} key={branch.id}>
              {branch.name.en}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
