import groups from '../data/sidebarMenu.json';
import { moduleForPath } from './moduleAccess';

export function sidebarPermissionModules(catalog) {
  const keys = new Set(['dashboard']);
  for (const group of groups) {
    for (const item of group.items) {
      const key = item.permissionKey || (!item.pending && moduleForPath(item.path));
      if (key) keys.add(key);
    }
  }
  return Object.fromEntries([...keys].filter((key) => catalog[key]).map((key) => [key, catalog[key]]));
}
