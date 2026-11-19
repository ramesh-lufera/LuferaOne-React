import routes from '../data/routes.json';

export const completedPaths = routes.map(({ path }) => path);

export function navigationTarget(destination) {
  if (typeof destination !== 'string' || !destination.startsWith('/')) return destination;
  const pathname = destination.split(/[?#]/, 1)[0].toLowerCase().replace(/\/+$/, '') || '/';
  return completedPaths.includes(pathname) ? destination : '/404';
}
