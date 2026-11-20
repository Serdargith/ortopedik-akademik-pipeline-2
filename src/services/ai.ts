import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = 'gemini' | 'openrouter' | 'groq';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callAI(
  provider: AIProvider,
  systemPrompt: string,
  userPrompt: string,
  modelName?: string,
  retries = 3,
  maxTokens = 4096
): Promise<string> {
  let lastError: any;
  
  for (let i = 0; i < retries; i++) {
    try {
      if (provider === 'gemini') {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ 
          model: modelName || "gemini-2.0-flash",
          systemInstruction: systemPrompt,
          generationConfig: {
            maxOutputTokens: maxTokens
          }
        });
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        return response.text();
      } else if (provider === 'openrouter' || provider === 'groq') {
        const apiKey = provider === 'openrouter' 
          ? process.env.OPENROUTER_API_KEY 
          : process.env.GROQ_API_KEY;
        
        const baseUrl = provider === 'openrouter'
          ? "https://openrouter.ai/api/v1/chat/completions"
          : "https://api.groq.com/openai/v1/chat/completions";

        const defaultModel = provider === 'openrouter'
          ? "anthropic/claude-3.5-sonnet"
          : "llama-3.3-70b-versatile";

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            ...(provider === 'openrouter' ? {
              'HTTP-Referer': window.location.origin,
              'X-Title': 'IMRaD Pipeline'
            } : {})
          },
          body: JSON.stringify({
            model: modelName || defaultModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: maxTokens
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error?.message || `API Error: ${response.status}`;
          
          // Handle OpenRouter prompt token limit error
          if (provider === 'openrouter' && errorMessage.includes('Prompt tokens limit exceeded')) {
            console.error('OpenRouter prompt token limit exceeded. The prompt is too large for your current credit tier.');
            throw new Error(`Prompt too large for OpenRouter credits: ${errorMessage}`);
          }

          // Handle OpenRouter credit/token limit error
          if (provider === 'openrouter' && errorMessage.includes('can only afford')) {
            const match = errorMessage.match(/can only afford (\d+)/);
            if (match && match[1]) {
              const affordableTokens = parseInt(match[1], 10);
              // Reduce maxTokens for the next retry
              maxTokens = Math.max(1024, affordableTokens - 100); 
              console.warn(`OpenRouter credit limit hit. Reducing maxTokens to ${maxTokens} and retrying...`);
              continue;
            }
          }

          // If rate limited, wait and retry
          if (response.status === 429) {
            const waitTime = (i + 1) * 5000; // 5s, 10s, 15s...
            console.warn(`Rate limited. Retrying in ${waitTime}ms...`);
            await delay(waitTime);
            continue;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        const waitTime = (i + 1) * 2000;
        await delay(waitTime);
        continue;
      }
    }
  }
  
  throw lastError || new Error('Failed after retries');
}
