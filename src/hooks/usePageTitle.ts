import { useEffect } from 'react';

export const usePageTitle = (title: string) => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    // Restore previous title on cleanup
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

// Helper function to set title without hook
export const setPageTitle = (title: string) => {
  document.title = title;
};

// Default app title
export const DEFAULT_APP_TITLE = "Company Client Partner";

// Page title configurations
export const PAGE_TITLES = {
  // Auth pages
  login: "Login - Company Client Partner",

  // Dashboard
  dashboard: "Dashboard - Company Client Partner",

  // Jobs
  jobs: "Job Postings - Company Client Partner",
  "jobs/create": "Create New Job - Company Client Partner",
  "jobs/update": "Update Job - Company Client Partner",

  // Admin
  admin: "Admin Dashboard - Company Client Partner",
  "admin/meta": "Meta Data Management - Company Client Partner",

  // Profile
  profile: "Profile - Company Client Partner",

  // Candidates
  candidates: "Candidates - Company Client Partner",
} as const;

// Helper function to get title by path
export const getPageTitle = (path: string): string => {
  // Remove leading slash and get the path
  const cleanPath = path.replace(/^\//, '');

  // Check for exact matches first
  if (PAGE_TITLES[cleanPath as keyof typeof PAGE_TITLES]) {
    return PAGE_TITLES[cleanPath as keyof typeof PAGE_TITLES];
  }

  // Check for dynamic routes (like jobs/update/[id])
  if (cleanPath.startsWith('jobs/update/')) {
    return "Update Job - Company Client Partner";
  }

  // Default fallback
  return DEFAULT_APP_TITLE;
};
