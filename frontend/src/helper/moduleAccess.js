import modules from '../data/modules.json';

const categoryPath = /^\/categories\/[a-z0-9._-]+$/;
export const selectedCategoryModules = (user) => (user?.modules || []).filter((key) => /^category:[1-9][0-9]*$/.test(key));

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
  if (/^\/products\/[a-z0-9-]+$/.test(normalized)) return 'products';
  if (/^\/packages\/[a-z0-9-]+$/.test(normalized)) return 'packages';
  if (categoryPath.test(normalized)) return 'categories';
  return modules.find((module) => module.paths.includes(normalized))?.key;
};
export const canAccessPath = (user, path) => {
  const normalized = normalizePath(path);
  if (publicPaths.includes(normalized)) return true;
  if (normalized === '/view-profile') return Boolean(user);
  if (categoryPath.test(normalized) && selectedCategoryModules(user).length) return true;
  const module = moduleForPath(path);
  return Boolean(
    module && (user?.modules?.includes('*') || user?.modules?.includes(module)),
  );
};
