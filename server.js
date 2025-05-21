const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
require('dotenv').config();
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve o index.html na raiz
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/perguntar', async (req, res) => {
  const { modo, pergunta } = req.body;

  const promptSistema = modo === 'mista'
    ? 'Você é um ortodontista especialista em dentição mista. Use o protocolo Roberta Held para gerar uma sequência técnica de tratamento com alinhadores para dentição mista.'
    : 'Você é um ortodontista especialista em alinhadores. Use o protocolo Roberta Held para gerar um plano técnico de tratamento com alinhadores para um paciente adulto.';

  try {
    const resposta = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: promptSistema },
        { role: 'user', content: pergunta }
      ],
      temperature: 0.5,
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
