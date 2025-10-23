# Gemini API Setup Guide

## 🚨 **Error: Gemini API not initialized**

The error occurs because the `GEMINI_API_KEY` environment variable is not set. Here's how to fix it:

## 🔑 **Step 1: Get Your Gemini API Key**

1. **Visit Google AI Studio**:
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create API Key**:
   - Click "Create API Key"
   - Select your project (or create a new one)
   - Copy the generated API key

## 📝 **Step 2: Set Up Environment Variables**

### Option A: Manual Setup
1. **Create `.env.local` file** in the project root:
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://xccuofiagrvfrtkuviro.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjY3VvZmlhZ3J2ZnJ0a3V2aXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjM5OTAsImV4cCI6MjA3Njc5OTk5MH0.wSvnFBI8P4DRaSt20cJtx-58yNXfI7xEmDpc__YKs6Y

   # Gemini API Configuration
   GEMINI_API_KEY=your_actual_api_key_here
   ```

2. **Replace `your_actual_api_key_here`** with your actual Gemini API key

### Option B: Use Setup Script
1. **Run the setup script**:
   ```bash
   chmod +x setup-gemini.sh
   ./setup-gemini.sh
   ```

2. **Follow the instructions** to add your API key

## 🔄 **Step 3: Restart Development Server**

After adding the API key:
```bash
npm run dev
```

## ✅ **Step 4: Test Gemini Integration**

1. **Go to Submit Idea page**:
   - Visit: http://localhost:3000/submit-idea
   - Fill in the form and submit an idea

2. **Go to Validate Ideas page**:
   - Visit: http://localhost:3000/validate-ideas
   - Select an idea
   - MCQs should generate automatically using Gemini API

3. **Go to Analytics page**:
   - Visit: http://localhost:3000/analytics
   - Select an idea
   - AI summary should generate using Gemini API

## 🚨 **Troubleshooting**

### Error: "Gemini API not initialized"
- **Cause**: `GEMINI_API_KEY` not set or incorrect
- **Solution**: Check `.env.local` file and restart server

### Error: "API key invalid"
- **Cause**: Wrong API key or expired key
- **Solution**: Generate a new API key from Google AI Studio

### Error: "Quota exceeded"
- **Cause**: API usage limit reached
- **Solution**: Check your Google Cloud billing and quotas

## 🎯 **What Gemini API Does**

1. **MCQ Generation**: Creates 4 market-validation questions for each idea
2. **AI Summarization**: Analyzes validation feedback and provides insights
3. **Recommendations**: Suggests improvements for ideas based on feedback

## 📊 **API Usage**

- **Free Tier**: 15 requests per minute
- **Paid Tier**: Higher limits available
- **Cost**: Very affordable for this use case

## 🔒 **Security Notes**

- ✅ **Never commit** `.env.local` to version control
- ✅ **Keep API key** private and secure
- ✅ **Use environment variables** for production deployment

Once you've set up the API key, the Gemini integration will work seamlessly! 🚀
