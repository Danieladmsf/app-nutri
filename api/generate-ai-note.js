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

    // Instrução para evitar repetir texto anterior
    let avoidRepeat = '';
    if (existingText && existingText.trim().length > 10) {
      avoidRepeat = `\n\nIMPORTANTE: O texto anterior foi rejeitado pelo auditor. NÃO repita o texto abaixo. Produza uma versão COMPLETAMENTE DIFERENTE com outra abordagem, outras palavras e outra estrutura:\n---\n${existingText.trim()}\n---`;
    }

    contentArray.push({
      type: 'text',
      text: `Atue como um Nutricionista Auditor rigoroso inspecionando uma cozinha industrial. Categoria do problema: ${categoryLabel}. Assunto Específico: ${itemLabel}. Descrição padrão do problema: ${itemText}. \n\n${image ? 'Analise a imagem anexada sobre este quesito.' : ''}\nEscreva de forma técnica, impessoal e direta, APENAS A CONSTATAÇÃO DO FATO E A ORIENTAÇÃO TÉCNICA/AÇÃO CORRETIVA para regularizar a situação. Máximo de 4 linhas. Não use saudações.${avoidRepeat}`,
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
