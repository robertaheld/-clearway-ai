idiomaSelect.addEventListener('change', () => {
  const lang = idiomaSelect.value;

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
});

// Aplica idioma atual ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const lang = idiomaSelect.value;

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
});
