import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link2, Palette, BarChart3, GripVertical, Globe, Smartphone } from 'lucide-react';

const features = [
  { key: 'links', icon: Link2, span: 'col-span-1' },
  { key: 'themes', icon: Palette, span: 'col-span-1' },
  { key: 'analytics', icon: BarChart3, span: 'col-span-1 sm:col-span-2 lg:col-span-1' },
  { key: 'dragDrop', icon: GripVertical, span: 'col-span-1' },
  { key: 'multilingual', icon: Globe, span: 'col-span-1' },
  { key: 'mobile', icon: Smartphone, span: 'col-span-1 sm:col-span-2 lg:col-span-1' },
] as const;

const FeaturesSection = () => {
  const { t } = useTranslation();

  return (
    <section className="px-4 sm:px-6 py-20 sm:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-lg mb-12">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">{t('landing.featuresLabel')}</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-snug">{t('features.title')}</h2>
          <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{t('features.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map(({ key, icon: Icon, span }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`${span} group relative rounded-xl border border-border bg-card p-5 hover:bg-secondary/40 transition-colors`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground">{t(`features.${key}`)}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{t(`features.${key}Desc`)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
