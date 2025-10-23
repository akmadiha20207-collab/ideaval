'use client'

import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AuthDebugPage() {
  const { user, session, loading } = useAuth()
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  const [supabaseSession, setSupabaseSession] = useState<any>(null)

  useEffect(() => {
    // Get current session directly from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session)
      setSupabaseUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session)
      setSupabaseSession(session)
      setSupabaseUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleRefresh = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setSupabaseSession(session)
    setSupabaseUser(session?.user ?? null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Auth Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Auth Context State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>User:</strong> {user ? 'Present' : 'Not present'}
              </div>
              <div>
                <strong>Session:</strong> {session ? 'Present' : 'Not present'}
              </div>
              {user && (
                <div>
                  <strong>User ID:</strong> {user.id}
                </div>
              )}
              {user && (
                <div>
                  <strong>User Email:</strong> {user.email}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Direct Supabase State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Supabase User:</strong> {supabaseUser ? 'Present' : 'Not present'}
              </div>
              <div>
                <strong>Supabase Session:</strong> {supabaseSession ? 'Present' : 'Not present'}
              </div>
              {supabaseUser && (
                <div>
                  <strong>User ID:</strong> {supabaseUser.id}
                </div>
              )}
              {supabaseUser && (
                <div>
                  <strong>User Email:</strong> {supabaseUser.email}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={handleRefresh}>
                Refresh Session
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify({
                authContext: { user, session, loading },
                supabaseDirect: { user: supabaseUser, session: supabaseSession }
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
