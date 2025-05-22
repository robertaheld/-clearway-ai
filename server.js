// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { OpenAI } from 'openai';

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(bodyParser.json());

app.post('/perguntar', async (req, res) => {
  const { pergunta, prompt, modo, idioma } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: pergunta }
      ],
      temperature: 0.7
    });

    const resposta = completion.choices[0]?.message?.content || 'Resposta vazia';
    res.json({ resposta });
  } catch (err) {
    console.error('Erro da OpenAI:', err);
    res.status(500).json({ erro: err.message || 'Erro interno' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
