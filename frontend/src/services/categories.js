import { api } from './api';

export const categoriesChangedEvent = 'categories-changed';

export async function listSidebarCategories(signal) {
  const categories = [];
  let page = 1;
  let lastPage;
  do {
    const result = await api(`/categories?per_page=50&page=${page}`, { signal });
    categories.push(...result.data);
    lastPage = result.last_page;
    page += 1;
  } while (page <= lastPage && !signal.aborted);
  return categories;
}
