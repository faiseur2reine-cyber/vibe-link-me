import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TapLink as Link2, TapPalette as Palette, TapChart as BarChart3, TapGrip as GripVertical, TapGlobe as Globe, TapSmartphone as Smartphone } from '@/components/icons/TapIcons';

const features = [
  { key: 'links', icon: Link2, accent: 'pop-violet', shadow: 'shadow-pop-violet' },
  { key: 'themes', icon: Palette, accent: 'pop-coral', shadow: 'shadow-pop-coral' },
  { key: 'analytics', icon: BarChart3, accent: 'pop-cyan', shadow: 'shadow-pop-cyan' },
  { key: 'dragDrop', icon: GripVertical, accent: 'pop-yellow', shadow: 'shadow-pop-yellow' },
  { key: 'multilingual', icon: Globe, accent: 'pop-lime', shadow: 'shadow-pop-lime' },
  { key: 'mobile', icon: Smartphone, accent: 'pop-pink', shadow: 'shadow-pop-pink' },
] as const;

const rotations = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]', 'rotate-[0.5deg]', '-rotate-1', 'rotate-[0.5deg]'];

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-24 sm:py-32 relative overflow-hidden">
      {/* SVG blob backgrounds */}
      <FeatureBlobs />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg mx-auto mb-16"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-pop-gradient">
            {t('landing.featuresLabel')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] leading-tight">
            {t('features.title')}
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Bento grid — pop style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ key, icon: Icon, accent, shadow }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
              className={`group relative rounded-3xl border-2 border-border/50 bg-card p-7 hover:border-${accent}/30 hover:${shadow} transition-all duration-500 overflow-hidden cursor-default ${rotations[i]} hover:rotate-0`}
            >
              {/* Color splash on hover */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${accent}/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative">
                <div className={`w-12 h-12 rounded-2xl bg-${accent}/12 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  <Icon className={`w-5 h-5 text-${accent}`} />
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