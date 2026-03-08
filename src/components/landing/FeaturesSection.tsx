import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link2, Palette, BarChart3, GripVertical, Globe, Smartphone } from 'lucide-react';

const featureIcons = [Link2, Palette, BarChart3, GripVertical, Globe, Smartphone];
const featureKeys = ['links', 'themes', 'analytics', 'dragDrop', 'multilingual', 'mobile'] as const;

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 bg-muted/50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">{t('features.title')}</h2>
        <p className="mt-3 text-muted-foreground text-base sm:text-lg">{t('features.subtitle')}</p>
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {featureKeys.map((key, i) => {
            const Icon = featureIcons[i];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 mx-auto">
                  <Icon className="w-5 sm:w-6 h-5 sm:h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg">{t(`features.${key}`)}</h3>
                <p className="mt-2 text-muted-foreground text-xs sm:text-sm">{t(`features.${key}Desc`)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;