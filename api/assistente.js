// Importa a biblioteca oficial do Google
import { GoogleGenerativeAI } from '@google/generative-ai';

// O nome do modelo que queremos usar
const modelName = "gemini-pro";

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
    // --- AUTENTICAÇÃO SEGURA COM CONTA DE SERVIÇO ---
    // A Vercel vai ler nossas variáveis de ambiente e montar o objeto de credenciais
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Corrige quebras de linha
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
    };
    
    // Inicializa a IA com as credenciais seguras
    const genAI = new GoogleGenerativeAI(credentials);
    const model = genAI.getGenerativeModel({ model: modelName });
    // --- FIM DA AUTENTICAÇÃO ---

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
    return response.status(500).json({ message: 'Erro interno no servidor ao se comunicar com a IA.' });
  }
}