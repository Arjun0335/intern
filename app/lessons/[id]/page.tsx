"use client";

import React, { useEffect, useState } from "react";
import { getRecord, LessonRecord } from "../../../lib/lessonStore";

export default function LessonView({ params }: { params: { id: string } }) {
  const { id } = params as { id: string };
  const [rec, setRec] = useState<LessonRecord | null>(null);

  useEffect(() => {
    const found = getRecord(id);
    setRec(found ?? null);
  }, [id]);

  if (!rec) {
    return (
      <div>
        <h2>Lesson not found</h2>
        <p>Either the lesson id is invalid or it hasn't been generated yet in this browser.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22 }}>{rec.status === "generating" ? "Generating..." : `Lesson: ${rec.id}`}</h1>
      <p style={{ color: "#555" }}>{rec.outline}</p>

      {rec.status === "generating" && <div style={{ marginTop: 12 }}>The lesson is still generating. Return to <a href="/">home</a> to check status.</div>}

      {rec.status === "generated" && rec.tsSource && (
        <section style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Generated TypeScript</h3>
          <pre style={{ background: "#0f172a", color: "#e6eef8", padding: 12, borderRadius: 6, overflowX: "auto" }}>
            <code>{rec.tsSource}</code>
          </pre>

          <h3 style={{ marginTop: 16 }}>Rendered Lesson (parsed from generated TypeScript)</h3>
          <RenderedFromTs source={rec.tsSource} />
        </section>
      )}
    </div>
  );
}

function RenderedFromTs({ source }: { source: string }) {
  // Very small parser: find `body:` field inside template literal and render it.
  // NOTE: we do NOT eval the TypeScript for safety — we parse the string.
  const bodyMatch = source.match(/body:\s*`([\s\S]*?)`/);
  const titleMatch = source.match(/title:\s*"(.*?)"/);
  const title = titleMatch ? titleMatch[1] : "Lesson";
  const body = bodyMatch ? bodyMatch[1] : "(no body)";

  return (
    <div style={{ marginTop: 8 }}>
      <h4 style={{ marginBottom: 6 }}>{title}</h4>
      <div style={{ whiteSpace: "pre-wrap", background: "#fafafa", padding: 12, borderRadius: 6 }}>{body}</div>
    </div>
  );
}
