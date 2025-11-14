import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { LiveProvider, LivePreview } from 'react-live'

export default function LessonPage() {
  const router = useRouter()
  const { id } = router.query
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchLesson()
    }
  }, [id])

  const fetchLesson = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('code')
      .eq('id', id)
      .single()

    if (data?.code) {
      setCode(data.code)
    }
    setLoading(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => router.push('/')}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Back
      </button>
      
      <LiveProvider 
        code={code} 
        scope={{ React, useState, useEffect }} // Provide necessary dependencies
        noInline
      >
        <LivePreview />
      </LiveProvider>
    </div>
  )
}
