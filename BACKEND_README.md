# Idea Validation Portal - Backend Setup Guide

## Overview

This is a full-stack Idea Validation Portal built for Edventure Park's incubation center at Masab Tank, Hyderabad. The platform allows users to submit ideas, validate them through community feedback and AI analysis, and provides comprehensive analytics.

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Supabase (Database, Authentication, Real-time)
- **AI Integration**: Google Gemini API
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Prerequisites

Before setting up the project, ensure you have:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Supabase account** (free tier available)
4. **Google Cloud account** with Gemini API access
5. **Git** (for version control)

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the Project URL and anon/public key
4. Paste them in your `.env.local` file

### Getting Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in your `.env.local` file

## Database Setup

### 1. Run the Database Schema

Execute the SQL commands in `supabase-schema.sql` in your Supabase SQL editor:

```sql
-- Copy and paste the entire content of supabase-schema.sql
-- This will create all necessary tables, policies, and functions
```

### 2. Database Tables Created

The schema creates the following tables:

#### `users` table
- `id` (UUID, Primary Key, References auth.users)
- `email` (TEXT, Unique)
- `name` (TEXT)
- `user_type` (TEXT, Enum: 'campus_lead' | 'non_campus_lead')
- `created_at` (TIMESTAMP)

#### `ideas` table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `title` (TEXT)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

#### `validations` table
- `id` (UUID, Primary Key)
- `idea_id` (UUID, Foreign Key to ideas)
- `validator_id` (UUID, Foreign Key to users)
- `mcqs` (JSONB, Stores MCQ data)
- `vote` (TEXT, Enum: 'upvote' | 'downvote' | 'maybe')
- `opinion_text` (TEXT)
- `created_at` (TIMESTAMP)

### 3. Row Level Security (RLS)

The schema includes comprehensive RLS policies:

- Users can only view/edit their own data
- Ideas are publicly readable but only editable by the creator
- Validations are publicly readable but only editable by the validator
- Prevents duplicate validations from the same user for the same idea

## Authentication Setup

### 1. Enable Authentication Providers

In your Supabase dashboard:

1. Go to Authentication > Providers
2. Enable **Email** provider
3. Enable **Google** provider and configure OAuth settings:
   - Add your domain to authorized redirect URIs
   - Configure OAuth consent screen in Google Cloud Console

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Installation and Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd idea-validation-portal

# Install dependencies
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── submit-idea/       # Idea submission page
│   ├── validate-ideas/    # Idea validation page
│   ├── analytics/         # Analytics dashboard
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   └── ProtectedRoute.tsx # Route protection component
├── contexts/
│   └── AuthContext.tsx   # Authentication context
└── lib/
    ├── supabase.ts       # Supabase client configuration
    ├── gemini.ts         # Gemini API service
    └── utils.ts          # Utility functions
```

## Key Features Implementation

### 1. Authentication System
- Email/password authentication
- Google OAuth integration
- User type selection (Campus Lead / Non-Campus Lead)
- Protected routes and session management

### 2. Idea Submission
- Form validation and submission
- Real-time data storage
- User-specific idea management

### 3. Validation System
- AI-generated MCQs using Gemini API
- Community voting (upvote/downvote/maybe)
- Opinion collection and storage
- Duplicate validation prevention

### 4. Analytics Dashboard
- Interactive pie charts and bar charts
- AI-powered opinion summarization
- Comprehensive feedback analysis
- Actionable recommendations

### 5. AI Integration
- MCQ generation for idea validation
- Opinion summarization and analysis
- Recommendation generation
- Error handling and fallbacks

## API Endpoints

### Supabase API (Auto-generated)
- `GET /rest/v1/ideas` - Fetch ideas
- `POST /rest/v1/ideas` - Create new idea
- `GET /rest/v1/validations` - Fetch validations
- `POST /rest/v1/validations` - Create validation

### Custom API Routes
- `POST /auth/callback` - OAuth callback handler

## Deployment

### 1. Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### 2. Environment Variables for Production

Update your production environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
GEMINI_API_KEY=your_gemini_api_key
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret
```

### 3. Supabase Production Setup

1. Update OAuth redirect URIs in Supabase
2. Configure production domain in Supabase settings
3. Update RLS policies if needed

## Testing

### 1. Manual Testing Checklist

- [ ] User registration and login
- [ ] Idea submission and validation
- [ ] MCQ generation and answering
- [ ] Voting and opinion submission
- [ ] Analytics dashboard functionality
- [ ] AI summary generation
- [ ] Responsive design on mobile devices

### 2. Test Data

You can create test data by:
1. Registering multiple test users
2. Submitting sample ideas
3. Validating ideas with different votes
4. Testing AI summary generation

## Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies are correct

2. **Gemini API Errors**
   - Verify API key is valid
   - Check API quota limits
   - Ensure proper error handling

3. **Authentication Problems**
   - Verify OAuth configuration
   - Check redirect URIs
   - Ensure proper session handling

4. **Build Errors**
   - Clear `.next` folder
   - Reinstall dependencies
   - Check TypeScript errors

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **RLS Policies**: All database operations are protected by Row Level Security
3. **Input Validation**: All user inputs are validated and sanitized
4. **API Rate Limiting**: Consider implementing rate limiting for production
5. **CORS Configuration**: Properly configure CORS for production domains

## Performance Optimization

1. **Database Indexing**: Indexes are created for frequently queried columns
2. **Image Optimization**: Use Next.js Image component for optimized images
3. **Code Splitting**: Automatic code splitting with Next.js
4. **Caching**: Implement proper caching strategies for API calls

## Monitoring and Analytics

1. **Supabase Analytics**: Monitor database performance and usage
2. **Vercel Analytics**: Track application performance and user behavior
3. **Error Tracking**: Consider implementing error tracking (Sentry, etc.)
4. **User Analytics**: Track user engagement and feature usage

## Support and Maintenance

1. **Regular Updates**: Keep dependencies updated
2. **Security Patches**: Apply security updates promptly
3. **Backup Strategy**: Implement database backup strategy
4. **Monitoring**: Set up monitoring and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed for Edventure Park, Masab Tank, Hyderabad. Please contact the organization for licensing information.

## Contact

For technical support or questions about this implementation, please contact the development team or refer to the project documentation.
