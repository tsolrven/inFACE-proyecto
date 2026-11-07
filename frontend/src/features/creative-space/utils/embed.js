export function parsearEnlace(enlace) {
  if (!enlace) return null;
  let url;
  try {
    url = new URL(enlace);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  const partes = url.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be' && partes[0]) {
    return youtube(partes[0]);
  }
  if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    if (url.searchParams.get('v')) return youtube(url.searchParams.get('v'));
    if (['embed', 'shorts', 'live'].includes(partes[0]) && partes[1]) {
      return youtube(partes[1]);
    }
    return null;
  }
  if (host === 'vimeo.com' && /^\d+$/.test(partes[0] ?? '')) {
    return {
      plataforma: 'Vimeo',
      src: `https://player.vimeo.com/video/${partes[0]}`,
      alto: 'aspect-video',
    };
  }
  if (host === 'open.spotify.com') {
    const idx = partes.findIndex((p) =>
      ['track', 'album', 'playlist', 'episode', 'show', 'artist'].includes(p),
    );
    if (idx === -1 || !partes[idx + 1]) return null;
    const tipo = partes[idx];
    return {
      plataforma: 'Spotify',
      src: `https://open.spotify.com/embed/${tipo}/${partes[idx + 1]}`,
      alto: tipo === 'track' || tipo === 'episode' ? 'h-[152px]' : 'h-[352px]',
    };
  }
  if (host === 'soundcloud.com' || host.endsWith('.soundcloud.com')) {
    return {
      plataforma: 'SoundCloud',
      src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(enlace)}&color=%23ec4899`,
      alto: 'h-[166px]',
    };
  }
  return null;
}

function youtube(id) {
  if (!/^[\w-]{6,20}$/.test(id)) return null;
  return {
    plataforma: 'YouTube',
    src: `https://www.youtube-nocookie.com/embed/${id}`,
    alto: 'aspect-video',
    miniatura: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  };
}
