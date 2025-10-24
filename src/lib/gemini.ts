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
  factor: 'Feasibility' | 'Scalability' | 'Market Potential' | 'Uniqueness'
}

export interface ValidationSummary {
  upvote_summary: string
  downvote_summary: string
  maybe_summary: string
  mcq_analysis: string
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
Generate 4 simple multiple-choice questions that help validate a startup or business idea based on the following details:

Idea Title: ${ideaName}
Idea Description: ${ideaBrief}

The questions should explore how people perceive the idea in terms of:

Feasibility (Can this actually work?)
Scalability (Can it grow big?)
Market Potential (Would people use or pay for it?)
Uniqueness (Is it different from others?)

Each question should be written in easy, natural language (like asking a friend for their opinion), not in formal or academic tone.
Avoid using any "correct" or "wrong" answers — all options should represent different viewpoints or levels of confidence.

Format each question as an object in this JSON array:

[
  {
    "question": "Question text here",
    "options": [
      "Option A text",
      "Option B text", 
      "Option C text",
      "Option D text"
    ],
    "factor": "Feasibility"
  }
]

Make sure:
- The options reflect different user sentiments (e.g., "Very likely", "Maybe", "Not sure", "Unlikely")
- The tone stays simple, curious, and engaging
- There's no correct_answer field
- Each question focuses on one of the four factors: Feasibility, Scalability, Market Potential, or Uniqueness
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
    maybeOpinions: string[],
    mcqData: { mcqs: MCQ[], answers: number[][] }
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

MCQ Validation Data:
${mcqData.mcqs.map((mcq, index) => {
  const upvoteAnswers = mcqData.answers.filter((_, i) => i < upvoteOpinions.length).map(answers => answers[index]).filter(a => a !== -1)
  const downvoteAnswers = mcqData.answers.filter((_, i) => i >= upvoteOpinions.length && i < upvoteOpinions.length + downvoteOpinions.length).map(answers => answers[index]).filter(a => a !== -1)
  const maybeAnswers = mcqData.answers.filter((_, i) => i >= upvoteOpinions.length + downvoteOpinions.length).map(answers => answers[index]).filter(a => a !== -1)
  
  return `
Question ${index + 1} (${mcq.factor}): ${mcq.question}
Options: ${mcq.options.map((opt, i) => `${i}: ${opt}`).join(', ')}
Upvote responses: ${upvoteAnswers.map(a => mcq.options[a]).join(', ') || 'No responses'}
Downvote responses: ${downvoteAnswers.map(a => mcq.options[a]).join(', ') || 'No responses'}
Maybe responses: ${maybeAnswers.map(a => mcq.options[a]).join(', ') || 'No responses'}`
}).join('\n')}

Please provide:
1. A summary of key points from upvote opinions
2. A summary of key points from downvote opinions  
3. A summary of key points from maybe opinions
4. An analysis of MCQ responses by validation factor (Feasibility, Scalability, Market Potential, Uniqueness)
5. An overall analysis of the idea's potential
6. Three actionable recommendations for improving this idea

Return the response in the following JSON format:
{
  "upvote_summary": "Summary of upvote feedback",
  "downvote_summary": "Summary of downvote feedback", 
  "maybe_summary": "Summary of maybe feedback",
  "mcq_analysis": "Analysis of MCQ responses by factor",
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
            summary.mcq_analysis && summary.overall_analysis && Array.isArray(summary.recommendations)) {
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
