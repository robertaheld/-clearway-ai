document.getElementById('idioma').addEventListener('change', () => {
  const lang = document.getElementById('idioma').value;
  document.querySelectorAll('[data-pt]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
  document.querySelectorAll('span[data-pt]').forEach(span => {
    span.textContent = span.dataset[lang];
  });
  document.querySelectorAll('option').forEach(opt => {
    if (opt.dataset[lang]) opt.textContent = opt.dataset[lang];
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
  respostaDiv.innerText = idioma === 'en' ? 'Generating technician message...' :
                          idioma === 'es' ? 'Generando mensaje técnico...' :
                          'Gerando mensagem ao técnico...';

  const promptSistema = idioma === 'pt'
    ? 'Você é um ortodontista especialista em alinhadores ClearCorrect. Gere apenas a MENSAGEM AO TÉCNICO, seguindo o protocolo oficial da Dra. Roberta Held. A resposta deve estar no formato direto, objetivo e técnico. Não escreva plano para paciente, apenas a mensagem ao técnico no padrão Roberta Held.'
    : idioma === 'en'
    ? 'You are an orthodontist specialized in ClearCorrect aligners. Generate ONLY the TECHNICIAN MESSAGE using the official protocol of Dr. Roberta Held. The response must be technical, direct and formatted for technician only. Do not write any patient plan.'
    : 'Eres un ortodoncista especializado en alineadores ClearCorrect. Genera SOLO el MENSAJE TÉCNICO siguiendo el protocolo oficial de la Dra. Roberta Held. La respuesta debe ser directa, técnica y sin texto para el paciente.';

  const pergunta = `
Tipo facial: ${facial}.
Classe sagital: ${classe}.
Dentes com: ${dentes.join(', ')}.
Detalhes: ${detalhesDentes}.
Mordida aberta anterior: ${aberta}.
Mordida cruzada: ${cruzada}.
Sobremordida: ${sobremordida}.
Observações adicionais: ${observacoes}.
Idioma: ${idioma}.
  `;

  try {
    const resposta = await fetch('/perguntar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modo, pergunta, idioma, prompt: promptSistema })
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
