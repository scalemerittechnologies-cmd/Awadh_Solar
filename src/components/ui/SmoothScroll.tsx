'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function SmoothScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return

    let cancelled = false
    let cleanup = () => {}

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return

      const lenis = new Lenis({
        autoRaf: true,
        autoToggle: true,
        anchors: true,
        prevent: (node) => node.matches('.enquiry-dialog, .mobile-nav, .project-editor-panel, .project-editor-list'),
        stopInertiaOnNavigate: true,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        // Native touch stays directly tied to the finger; wheel motion settles quickly.
        syncTouch: false,
        lerp: 0.22,
      })

      // The enquiry dialog locks body scrolling; keep the page still behind it.
      const syncScrollLock = () => {
        if (document.body.style.overflow === 'hidden') lenis.stop()
        else lenis.start()
      }
      const observer = new MutationObserver(syncScrollLock)
      observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
      syncScrollLock()

      cleanup = () => {
        observer.disconnect()
        lenis.destroy()
      }
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [pathname])

  return null
}
