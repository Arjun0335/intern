import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { outline, id } = await req.json();
    if (!outline) return NextResponse.json({ error: "missing outline" }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "server missing OPENAI_API_KEY" }, { status: 500 });

    // Build a precise prompt that asks the model to return ONLY TypeScript source
    const prompt = `You are an assistant that must produce VALID TypeScript source code only.\n\nTask: Given the following lesson outline, generate a TypeScript module that default-exports a Lesson object and its type. The module must: \n1) Export a type named Lesson with fields id, title, outline, body (all strings).\n2) Export a default lesson object of type Lesson.\n3) Ensure the file is valid TypeScript and uses template literals for multi-line strings.\n4) Do not include any narrative or explanations — output only TypeScript source code.\n\nOutline:\n${outline}\n\nEnd.`;

    const body = {
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "You are a TypeScript code generator." }, { role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 800,
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: "openai error", detail: txt }, { status: res.status });
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;
    if (!content) return NextResponse.json({ error: "no content from AI" }, { status: 500 });

    return NextResponse.json({ tsSource: content });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
