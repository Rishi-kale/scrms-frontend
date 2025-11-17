"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getPageTitle } from '@/hooks/usePageTitle';

export function PageTitle() {
  const pathname = usePathname();
  
  useEffect(() => {
    const title = getPageTitle(pathname);
    document.title = title;
  }, [pathname]);
  
  return null; // This component doesn't render anything
}
