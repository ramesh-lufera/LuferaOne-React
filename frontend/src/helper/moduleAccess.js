import modules from '../data/modules.json';

const publicPaths = [
  '/404',
  '/privacy-policy',
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

export const moduleForPath = (path) => {
  const normalized = normalizePath(path);
  if (/^\/categories\/[a-z0-9._-]+$/.test(normalized)) return 'categories';
  return modules.find((module) => module.paths.includes(normalized))?.key;
};
export const canAccessPath = (user, path) => {
  if (publicPaths.includes(normalizePath(path))) return true;
  if (normalizePath(path) === '/view-profile') return Boolean(user);
  const module = moduleForPath(path);
  return Boolean(
    module && (user?.modules?.includes('*') || user?.modules?.includes(module)),
  );
};
