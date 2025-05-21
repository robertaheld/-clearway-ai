document.getElementById('idioma').addEventListener('change', () => {
  const lang = document.getElementById('idioma').value;
  document.querySelectorAll('[data-pt]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
});

async function gerarPlano() {
  const idioma = document.getElementById('idioma').value;
  const modo = document.getElementById('modo').value;
  const facial = Array.from(document.getElementById('facial').selectedOptions).map(o => o.value).join(', ');
  const classe = Array.from(document.getElementById('classe').selectedOptions).map(o => o.value).join(', ');

  const dentes = [];
  if (document.getElementById('diastema').checked) dentes.push('diastema');
  if (document.getElementById('giroversao').checked) dentes.push('giroversão');
  if (document.getElementById('apinhamento').checked) dentes.push('apinhamento');
  const detalhesDentes = document.getElementById('detalhesDentes').value;

  let aberta = '';
  if (document.getElementById('aberta').checked) {
    const checks = document.querySelectorAll('#abertaOpcoes input:checked');
    aberta = Array.from(checks).map(c => c.value).join(', ');
  }

  let cruzada = '';
  if (document.getElementById('cruzada').checked) {
    const checks = document.querySelectorAll('#cruzadaOpcoes input:checked');
    cruzada = Array.from(checks).map(c => c.value).join(', ');
  }

  let sobremordida = '';
  if (document.getElementById('sobremordida').checked) {
    const corr = document.querySelector('input[name="sobrecorr"]:checked')?.value || '';
    const local = document.querySelector('input[name="local"]:checked')?.value || '';
    const detalhe = document.getElementById('sobremordidaDetalhe').value;
    sobremordida = `${corr}, localização: ${local}. ${detalhe ? 'Detalhes: ' + detalhe : ''}`;
  }

  const observacoes = document.getElementById('observacoes').value;

  const respostaDiv = document.getElementById('resposta');
  respostaDiv.innerText = idioma === 'en' ? 'Generating plan with AI...' :
                          idioma === 'es' ? 'Generando plan con IA...' :
                          'Gerando plano com IA...';

  const promptBase = {
    pt: modo === 'mista'
      ? 'Você é um ortodontista especialista em dentição mista. Use o protocolo Roberta Held para gerar uma sequência técnica de tratamento com alinhadores para dentição mista.'
      : 'Você é um ortodontista especialista em alinhadores. Use o protocolo Roberta Held para gerar um plano técnico de tratamento com alinhadores para um paciente adulto.',
    en: modo === 'mista'
      ? 'You are an orthodontist specialized in mixed dentition. Use the Roberta Held protocol to generate a technical aligner treatment sequence for mixed dentition.'
      : 'You are an orthodontist specialized in aligners. Use the Roberta Held protocol to generate a technical treatment plan for an adult patient using aligners.',
    es: modo === 'mista'
      ? 'Eres un ortodoncista especializado en dentición mixta. Usa el protocolo de Roberta Held para generar una secuencia técnica de tratamiento con alineadores para dentición mixta.'
      : 'Eres un ortodoncista especializado en alineadores. Usa el protocolo de Roberta Held para generar un plan técnico de tratamiento con alineadores para un paciente adulto.'
  };

  const pergunta = `
Tipo facial: ${facial}.
Classe sagital: ${classe}.
Dentes com: ${dentes.join(', ')}.
Detalhes: ${detalhesDentes}.
Mordida aberta anterior: ${aberta}.
Mordida cruzada: ${cruzada}.
Sobremordida: ${sobremordida}.
Observações: ${observacoes}.
Idioma: ${idioma}.
  `;

  try {
    const resposta = await fetch('/perguntar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modo, pergunta, idioma, prompt: promptBase[idioma] })
    });

    const dados = await resposta.json();
    let respostaTexto = dados.resposta || 'Erro: resposta vazia.';

    respostaDiv.innerText = respostaTexto;
  } catch (err) {
    respostaDiv.innerText = idioma === 'en' ? 'Error connecting to AI.' :
                            idioma === 'es' ? 'Error al conectar con la IA.' :
                            'Erro ao conectar com a IA.';
    console.error(err);
  }
}
