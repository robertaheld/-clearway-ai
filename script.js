async function gerarPlano() {
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

  const pergunta = `
Paciente com tipo facial: ${facial}.
Classe sagital: ${classe}.
Dentes com: ${dentes.join(', ')}.
Detalhes: ${detalhesDentes}.
Mordida aberta anterior: ${aberta}.
Mordida cruzada: ${cruzada}.
Sobremordida: ${sobremordida}.
Observações adicionais: ${observacoes}.
  `;

  const respostaDiv = document.getElementById('resposta');
  respostaDiv.innerText = 'Gerando plano com IA...';

  try {
    const resposta = await fetch('/perguntar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modo, pergunta })
    });

    const dados = await resposta.json();
    let respostaTexto = dados.resposta || 'Erro: resposta vazia.';

    let mensagemTecnico = '';
    if (modo === 'adulto' && classe.includes('classe III')) {
      mensagemTecnico = `
〚Mensagem ao Técnico – Classe III Cirúrgico〛
Expandir maxila com rotação distal das cúspides vestibulares de 16 e 26.
Distalização em bloco: 17-27 → 16-26 → 15-25, com 50% de sobreposição.
Correção de giroversão após ganho de espaço com movimentos <2,0° por etapa.
Contração leve de 38 e 48, se presentes.
Attachs verticais em todos os posteriores.
Recorte tipo fenda em 13 e 23.
Recorte para botão no primeiro molar inferior.
Intrusão posterior inferior para compensar sobremordida (sem bite ramp).
Finalização com curva do sorriso e torque leve em 11 e 21.
Evitar qualquer compensação sagital.
Foco em alinhamento, expansão, torque e nivelamento.
      `;
    } else if (modo === 'mista') {
      mensagemTecnico = `
〚Mensagem ao Técnico – Dentição Mista〛
Expandir ambos os arcos dentro do limite permitido pelo sistema.
Descrever regiões com giroversão e apinhamento, sem IPR.
Distalização máxima de 1mm em molares superiores.
Sem attachs verticais, sem recortes, sem botão.
Sem intrusão.
Finalização respeitando erupção dos permanentes e oclusão funcional provisória.
      `;
    } else {
      mensagemTecnico = `
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
      `;
    }

    respostaDiv.innerText = respostaTexto + '\n\n' + mensagemTecnico;
  } catch (err) {
    respostaDiv.innerText = 'Erro ao conectar com a IA.';
    console.error(err);
  }
}
