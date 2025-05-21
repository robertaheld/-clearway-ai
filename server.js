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

  const modelos = {
    pt: {
      adulto: `
〚Mensagem ao Técnico – Adulto〛
Expandir dentoalveolar com rotação distal das cúspides vestibulares de 16 e 26.
Contração leve dos terceiros molares, se presentes.
Distalização sequencial em bloco: 17-27 → 16-26 → 15-25 → 14-24 → 13-23.
Correção de giroversão após ganho de espaço sem IPR, <2,0° por etapa.
Attachs verticais nos posteriores.
Recorte tipo fenda em 13 e 23.
Recorte para botão no primeiro molar inferior.
Intrusão de 11-21-12-22 com bite ramp anterior se >1mm.
Finalizar com curva do sorriso.
      `,
      mista: `
〚Mensagem ao Técnico – Dentição Mista〛
Expandir ambos os arcos dentro do limite permitido pelo sistema.
Distalização máxima de 1mm em molares superiores.
Sem IPR.
Sem attachs verticais.
Sem recortes ou botões.
Sem intrusão.
Finalização respeitando a erupção dos permanentes e oclusão funcional provisória.
      `,
      cirurgico: `
〚Mensagem ao Técnico – Classe II Cirúrgica〛
Expandir ambos os arcos ao máximo permitido.
Intrusão posterior para correção da mordida aberta anterior.
Torque vestibular progressivo de 13 a 23 para gerar overjet anterior.
Sem retração anterior.
Sem bite ramp.
Sem recortes ou botões.
Não realizar compensações sagitais.
Finalizar respeitando a curva do sorriso.
      `
    },
    en: {
      adulto: `
〚Technician Message – Adult〛
Dentoalveolar expansion with distal cusp rotation of 16 and 26.
Light contraction of third molars, if present.
Sequential block distalization: 17-27 → 16-26 → 15-25 → 14-24 → 13-23.
Rotation correction after space gain without IPR, <2.0° per stage.
Vertical attachments on posteriors.
Slot cutout on 13 and 23.
Button cutout on lower first molar.
Intrusion of 11-21-12-22 with anterior bite ramp if >1mm.
Finish with smile arc.
      `,
      mista: `
〚Technician Message – Mixed Dentition〛
Expand both arches within system's allowed limits.
Maximum distalization of 1mm on upper molars.
No IPR.
No vertical attachments.
No cutouts or buttons.
No intrusion.
Finalization respecting eruption of permanent teeth and provisional functional occlusion.
      `,
      cirurgico: `
〚Technician Message – Class II Surgical〛
Expand both arches to the maximum allowed.
Posterior intrusion to correct anterior open bite.
Progressive labial torque from 13 to 23 to generate anterior overjet.
No anterior retraction.
No bite ramp.
No cutouts or buttons.
Do not perform sagittal compensations.
Finish with smile arc.
      `
    },
    es: {
      adulto: `
〚Mensaje al Técnico – Adulto〛
Expansión dentoalveolar con rotación distal de las cúspides de 16 y 26.
Contracción ligera de terceros molares, si presentes.
Distalización secuencial en bloque: 17-27 → 16-26 → 15-25 → 14-24 → 13-23.
Corrección de giroversión tras ganancia de espacio sin IPR, <2.0° por etapa.
Attachments verticales en posteriores.
Corte tipo ranura en 13 y 23.
Botón en el primer molar inferior.
Intrusión de 11-21-12-22 con bite ramp anterior si >1mm.
Finalizar con curva de la sonrisa.
      `,
      mista: `
〚Mensaje al Técnico – Dentición Mixta〛
Expandir ambos arcos dentro del límite del sistema.
Distalización máxima de 1mm en molares superiores.
Sin IPR.
Sin attachments verticales.
Sin recortes ni botones.
Sin intrusión.
Finalizar respetando la erupción de permanentes y oclusión funcional provisional.
      `,
      cirurgico: `
〚Mensaje al Técnico – Clase II Quirúrgica〛
Expandir ambos arcos al máximo permitido.
Intrusión posterior para corregir mordida abierta anterior.
Torque vestibular progresivo de 13 a 23 para generar overjet anterior.
Sin retracción anterior.
Sin bite ramp.
Sin recortes ni botones.
No realizar compensaciones sagitales.
Finalizar con curva de la sonrisa.
      `
    }
  };

  const promptSistema = idioma === 'pt'
    ? 'Você é um ortodontista especialista em alinhadores ClearCorrect. Com base no diagnóstico abaixo, gere apenas a MENSAGEM AO TÉCNICO no estilo Roberta Held, seguindo exatamente a estrutura de exemplo abaixo. NÃO escreva plano narrativo. Adapte apenas as informações clínicas conforme o preenchido pelo doutor. Use o modelo:'
    : idioma === 'en'
    ? 'You are an orthodontist specialized in ClearCorrect. Based on the clinical input below, generate ONLY the TECHNICIAN MESSAGE in the Roberta Held format. DO NOT write a narrative plan. Follow exactly the model shown below and adapt only the clinical data provided by the doctor. Use this template:'
    : 'Eres un ortodoncista especializado en alineadores ClearCorrect. Con base en el diagnóstico clínico a continuación, genera SOLO el MENSAJE TÉCNICO en el formato de Roberta Held. NO escribas un plan narrativo. Adapta únicamente la información proporcionada por el doctor. Usa este modelo:';

  const modelo = idioma === 'pt'
    ? modo === 'mista' ? modelos.pt.mista : (pergunta.includes('cirurgica') ? modelos.pt.cirurgico : modelos.pt.adulto)
    : idioma === 'en'
    ? modo === 'mista' ? modelos.en.mista : (pergunta.includes('surgical') ? modelos.en.cirurgico : modelos.en.adulto)
    : modo === 'mista' ? modelos.es.mista : (pergunta.includes('quirúrgica') ? modelos.es.cirurgico : modelos.es.adulto);

  try {
    const resposta = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `${promptSistema}\n${modelo}` },
        { role: 'user', content: pergunta }
      ],
      temperature: 0.2,
      max_tokens: 900
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
