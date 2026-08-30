import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function NotFoundPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <p className="arabic-heading text-5xl text-ink-faint" lang="ar" dir="rtl" translate="no">
        ٤٠٤
      </p>
      <h1 className="mt-4 text-xl font-bold text-ink">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="gold-divider mx-auto my-6 w-24" />
      <div className="flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-deep"
        >
          <Home className="h-4 w-4" aria-hidden />
          Go Home
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    </motion.div>
  )
}
