/** Ouvre l'assistant IA flottant, avec message optionnel pré-rempli. */
export function openAiAssistant({ message } = {}) {
  window.dispatchEvent(new CustomEvent('djamsante:ai-open', {
    detail: { message: message || null },
  }));
}
