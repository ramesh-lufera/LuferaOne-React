import { api } from '../../services/api';

export const categoriesChangedEvent = 'categories-changed';

export async function listSidebarCategories(signal) {
  const { categories } = await api('/sidebar-categories', { signal, cache: 'no-store' });
  return categories;
}
