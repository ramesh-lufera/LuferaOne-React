/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react/dist/iconify.js';
import AccessNavigation from '../components/AccessNavigation';
import AuthBrandingImage from '../components/AuthBrandingImage';
import { useAccessUser } from '../helper/AccessContext';
import useCompanyBranding from '../helper/useCompanyBranding';
import './Sidebar.css';

const groups = [
  {
    "label": "LuferaSheets",
    "icon": "solar:calculator-linear",
    "items": [
      {
        "path": "/404",
        "label": "Sheets",
        "pending": true
      },
      {
        "path": "/404",
        "label": "Form Builder",
        "pending": true
      }
    ]
  },
  {
    "label": "Billing",
    "icon": "hugeicons:invoice-03",
    "items": [
      {
        "path": "/404",
        "label": "Subscriptions",
        "pending": true
      },
      {
        "path": "/invoice-list",
        "label": "Invoice",
        "pending": false
      },
      {
        "path": "/404",
        "label": "Payment History",
        "pending": true
      }
    ]
  },
  {
    "label": "Inventory",
    "icon": "solar:box-linear",
    "items": [
      {
        "path": "/404",
        "label": "Add on Services",
        "pending": true
      },
      {
        "path": "/categories",
        "label": "Category",
        "pending": false
      },
      {
        "path": "/404",
        "label": "Package",
        "pending": true
      },
      {
        "path": "/404",
        "label": "Product",
        "pending": true
      }
    ]
  },
  {
    "label": "Settings",
    "icon": "icon-park-outline:setting-two",
    "items": [
      {
        "path": "/activity-log",
        "label": "Activity Log",
        "pending": false
      },
      {
        "path": "/assign-role",
        "label": "Assign Role",
        "pending": false
      },
      {
        "path": "/404",
        "label": "Backup",
        "pending": true
      },
      {
        "path": "/404",
        "label": "Bank Details",
        "pending": true
      },
      {
        "path": "/404",
        "label": "Buy For Customer",
        "pending": true
      },
      {
        "path": "/company",
        "label": "Company",
        "pending": false
      },
      {
        "path": "/credentials",
        "label": "Credentials",
        "pending": false
      },
      {
        "path": "/404",
        "label": "Currencies",
        "pending": true
      },
      {
        "path": "/invoice-settings",
        "label": "Invoice Settings",
        "pending": false
      },
      {
        "path": "/404",
        "label": "Marketplace",
        "pending": true
      },
      {
        "path": "/404",
        "label": "Promotion",
        "pending": true
      },
      {
        "path": "/settings/privacy-policy",
        "label": "Privacy Policy",
        "pending": false
      },
      {
        "path": "/roles-permissions",
        "label": "Roles",
        "pending": false
      },
      {
        "path": "/404",
        "label": "Taxes",
        "pending": true
      },
      {
        "path": "/settings/terms-conditions",
        "label": "Terms and Conditions",
        "pending": false
      },
      {
        "path": "/theme-colors",
        "label": "Theme Colors",
        "pending": false
      },
      {
        "path": "/users-list",
        "label": "Users",
        "pending": false
      }
    ]
  }
];

const activeClass = ({ isActive }) => isActive ? 'active-page' : '';

export default function ApplicationSidebar({ sidebarActive, mobileMenu, onClose, onLogout }) {
  const user = useAccessUser();
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
        <li><Link to="#" role="button" onClick={(event) => { event.preventDefault(); onLogout(); }}><Icon icon="solar:close-circle-linear" className="menu-icon" /><span>Log-Out</span></Link></li>
      </>}
    </ul></div>
  </aside>;
}
