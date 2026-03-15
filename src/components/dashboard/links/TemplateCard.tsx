import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TapTrash as Trash2 } from '@/components/icons/TapIcons';

interface TemplateCardProps {
  name: string;
  desc: string | null;
  links: Array<{ title: string; bg_color: string | null; text_color: string | null }>;
  gradient?: string;
  loading: boolean;
  onApply: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const TemplateCard = ({ name, desc, links, gradient, loading, onApply, onDelete }: TemplateCardProps) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={() => !loading && onApply()}
      className="w-full text-left rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all group active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className={`relative h-16 flex items-end gap-1 px-3 pb-2 overflow-hidden ${gradient ? `bg-gradient-to-br ${gradient}` : 'bg-muted'}`}>
        <div className="absolute inset-0 bg-black/10" />
        {links.slice(0, 4).map((tl, idx) => (
          <motion.div
            key={idx}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-semibold shadow-sm backdrop-blur-sm truncate max-w-[100px]"
            style={{
              backgroundColor: tl.bg_color || 'rgba(255,255,255,0.9)',
              color: tl.text_color || '#000',
            }}
          >
            <span className="truncate">{tl.title}</span>
          </motion.div>
        ))}
        {links.length > 4 && (
          <span className="relative text-[9px] font-bold text-white/70 px-1">
            +{links.length - 4}
          </span>
        )}
      </div>
      <div className="px-3.5 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-foreground truncate">{name}</p>
          {desc && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{desc}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDelete && (
            <span
              role="button"
              onClick={onDelete}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </span>
          )}
          <span className="text-[11px] font-semibold text-primary opacity-60 group-hover:opacity-100 transition-opacity">
            {loading ? '...' : t('linksManager.apply')}
          </span>
        </div>
      </div>
    </button>
  );
};

export default TemplateCard;
