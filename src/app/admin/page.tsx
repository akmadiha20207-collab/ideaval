'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import { Users, Lightbulb, BarChart3, Settings, ArrowLeft } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'

interface User {
  id: string
  email: string
  name: string
  user_type: 'campus_lead' | 'non_campus_lead'
  created_at: string
}

interface Idea {
  id: string
  title: string
  description: string
  created_at: string
  user_id: string
  user_name: string
}

interface Validation {
  id: string
  idea_id: string
  validator_id: string
  vote: 'upvote' | 'downvote' | 'maybe'
  created_at: string
  idea_title: string
  validator_name: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [validations, setValidations] = useState<Validation[]>([])
  const [loading, setLoading] = useState(true)
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all')
  const [ideaStatusFilter, setIdeaStatusFilter] = useState<string>('all')
  const { user } = useAuth()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Fetch ideas with user names
      const { data: ideasData, error: ideasError } = await supabase
        .from('ideas')
        .select(`
          *,
          users!inner(name)
        `)
        .order('created_at', { ascending: false })

      if (ideasError) throw ideasError

      // Fetch validations with idea titles and validator names
      const { data: validationsData, error: validationsError } = await supabase
        .from('validations')
        .select(`
          *,
          ideas!inner(title),
          users!validations_validator_id_fkey(name)
        `)
        .order('created_at', { ascending: false })

      if (validationsError) throw validationsError

      setUsers(usersData || [])
      setIdeas(ideasData || [])
      setValidations(validationsData || [])
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    userTypeFilter === 'all' || user.user_type === userTypeFilter
  )

  const filteredIdeas = ideas.filter(idea => {
    if (ideaStatusFilter === 'all') return true
    // You can add more sophisticated filtering logic here
    return true
  })

  const stats = {
    totalUsers: users.length,
    campusLeads: users.filter(u => u.user_type === 'campus_lead').length,
    nonCampusLeads: users.filter(u => u.user_type === 'non_campus_lead').length,
    totalIdeas: ideas.length,
    totalValidations: validations.length,
    upvotes: validations.filter(v => v.vote === 'upvote').length,
    downvotes: validations.filter(v => v.vote === 'downvote').length,
    maybes: validations.filter(v => v.vote === 'maybe').length,
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
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Panel
                </h1>
                <p className="text-sm text-gray-600">
                  Manage users, ideas, and platform analytics
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
              <TabsTrigger value="validations">Validations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Users
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalUsers}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats.campusLeads} Campus Leads, {stats.nonCampusLeads} Non-Campus Leads
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
                        Total Ideas
                      </CardTitle>
                      <Lightbulb className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalIdeas}</div>
                      <p className="text-xs text-muted-foreground">
                        Ideas submitted by users
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
                        Total Validations
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalValidations}</div>
                      <p className="text-xs text-muted-foreground">
                        Community validations
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Vote Distribution
                      </CardTitle>
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.upvotes}👍 / {stats.downvotes}👎 / {stats.maybes}🤔
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upvotes / Downvotes / Maybes
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest submissions and validations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ideas.slice(0, 5).map((idea) => (
                        <div key={idea.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{idea.title}</p>
                            <p className="text-sm text-gray-600">
                              by {idea.user_name} • {new Date(idea.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Management</h2>
                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="campus_lead">Campus Leads</SelectItem>
                    <SelectItem value="non_campus_lead">Non-Campus Leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {user.user_type.replace('_', ' ')} • Joined {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ideas" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Idea Management</h2>
                <Select value={ideaStatusFilter} onValueChange={setIdeaStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ideas</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{idea.title}</CardTitle>
                        <CardDescription>
                          by {idea.user_name} • {new Date(idea.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {idea.description}
                        </p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            View Analytics
                          </Button>
                          <Button variant="outline" size="sm">
                            Mark as Featured
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="validations" className="space-y-6">
              <h2 className="text-xl font-semibold">Validation Management</h2>
              
              <div className="grid gap-4">
                {validations.map((validation, index) => (
                  <motion.div
                    key={validation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{validation.idea_title}</h3>
                            <p className="text-sm text-gray-600">
                              Validated by {validation.validator_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(validation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              validation.vote === 'upvote' ? 'bg-green-100 text-green-800' :
                              validation.vote === 'downvote' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {validation.vote === 'upvote' ? '👍 Upvote' :
                               validation.vote === 'downvote' ? '👎 Downvote' :
                               '🤔 Maybe'}
                            </span>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}
