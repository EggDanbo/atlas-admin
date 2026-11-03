let visitedPages: Set<string> | null = null

function getVisitedPages() {
  if (!visitedPages) {
    visitedPages = new Set()
  }
  return visitedPages
}

export function useVisitedPages() {
  const pages = getVisitedPages()
  const markPageAsVisited = (path: string) => {
    pages.add(path)
  }

  const isPageVisited = (path: string) => {
    return pages.has(path)
  }

  const clearVisitedPages = () => {
    pages.clear()
  }

  return {
    visitedPages: pages,
    markPageAsVisited,
    isPageVisited,
    clearVisitedPages,
  }
}
