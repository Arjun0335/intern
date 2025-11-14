import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateLessonCode } from '../lib/openai'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  status: 'generating' | 'generated'
}

export default function Home() {
  const [outline, setOutline] = useState('')
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    fetchLessons()
    
    const subscription = supabase
      .channel('lessons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => {
        fetchLessons()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchLessons = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('id, title, status')
      .order('created_at', { ascending: false })
    setLessons(data || [])
  }

  const handleGenerate = async () => {
    if (!outline.trim()) return

    const { data, error } = await supabase
      .from('lessons')
      .insert([{ title: outline, outline, status: 'generating' }])
      .select()
      .single()

    if (error) {
      console.error(error)
      return
    }

    setOutline('')

    // Generate the lesson code asynchronously
    generateLessonCode(outline).then(async (code) => {
      await supabase
        .from('lessons')
        .update({ status: 'generated', code })
        .eq('id', data.id)
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Generate Lessons</h1>
      
      <div className="mb-8">
        <textarea
          value={outline}
          onChange={(e) => setOutline(e.target.value)}
          placeholder="Enter lesson outline (e.g., 'A 10 question pop quiz on Florida')"
          className="w-full p-2 border rounded"
          rows={4}
        />
        <button
          onClick={handleGenerate}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate
        </button>
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.id}>
              <td className="border p-2">{lesson.title}</td>
              <td className="border p-2">{lesson.status}</td>
              <td className="border p-2">
                {lesson.status === 'generated' && (
                  <Link href={`/lessons/${lesson.id}`} className="text-blue-500 hover:underline">
                    View
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
