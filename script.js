// Ativa tradução dinâmica
const idiomaSelect = document.getElementById('idioma');

function aplicarIdioma(lang) {
  document.querySelectorAll('[data-pt]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
  document.querySelectorAll('option').forEach(opt => {
    if (opt.dataset[lang]) opt.textContent = opt.dataset[lang];
  });
  document.querySelectorAll('textarea').forEach(el => {
    const val = el.getAttribute(`data-${lang}`);
    if (val) el.placeholder = val;
  });
}

idiomaSelect.addEventListener('change', () => {
  const lang = idiomaSelect.value;
  aplicarIdioma(lang);
});

window.addEventListener('DOMContentLoaded', () => {
  aplicarIdioma(idiomaSelect.value);
});

// Gera mensagem com base nos dados do formulário
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

  const pergunta = `\nTipo facial: ${facial}.\nClasse sagital: ${classe}.\nDentes com: ${dentes.join(', ')}.\nDetalhes: ${detalhesDentes}.\nMordida aberta anterior: ${aberta}.\nMordida cruzada: ${cruzada}.\nSobremordida: ${sobremordida}.\nObservações adicionais: ${observacoes}.\nIdioma: ${idioma}.`;

  try {
    const resposta = await fetch('/perguntar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modo, pergunta, idioma, prompt: promptSistema })
    });

    const dados = await resposta.json();
    respostaDiv.innerText = dados.resposta || 'Erro: resposta vazia.';
  } catch (err) {
    respostaDiv.innerText = idioma === 'en' ? 'Error connecting to AI.' :
                            idioma === 'es' ? 'Error al conectar con la IA.' :
                            'Erro ao conectar com a IA.';
    console.error(err);
  }
}

// Preview de imagens (limite 3)
const imagemInput = document.getElementById('imagem');
if (imagemInput) {
  imagemInput.addEventListener('change', function (event) {
    const container = document.getElementById('preview-container');
    container.innerHTML = '';
    Array.from(event.target.files).slice(0, 3).forEach(file => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'image-preview';
        container.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
}

// Mostrar campos condicionais
['aberta', 'cruzada', 'sobremordida'].forEach(id => {
  const checkbox = document.getElementById(id);
  if (checkbox) {
    checkbox.addEventListener('change', function () {
      document.getElementById(id + 'Opcoes').style.display = this.checked ? 'block' : 'none';
    });
  }
});
