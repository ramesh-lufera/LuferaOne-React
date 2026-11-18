import modules from '../data/modules.json';

const publicPaths = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/terms-condition',
  '/coming-soon',
  '/maintenance',
  '/access-denied',
];

const normalizePath = (path) => {
  try {
    return decodeURIComponent(path).toLowerCase().replace(/\/+$/, '') || '/';
  } catch {
    return '';
  }
};

export const moduleForPath = (path) =>
  modules.find((module) => module.paths.includes(normalizePath(path)))?.key;
export const canAccessPath = (user, path) => {
  if (publicPaths.includes(normalizePath(path))) return true;
  if (normalizePath(path) === '/view-profile') return Boolean(user);
  const module = moduleForPath(path);
  return Boolean(
    module && (user?.modules?.includes('*') || user?.modules?.includes(module)),
  );
};
