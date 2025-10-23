'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AuthCodeErrorPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRetry = () => {
    setLoading(true)
    // Redirect to auth page
    router.push('/auth')
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Authentication Error
            </CardTitle>
            <CardDescription>
              There was an issue with your Google authentication. This could be due to:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Google OAuth not properly configured</li>
              <li>• Redirect URI mismatch</li>
              <li>• Network connectivity issues</li>
              <li>• Browser popup blocked</li>
            </ul>
            
            <div className="space-y-3">
              <Button 
                onClick={handleRetry} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoHome}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Or try signing in with email and password instead
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
