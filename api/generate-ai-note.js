import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' });
  }

  try {
    const { categoryLabel, itemLabel, itemText, image, existingText } = req.body || {};

    if (!categoryLabel || !itemLabel || !itemText) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes.' });
    }

    const contentArray = [];

    if (image && image.b64 && image.mime) {
      contentArray.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.mime,
          data: image.b64,
        },
      });
    }

    // O auditor pode ter feito uma anotação manual que deve guiar a visão da IA
    let auditorNotes = '';
    if (existingText && existingText.trim().length > 3) {
      auditorNotes = `\n\nO auditor fez a seguinte anotação/draft neste quesito:\n"${existingText.trim()}"\n\nDiretriz: Utilize a anotação do auditor como o CONTEXTO PRINCIPAL e expanda-a. Se a anotação for breve ou informal, formalize, elabore e detalhe o problema com riqueza de detalhes, confirmando com o que você vê na imagem (se houver). Se a anotação já for um texto final e formal, o usuário está pedindo uma versão alternativa, então gere um texto reescrito diferente do original.`;
    }

    contentArray.push({
      type: 'text',
      text: `Atue como um Nutricionista Auditor especializado inspecionando uma cozinha industrial.\nCategoria: ${categoryLabel}\nAssunto: ${itemLabel}\nPadrão Exigido: ${itemText}${auditorNotes}\n\n${image ? 'Analise minuciosamente a evidência fotográfica anexada.' : ''}\nProduza o laudo escrevendo de forma técnica, impessoal e rica em detalhes visuais e contextuais. Estruture apenas com o texto da CONSTATAÇÃO DA NÃO-CONFORMIDADE e a respectiva AÇÃO CORRETIVA/ORIENTAÇÃO. Máximo de 5 linhas corridas. Não use saudações.`,
    });

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 250,
      temperature: 0.6,
      messages: [{ role: 'user', content: contentArray }],
    });

    const text = msg.content?.[0]?.text || '';
    return res.status(200).json({ text });
  } catch (err) {
    console.error('Erro na API Anthropic:', err);
    return res.status(500).json({ error: err.message || 'Erro ao processar requisição' });
  }
}
