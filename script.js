const contactForm = document.querySelector(".contact-form");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector(".form-status");
  const originalLabel = submitButton?.textContent || "Invia richiesta";
  const formData = new FormData(contactForm);

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Invio in corso…";
  }
  if (status) status.textContent = "";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: formData.get("nome"),
        email: formData.get("contatto"),
        messaggio: formData.get("messaggio"),
      }),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok)
      throw new Error(result.error || "Controlla i dati inseriti e riprova.");

    contactForm.reset();
    if (status) status.textContent = "Richiesta inviata. Ti risponderò presto.";
  } catch (error) {
    if (status)
      status.textContent =
        error.message || "Si è verificato un errore. Riprova.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
});
