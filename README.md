# Idea Validation Portal

A comprehensive AI-powered idea validation platform built for Edventure Park's incubation center at Masab Tank, Hyderabad.

## 🚀 Features

- **User Authentication**: Email/password and Google OAuth integration
- **Idea Submission**: Submit and manage innovative ideas
- **AI-Powered Validation**: Generate MCQs using Google Gemini API
- **Community Validation**: Vote and provide feedback on ideas
- **Analytics Dashboard**: Interactive charts and AI-generated summaries
- **Admin Panel**: Manage users, ideas, and platform analytics
- **Responsive Design**: Modern UI with TailwindCSS and shadcn/ui

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **AI Integration**: Google Gemini API
- **UI Components**: shadcn/ui, Radix UI
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js (v18 or higher)
- Supabase account
- Google Cloud account with Gemini API access

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd idea-validation-portal
   ```

2. **Run the setup script**
   ```bash
   npm run setup
   ```

3. **Configure environment variables**
   - Update `.env.local` with your Supabase and Gemini API credentials
   - See `BACKEND_README.md` for detailed setup instructions

4. **Set up the database**
   - Run the SQL commands in `supabase-schema.sql` in your Supabase dashboard

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── submit-idea/       # Idea submission
│   ├── validate-ideas/    # Idea validation
│   ├── analytics/         # Analytics dashboard
│   └── admin/             # Admin panel
├── components/
│   ├── ui/               # shadcn/ui components
│   └── ProtectedRoute.tsx # Route protection
├── contexts/
│   └── AuthContext.tsx   # Authentication context
└── lib/
    ├── supabase.ts       # Supabase client
    ├── gemini.ts         # Gemini API service
    └── utils.ts          # Utility functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup` - Run setup script
- `npm run type-check` - Run TypeScript type checking

## 📚 Documentation

- **Backend Setup**: See `BACKEND_README.md` for comprehensive setup instructions
- **Database Schema**: See `supabase-schema.sql` for database structure
- **API Documentation**: Supabase auto-generates API documentation

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## 🎯 Key Features Implementation

### Authentication System
- Email/password authentication
- Google OAuth integration
- User type selection (Campus Lead / Non-Campus Lead)
- Protected routes and session management

### Idea Management
- Submit ideas with title and description
- View submitted ideas in dashboard
- Track validation progress

### Validation System
- AI-generated MCQs using Gemini API
- Community voting (upvote/downvote/maybe)
- Opinion collection and storage
- Duplicate validation prevention

### Analytics Dashboard
- Interactive pie charts and bar charts
- AI-powered opinion summarization
- Comprehensive feedback analysis
- Actionable recommendations

### Admin Panel
- User management and analytics
- Idea management and filtering
- Validation tracking and statistics
- Platform overview and metrics

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- Update environment variables for production
- Configure OAuth redirect URIs
- Set up production database

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Idea submission and validation
- [ ] MCQ generation and answering
- [ ] Voting and opinion submission
- [ ] Analytics dashboard functionality
- [ ] AI summary generation
- [ ] Responsive design on mobile devices

## 🔒 Security

- Row Level Security (RLS) policies protect all database operations
- Input validation and sanitization
- Environment variables protection
- OAuth security best practices

## 📈 Performance

- Database indexing for optimal queries
- Next.js automatic code splitting
- Image optimization
- Efficient state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is developed for Edventure Park, Masab Tank, Hyderabad.

## 📞 Support

For technical support or questions, please refer to the `BACKEND_README.md` file or contact the development team.

---

**Built with ❤️ for Edventure Park's innovation ecosystem**