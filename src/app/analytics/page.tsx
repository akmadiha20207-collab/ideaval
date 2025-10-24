'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { geminiService, ValidationSummary } from '@/lib/gemini'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft, ThumbsUp, ThumbsDown, HelpCircle, TrendingUp, Users, Lightbulb } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
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
  mcqs: any
  mcq_answers: number[]
  vote: 'upvote' | 'downvote' | 'maybe'
  opinion_text: string
  created_at: string
}

interface ValidationStats {
  upvotes: number
  downvotes: number
  maybes: number
  total: number
}

const COLORS = {
  upvote: '#10B981', // green
  downvote: '#EF4444', // red
  maybe: '#F59E0B', // yellow
}

export default function AnalyticsPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [validations, setValidations] = useState<Validation[]>([])
  const [validationStats, setValidationStats] = useState<ValidationStats>({
    upvotes: 0,
    downvotes: 0,
    maybes: 0,
    total: 0,
  })
  const [aiSummary, setAiSummary] = useState<ValidationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchUserIdeas()
    }
  }, [user])

  // Handle idea selection from query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const ideaId = urlParams.get('idea')
    
    if (ideaId && ideas.length > 0) {
      const idea = ideas.find(i => i.id === ideaId)
      if (idea) {
        setSelectedIdea(idea)
      }
    }
  }, [ideas])

  useEffect(() => {
    if (selectedIdea) {
      fetchValidationsForIdea(selectedIdea.id)
    }
  }, [selectedIdea])

  // Real-time updates for validations
  useEffect(() => {
    if (!selectedIdea) return

    const channel = supabase
      .channel(`validations-${selectedIdea.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'validations',
          filter: `idea_id=eq.${selectedIdea.id}`,
        },
        (payload) => {
          // Refresh validations when they change
          fetchValidationsForIdea(selectedIdea.id)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedIdea])

  const fetchUserIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user?.id)
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

  const fetchValidationsForIdea = async (ideaId: string) => {
    try {
      const { data, error } = await supabase
        .from('validations')
        .select('*')
        .eq('idea_id', ideaId)

      if (error) {
        console.error('Error fetching validations:', error)
        throw error
      }
      
      const validations = data || []
      setValidations(validations)

      // Calculate stats
      const stats = validations.reduce(
        (acc, validation) => {
          // Map vote values to accumulator keys
          if (validation.vote === 'upvote') {
            acc.upvotes++
          } else if (validation.vote === 'downvote') {
            acc.downvotes++
          } else if (validation.vote === 'maybe') {
            acc.maybes++
          }
          
          acc.total++
          return acc
        },
        { upvotes: 0, downvotes: 0, maybes: 0, total: 0 }
      )
      
      setValidationStats(stats)

      // Generate AI summary if there are validations
      if (validations.length > 0) {
        generateAISummary(validations)
      } else {
        setAiSummary(null)
      }
    } catch (error) {
      console.error('Error fetching validations:', error)
      toast.error('Failed to load validation data')
    }
  }

  const generateAISummary = async (validations: Validation[]) => {
    if (!selectedIdea) return

    setSummaryLoading(true)
    try {
      const upvoteOpinions = validations
        .filter(v => v.vote === 'upvote')
        .map(v => v.opinion_text)
      
      const downvoteOpinions = validations
        .filter(v => v.vote === 'downvote')
        .map(v => v.opinion_text)
      
      const maybeOpinions = validations
        .filter(v => v.vote === 'maybe')
        .map(v => v.opinion_text)

      // Extract MCQ data
      const mcqData = {
        mcqs: validations[0]?.mcqs || [],
        answers: validations.map(v => v.mcq_answers || [])
      }

      const summary = await geminiService.generateValidationSummary(
        selectedIdea.name || selectedIdea.title || 'Untitled Idea',
        selectedIdea.tagline || selectedIdea.title || 'No tagline',
        selectedIdea.industry || 'No industry',
        selectedIdea.brief || selectedIdea.description || 'No description',
        upvoteOpinions,
        downvoteOpinions,
        maybeOpinions,
        mcqData
      )

      setAiSummary(summary)
    } catch (error) {
      console.error('Error generating AI summary:', error)
      toast.error('Failed to generate AI summary')
    } finally {
      setSummaryLoading(false)
    }
  }

  const pieChartData = [
    { name: 'Upvotes', value: validationStats.upvotes, color: COLORS.upvote },
    { name: 'Downvotes', value: validationStats.downvotes, color: COLORS.downvote },
    { name: 'Maybes', value: validationStats.maybes, color: COLORS.maybe },
  ].filter(item => item.value > 0)

  const barChartData = [
    { name: 'Upvotes', value: validationStats.upvotes, color: COLORS.upvote },
    { name: 'Downvotes', value: validationStats.downvotes, color: COLORS.downvote },
    { name: 'Maybes', value: validationStats.maybes, color: COLORS.maybe },
  ]

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
                <h1 className="text-2xl font-bold text-gray-900">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  AI-powered insights and validation analytics
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {ideas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Lightbulb className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No ideas to analyze
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  Submit your first idea to start getting validation analytics and AI insights.
                </p>
                <Button onClick={() => window.location.href = '/submit-idea'}>
                  Submit Your First Idea
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Idea Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select an Idea to Analyze</CardTitle>
                  <CardDescription>
                    Choose one of your submitted ideas to view detailed analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {ideas.map((idea) => (
                      <div
                        key={idea.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedIdea?.id === idea.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedIdea(idea)}
                      >
                        <h3 className="font-medium">{idea.name || idea.title || 'Untitled Idea'}</h3>
                        <p className="text-sm text-gray-600 mt-1">{idea.tagline || idea.title || 'No tagline'}</p>
                        <p className="text-xs text-gray-500">
                          {idea.industry || 'No industry'} • {new Date(idea.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedIdea && (
                <div className="space-y-6">
                  {/* Selected Idea */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedIdea.name || selectedIdea.title || 'Untitled Idea'}</CardTitle>
                      <CardDescription>
                        {selectedIdea.tagline || 'No tagline'} • {selectedIdea.industry || 'No industry'} •{' '}
                        Submitted on {new Date(selectedIdea.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedIdea.brief || selectedIdea.description || 'No description available'}</p>
                      
                      {Array.isArray(selectedIdea.tags) && selectedIdea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
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
                    </CardContent>
                  </Card>

                  {/* Validation Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Upvotes
                          </CardTitle>
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {validationStats.upvotes}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {validationStats.total > 0 
                              ? `${Math.round((validationStats.upvotes / validationStats.total) * 100)}% of total`
                              : 'No validations yet'
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Downvotes
                          </CardTitle>
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {validationStats.downvotes}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {validationStats.total > 0 
                              ? `${Math.round((validationStats.downvotes / validationStats.total) * 100)}% of total`
                              : 'No validations yet'
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Maybes
                          </CardTitle>
                          <HelpCircle className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-yellow-600">
                            {validationStats.maybes}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {validationStats.total > 0 
                              ? `${Math.round((validationStats.maybes / validationStats.total) * 100)}% of total`
                              : 'No validations yet'
                            }
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Charts */}
                  {validationStats.total > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>Validation Distribution</CardTitle>
                            <CardDescription>
                              Pie chart showing vote distribution
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={pieChartData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Card>
                          <CardHeader>
                            <CardTitle>Validation Comparison</CardTitle>
                            <CardDescription>
                              Bar chart comparing vote counts
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={barChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  )}

                  {/* AI Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                          AI-Powered Analysis
                        </CardTitle>
                        <CardDescription>
                          Comprehensive analysis and recommendations generated by AI
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {summaryLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-4"></div>
                            <span>Generating AI analysis...</span>
                          </div>
                        ) : aiSummary ? (
                          <div className="space-y-6">
                            <div>
                              <h4 className="font-semibold text-green-700 mb-2">Upvote Feedback Summary</h4>
                              <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                                {aiSummary.upvote_summary}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-red-700 mb-2">Downvote Feedback Summary</h4>
                              <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg">
                                {aiSummary.downvote_summary}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-yellow-700 mb-2">Maybe Feedback Summary</h4>
                              <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                                {aiSummary.maybe_summary}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-indigo-700 mb-2">MCQ Analysis by Factor</h4>
                              <p className="text-sm text-gray-700 bg-indigo-50 p-3 rounded-lg">
                                {aiSummary.mcq_analysis}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-blue-700 mb-2">Overall Analysis</h4>
                              <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                {aiSummary.overall_analysis}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-purple-700 mb-2">Recommendations</h4>
                              <ul className="space-y-2">
                                {aiSummary.recommendations.map((recommendation, index) => (
                                  <li key={index} className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">
                                    <span className="font-medium">{index + 1}.</span> {recommendation}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : validationStats.total === 0 ? (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No validations yet
                            </h3>
                            <p className="text-gray-500">
                              This idea hasn't been validated by the community yet. 
                              Share it with others to get feedback and AI analysis.
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Button onClick={() => generateAISummary(validations)}>
                              Generate AI Analysis
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
