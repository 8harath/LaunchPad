type AvatarPreset = {
  id: string
  label: string
  url: string
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function createAvatarSvg(id: string, background: string, accent: string, face: string) {
  return svgToDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${id}">
      <rect width="96" height="96" rx="28" fill="${background}"/>
      <circle cx="48" cy="39" r="18" fill="${accent}"/>
      <path d="M22 82c4-15 15-23 26-23s22 8 26 23" fill="${accent}"/>
      <circle cx="41" cy="36" r="2.5" fill="${face}"/>
      <circle cx="55" cy="36" r="2.5" fill="${face}"/>
      <path d="M40 46c3 4 13 4 16 0" stroke="${face}" stroke-width="3" stroke-linecap="round" fill="none"/>
    </svg>`
  )
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'lotus', label: 'Lotus', url: createAvatarSvg('Lotus avatar', '#F6F3EE', '#D9C3A5', '#3A342E') },
  { id: 'stone', label: 'Stone', url: createAvatarSvg('Stone avatar', '#F2F1EE', '#B7C2C8', '#2E3133') },
  { id: 'ink', label: 'Ink', url: createAvatarSvg('Ink avatar', '#F7F5F2', '#9AA6B2', '#1F2328') },
  { id: 'sage', label: 'Sage', url: createAvatarSvg('Sage avatar', '#F4F5EF', '#B7C9A8', '#31402E') },
  { id: 'pebble', label: 'Pebble', url: createAvatarSvg('Pebble avatar', '#F8F7F4', '#CDC6BE', '#3B3632') },
  { id: 'dune', label: 'Dune', url: createAvatarSvg('Dune avatar', '#F8F4EC', '#E1BB8D', '#4D3725') },
  { id: 'river', label: 'River', url: createAvatarSvg('River avatar', '#F1F6F8', '#9FC1D3', '#263842') },
  { id: 'fern', label: 'Fern', url: createAvatarSvg('Fern avatar', '#F3F7F1', '#8FB18E', '#223326') },
  { id: 'clay', label: 'Clay', url: createAvatarSvg('Clay avatar', '#F9F2EE', '#D7A693', '#4A3028') },
  { id: 'midnight', label: 'Midnight', url: createAvatarSvg('Midnight avatar', '#ECEFF3', '#7C8DA6', '#202734') },
]
