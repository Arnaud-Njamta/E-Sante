/** Ouvre la salle Jitsi — en HTTP, nouvel onglet (WebRTC bloqué en iframe). */
export function buildJitsiUrl(lienVideo, displayName) {
  if (!lienVideo) return null;
  const name = encodeURIComponent(displayName || 'DjamSanté');
  const hash = `config.prejoinPageEnabled=false&config.startWithAudioMuted=false&userInfo.displayName=${name}`;
  return lienVideo.includes('#') ? `${lienVideo}&${hash}` : `${lienVideo}#${hash}`;
}

export function isTeleconsultSecure() {
  return typeof window !== 'undefined' && window.isSecureContext;
}

export function openTeleconsultation(lienVideo, displayName) {
  const url = buildJitsiUrl(lienVideo, displayName);
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

export function joinTeleconsultation({ lienVideo, displayName, navigate, route }) {
  if (!lienVideo) return;
  if (!isTeleconsultSecure()) {
    openTeleconsultation(lienVideo, displayName);
    return;
  }
  if (navigate && route) navigate(route);
}
