import { Children, cloneElement, isValidElement } from 'react';
import { canAccessPath } from '../helper/moduleAccess';
import { useAccessUser } from '../helper/AccessContext';

function navigationPaths(element) {
  if (!isValidElement(element)) return [];
  const path = element.props.to;
  return [
    ...(typeof path === 'string' && path.startsWith('/') ? [path] : []),
    ...Children.toArray(element.props.children).flatMap(navigationPaths),
  ];
}

function filterNavigation(children, user) {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const paths = navigationPaths(child);
    if (paths.length && !paths.some((path) => canAccessPath(user, path)))
      return null;
    if (!child.props.children) return child;
    return cloneElement(
      child,
      {},
      filterNavigation(child.props.children, user),
    );
  });
}

export default function AccessNavigation({ children }) {
  return filterNavigation(children, useAccessUser());
}
