import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sophie L.',
    role: 'Content Creator',
    text: 'Depuis que j\'utilise MyTaptap, mes taux de clic ont doublé. Le deeplink qui sort d\'Instagram, c\'est game changer.',
    avatar: 'S',
    stars: 5,
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Marc D.',
    role: 'Agency Manager',
    text: 'On gère 30 créatrices. L\'onglet agence avec les revenus et les opérateurs nous fait gagner 2h par jour.',
    avatar: 'M',
    stars: 5,
    color: 'from-blue-500 to-cyan-600',
  },
  {
    name: 'Emma R.',
    role: 'Fitness Coach',
    text: 'Simple, rapide, et mes clients font confiance au lien. Le QR code pour mes événements est un plus énorme.',
    avatar: 'E',
    stars: 5,
    color: 'from-emerald-500 to-green-600',
  },
  {
    name: 'Lucas T.',
    role: 'Musician',
    text: 'J\'ai testé Linktree, Beacons, et GAML. MyTaptap est le seul avec l\'UTM auto et le tracking TikTok Pixel gratuit.',
    avatar: 'L',
    stars: 5,
    color: 'from-amber-500 to-orange-600',
  },
];

const TestimonialsSection = () => (
  <section className="px-4 sm:px-6 py-20 sm:py-28 bg-muted/30">
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">
          Témoignages
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ils nous font confiance
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="p-6 rounded-2xl border border-border/60 bg-card hover:border-border hover:shadow-sm transition-all duration-300"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.stars }).map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-[13px] text-foreground leading-relaxed mb-4">
              "{t.text}"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-[12px] font-bold shrink-0`}>
                {t.avatar}
              </div>
              <div>
                <p className="text-[12px] font-semibold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
