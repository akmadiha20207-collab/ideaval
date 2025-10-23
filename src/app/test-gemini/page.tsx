'use client'

import { useState } from 'react'
import { geminiService } from '@/lib/gemini'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function GeminiTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testMCQGeneration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Testing MCQ generation...')
      
      const mcqs = await geminiService.generateMCQs(
        'AI-Powered Learning Platform',
        'Personalized education for everyone',
        'Education',
        'An AI-powered platform that creates personalized learning paths for students based on their learning style, pace, and interests. The platform uses machine learning to adapt content delivery and provides real-time feedback to optimize learning outcomes.'
      )

      console.log('Generated MCQs:', mcqs)
      setResult(mcqs)
      toast.success('MCQs generated successfully!')
    } catch (error: any) {
      console.error('MCQ generation error:', error)
      setError(error.message)
      toast.error('Failed to generate MCQs')
    } finally {
      setLoading(false)
    }
  }

  const testSummaryGeneration = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Testing summary generation...')
      
      const summary = await geminiService.generateValidationSummary(
        'AI-Powered Learning Platform',
        'Personalized education for everyone',
        'Education',
        'An AI-powered platform that creates personalized learning paths for students.',
        ['Great idea, addresses real need', 'Innovative approach'],
        ['Too complex to implement', 'Market already saturated'],
        ['Interesting concept, needs more research', 'Could work with right team']
      )

      console.log('Generated summary:', summary)
      setResult(summary)
      toast.success('Summary generated successfully!')
    } catch (error: any) {
      console.error('Summary generation error:', error)
      setError(error.message)
      toast.error('Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  const testAvailability = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('Testing API availability...')
      
      const isAvailable = await geminiService.isAvailable()
      
      console.log('API available:', isAvailable)
      setResult({ available: isAvailable })
      toast.success(`API ${isAvailable ? 'is' : 'is not'} available`)
    } catch (error: any) {
      console.error('Availability test error:', error)
      setError(error.message)
      toast.error('Failed to test API availability')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Gemini API Test Page</CardTitle>
            <CardDescription>
              Test Gemini API integration and MCQ generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button onClick={testAvailability} disabled={loading}>
                  Test API Availability
                </Button>
                <Button onClick={testMCQGeneration} disabled={loading}>
                  Test MCQ Generation
                </Button>
                <Button onClick={testSummaryGeneration} disabled={loading}>
                  Test Summary Generation
                </Button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Testing...</span>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-800 mb-2">Error:</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {result && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-2">Result:</h3>
                  <pre className="text-green-700 text-sm overflow-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
