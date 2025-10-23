'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function DatabaseTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>({})

  const testDatabase = async () => {
    setLoading(true)
    const testResults: any = {}

    try {
      // Test 1: Check if ideas table exists
      try {
        const { data: ideas, error: ideasError } = await supabase
          .from('ideas')
          .select('count')
          .limit(1)
        
        testResults.ideas = {
          exists: !ideasError,
          error: ideasError?.message,
          count: ideas?.length || 0
        }
      } catch (error: any) {
        testResults.ideas = {
          exists: false,
          error: error.message
        }
      }

      // Test 2: Check if validations table exists
      try {
        const { data: validations, error: validationsError } = await supabase
          .from('validations')
          .select('count')
          .limit(1)
        
        testResults.validations = {
          exists: !validationsError,
          error: validationsError?.message,
          count: validations?.length || 0
        }
      } catch (error: any) {
        testResults.validations = {
          exists: false,
          error: error.message
        }
      }

      // Test 3: Check if users table exists
      try {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        testResults.users = {
          exists: !usersError,
          error: usersError?.message,
          count: users?.length || 0
        }
      } catch (error: any) {
        testResults.users = {
          exists: false,
          error: error.message
        }
      }

      // Test 4: Check if industries table exists
      try {
        const { data: industries, error: industriesError } = await supabase
          .from('industries')
          .select('count')
          .limit(1)
        
        testResults.industries = {
          exists: !industriesError,
          error: industriesError?.message,
          count: industries?.length || 0
        }
      } catch (error: any) {
        testResults.industries = {
          exists: false,
          error: error.message
        }
      }

      // Test 5: Try to insert a test validation (will fail but show the error)
      try {
        const { error: insertError } = await supabase
          .from('validations')
          .insert([
            {
              idea_id: '00000000-0000-0000-0000-000000000000',
              validator_id: '00000000-0000-0000-0000-000000000000',
              mcqs: [],
              mcq_answers: [],
              vote: 'upvote',
              opinion_text: 'test'
            }
          ])
        
        testResults.insertTest = {
          success: !insertError,
          error: insertError?.message
        }
      } catch (error: any) {
        testResults.insertTest = {
          success: false,
          error: error.message
        }
      }

      setResults(testResults)
      toast.success('Database test completed')
    } catch (error: any) {
      console.error('Database test error:', error)
      toast.error('Database test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Database Test</CardTitle>
            <CardDescription>
              Test database connectivity and table existence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testDatabase} disabled={loading}>
              {loading ? 'Testing...' : 'Run Database Test'}
            </Button>

            {Object.keys(results).length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Test Results:</h3>
                
                {Object.entries(results).map(([table, result]: [string, any]) => (
                  <div key={table} className="p-4 border rounded-lg">
                    <h4 className="font-medium capitalize">{table}</h4>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Exists:</span> 
                        <span className={`ml-2 ${result.exists ? 'text-green-600' : 'text-red-600'}`}>
                          {result.exists ? 'Yes' : 'No'}
                        </span>
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Error:</span> {result.error}
                        </p>
                      )}
                      {result.count !== undefined && (
                        <p className="text-sm">
                          <span className="font-medium">Count:</span> {result.count}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}