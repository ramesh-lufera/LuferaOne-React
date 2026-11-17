import MasterLayout from '../masterLayout/MasterLayout';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import ActivityLogLayer from '../components/ActivityLogLayer';

export default function ActivityLogPage() {
  const navigate = useNavigate();
  return <MasterLayout>
    <div className='d-grid align-items-center gap-3 mb-24' style={{ gridTemplateColumns: '1fr auto 1fr' }}>
      <button type='button' className='d-inline-flex align-items-center gap-2 bg-transparent border-0 p-0 text-black' style={{ justifySelf: 'start' }} onClick={() => navigate(-1)}>
        <Icon icon='solar:arrow-left-linear' className='text-xl' aria-hidden='true' />
        Back
      </button>
      <h6 className='fw-semibold mb-0 text-center'>Activity Log</h6>
      <nav aria-label='Breadcrumb' style={{ justifySelf: 'end' }}>
        <ul className='d-flex flex-wrap align-items-center justify-content-end gap-2 mb-0'>
          <li className='fw-medium'>
            <Link to='/' className='d-flex align-items-center gap-1 hover-text-primary'>
              <Icon icon='solar:home-smile-angle-outline' className='icon text-lg' aria-hidden='true' />
              Dashboard
            </Link>
          </li>
          <li aria-hidden='true'> - </li>
          <li className='fw-medium' aria-current='page'>Activity Log</li>
        </ul>
      </nav>
    </div>
    <ActivityLogLayer />
  </MasterLayout>;
}
