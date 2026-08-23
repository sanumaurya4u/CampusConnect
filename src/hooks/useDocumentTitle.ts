import { useEffect } from 'react'

/**
 * Custom hook to dynamically update document title with a consistent branding suffix.
 * @param title The page-specific title (e.g. "Club Directory")
 * @param preserveExact If true, does not append " | UIET Campus Connect"
 */
export function useDocumentTitle(title: string, preserveExact = false) {
  useEffect(() => {
    const baseSuffix = 'UIET Campus Connect'
    if (!title) {
      document.title = baseSuffix
    } else if (preserveExact) {
      document.title = title
    } else {
      document.title = `${title} | ${baseSuffix}`
    }
  }, [title, preserveExact])
}
