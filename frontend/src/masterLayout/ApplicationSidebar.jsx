/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import AccessNavigation from '../components/AccessNavigation';
import AuthBrandingImage from '../components/AuthBrandingImage';
import { useAccessUser } from '../helper/AccessContext';
import { selectedCategoryModules } from '../helper/moduleAccess';
import useCompanyBranding from '../helper/useCompanyBranding';
import { categoriesChangedEvent, listSidebarCategories } from '../pages/categories/categories';
import './Sidebar.css';

import sidebarMenu from '../data/sidebarMenu.json';

const groups = sidebarMenu.map((group) => ({
  ...group,
  items: group.items.filter(({ hidden }) => !hidden),
}));

const activeClass = ({ isActive }) => isActive ? 'active-page' : '';

function SidebarCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let controller;
    function refreshCategories() {
      controller?.abort();
      controller = new AbortController();
      const { signal } = controller;
      listSidebarCategories(signal)
        .then((items) => {
          if (!signal.aborted) setCategories(items);
        })
        .catch((error) => {
          if (!signal.aborted && [401, 403].includes(error.status)) setCategories([]);
        });
    }

    refreshCategories();
    window.addEventListener(categoriesChangedEvent, refreshCategories);
    return () => {
      controller.abort();
      window.removeEventListener(categoriesChangedEvent, refreshCategories);
    };
  }, []);

  return categories.map(({ id, name, page_path: pagePath }) => (
    <li key={id}>
      <NavLink to={pagePath} end className={activeClass} title={name}>
        <Icon icon="solar:folder-outline" className="menu-icon flex-shrink-0" aria-hidden="true" />
        <span className="text-truncate">{name}</span>
      </NavLink>
    </li>
  ));
}

export default function ApplicationSidebar({ sidebarActive, mobileMenu, onClose, onLogout }) {
  const user = useAccessUser();
  const categoryScope = ['admin', 'super_admin'].includes(user?.role) ? '*' : selectedCategoryModules(user).join(',');
  const images = useCompanyBranding();
  const { pathname } = useLocation();
  const activeGroup = groups.find(({ items }) => items.some(({ path, pending }) => !pending && path === pathname))?.label;
  const [menu, setMenu] = useState({ pathname, group: activeGroup });
  const expanded = menu.pathname === pathname ? menu.group : activeGroup;
  return <aside className={`sidebar application-sidebar${sidebarActive ? ' active' : mobileMenu ? ' sidebar-open' : ''}`}>
    <button onClick={onClose} type="button" className="sidebar-close-btn" aria-label="Close sidebar"><Icon icon="radix-icons:cross-2" /></button>
    <div><Link to="/" className="sidebar-logo">
      <AuthBrandingImage src={images.logo_url} fallbackSrc="/assets/images/logo.png" alt="Company logo" className="light-logo" />
      <AuthBrandingImage src={images.logo_url} fallbackSrc="/assets/images/logo-light.png" alt="Company logo" className="dark-logo" />
      <AuthBrandingImage src={images.site_logo_url} fallbackSrc="/assets/images/logo-icon.png" alt="Site logo" className="logo-icon" />
    </Link></div>
    <div className="sidebar-menu-area"><ul className="sidebar-menu" id="sidebar-menu">
      <AccessNavigation><li className="sidebar-dashboard"><NavLink to="/" end className={activeClass}><Icon icon="solar:home-smile-angle-outline" className="menu-icon" /><span>Dashboard</span></NavLink></li></AccessNavigation>
      {categoryScope && <SidebarCategories key={categoryScope} />}
      {user && <>
        {groups.map(({ label, icon, items }, index) => <AccessNavigation key={label}>
          <li className={`dropdown${index === 0 ? ' sidebar-bottom-start' : ''}${expanded === label ? ' open' : ''}`}>
            <Link to="#" role="button" aria-expanded={expanded === label} aria-controls={`sidebar-${label.toLowerCase()}`} onClick={(event) => { event.preventDefault(); setMenu({ pathname, group: expanded === label ? null : label }); }}><Icon icon={icon} className="menu-icon" /><span>{label}</span></Link>
            <ul className="sidebar-submenu" id={`sidebar-${label.toLowerCase()}`}>
              {items.map(({ path, label: title, pending }) => <li key={title}>{pending
                ? <Link to="/404" data-unavailable="true"><i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{' '}{title}</Link>
                : <NavLink to={path} className={activeClass}><i className="ri-circle-fill circle-icon text-primary-600 w-auto" />{' '}{title}</NavLink>}
              </li>)}
            </ul>
          </li>
        </AccessNavigation>)}
        <li><Link to="#" role="button" className="sidebar-logout" onClick={(event) => { event.preventDefault(); onLogout(); }}><Icon icon="solar:close-circle-linear" className="menu-icon" /><span>Log-Out</span></Link></li>
      </>}
    </ul></div>
  </aside>;
}
