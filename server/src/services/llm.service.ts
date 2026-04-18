import { OpenAI } from 'openai';
import { config } from '../config/env.js';

const client = new OpenAI({
  apiKey: config.openaiApiKey,
});

export async function generateChatAnswer(userQuery: string, docs: any[]) {
  const systemPrompt = `
        You are helpful AI Assistant who answers the user query based on the available context from PDF File.
        Context:
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
