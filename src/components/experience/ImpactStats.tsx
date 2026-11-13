'use client'

import { Leaf, ShieldCheck, SolarPanel, Wallet, type LucideIcon } from 'lucide-react'
import { useLanguage } from '@/components/language/LanguageProvider'

type ImpactStatData = {
  icon: LucideIcon
  value: number
  prefix?: string
  prefixHi?: string
  suffix: string
  label: string
  labelHi: string
  description: string
  descriptionHi: string
}

const stats: ImpactStatData[] = [
  {
    icon: SolarPanel,
    value: 2000,
    suffix: '+',
    label: 'Installations',
    labelHi: 'सोलर इंस्टॉलेशन',
    description: 'Homes and businesses served',
    descriptionHi: 'घरों और व्यवसायों को सेवा',
  },
  {
    icon: Wallet,
    value: 90,
    suffix: '%',
    prefix: 'Up to ',
    prefixHi: 'तक ',
    label: 'Bill savings',
    labelHi: 'बिजली बिल में बचत',
    description: 'Savings depend on your system and usage',
    descriptionHi: 'बचत सिस्टम और उपयोग पर निर्भर है',
  },
  {
    icon: Leaf,
    value: 78000,
    prefix: '₹',
    suffix: '',
    label: 'PM Surya Ghar subsidy',
    labelHi: 'पीएम सूर्य घर सब्सिडी',
    description: 'Up to, subject to eligibility',
    descriptionHi: 'पात्रता के अनुसार अधिकतम',
  },
  {
    icon: ShieldCheck,
    value: 25,
    suffix: ' yrs',
    label: 'Panel output warranty',
    labelHi: 'पैनल आउटपुट वारंटी',
    description: 'Long-term performance assurance',
    descriptionHi: 'लंबे समय के प्रदर्शन का भरोसा',
  },
]

function ImpactStat({ stat, hi }: { stat: ImpactStatData; hi: boolean }) {
  const { icon: Icon, value, prefix = '', prefixHi, suffix, label, labelHi, description, descriptionHi } = stat
  return (
    <article
      className="impact-stat"
      aria-label={`${prefixHi && hi ? prefixHi : prefix}${value.toLocaleString('en-IN')}${suffix} ${hi ? labelHi : label}`}
    >
      <Icon className="impact-stat-icon" size={30} strokeWidth={2.2} aria-hidden="true" />
      <strong aria-live="off">
        <span aria-hidden="true">{hi ? prefixHi ?? prefix : prefix}{value.toLocaleString('en-IN')}{suffix}</span>
      </strong>
      <span className="impact-stat-label">{hi ? labelHi : label}</span>
      <small>{hi ? descriptionHi : description}</small>
    </article>
  )
}

export function ImpactStats() {
  const { language } = useLanguage()
  const hi = language === 'hi'
  return (
    <section className="impact-stats" aria-label={hi ? 'हमारा प्रभाव' : 'Our impact'}>
      <div className="impact-stats-inner">
        {stats.map((stat) => <ImpactStat stat={stat} hi={hi} key={stat.label} />)}
      </div>
    </section>
  )
}
