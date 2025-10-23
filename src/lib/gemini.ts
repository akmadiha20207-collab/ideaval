const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'

// Initialize Gemini AI with proper error handling
let genAI: any = null

try {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not found in environment variables')
  } else {
    genAI = { apiKey: GEMINI_API_KEY, apiUrl: GEMINI_API_URL }
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
  private async callGeminiAPI(prompt: string) {
    if (!genAI) {
      throw new Error('Gemini API not initialized. Please check your GEMINI_API_KEY environment variable.')
    }

    const response = await fetch(`${genAI.apiUrl}?key=${genAI.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2000,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }

    // Handle different response structures
    if (data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text
    } else if (data.candidates[0].content.text) {
      return data.candidates[0].content.text
    } else {
      console.error('Unexpected response structure:', data.candidates[0].content)
      throw new Error('Unexpected response structure from Gemini API')
    }
  }

  async generateMCQs(ideaName: string, ideaTagline: string, ideaIndustry: string, ideaBrief: string): Promise<MCQ[]> {
    console.log('Generating MCQs for:', { ideaName, ideaTagline, ideaIndustry, ideaBrief })
    
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
      console.log('Calling Gemini API...')
      
      const text = await this.callGeminiAPI(prompt)
      console.log('Response text:', text)
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        console.log('Found JSON match:', jsonMatch[0])
        const mcqs = JSON.parse(jsonMatch[0])
        console.log('Parsed MCQs:', mcqs)
        // Validate the structure
        if (Array.isArray(mcqs) && mcqs.length === 4) {
          console.log('MCQs validation passed')
          return mcqs
        } else {
          console.error('MCQs validation failed:', { length: mcqs.length, isArray: Array.isArray(mcqs) })
        }
      } else {
        console.error('No JSON match found in response')
      }
      
      throw new Error('Could not parse MCQ response or invalid format')
    } catch (error) {
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
