import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from './UploadZone';
import ResultPanel from './ResultPanel';
import HistoryPanel from './HistoryPanel';
import { analyzeImage } from '../../services/aiService';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { getTreatment } from '../../utils/treatments';

export default function DetectionPage() {
  const { user } = useAuth();

  const [preview, setPreview] = useState(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }
    previewRef.current = preview;
  }, [preview]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = useCallback(async (file) => {
    setError(null);
    setResult(null);

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    setLoading(true);
    try {
      const analysis = await analyzeImage(file);
      setResult(analysis);

      if (user && supabase) {
        const treatment = getTreatment(analysis.label);
        try {
          await supabase.from('detections').insert({
            user_id: user.id,
            image_url: '',
            disease: analysis.label,
            confidence: analysis.confidence,
            treatment: treatment.title,
          });
        } catch (insertErr) {
          // Log insert error but don't fail the user experience
          console.error('[DetectionPage] Failed to save detection to history:', insertErr);
        }

        window.dispatchEvent(new CustomEvent('phytanova:history:refresh'));
      }
    } catch (err) {
      // Show user-friendly error message from AI service
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-black">
      {/* Page header */}
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white"
        >
          Disease{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Detection
          </span>
        </motion.h1>
        <p className="text-text-secondary mt-2">
          Upload a photo of a plant leaf to identify diseases and get AI-powered
          treatment recommendations.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-8 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Left column — upload + result */}
        <div className="space-y-8">
          {/* Upload zone */}
          <div className="border border-white/10 bg-white/[0.02] rounded-md p-6 lg:p-8">
            <h2 className="text-white font-semibold mb-4">
              Upload Plant Image
            </h2>
            <UploadZone onUpload={handleUpload} />
          </div>

          {/* Loading spinner */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center gap-4 py-10"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-md border-4 border-white/10" />
                  <div className="absolute inset-0 rounded-md border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="text-text-secondary text-sm">
                  Analysing image with AI…
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border border-red-500/30 bg-red-500/10 rounded-md p-4"
              >
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result panel */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ResultPanel result={result} preview={preview} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column — history */}
        <div>
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}