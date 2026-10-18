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

const contactForm = document.querySelector('[data-contact-form]');
const contactStatus = document.querySelector('#contact-status');
const contactApiUrl = window.CONTACT_API_URL || '/api/contact';

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  if (contactStatus) contactStatus.textContent = 'Invio in corso…';

  try {
    const response = await fetch(contactApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Request failed');
    contactForm.reset();
    if (contactStatus) contactStatus.textContent = 'Richiesta inviata correttamente.';
  } catch (error) {
    if (contactStatus) contactStatus.textContent = 'Non è stato possibile inviare la richiesta. Riprova tra poco.';
  } finally {
    submitButton.disabled = false;
  }
});
