import { openaiConfig } from 'src/config/openai';

export const textBot: (
  prompt: string,
  context: string,
) => Promise<any> = async (prompt: string, context: string) => {
  try {
    const response = await openaiConfig.createCompletion({
      model: 'text-davinci-003',
      prompt: generatePrompt(prompt, context),
      temperature: 0.2,
      max_tokens: 2048,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const generatePrompt = (message: string, context: string) => {
  return `
  Answer various questions from a user prompts based on the context provided.

  (N.B): context provided might be bunch of unstructured data

  context: ${context}

  question: ${message}
  `;
};
