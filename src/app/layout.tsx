import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Devanagari, Poppins } from 'next/font/google'
import { LanguageProvider } from '@/components/language/LanguageProvider'
import { SmoothScroll } from '@/components/ui/SmoothScroll'
import 'lenis/dist/lenis.css'
import './globals.css'
import './premium.css'
import './experience.css'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  fallback: ['system-ui', 'sans-serif'],
})

const notoDevanagari = Noto_Sans_Devanagari({ subsets: ['devanagari'], display: 'swap', variable: '--font-hindi' })

export const metadata: Metadata = {
  title: {
    default: 'Awadh Enterprises | Solar Solutions in Mirzapur',
    template: '%s | Awadh Enterprises',
  },
  description: 'Explore solar solutions for homes, businesses and institutions from Awadh Enterprises in Mirzapur, Uttar Pradesh.',
  authors: [{ name: 'Awadh Enterprises' }],
  creator: 'Awadh Enterprises',
  publisher: 'Awadh Enterprises',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Awadh Enterprises',
    title: 'Awadh Enterprises | Solar Solutions in Mirzapur',
    description: 'Solar solutions for homes, businesses and institutions in Mirzapur.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Awadh Enterprises | Solar Solutions in Mirzapur',
    description: 'Solar solutions for homes, businesses and institutions in Mirzapur.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0A1628' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-IN" className={`${poppins.variable} ${notoDevanagari.variable}`}>
      <body id="top" className="min-h-screen bg-white text-navy-900 antialiased">
        <LanguageProvider>
          <SmoothScroll />
          {children}
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function r(){document.querySelectorAll('iframe[src*="netlify"],a[href*="netlify.com"],[data-netlify-badge],[data-netlify-drawer],netlify-drawer,.netlify-badge,#netlify-badge').forEach(function(e){e.remove()});document.querySelectorAll('body > div').forEach(function(d){if(d.querySelector&&d.querySelector('a[href*="netlify"]'))d.remove();})}r();if(typeof MutationObserver!=='undefined'){new MutationObserver(r).observe(document.body,{childList:true,subtree:true})}else{setInterval(r,2000)}})();`,
          }}
        />
      </body>
    </html>
  )
}
