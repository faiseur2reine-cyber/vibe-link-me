import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link2, Palette, BarChart3, GripVertical, Globe, Smartphone } from 'lucide-react';

const features = [
  { key: 'links', icon: Link2 },
  { key: 'themes', icon: Palette },
  { key: 'analytics', icon: BarChart3 },
  { key: 'dragDrop', icon: GripVertical },
  { key: 'multilingual', icon: Globe },
  { key: 'mobile', icon: Smartphone },
] as const;

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-24 sm:py-32">
      <div className="max-w-5xl mx-auto">
        {/* Section header — centered */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-lg mx-auto mb-16"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-[0.2em] mb-3">
            {t('landing.featuresLabel')}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
            {t('features.title')}
          </h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* 3×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {features.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="bg-card p-6 sm:p-8 group hover:bg-secondary/30 transition-colors duration-300"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors duration-300">
                <Icon className="w-4.5 h-4.5 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">
                {t(`features.${key}`)}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t(`features.${key}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
