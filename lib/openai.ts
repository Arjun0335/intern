import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateLessonCode(outline: string): Promise<string> {
  const prompt = `
Generate a React component in TypeScript that renders an interactive lesson based on this outline: "${outline}".

Requirements:
- The component must be named LessonComponent
- It should be a complete, self-contained React functional component
- Use TypeScript types where appropriate
- Include interactive elements if suitable (e.g., quizzes, examples)
- Style it appropriately using inline styles or Tailwind classes
- Export it as default

Example structure:
import React, { useState } from 'react';

const LessonComponent: React.FC = () => {
  // Component logic here
  return (
    <div>
      {/* Lesson content */}
    </div>
  );
};

export default LessonComponent;
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2000,
  })

  return response.choices[0].message.content || ''
}
