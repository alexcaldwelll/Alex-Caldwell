export function sitePath(path: string) {
  const base = import.meta.env.BASE_URL;
  return path.startsWith('/') && !path.startsWith('//') && !path.startsWith(base)
    ? base + path.slice(1)
    : path;
}
