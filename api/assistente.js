// Importa a biblioteca oficial do Google
import { GoogleGenerativeAI } from '@google/generative-ai';

// MODELO ATUALIZADO - Use um destes modelos válidos:
// "gemini-1.5-flash" (rápido e eficiente)
// "gemini-1.5-pro" (mais poderoso)
const modelName = "gemini-1.5-flash";

export default async function handler(request, response) {
  // Apenas permitir requisições do tipo POST
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Método não permitido' });
  }

  // Pegar a pergunta do usuário que veio do front-end
  const { prompt } = request.body;
  if (!prompt) {
    return response.status(400).json({ message: 'Prompt é obrigatório' });
  }

  try {
    // Pega a API Key das variáveis de ambiente
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key não configurada.');
    }
    
    // Inicializa a IA
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Prepara a pergunta para a IA, com o contexto de tutor
    const fullPrompt = `Você é um tutor especialista em vestibulares de Medicina no Brasil (ENEM, UEM, UFPR). Responda a pergunta do estudante de forma clara, didática e motivadora. Pergunta: "${prompt}"`;

    // Gera o conteúdo
    const result = await model.generateContent(fullPrompt);
    const aiResponse = await result.response;
    const aiResponseText = aiResponse.text();

    // Envia a resposta de volta para o front-end
    return response.status(200).json({ response: aiResponseText });

  } catch (error) {
    console.error('Erro na serverless function:', error);
    return response.status(500).json({ 
      message: 'Erro ao comunicar com a IA.',
      error: error.message 
    });
  }
}
