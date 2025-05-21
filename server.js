const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/perguntar', async (req, res) => {
  const { modo, pergunta, idioma } = req.body;

  const promptSistema = idioma === 'pt'
    ? 'Você é um ortodontista especialista em alinhadores ClearCorrect. Gere apenas a MENSAGEM AO TÉCNICO, seguindo o protocolo oficial da Dra. Roberta Held. A resposta deve estar no formato direto, objetivo e técnico. Não escreva plano para paciente, apenas a mensagem ao técnico no padrão Roberta Held.'
    : idioma === 'en'
    ? 'You are an orthodontist specialized in ClearCorrect aligners. Generate ONLY the TECHNICIAN MESSAGE using the official protocol of Dr. Roberta Held. The response must be technical, direct and formatted for technician only. Do not write any patient plan.'
    : 'Eres un ortodoncista especializado en alineadores ClearCorrect. Genera SOLO el MENSAJE TÉCNICO siguiendo el protocolo oficial de la Dra. Roberta Held. La respuesta debe ser directa, técnica y sin texto para el paciente.';

  try {
    const resposta = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: promptSistema },
        { role: 'user', content: pergunta }
      ],
      temperature: 0.4,
      max_tokens: 800
    });

    res.json({ resposta: resposta.choices[0].message.content });
  } catch (error) {
    console.error('Erro da OpenAI:', error);
    res.status(500).json({ erro: 'Erro ao conectar com a IA.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
