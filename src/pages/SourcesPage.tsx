import { motion } from 'framer-motion'
import { ExternalLink, Shield } from 'lucide-react'
import { DATA_SOURCES, INTEGRITY_STATEMENT } from '../data/attribution'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
}

const KIND_LABELS: Record<string, string> = {
  'quran-text': 'Quran Text',
  metadata: 'Metadata',
  translation: 'Translations',
  tafsir: 'Tafsir',
  audio: 'Audio',
  tooling: 'Tools & APIs',
}

export default function SourcesPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.header variants={fadeIn}>
        <h1 className="text-2xl font-bold text-ink">Sources & Attribution</h1>
        <p className="text-sm text-ink-muted">
          Transparency about where our data comes from
        </p>
      </motion.header>

      {/* Integrity Statement */}
      <motion.div variants={fadeIn} className="card rounded-2xl border-brand/20 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-ink">Text Integrity</h2>
            <p className="mt-1 text-sm text-ink-muted">{INTEGRITY_STATEMENT}</p>
          </div>
        </div>
      </motion.div>

      {/* Data Sources */}
      <motion.div variants={stagger} className="space-y-3">
        {Object.entries(
          DATA_SOURCES.reduce(
            (acc, source) => {
              const kind = KIND_LABELS[source.kind] ?? source.kind
              ;(acc[kind] ??= []).push(source)
              return acc
            },
            {} as Record<string, typeof DATA_SOURCES[number][]>,
          ),
        ).map(([kind, sources]) => (
          <motion.div key={kind} variants={fadeIn}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
              {kind}
            </h2>
            <div className="space-y-2">
              {sources.map((source) => (
                <div key={source.id} className="card rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{source.name}</p>
                      <p className="mt-1 text-xs text-ink-muted">{source.license}</p>
                      {source.notes && (
                        <p className="mt-1 text-xs text-ink-faint italic">{source.notes}</p>
                      )}
                    </div>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand hover:underline"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Fonts */}
      <motion.section variants={fadeIn}>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink-faint">
          Fonts
        </h2>
        <div className="card rounded-2xl p-4">
          <ul className="space-y-1 text-sm text-ink-muted">
            <li><span className="font-semibold text-ink">Amiri Quran</span> — Quranic Arabic text (SIL Open Font License)</li>
            <li><span className="font-semibold text-ink">Amiri</span> — Arabic headings (SIL Open Font License)</li>
            <li><span className="font-semibold text-ink">Noto Nastaliq Urdu</span> — Urdu translations (SIL Open Font License)</li>
            <li><span className="font-semibold text-ink">Lora Variable</span> — English translation text (SIL Open Font License)</li>
            <li><span className="font-semibold text-ink">Inter Variable</span> — UI text (SIL Open Font License)</li>
          </ul>
        </div>
      </motion.section>
    </motion.div>
  )
}
