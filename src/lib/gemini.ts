import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY || ''

// Initialize Gemini AI with proper error handling
let genAI: GoogleGenerativeAI | null = null

try {
  if (!GEMINI_API_KEY) {
    console.warn('NEXT_PUBLIC_GEMINI_API_KEY not found in environment variables')
  } else {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    console.log('Gemini AI initialized successfully')
  }
} catch (error) {
  console.error('Failed to initialize Gemini AI:', error)
}

export interface MCQ {
  question: string
  options: string[]
  correct_answer: number
}

export interface ValidationSummary {
  upvote_summary: string
  downvote_summary: string
  maybe_summary: string
  overall_analysis: string
  recommendations: string[]
}

export class GeminiService {
  private model = genAI?.getGenerativeModel({ model: 'gemini-2.5-flash' })

  private async callGeminiAPI(prompt: string) {
    if (!genAI || !this.model) {
      throw new Error('Gemini API not initialized. Please check your NEXT_PUBLIC_GEMINI_API_KEY environment variable.')
    }

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error(`Gemini API error: ${error}`)
    }
  }

  async generateMCQs(ideaName: string, ideaTagline: string, ideaIndustry: string, ideaBrief: string): Promise<MCQ[]> {
    const prompt = `
Generate 4 market-validation-related multiple-choice questions about this business idea:

Idea Name: ${ideaName}
Tagline: ${ideaTagline}
Industry: ${ideaIndustry}
Brief Description: ${ideaBrief}

The questions should focus on:
1. Market feasibility and demand
2. Competitive landscape and uniqueness
3. Scalability and growth potential
4. Technical/operational feasibility

Each question should have 4 options (A, B, C, D) and one correct answer.

Return the response in the following JSON format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0
  }
]

Make sure the questions are practical and help validate the business idea's market potential.
`

    try {
      const text = await this.callGeminiAPI(prompt)
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const mcqs = JSON.parse(jsonMatch[0])
        // Validate the structure
        if (Array.isArray(mcqs) && mcqs.length === 4) {
          return mcqs
        }
      }
      
      throw new Error('Could not parse MCQ response or invalid format')
    } catch (error: any) {
      console.error('Error generating MCQs:', error)
      throw error
    }
  }

  async generateValidationSummary(
    ideaName: string,
    ideaTagline: string,
    ideaIndustry: string,
    ideaBrief: string,
    upvoteOpinions: string[],
    downvoteOpinions: string[],
    maybeOpinions: string[]
  ): Promise<ValidationSummary> {
    const prompt = `
Analyze the validation feedback for this business idea:

Idea Name: ${ideaName}
Tagline: ${ideaTagline}
Industry: ${ideaIndustry}
Brief Description: ${ideaBrief}

Upvote Opinions: ${upvoteOpinions.join('; ')}
Downvote Opinions: ${downvoteOpinions.join('; ')}
Maybe Opinions: ${maybeOpinions.join('; ')}

Please provide:
1. A summary of key points from upvote opinions
2. A summary of key points from downvote opinions  
3. A summary of key points from maybe opinions
4. An overall analysis of the idea's potential
5. Three actionable recommendations for improving this idea

Return the response in the following JSON format:
{
  "upvote_summary": "Summary of upvote feedback",
  "downvote_summary": "Summary of downvote feedback", 
  "maybe_summary": "Summary of maybe feedback",
  "overall_analysis": "Overall analysis of the idea",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}
`

    try {
      const text = await this.callGeminiAPI(prompt)
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const summary = JSON.parse(jsonMatch[0])
        // Validate the structure
        if (summary.upvote_summary && summary.downvote_summary && summary.maybe_summary && 
            summary.overall_analysis && Array.isArray(summary.recommendations)) {
          return summary
        }
      }
      
      throw new Error('Could not parse validation summary response or invalid format')
    } catch (error) {
      console.error('Error generating validation summary:', error)
      throw error
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!genAI) return false
      await this.callGeminiAPI('Test')
      return true
    } catch (error) {
      console.error('Gemini API not available:', error)
      return false
    }
  }
}

export const geminiService = new GeminiService()
