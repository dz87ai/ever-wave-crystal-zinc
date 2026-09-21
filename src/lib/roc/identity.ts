import { create } from "zustand";
import { DEPARTMENTS, type DepartmentKey } from "./constants";

const STORAGE_KEY = "roc-posted-as";

let pickedThisVisit = false;

type IdentityState = {
  postedAs: string;
  savedPostedAs: string | null;
  hydrated: boolean;
  needsDepartment: boolean;
  setPostedAs: (value: string) => void;
  confirmDepartment: (value: string) => void;
  hydrate: () => void;
};

export const POST_AS_OPTIONS = [
  ...DEPARTMENTS.map((d) => d.label),
  "Quality Meeting",
  "Management",
];

export const useIdentity = create<IdentityState>((set) => ({
  postedAs: "Engineering",
  savedPostedAs: null,
  hydrated: false,
  needsDepartment: false,
  setPostedAs: (value) => {
    const next = value.trim() || "Engineering";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    set({ postedAs: next, savedPostedAs: next });
  },
  confirmDepartment: (value) => {
    const next = value.trim() || "Engineering";
    pickedThisVisit = true;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    set({ postedAs: next, savedPostedAs: next, needsDepartment: false });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY)?.trim() || null;
    set({
      postedAs: stored || "Engineering",
      savedPostedAs: stored,
      hydrated: true,
      needsDepartment: !pickedThisVisit,
    });
  },
}));

export function departmentFromPostedAs(postedAs: string): DepartmentKey | null {
  const match = DEPARTMENTS.find(
    (d) => d.label === postedAs || d.short === postedAs || d.key === postedAs,
  );
  return match?.key ?? null;
}