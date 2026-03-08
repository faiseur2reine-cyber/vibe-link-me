import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link2, Palette, BarChart3, GripVertical, Globe, Smartphone } from 'lucide-react';

const featureIcons = [Link2, Palette, BarChart3, GripVertical, Globe, Smartphone];
const featureKeys = ['links', 'themes', 'analytics', 'dragDrop', 'multilingual', 'mobile'] as const;

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 border-t border-border">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('features.title')}</h2>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">{t('features.subtitle')}</p>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureKeys.map((key, i) => {
            const Icon = featureIcons[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-xl p-5 border border-border text-left hover:border-primary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{t(`features.${key}`)}</h3>
                <p className="mt-1 text-muted-foreground text-xs leading-relaxed">{t(`features.${key}Desc`)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
