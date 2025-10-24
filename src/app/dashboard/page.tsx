'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { Plus, Lightbulb, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'
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

interface User {
  id: string
  name: string
  email: string
  user_type: 'campus_lead' | 'non_campus_lead'
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [userProfile, setUserProfile] = useState<User | null>(null)
  const [userIdeas, setUserIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserProfile()
      fetchUserIdeas()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error
      setUserProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const fetchUserIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserIdeas(data || [])
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
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
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Idea Validation Portal
                </h1>
                <p className="text-sm text-gray-600">
                  Edventure Park, Masab Tank, Hyderabad
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userProfile?.user_type?.replace('_', ' ')}
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ideas">My Ideas</TabsTrigger>
              <TabsTrigger value="validate">Validate Ideas</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Ideas
                      </CardTitle>
                      <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userIdeas.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Ideas submitted by you
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
                        Validations
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Ideas you've validated
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
                        Analytics
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">
                        Ideas with feedback
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Get started with the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link href="/submit-idea">
                        <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                          <Plus className="h-6 w-6" />
                          <span>Submit New Idea</span>
                        </Button>
                      </Link>
                      <Link href="/validate-ideas">
                        <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                          <Users className="h-6 w-6" />
                          <span>Validate Ideas</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="ideas" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">My Ideas</h2>
                <Link href="/submit-idea">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit New Idea
                  </Button>
                </Link>
              </div>

              {userIdeas.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Lightbulb className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No ideas submitted yet
                    </h3>
                    <p className="text-gray-500 text-center mb-4">
                      Start by submitting your first idea to get validation feedback from the community.
                    </p>
                    <Link href="/submit-idea">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Your First Idea
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {userIdeas.map((idea, index) => (
                    <motion.div
                      key={idea.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader>
                        <CardTitle className="text-lg">{idea.name || idea.title || 'Untitled Idea'}</CardTitle>
                        <CardDescription>
                          {idea.tagline || idea.title || 'No tagline'} • {idea.industry || 'No industry'} • {new Date(idea.created_at).toLocaleDateString()}
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 mb-4 line-clamp-3">{idea.brief || idea.description || 'No description available'}</p>
                          {idea.tags && idea.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {idea.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                              {idea.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{idea.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <Link href={`/analytics?idea=${idea.id}`}>
                              <Button variant="outline" size="sm">
                                View Analytics
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="validate">
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Validate Ideas
                </h3>
                <p className="text-gray-500 mb-4">
                  Help validate ideas from the community by providing feedback and voting.
                </p>
                <Link href="/validate-ideas">
                  <Button>Start Validating</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-gray-500 mb-4">
                  View detailed analytics and AI-generated summaries for your ideas.
                </p>
                <Link href="/analytics">
                  <Button>View Analytics</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
