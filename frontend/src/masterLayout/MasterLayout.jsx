import ApplicationSidebar from './ApplicationSidebar';
import TopbarProfileImage from '../components/TopbarProfileImage';
import { useAccessUser } from '../helper/AccessContext';
import { signOut } from "../helper/auth";
/* eslint-disable react/prop-types */
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";

const capitalizeFirst = (value) =>
  (value ?? '').trim().toLowerCase().replace(/^\p{L}/u, (letter) => letter.toUpperCase());

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const accessUser = useAccessUser();



  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <ApplicationSidebar
        sidebarActive={sidebarActive}
        mobileMenu={mobileMenu}
        onClose={mobileMenuControl}
        onLogout={() => signOut().catch(() => setLogoutError('Unable to sign out. Please try again.'))}
      />

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  className='sidebar-toggle'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* ThemeToggleButton */}
                <ThemeToggleButton />
                <div className='dropdown'>
                  <button
                    className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <Icon
                      icon='iconoir:bell'
                      className='text-primary-light text-xl'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-lg p-0'>
                    <div className='m-16 py-12 px-16 radius-8 mb-16 d-flex align-items-center justify-content-between gap-2' style={{ backgroundColor: 'var(--module-theme-focus, var(--primary-50))' }}>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-0'>
                          Notifications
                        </h6>
                      </div>
                      <span className='fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center' style={{ color: 'var(--module-theme-main, var(--primary-600))' }}>
                        0
                      </span>
                    </div>
                    <div className='max-h-400-px overflow-y-auto scroll-sm pe-4'>
                    </div>
                    <div className='text-center py-12 px-16'>
                      <Link
                        to='#'
                        className='fw-semibold text-md' style={{ color: 'var(--module-theme-main, var(--primary-600))' }}
                      >
                        See All Notification
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Notification dropdown end */}
                <div className='dropdown'>
                  <button
                    className='d-flex justify-content-center align-items-center rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <TopbarProfileImage />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm topbar-profile-menu'>
                    <div
                      className='py-12 px-16 radius-8 mb-16 d-flex align-items-center justify-content-between gap-2'
                      style={{ backgroundColor: 'var(--module-theme-focus, var(--primary-50))' }}
                    >
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                          {capitalizeFirst(accessUser?.username)}
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                          {accessUser?.role?.split('_').map(capitalizeFirst).join(' ')}
                        </span>
                      </div>
                      <button type='button' className='hover-text-danger'>
                        <Icon
                          icon='radix-icons:cross-1'
                          className='icon text-xl'
                        />
                      </button>
                    </div>
                    <ul className='to-top-list'>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/'
                        >
                          <Icon
                            icon='solar:home-smile-angle-outline'
                            className='icon text-xl'
                          />{" "}
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/view-profile'
                        >
                          <Icon
                            icon='solar:user-linear'
                            className='icon text-xl'
                          />{" "}
                          My Account
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/users-list'
                        >
                          <Icon
                            icon='flowbite:users-group-outline'
                            className='icon text-xl'
                          />
                          Users
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3'
                          onClick={(event) => { event.preventDefault(); signOut().catch(() => setLogoutError('Unable to sign out. Please try again.')); }}
                          to='#'
                        >
                          <Icon icon='lucide:power' className='icon text-xl' />{" "}
                          Log Out
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>{logoutError && <div className='alert alert-danger' role='alert'>{logoutError}</div>}{children}</div>

        {/* Footer section */}
        <footer className='d-footer py-12'>
          <div className='d-flex flex-wrap align-items-center justify-content-between gap-2'>
            <p className='mb-0'>© {new Date().getFullYear()} Lufera Infotech</p>
            <nav aria-label='Legal links' className='d-flex align-items-center gap-1'>
              <Link to='/privacy-policy' style={{ color: 'inherit' }}>Privacy Policy</Link>
              <span aria-hidden='true'>|</span>
              <Link to='/terms-condition' style={{ color: 'inherit' }}>Terms and Conditions</Link>
            </nav>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default MasterLayout;
