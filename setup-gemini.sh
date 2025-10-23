#!/bin/bash

# Gemini API Setup Script
echo "🚀 Setting up Gemini API for Idea Validation Portal"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xccuofiagrvfrtkuviro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjY3VvZmlhZ3J2ZnJ0a3V2aXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjM5OTAsImV4cCI6MjA3Njc5OTk5MH0.wSvnFBI8P4DRaSt20cJtx-58yNXfI7xEmDpc__YKs6Y

# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIzaSyA8XCqOZ04x1sFpfiqOsnYmKjuLp2BcucU
EOF
    echo "✅ .env.local file created!"
else
    echo "✅ .env.local file already exists"
fi

echo ""
echo "🔑 Next steps to get your Gemini API key:"
echo ""
echo "1. Visit: https://makersuite.google.com/app/apikey"
echo "2. Sign in with your Google account"
echo "3. Click 'Create API Key'"
echo "4. Copy the generated API key"
echo "5. Replace 'your_gemini_api_key_here' in .env.local with your actual key"
echo ""
echo "6. Restart your development server:"
echo "   npm run dev"
echo ""
echo "🎉 Once you've added your API key, the Gemini integration will work!"
