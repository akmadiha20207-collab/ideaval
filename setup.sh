#!/bin/bash

# Idea Validation Portal - Setup Script
# This script helps set up the project environment

echo "🚀 Setting up Idea Validation Portal..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOL
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
EOL
    echo "✅ .env.local file created. Please update it with your actual credentials."
else
    echo "✅ .env.local file already exists."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if all required files exist
echo "🔍 Checking project structure..."

required_files=(
    "src/lib/supabase.ts"
    "src/lib/gemini.ts"
    "src/contexts/AuthContext.tsx"
    "src/components/ProtectedRoute.tsx"
    "supabase-schema.sql"
    "BACKEND_README.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase and Gemini API credentials"
echo "2. Run the SQL commands in supabase-schema.sql in your Supabase dashboard"
echo "3. Configure Google OAuth in Supabase Authentication settings"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "For detailed setup instructions, see BACKEND_README.md"
