// script.js

const selectIdioma = document.getElementById("idioma"); if (selectIdioma) { selectIdioma.addEventListener("change", () => traduzir(selectIdioma.value)); traduzir(selectIdioma.value); }

function traduzir(lang) { document.querySelectorAll("[data-pt]").forEach((el) => { const txt = el.getAttribute(data-${lang}); if (txt) el.textContent = txt; }); document.querySelectorAll("textarea").forEach((el) => { const val = el.getAttribute(data-${lang}); if (val) el.placeholder = val; }); }

document.getElementById("imagem")?.addEventListener("change", function (event) { const container = document.getElementById("preview-container"); container.innerHTML = ""; const files = event.target.files; Array.from(files).slice(0, 5).forEach((file) => { const reader = new FileReader(); reader.onload = function (e) { const img = document.createElement("img"); img.src = e.target.result; img.className = "image-preview"; container.appendChild(img); }; reader.readAsDataURL(file); }); });

async function gerarPlano() { const idioma = document.getElementById("idioma")?.value; const modo = document.getElementById("modo")?.value; const facial = document.getElementById("facial")?.value; const classe = document.getElementById("classe")?.value; const dentes = []; if (document.getElementById("diastema")?.checked) dentes.push("diastema"); if (document.getElementById("giroversao")?.checked) dentes.push("giroversão"); if (document.getElementById("apinhamento")?.checked) dentes.push("apinhamento"); const detalhesDentes = document.getElementById("detalhesDentes")?.value || "";

const aberta = Array.from(document.querySelectorAll("input[value^='extrusao'], input[value^='intrusao'], input[value^='ambos aberta']")) .filter((el) => el.checked) .map((el) => el.value);

const cruzada = Array.from(document.querySelectorAll("input[value^='expandir'], input[value^='contrair'], input[value^='ambos cruzada']")) .filter((el) => el.checked) .map((el) => el.value);

const sobremordida = document.querySelector("input[name='sobrecorr']:checked")?.value || ""; const local = document.querySelector("input[name='local']:checked")?.value || ""; const detalheSobremordida = document.getElementById("sobremordidaDetalhe")?.value || "";

const obs = document.getElementById("observacoes")?.value || "";

const pergunta = Tipo facial: ${facial}. Classe sagital: ${classe}. Dentes com: ${dentes.join(", ")} ${detalhesDentes}. Mordida aberta: ${aberta.join(", ")}. Mordida cruzada: ${cruzada.join(", ")}. Sobremordida: ${sobremordida} - ${local} - ${detalheSobremordida}. Observações: ${obs}.;

try { const resposta = await fetch("/perguntar", { method: "POST", headers: { "Content-Type": "application/json", }, body: JSON.stringify({ modo, pergunta, idioma }), });

const json = await resposta.json();
document.getElementById("resposta").textContent = json.resposta || "Erro: resposta vazia";

} catch (erro) { document.getElementById("resposta").textContent = "Erro ao conectar com a IA."; } }

