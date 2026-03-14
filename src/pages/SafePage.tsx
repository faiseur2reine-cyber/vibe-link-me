// src/pages/SafePage.tsx
// ═══ SAFE PAGE ═══
// Neutral landing page for bot redirects.
// Route: /safe/:username
// When safe_page_enabled is true on a creator_page, bots hitting the
// public profile get redirected here instead.

import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

const SafePage = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <>
      <Helmet>
        <title>Bienvenue</title>
        <meta name="description" content="Découvrez nos contenus" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bienvenue</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Découvrez nos contenus et suivez-nous sur les réseaux.
          </p>
          <Link
            to={`/${username || ''}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Voir le profil
          </Link>
        </motion.div>
      </div>
    </>
  );
};

export default SafePage;
