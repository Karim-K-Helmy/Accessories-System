function cleanUrl(value) {
  return String(value || "").trim();
}

function youtubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?[^#]*v=)([a-zA-Z0-9_-]{6,})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
    /(?:youtube\.com\/(?:shorts|embed|live)\/)([a-zA-Z0-9_-]{6,})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

function googleDriveId(url) {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/,
    /drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([^&#]+)/,
    /[?&]id=([^&#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

export function getVideoSource(value) {
  const url = cleanUrl(value);
  if (!url) return null;

  const youtube = youtubeId(url);
  if (youtube) {
    return {
      type: "embed",
      provider: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${youtube}?rel=0&modestbranding=1`
    };
  }

  const drive = googleDriveId(url);
  if (drive) {
    return {
      type: "embed",
      provider: "drive",
      src: `https://drive.google.com/file/d/${drive}/preview`
    };
  }

  if (/\.(mp4|webm|ogg|mov)(?:[?#].*)?$/i.test(url) || /\/video\/upload\//i.test(url)) {
    return { type: "video", provider: "direct", src: url };
  }

  return { type: "link", provider: "external", src: url };
}
