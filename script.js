const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('is-open', !isOpen);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const contactForm = document.querySelector('.call-form');

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector('.form-status');
  const originalLabel = submitButton?.textContent || 'Invia richiesta';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Invio in corso…';
  }
  if (status) status.textContent = '';

  try {
    const response = await fetch('/api/contatto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(result.error || 'Controlla i dati inseriti e riprova.');

    contactForm.reset();
    if (status) status.textContent = 'Richiesta inviata. Ti risponderò presto.';
  } catch (error) {
    if (status) status.textContent = error.message || 'Si è verificato un errore. Riprova.';
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
});
