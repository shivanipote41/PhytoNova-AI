import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

function HeroSection() {
  const viewerRef = useRef(null);
  const [splineLoaded, setSplineLoaded] = useState(false);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;
    const onLoad = () => setSplineLoaded(true);
    el.addEventListener('load', onLoad);
    return () => el.removeEventListener('load', onLoad);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col bg-black">
      {/* TOP: Animation area — clearly visible */}
      <div className="relative flex-1 min-h-[55vh] sm:min-h-[60vh] w-full overflow-hidden">
        {/* Spline 3D scene */}
        <div className="absolute inset-0">
          <spline-viewer
            ref={viewerRef}
            url="https://prod.spline.design/pAJwb3fvllax6-xD/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Loading overlay (only visible while loading) */}
        {!splineLoaded && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black pointer-events-none z-10"
            aria-live="polite"
            aria-label="Loading 3D scene"
          >
            <p className="text-sm font-mono text-slate-500 tracking-widest uppercase">
              Loading PhytoNova…
            </p>
          </div>
        )}

        {/* Subtle bottom fade to blend animation → text area */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* BOTTOM: Text content — clearly below the animation */}
      <div className="relative z-20 bg-black pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-md text-sm font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-6">
                AI-Powered Plant Health
              </span>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              PhytoNova Intelligence
            </motion.h1>

            <motion.p
              className="text-slate-400 text-base sm:text-lg lg:text-xl mb-8 max-w-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Detect plant diseases instantly with AI-powered image analysis.
              Get accurate diagnoses and actionable treatment recommendations
              for healthier crops.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <a
                href="/detect"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-md font-semibold text-white bg-emerald-500 hover:bg-emerald-400 transition-colors border border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black"
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
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-md font-semibold text-white border border-white/15 hover:bg-white/[0.06] hover:border-white/25 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-black"
              >
                Explore Marketplace
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;