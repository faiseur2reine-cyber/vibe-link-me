import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TapLink as Link2, TapPalette as Palette, TapChart as BarChart3, TapGrip as GripVertical, TapGlobe as Globe, TapSmartphone as Smartphone } from '@/components/icons/TapIcons';

const features = [
  { key: 'links', icon: Link2, accent: 'from-violet-500/15 to-purple-500/5' },
  { key: 'themes', icon: Palette, accent: 'from-pink-500/15 to-rose-500/5' },
  { key: 'analytics', icon: BarChart3, accent: 'from-blue-500/15 to-cyan-500/5' },
  { key: 'dragDrop', icon: GripVertical, accent: 'from-amber-500/15 to-orange-500/5' },
  { key: 'multilingual', icon: Globe, accent: 'from-emerald-500/15 to-green-500/5' },
  { key: 'mobile', icon: Smartphone, accent: 'from-primary/15 to-primary/5' },
] as const;

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-24 sm:py-32 relative">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.03),transparent_60%)]" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg mx-auto mb-16"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4">
            {t('landing.featuresLabel')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] leading-tight">
            {t('features.title')}
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ key, icon: Icon, accent }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
              className="group relative rounded-2xl border border-border/60 bg-card p-7 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/[0.03] transition-all duration-500 overflow-hidden"
            >
              {/* Gradient accent on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-5 group-hover:bg-primary/12 group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-[15px] text-foreground mb-2 tracking-tight">
                  {t(`features.${key}`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`features.${key}Desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
