import { useEffect } from 'react';
import { useLanguage } from './useLanguage';

const usePageTitle = (titleKey, dynamicValue = '') => {
  const { t } = useLanguage();

  useEffect(() => {
    const baseTitle = 'E-Commerce';
    let pageTitle = t(titleKey);
    
    if (dynamicValue) {
      pageTitle = `${dynamicValue} | ${pageTitle}`;
    }
    
    document.title = `${pageTitle} | ${baseTitle}`;
    
    return () => {
      document.title = baseTitle;
    };
  }, [titleKey, dynamicValue, t]);
};

export default usePageTitle;