// Gemini AI Service for Farm Advisor
// Uses Google's Generative AI - Gemini 2.5 Flash

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface AdvisorQuery {
    question: string;
    sector: 'Layer' | 'Broiler' | 'Fish';
    farmContext?: {
        totalBirds?: number;
        activeBatches?: number;
        recentMortality?: number;
    };
}

export interface AdvisorResponse {
    success: boolean;
    response?: string;
    error?: string;
}

// System prompt to give the AI context about farming
const SYSTEM_PROMPT = `You are HomeFarm Advisor, an expert AI assistant for small-scale farmers in Africa. 
You specialize in poultry (layers and broilers) and aquaculture (fish farming).

Your responses should be:
- Practical and actionable for farmers with limited resources
- Written in simple, clear language
- Focused on low-cost solutions when possible
- Culturally appropriate for African farming contexts
- Concise (aim for 3-5 key points maximum)

Always format your response with:
1. A brief diagnosis or assessment
2. 2-4 numbered action steps
3. A prevention tip for the future (if applicable)

If you're unsure about medical advice, recommend consulting a local veterinarian.
Keep responses under 300 words.`;

export async function queryAdvisor(query: AdvisorQuery): Promise<AdvisorResponse> {
    if (!GEMINI_API_KEY) {
        return {
            success: false,
            error: 'Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment.'
        };
    }

    try {
        // Build context-aware prompt
        let contextInfo = '';
        if (query.farmContext) {
            const ctx = query.farmContext;
            contextInfo = `\n\nFarm context: ${query.sector} sector`;
            if (ctx.totalBirds) contextInfo += `, ${ctx.totalBirds} total stock`;
            if (ctx.activeBatches) contextInfo += `, ${ctx.activeBatches} active batches`;
            if (ctx.recentMortality) contextInfo += `, recent mortality: ${ctx.recentMortality}`;
        }

        const userMessage = `[${query.sector} Farming Question]${contextInfo}\n\nFarmer's question: ${query.question}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: SYSTEM_PROMPT },
                        { text: userMessage }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
                topP: 0.9,
                topK: 40
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
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API error:', errorData);
            return {
                success: false,
                error: errorData.error?.message || `API request failed with status ${response.status}`
            };
        }

        const data = await response.json();

        // Extract the text response from Gemini's response structure
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            return {
                success: false,
                error: 'No response generated. Please try rephrasing your question.'
            };
        }

        return {
            success: true,
            response: textResponse
        };

    } catch (error) {
        console.error('Error querying Gemini:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred'
        };
    }
}

// Test function to verify API connectivity
export async function testGeminiConnection(): Promise<boolean> {
    try {
        const result = await queryAdvisor({
            question: 'Say "Hello, I am working!" in exactly 5 words.',
            sector: 'Layer'
        });
        return result.success;
    } catch {
        return false;
    }
}
