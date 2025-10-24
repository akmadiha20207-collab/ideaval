'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { geminiService, MCQ } from '@/lib/gemini'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { ArrowLeft, ThumbsUp, ThumbsDown, HelpCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Idea {
  id: string
  name?: string
  title?: string // Legacy field
  tagline?: string
  industry?: string
  brief?: string
  description?: string // Legacy field
  tags?: string[]
  media_urls?: string[]
  created_at: string
  user_id: string
}

interface Validation {
  id: string
  idea_id: string
  validator_id: string
  mcqs: MCQ[]
  mcq_answers: number[]
  vote: 'upvote' | 'downvote' | 'maybe'
  opinion_text: string
  created_at: string
}

export default function ValidateIdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [mcqs, setMcqs] = useState<MCQ[]>([])
  const [mcqAnswers, setMcqAnswers] = useState<number[]>([])
  const [opinion, setOpinion] = useState('')
  const [vote, setVote] = useState<'upvote' | 'downvote' | 'maybe' | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mcqLoading, setMcqLoading] = useState(false)
  const [mcqError, setMcqError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchIdeas()
  }, [])

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

  const handleIdeaSelect = async (idea: Idea) => {
    setSelectedIdea(idea)
    setMcqLoading(true)
    setMcqError(null)
    setMcqs([]) // Clear previous MCQs

    // Add minimum loading time to ensure user sees the loading state
    const startTime = Date.now()
    const minLoadingTime = 1000 // 1 second minimum

    try {
      // Check if MCQs already exist for this idea
      const { data: existingValidation, error: validationError } = await supabase
        .from('validations')
        .select('mcqs')
        .eq('idea_id', idea.id)
        .limit(1)
        .single()

      if (existingValidation?.mcqs && Array.isArray(existingValidation.mcqs) && existingValidation.mcqs.length > 0) {
        setMcqs(existingValidation.mcqs)
        setMcqAnswers(new Array(existingValidation.mcqs.length).fill(-1))
      } else {
        // Generate new MCQs using Gemini API
        const generatedMcqs = await geminiService.generateMCQs(
          idea.name || idea.title || 'Untitled Idea',
          idea.tagline || idea.title || 'No tagline',
          idea.industry || 'No industry',
          idea.brief || idea.description || 'No description'
        )
        
        if (generatedMcqs && Array.isArray(generatedMcqs) && generatedMcqs.length > 0) {
          setMcqs(generatedMcqs)
          setMcqAnswers(new Array(generatedMcqs.length).fill(-1))
        } else {
          throw new Error('Generated MCQs are empty or invalid')
        }
      }

      setOpinion('')
      setVote(null)
    } catch (error: any) {
      console.error('Error generating MCQs:', error)
      setMcqError(error.message || 'Failed to generate validation questions')
      toast.error('Failed to generate validation questions')
    } finally {
      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
      
      if (remainingTime > 0) {
        setTimeout(() => {
          setMcqLoading(false)
        }, remainingTime)
      } else {
        setMcqLoading(false)
      }
    }
  }

  const handleMcqAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...mcqAnswers]
    newAnswers[questionIndex] = answerIndex
    setMcqAnswers(newAnswers)
  }

  const resetValidationState = () => {
    setSelectedIdea(null)
    setMcqs([])
    setMcqAnswers([])
    setOpinion('')
    setVote(null)
    setMcqError(null)
  }

  const handleSubmitValidation = async () => {
    if (!selectedIdea || !user || !vote || !opinion.trim()) {
      toast.error('Please provide all required information')
      return
    }

    if (mcqAnswers.some(answer => answer === -1)) {
      toast.error('Please answer all MCQ questions')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('validations')
        .insert([
          {
            idea_id: selectedIdea.id,
            validator_id: user.id,
            mcqs: mcqs,
            mcq_answers: mcqAnswers,
            vote: vote,
            opinion_text: opinion.trim(),
          },
        ])

      if (error) throw error

      toast.success('Validation submitted successfully!')
      resetValidationState()
    } catch (error: any) {
      console.error('Error submitting validation:', error)

      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        toast.error('Database tables not found. Please contact administrator.')
      } else if (error.message?.includes('foreign key constraint')) {
        toast.error('Invalid idea or user. Please try again.')
      } else if (error.message?.includes('row-level security')) {
        toast.error('Permission denied. Please check your account.')
      } else if (error.message?.includes('duplicate key')) {
        toast.error('You have already validated this idea.')
      } else {
        toast.error(`Failed to submit validation: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Validate Ideas</h1>
                <p className="text-sm text-gray-600">Help validate ideas from the community</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedIdea ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Available Ideas to Validate</h2>

              {ideas.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas available</h3>
                    <p className="text-gray-500 text-center">
                      There are no ideas to validate at the moment. Check back later!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {ideas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleIdeaSelect(idea)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {idea.name || idea.title || 'Untitled Idea'}
                          </CardTitle>
                          <CardDescription>
                            {idea.tagline || 'No tagline'} • {idea.industry || 'No industry'} •{' '}
                            Submitted on {new Date(idea.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4 line-clamp-3">
                            {idea.brief || idea.description || 'No description available'}
                          </p>
                          {idea.tags && idea.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {idea.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <Button variant="outline" size="sm">
                            Validate This Idea
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Idea */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {selectedIdea.name || selectedIdea.title || 'Untitled Idea'}
                  </CardTitle>
                  <CardDescription>
                    {selectedIdea.tagline || 'No tagline'} • {selectedIdea.industry || 'No industry'} •{' '}
                    Submitted on {new Date(selectedIdea.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    {selectedIdea.brief || selectedIdea.description || 'No description available'}
                  </p>

                  {Array.isArray(selectedIdea.tags) && selectedIdea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedIdea.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {Array.isArray(selectedIdea.media_urls) && selectedIdea.media_urls.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Media:</h4>
                      {selectedIdea.media_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* MCQ Section */}
              {mcqLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                    <span>Generating validation questions...</span>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Market Validation Questions</CardTitle>
                    <CardDescription>
                      Answer these AI-generated questions to help validate the idea
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {mcqError ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Error generating questions:</h4>
                        <p className="text-red-700 text-sm mb-4">{mcqError}</p>
                        <Button 
                          onClick={() => handleIdeaSelect(selectedIdea!)} 
                          variant="outline" 
                          size="sm"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : mcqs.length > 0 ? (
                      mcqs.map((mcq, questionIndex) => (
                        <div key={questionIndex} className="space-y-3">
                          <h4 className="font-medium">
                            {questionIndex + 1}. {mcq.question}
                          </h4>
                          <div className="space-y-2">
                            {mcq.options.map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-gray-50"
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  checked={mcqAnswers[questionIndex] === optionIndex}
                                  onChange={() => handleMcqAnswer(questionIndex, optionIndex)}
                                  className="h-4 w-4 text-blue-600"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm mb-4">No questions available.</p>
                        <Button 
                          onClick={() => handleIdeaSelect(selectedIdea!)} 
                          variant="outline" 
                          size="sm"
                        >
                          Generate Questions
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Opinion Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Opinion</CardTitle>
                  <CardDescription>Share your thoughts about this idea</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="opinion">Detailed Feedback</Label>
                    <Textarea
                      id="opinion"
                      placeholder="Provide feedback about feasibility, potential, uniqueness..."
                      value={opinion}
                      onChange={(e) => setOpinion(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Overall Assessment</Label>
                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant={vote === 'upvote' ? 'default' : 'outline'}
                        onClick={() => setVote('upvote')}
                        className="flex items-center space-x-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Upvote</span>
                      </Button>
                      <Button
                        type="button"
                        variant={vote === 'downvote' ? 'default' : 'outline'}
                        onClick={() => setVote('downvote')}
                        className="flex items-center space-x-2"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>Downvote</span>
                      </Button>
                      <Button
                        type="button"
                        variant={vote === 'maybe' ? 'default' : 'outline'}
                        onClick={() => setVote('maybe')}
                        className="flex items-center space-x-2"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <span>Maybe</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={resetValidationState}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitValidation} disabled={submitting || mcqLoading}>
                  {submitting ? 'Submitting...' : 'Submit Validation'}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
