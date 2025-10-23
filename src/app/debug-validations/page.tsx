'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Idea {
  id: string
  name?: string
  title?: string
  tagline?: string
  industry?: string
  brief?: string
  description?: string
  created_at: string
  user_id: string
}

interface Validation {
  id: string
  idea_id: string
  validator_id: string
  mcqs: any
  mcq_answers: number[]
  vote: string
  opinion_text: string
  created_at: string
}

export default function ValidationDebugPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [validations, setValidations] = useState<Validation[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchIdeas()
    }
  }, [user])

  useEffect(() => {
    if (selectedIdea) {
      fetchValidations()
    }
  }, [selectedIdea])

  const fetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setIdeas(data || [])
    } catch (error) {
      console.error('Error fetching ideas:', error)
      toast.error('Failed to load ideas')
    } finally {
      setLoading(false)
    }
  }

  const fetchValidations = async () => {
    if (!selectedIdea) return

    try {
      console.log('Fetching validations for idea:', selectedIdea.id)
      const { data, error } = await supabase
        .from('validations')
        .select('*')
        .eq('idea_id', selectedIdea.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching validations:', error)
        throw error
      }

      console.log('Fetched validations:', data)
      setValidations(data || [])
    } catch (error) {
      console.error('Error fetching validations:', error)
      toast.error('Failed to load validations')
    }
  }

  const refreshValidations = () => {
    if (selectedIdea) {
      fetchValidations()
    }
  }

  const testRealTime = () => {
    if (!selectedIdea) return

    console.log('Setting up real-time test for idea:', selectedIdea.id)
    const channel = supabase
      .channel(`test-validations-${selectedIdea.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'validations',
          filter: `idea_id=eq.${selectedIdea.id}`,
        },
        (payload) => {
          console.log('Real-time test - validation change:', payload)
          toast.success('Real-time update detected!')
          fetchValidations()
        }
      )
      .subscribe()

    toast.success('Real-time subscription started. Check console for updates.')
    
    // Clean up after 30 seconds
    setTimeout(() => {
      supabase.removeChannel(channel)
      toast.info('Real-time test ended')
    }, 30000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Validation Debug Page</CardTitle>
            <CardDescription>
              Debug validation submission and analytics reflection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Current User:</h3>
                <p className="text-sm text-gray-600">
                  {user ? `${user.email} (${user.id})` : 'Not logged in'}
                </p>
              </div>

              <div className="flex space-x-4">
                <Button onClick={fetchIdeas}>Refresh Ideas</Button>
                <Button onClick={refreshValidations} disabled={!selectedIdea}>
                  Refresh Validations
                </Button>
                <Button onClick={testRealTime} disabled={!selectedIdea}>
                  Test Real-time
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ideas List */}
          <Card>
            <CardHeader>
              <CardTitle>Ideas ({ideas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedIdea?.id === idea.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedIdea(idea)}
                  >
                    <h4 className="font-medium">
                      {idea.name || idea.title || 'Untitled'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {idea.tagline || idea.title || 'No tagline'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {idea.industry || 'No industry'} • {new Date(idea.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validations List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Validations ({validations.length})
                {selectedIdea && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    for "{selectedIdea.name || selectedIdea.title}"
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedIdea ? (
                <div className="space-y-3">
                  {validations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No validations found for this idea
                    </p>
                  ) : (
                    validations.map((validation) => (
                      <div key={validation.id} className="p-3 border rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            validation.vote === 'upvote' ? 'bg-green-100 text-green-800' :
                            validation.vote === 'downvote' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {validation.vote}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(validation.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {validation.opinion_text}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>Validator: {validation.validator_id}</p>
                          <p>MCQ Answers: {JSON.stringify(validation.mcq_answers)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Select an idea to view its validations
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Summary */}
        {selectedIdea && validations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Validation Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {validations.filter(v => v.vote === 'upvote').length}
                  </div>
                  <div className="text-sm text-gray-600">Upvotes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {validations.filter(v => v.vote === 'downvote').length}
                  </div>
                  <div className="text-sm text-gray-600">Downvotes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {validations.filter(v => v.vote === 'maybe').length}
                  </div>
                  <div className="text-sm text-gray-600">Maybes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {validations.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
