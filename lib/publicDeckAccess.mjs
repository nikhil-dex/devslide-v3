/**
 * Build the public response fields for a presentation.
 * Password-protected slide content must only be released by the verification
 * endpoint after bcrypt comparison succeeds.
 */
export function getPublicDeckPayload(ppt) {
  const requiresPassword = Boolean(ppt.passwordHash);
  let slides = [];

  if (!requiresPassword) {
    slides = ppt.ppt_History || [];
    if (slides.length === 1 && Array.isArray(slides[0])) {
      slides = slides[0];
    }
  }

  return { requiresPassword, slides };
}
