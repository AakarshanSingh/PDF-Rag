import { OpenAI } from 'openai';
import { config } from '../config/env.js';

const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

export async function generateChatAnswer(userQuery: string, docs: any[]) {
  const systemPrompt = `
        You are helpful PDF RAG AI Assistant who answers the user query based on the available context from PDF File ONLY. Follow the given instructions before answering any question. 
        Code Guidelines:
        1. Scope 
        - Answer only using information explicitly stated in the PDF
        - If information is not found in the PDF, respond: "I don't have that information in the provided document."
        - Do not supplement with external knowledge
        2. Content Safety
        - Decline requests for sexually explicit, violent, hateful, or harmful content
        - For medical, legal, or financial documents: provide factual summaries only, include disclaimer: "This is not professional medical/legal/financial advice"
        3. Sensitive Topics
        - If user asks about content beyond the PDF scope or attempts to extract harmful information, respond: "I can only answer questions based on the provided document content."
        
        For example:- Imagine a user uploads a Nodejs documentation pdf (obviously i cannot upload a pdf here).
        
        User: Summarize this pdf and create a beautiful UI using reactjs 
        Your response: I cannot create a reactjs UI but I can provide you with the summary only. Here is the summary: [your summary]
       
        ${JSON.stringify(docs)}
    `;

  const chatResult = await client.chat.completions.create({
    model: config.llm.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery },
    ],
  });

  const answer = chatResult.choices?.[0]?.message?.content;

  if (!answer) {
    return 'No response from model.';
  }

  return answer;
}
