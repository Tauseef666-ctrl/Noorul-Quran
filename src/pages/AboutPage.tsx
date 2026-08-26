import { motion } from 'framer-motion'
import { BookOpen, Heart, Globe, Shield, Code } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
}

export default function AboutPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.header variants={fadeIn} className="text-center py-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-brand/10 text-brand">
          <BookOpen className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="arabic-heading text-3xl" lang="ar" dir="rtl">
          نور القرآن
        </h1>
        <p className="mt-1 text-lg font-semibold text-ink">
          Noorul<span className="text-gold">Quran</span>
        </p>
        <p className="mt-1 text-sm text-ink-muted italic">Read. Listen. Reflect.</p>
        <div className="gold-divider mx-auto mt-4 w-24" />
      </motion.header>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Heart className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-ink">Our Mission</h2>
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">
              NoorulQuran is a peaceful digital Mushaf and modern Quran study companion.
              Our goal is to provide a respectful, accessible, and beautifully crafted
              digital Quran experience that helps people read, listen, and reflect on
              the words of Allah.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-ink">Text Integrity</h2>
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">
              Every verse in this application is served verbatim from authoritative
              sources. No verse is AI-generated, paraphrased, or truncated. The Quranic
              text follows the Uthmani script tradition. You can verify the integrity
              of the dataset at any time by running{' '}
              <code className="rounded bg-brand/5 px-1.5 py-0.5 text-xs font-mono text-brand">
                npm run validate:quran
              </code>
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Globe className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-ink">Content Distinction</h2>
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">
              This application clearly distinguishes between Quranic Arabic,
              translations, tafsir, personal notes, and educational information.
              Translations retain their original attribution. Tafsir is visually
              separated from the Quran text. This application does not generate
              fatwas or present AI-generated content as religious authority.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeIn} className="card rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Code className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-ink">Technology</h2>
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">
              Built with React, TypeScript, Vite, and Tailwind CSS.
              Responsive design with light/dark theme support.
              Progressive Web App with offline capabilities.
              Data sourced from Quran.com API and Al Quran Cloud.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.footer variants={fadeIn} className="text-center py-4">
        <p className="arabic-heading text-sm text-ink-faint" lang="ar" dir="rtl">
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          Built with love for the sake of Allah
        </p>
      </motion.footer>
    </motion.div>
  )
}
