#!/bin/bash

# Idea Validation Portal - Supabase Setup Script
echo "🔗 Setting up Supabase connection..."

# Create .env.local file with Supabase credentials
cat > .env.local << 'EOL'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xccuofiagrvfrtkuviro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjY3VvZmlhZ3J2ZnJ0a3V2aXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjM5OTAsImV4cCI6MjA3Njc5OTk5MH0.wSvnFBI8P4DRaSt20cJtx-58yNXfI7xEmDpc__YKs6Y

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
EOL

echo "✅ Supabase credentials configured!"
echo ""
echo "📋 Next steps:"
echo "1. Get your Gemini API key from: https://makersuite.google.com/app/apikey"
echo "2. Update GEMINI_API_KEY in .env.local"
echo "3. Run the database setup commands in your Supabase dashboard"
echo "4. Start the development server with: npm run dev"
echo ""
echo "🗄️ Database Setup Instructions:"
echo "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
echo "2. Select your project: xccuofiagrvfrtkuviro"
echo "3. Go to SQL Editor"
echo "4. Copy and paste the contents of supabase-schema.sql"
echo "5. Run the SQL commands"
echo ""
echo "🚀 Ready to start development!"
