import CompanyFavicon from './components/CompanyFavicon';
import { BrowserRouter } from 'react-router-dom';
import SavedModuleTheme from './helper/SavedModuleTheme';
import RouteScrollToTop from './helper/RouteScrollToTop';
import ApplicationRoutes from './components/ApplicationRoutes';

export default function App() {
  return <BrowserRouter>
    <SavedModuleTheme />
    <RouteScrollToTop />
    <CompanyFavicon>
      <ApplicationRoutes />
    </CompanyFavicon>
  </BrowserRouter>;
}
