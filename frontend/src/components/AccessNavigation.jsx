import { Children, cloneElement, isValidElement } from 'react';
import { navigationTarget } from '../helper/navigation';
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
    const props = typeof child.props.to === 'string' && child.props.to.startsWith('/')
      ? { to: navigationTarget(child.props.to) } : {};
    if (props.to && props.to !== child.props.to && typeof child.props.className === 'function') {
      props.className = (state) => child.props.className({ ...state, isActive: false });
    }
    if (!child.props.children) return cloneElement(child, props);
    return cloneElement(
      child,
      props,
      filterNavigation(child.props.children, user),
    );
  });
}

export default function AccessNavigation({ children }) {
  return filterNavigation(children, useAccessUser());
}
