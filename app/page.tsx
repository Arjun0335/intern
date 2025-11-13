"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createRecord, loadAll, LessonRecord, updateRecord } from "../lib/lessonStore";

export default function HomePage() {
  const [outline, setOutline] = useState("");
  const [list, setList] = useState<LessonRecord[]>([]);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setList(loadAll());
    function onStorage() {
      setList(loadAll());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function refreshList() {
    setList(loadAll());
  }

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!outline.trim()) return alert("Please enter a lesson outline");

    const rec = createRecord(outline.trim());
    setList((s) => [rec, ...s]);
    setLoadingIds((l) => ({ ...l, [rec.id]: true }));

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outline: outline.trim(), id: rec.id }),
      });

      const json = await resp.json();
      if (!resp.ok) {
        console.error("generate error", json);
        updateRecord(rec.id, { status: "generated", tsSource: `// Error generating lesson:\n// ${JSON.stringify(json)}` });
      } else {
        const { tsSource } = json as { tsSource: string };
        updateRecord(rec.id, { status: "generated", tsSource });
      }
    } catch (err) {
      console.error(err);
      updateRecord(rec.id, { status: "generated", tsSource: `// Generation failed: ${String(err)}` });
    } finally {
      setLoadingIds((l) => {
        const copy = { ...l };
        delete copy[rec.id];
        return copy;
      });
      refreshList();
      setOutline("");
    }
  }

  return (
    <main>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Generate Lessons</h1>

      <form onSubmit={handleGenerate}>
        <textarea
          placeholder={`Examples:\nA one-pager on how to divide with long division\nA test on counting numbers\nA 10 question pop quiz on Florida`}
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
          style={{ width: "100%", minHeight: 120, padding: 8, fontSize: 14 }}
        />
        <div style={{ marginTop: 8 }}>
          <button type="submit">Generate</button>
        </div>
      </form>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Lessons</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Title / Outline</th>
              <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd", width: 160 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td style={{ padding: 8 }} colSpan={2}>
                  No lessons yet — enter an outline above and hit Generate.
                </td>
              </tr>
            )}
            {list.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 8, borderTop: "1px solid #f0f0f0" }}>
                  <div style={{ fontWeight: 600 }}>
                    <Link href={`/lessons/${r.id}`}>{makeTitleFromOutline(r.outline)}</Link>
                  </div>
                  <div style={{ color: "#555", fontSize: 13 }}>{r.outline}</div>
                </td>
                <td style={{ padding: 8, borderTop: "1px solid #f0f0f0" }}>
                  {r.status === "generating" || loadingIds[r.id] ? (
                    <span>generating...</span>
                  ) : (
                    <span>generated — <Link href={`/lessons/${r.id}`}>view</Link></span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function makeTitleFromOutline(outline: string) {
  const trimmed = outline.trim();
  if (!trimmed) return "Untitled Lesson";
  const first = trimmed.split("\n")[0];
  return first.split(" ").slice(0, 6).join(" ") + (first.split(" ").length > 6 ? "..." : "");
}
