import { motion } from 'framer-motion';

function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center overflow-hidden">
      {/* Spline 3D scene as full-screen background */}
      <div className="absolute inset-0 z-0">
        <spline-viewer
          url="https://prod.spline.design/pAJwb3fvllax6-xD/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

      {/* Bottom fade into content below */}
      <div className="absolute bottom-0 left-0 right-0 h-24 z-[1] bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-md text-sm font-medium bg-primary/15 text-primary border border-primary/30 mb-6">
              AI-Powered Plant Health
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            PhytoNova Intelligence
          </motion.h1>

          <motion.p
            className="text-slate-400 text-lg sm:text-xl mb-8 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Detect plant diseases instantly with AI-powered image analysis. Get accurate diagnoses and actionable treatment recommendations for healthier crops.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <a
              href="/detect"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-md font-semibold text-slate-50 bg-primary hover:bg-primary/90 transition-colors border border-primary/50"
            >
              Start Detecting
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
            <a
              href="/marketplace"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-md font-semibold text-slate-50 border border-white/20 hover:bg-white/[0.06] hover:border-white/30 transition-colors"
            >
              Explore Marketplace
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;