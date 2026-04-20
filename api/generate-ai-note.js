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
    const { categoryLabel, itemLabel, itemText, image, existingText, maxTokens } = req.body || {};

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
      auditorNotes = `\n\nO auditor fez a seguinte anotação neste quesito:\n"${existingText.trim()}"\n\nDiretriz: Utilize a anotação do auditor como o CONTEXTO PRINCIPAL e expanda-a. Se a anotação for breve ou informal, detalhe o problema com base na imagem (se houver). Se a anotação já for um texto longo, crie uma versão alternativa estruturada de forma diferente.`;
    }

    contentArray.push({
      type: 'text',
      text: `Atue como um Nutricionista Consultor (perfil parceiro, amigável e extremamente profissional) orientando uma cozinha industrial.\nCategoria: ${categoryLabel}\nAssunto: ${itemLabel}\nPadrão Exigido: ${itemText}${auditorNotes}\n\n${image ? 'Analise a evidência fotográfica anexada.' : ''}\n\nEscreva a descrição do problema e a sugestão de melhoria. Use uma linguagem técnica, porém acessível, empática e positiva de quem está ajudando o cliente a melhorar (ex: "Notamos que...", "Sugerimos que..."), evitando um tom punitivo, policial ou exageradamente rígido. Redija em parágrafo(s) contínuo(s) e fluido(s). NÃO crie títulos em letras maiúsculas tipo "**AÇÃO CORRETIVA:**". Diga no máximo 5 a 6 linhas.`,
    });

    const tokenBudget = Number.isFinite(maxTokens) && maxTokens > 0 ? Math.min(Math.floor(maxTokens), 1500) : 250;

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: tokenBudget,
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
