import { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const PageTabTitleContext = createContext(null);

export default function usePageTabTitle(title) {
  const setPageTitle = useContext(PageTabTitleContext);
  const { key } = useLocation();

  useEffect(() => {
    if (!setPageTitle || !title) return;
    setPageTitle({ key, title });
    return () => setPageTitle(null);
  }, [key, setPageTitle, title]);
}
