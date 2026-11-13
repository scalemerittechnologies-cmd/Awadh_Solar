'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/components/language/LanguageProvider'

export function SunJourney() {
  const { language } = useLanguage()

  useEffect(() => {
    let cleanup = () => {}
    let cancelled = false
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return
      gsap.registerPlugin(ScrollTrigger)
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const ctx = gsap.context(() => {
          // Clean Sky Blue & Pure White Journey (No Tan, No Muddy Brown!)
          gsap
            .timeline({
              scrollTrigger: {
                trigger: 'main',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
              },
            })
            .to(document.documentElement, {
              '--journey-bg': '#f8fafc',
              '--journey-glow': '#bae6fd',
              '--journey-accent': '#0284c7',
            })
            .to(document.documentElement, {
              '--journey-bg': '#f0f7ff',
              '--journey-glow': '#93c5fd',
              '--journey-accent': '#2563eb',
            })
            .to(document.documentElement, {
              '--journey-bg': '#ffffff',
              '--journey-glow': '#bfdbfe',
              '--journey-accent': '#1d4ed8',
            })

          document
            .querySelectorAll(
              'main h1, main h2, main h3, .shop-copy>p, .hero-description'
            )
            .forEach((node) => {
              gsap.fromTo(
                node,
                { y: 16, opacity: 0.8 },
                {
                  y: 0,
                  opacity: 1,
                  duration: 0.5,
                  ease: 'power2.out',
                  scrollTrigger: { trigger: node, start: 'top 95%', once: true },
                  clearProps: 'opacity,transform',
                }
              )
            })
        })

        return () => {
          ctx.revert()
        }
      })

      cleanup = () => mm.revert()
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [language])

  return null
}
