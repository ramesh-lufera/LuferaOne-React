/* global test, expect */
import { canAccessPath, moduleForPath } from './moduleAccess';

test('module access handles direct URLs and route matching variants', () => {
  const user = { modules: ['dashboard'] };
  expect(canAccessPath(user, '/')).toBe(true);
  for (const path of ['/company', '/company/', '/COMPANY', '/%63ompany']) {
    expect(moduleForPath(path)).toBe('company');
    expect(canAccessPath(user, path)).toBe(false);
    expect(canAccessPath({ modules: ['company'] }, path)).toBe(true);
  }
  expect(canAccessPath({ modules: ['*'] }, '/roles-permissions')).toBe(true);
  expect(canAccessPath({ modules: [] }, '/company')).toBe(false);
  expect(canAccessPath(null, '/company')).toBe(false);
  expect(canAccessPath(user, '/unregistered-module')).toBe(false);
  expect(canAccessPath(user, '/%invalid')).toBe(false);
  expect(moduleForPath('/role-access')).toBe('roles');
  expect(moduleForPath('/assign-role')).toBe('roles');
});
