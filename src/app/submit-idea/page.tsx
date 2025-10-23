'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { UserService } from '@/lib/user-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft, Lightbulb, Upload, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Industry {
  id: number
  name: string
  description: string
}

export default function SubmitIdeaPage() {
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [industry, setIndustry] = useState('')
  const [brief, setBrief] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [newMediaUrl, setNewMediaUrl] = useState('')
  const [industries, setIndustries] = useState<Industry[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingIndustries, setLoadingIndustries] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchIndustries()
  }, [])

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('name')

      if (error) throw error
      setIndustries(data || [])
    } catch (error) {
      console.error('Error fetching industries:', error)
      toast.error('Failed to load industries')
    } finally {
      setLoadingIndustries(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addMediaUrl = () => {
    if (newMediaUrl.trim() && !mediaUrls.includes(newMediaUrl.trim())) {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()])
      setNewMediaUrl('')
    }
  }

  const removeMediaUrl = (urlToRemove: string) => {
    setMediaUrls(mediaUrls.filter(url => url !== urlToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !tagline.trim() || !industry || !brief.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!user) {
      toast.error('Please log in to submit an idea')
      return
    }

    setLoading(true)
    try {
      // Ensure user exists in users table
      await UserService.ensureUserExists(user)

      // Now submit the idea
      const { data, error } = await supabase
        .from('ideas')
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            tagline: tagline.trim(),
            industry: industry,
            brief: brief.trim(),
            tags: tags,
            media_urls: mediaUrls,
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Idea submitted successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error submitting idea:', error)
      
      // Show more specific error messages
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        toast.error('Database tables not found. Please contact administrator.')
      } else if (error.message?.includes('foreign key constraint')) {
        toast.error('User not found. Please try logging in again.')
      } else if (error.message?.includes('row-level security')) {
        toast.error('Permission denied. Please check your account.')
      } else {
        toast.error(`Failed to submit idea: ${error.message || 'Unknown error'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Submit New Idea
                </h1>
                <p className="text-sm text-gray-600">
                  Share your innovative idea with the community
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-blue-600" />
                  Idea Submission Form
                </CardTitle>
                <CardDescription>
                  Provide a clear title and detailed description of your idea. 
                  This will help validators understand and evaluate your concept effectively.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Idea Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your idea name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={100}
                      />
                      <p className="text-xs text-gray-500">
                        {name.length}/100 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tagline">Tagline *</Label>
                      <Input
                        id="tagline"
                        type="text"
                        placeholder="A catchy one-liner about your idea"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        required
                        maxLength={150}
                      />
                      <p className="text-xs text-gray-500">
                        {tagline.length}/150 characters
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={industry} onValueChange={setIndustry} disabled={loadingIndustries}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind.id} value={ind.name}>
                            {ind.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {loadingIndustries && (
                      <p className="text-xs text-gray-500">Loading industries...</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brief">Brief Description *</Label>
                    <Textarea
                      id="brief"
                      placeholder="Describe your idea in detail. Include:
• What problem does it solve?
• How does it work?
• Who is your target audience?
• What makes it unique?
• Any technical requirements or considerations?"
                      value={brief}
                      onChange={(e) => setBrief(e.target.value)}
                      required
                      rows={8}
                      maxLength={2000}
                    />
                    <p className="text-xs text-gray-500">
                      {brief.length}/2000 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-blue-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Media URLs (Optional)</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add media URL (images, videos, documents)"
                        value={newMediaUrl}
                        onChange={(e) => setNewMediaUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMediaUrl())}
                      />
                      <Button type="button" onClick={addMediaUrl} variant="outline">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {mediaUrls.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {mediaUrls.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm text-gray-700 truncate">{url}</span>
                            <button
                              type="button"
                              onClick={() => removeMediaUrl(url)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      What happens next?
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Your idea will be visible to all community members</li>
                      <li>• Validators will answer MCQs and provide feedback</li>
                      <li>• You'll receive AI-powered analytics and recommendations</li>
                      <li>• Track validation progress in your dashboard</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Idea'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
