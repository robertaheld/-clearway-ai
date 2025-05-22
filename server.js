// server.js

const express = require("express"); const cors = require("cors"); const bodyParser = require("body-parser"); const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: "SUA_CHAVE_DA_OPENAI" }); const app = express(); app.use(cors()); app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post("/perguntar", async (req, res) => { const { modo, pergunta, idioma } = req.body;

const systemPrompt = gerarPromptSistema(modo, idioma); const userPrompt = pergunta;

try { const completion = await openai.chat.completions.create({ model: "gpt-4", messages: [ { role: "system", content: systemPrompt }, { role: "user", content: userPrompt }, ], }); res.json({ resposta: completion.choices[0].message.content }); } catch (error) { console.error("Erro da OpenAI:", error); res.json({ resposta: "Erro ao gerar resposta da IA." }); } });

function gerarPromptSistema(modo, idioma) { const prefixo = { pt: "Você é um ortodontista técnico especializado em planejamento de casos com alinhadores transparentes. Responda apenas com a mensagem ao técnico, dentro do protocolo do modo Roberta Held ativado.", en: "You are a technical orthodontist specialized in planning aligner treatments. Respond only with the technician message following the Roberta Held protocol.", es: "Eres un ortodoncista técnico especializado en planificación con alineadores. Responde únicamente con el mensaje al técnico siguiendo el protocolo de Roberta Held." }; return prefixo[idioma] || prefixo.pt; }

app.listen(PORT, () => console.log(Servidor rodando em http://localhost:${PORT}));

