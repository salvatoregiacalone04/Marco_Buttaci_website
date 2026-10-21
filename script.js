const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const navSections = ['professional', 'lessons', 'social']
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const updateActiveNav = () => {
  const marker = window.innerHeight * 0.35;
  let currentSection = navSections[0];

  navSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= marker) currentSection = section;
  });

  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${currentSection.id}`);
  });
};

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

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

const callCta = document.querySelector('.call-cta');
if (callCta?.firstChild) {
  callCta.firstChild.textContent = 'Prenota il tuo primo incontro gratuito ';
}

const footerName = document.querySelector('.site-footer span');
if (footerName) footerName.textContent = 'Salvatore Giacalone';

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
