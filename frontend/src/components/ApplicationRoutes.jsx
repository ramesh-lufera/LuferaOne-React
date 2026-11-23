import SheetEditorPage from '../pages/SheetEditorPage';
import SheetsPage from '../pages/SheetsPage';
import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import routes from '../data/routes.json';
import AccessDeniedPage from '../pages/AccessDeniedPage';
import ActivityLogPage from '../pages/ActivityLogPage';
import AddUserPage from '../pages/AddUserPage';
import AssignRolePage from '../pages/AssignRolePage';
import CategoriesPage from '../pages/categories/CategoriesPage';
import CategoryPage from '../pages/categories/CategoryPage';
import ExternalCategoryPage from '../pages/categories/external/ExternalCategoryPage';
import CompanyPage from '../pages/CompanyPage';
import CredentialsPage from '../pages/CredentialsPage';
import ErrorPage from '../pages/ErrorPage';
import HomePageOne from '../pages/HomePageOne';
import InvoiceAddPage from '../pages/InvoiceAddPage';
import InvoiceEditPage from '../pages/InvoiceEditPage';
import InvoiceListPage from '../pages/InvoiceListPage';
import InvoicePreviewPage from '../pages/InvoicePreviewPage';
import InvoiceSettingsPage from '../pages/InvoiceSettingsPage';
import PrivacyPolicyPage from '../pages/PrivacyPolicyPage';
import PrivacyPolicySettingsPage from '../pages/PrivacyPolicySettingsPage';
import RoleAccessPage from '../pages/RoleAccessPage';
import SignInPage from '../pages/SignInPage';
import SignUpPage from '../pages/SignUpPage';
import TermsConditionPage from '../pages/TermsConditionPage';
import TermsConditionSettingsPage from '../pages/TermsConditionSettingsPage';
import ThemeColorsPage from '../pages/ThemeColorsPage';
import UsersGridPage from '../pages/UsersGridPage';
import UsersListPage from '../pages/UsersListPage';
import ViewProfilePage from '../pages/ViewProfilePage';

const pages = { SheetEditorPage, SheetsPage, AccessDeniedPage, ActivityLogPage, AddUserPage, AssignRolePage, CategoriesPage, CompanyPage, CredentialsPage, ErrorPage, HomePageOne, InvoiceAddPage, InvoiceEditPage, InvoiceListPage, InvoicePreviewPage, InvoiceSettingsPage, PrivacyPolicyPage, PrivacyPolicySettingsPage, RoleAccessPage, SignInPage, SignUpPage, TermsConditionPage, TermsConditionSettingsPage, ThemeColorsPage, UsersGridPage, UsersListPage, ViewProfilePage };

export default function ApplicationRoutes() {
  const renderRoutes = (access) => routes.filter((route) => route.access === access).map(({ path, page }) => {
    const Page = pages[page];
    return <Route key={path} path={path} element={<Page />} />;
  });
  return <Routes>
    <Route element={<RequireAuth />}>
      {renderRoutes('protected')}
      <Route path="/categories/:filename" element={<CategoryPage />} />
    </Route>
    <Route element={<RequireAuth allowGuest />}>{renderRoutes('legal')}</Route>
    <Route path="/external/categories/:filename" element={<ExternalCategoryPage />} />
    {renderRoutes('public')}
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Routes>;
}
