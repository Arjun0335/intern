"use client";

import { v4 as uuidv4 } from "uuid";

export type LessonRecord = {
  id: string;
  outline: string;
  status: "generating" | "generated";
  tsSource?: string;
  createdAt: string;
};

const STORAGE_KEY = "lessons_v1";

export function loadAll(): LessonRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LessonRecord[];
  } catch (e) {
    console.error("loadAll error", e);
    return [];
  }
}

export function saveAll(items: LessonRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function createRecord(outline: string): LessonRecord {
  const r: LessonRecord = {
    id: uuidv4(),
    outline,
    status: "generating",
    createdAt: new Date().toISOString(),
  };
  const all = loadAll();
  all.unshift(r);
  saveAll(all);
  return r;
}

export function updateRecord(id: string, patch: Partial<LessonRecord>) {
  const all = loadAll();
  const idx = all.findIndex((x) => x.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...patch };
  saveAll(all);
}

export function getRecord(id: string): LessonRecord | undefined {
  const all = loadAll();
  return all.find((x) => x.id === id);
}
