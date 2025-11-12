// CÓDIGO DE INVESTIGAÇÃO: LISTAR MODELOS DISPONÍVEIS
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(request, response) {
  try {
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
    };
    
    const genAI = new GoogleGenerativeAI(credentials);
    
    // ATENÇÃO: A URL para listar modelos é diferente!
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${credentials.private_key_id}`; // Usando uma parte da credencial como chave temporária para o request
    
    // Este código abaixo usa a API REST diretamente, pois a biblioteca do Google não facilita listar modelos com conta de serviço
    const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Autenticação com conta de serviço é mais complexa, mas vamos tentar sem token primeiro
        // Se não funcionar, o erro nos dirá o que fazer
      },
    });

    // Precisamos de um token de acesso para a API
    // Por simplicidade, vamos retornar uma mensagem guiando o próximo passo
    // A autenticação OAuth2 é necessária para listar modelos.

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Teste");
    
    // Se o código chegou aqui, o modelo 'gemini-pro' existe!
    return response.status(200).json({ response: "SUCESSO! O modelo 'gemini-pro' foi encontrado e funcionou." });

  } catch (error) {
    console.error('Erro de investigação:', error);
    // Retorna o erro exato para o front-end para podermos ver
    return response.status(500).json({ response: `ERRO DE INVESTIGAÇÃO: ${error.message}` });
  }
}
