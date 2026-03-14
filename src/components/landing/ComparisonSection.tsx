import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

const features = [
  { name: 'Link-in-bio pages', us: true, linktree: true, gaml: true, beacons: true },
  { name: 'Custom themes', us: true, linktree: true, gaml: true, beacons: true },
  { name: 'Analytics (clicks, geo)', us: true, linktree: true, gaml: true, beacons: true },
  { name: 'Deeplink engine (IG/TikTok breakout)', us: true, linktree: false, gaml: true, beacons: false },
  { name: '18+ age gate (Meta compliant)', us: true, linktree: false, gaml: false, beacons: false },
  { name: 'Safe page (bot redirect)', us: true, linktree: false, gaml: true, beacons: false },
  { name: 'Meta Pixel / GA4 / TikTok Pixel', us: true, linktree: 'paid', gaml: true, beacons: 'paid' },
  { name: 'UTM auto-tagging', us: true, linktree: false, gaml: false, beacons: false },
  { name: 'Agency management (multi-creator)', us: true, linktree: false, gaml: true, beacons: false },
  { name: 'Urgency widgets (countdown, spots)', us: true, linktree: false, gaml: true, beacons: false },
  { name: 'QR code sharing', us: true, linktree: true, gaml: false, beacons: true },
  { name: 'A/B testing', us: true, linktree: false, gaml: false, beacons: false },
  { name: 'CSV export', us: true, linktree: 'paid', gaml: false, beacons: false },
  { name: 'Free plan with all features', us: true, linktree: false, gaml: false, beacons: false },
];

const Cell = ({ value }: { value: boolean | string }) => {
  if (value === true) return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-red-400/50 mx-auto" />;
  return <span className="text-[10px] text-amber-500 font-medium">{value}</span>;
};

const ComparisonSection = () => (
  <section className="px-4 sm:px-6 py-20 sm:py-28">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Pourquoi choisir MyTaptap ?
        </h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-md mx-auto">
          Toutes les features dont les créateurs ont besoin, sans les limitations.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="overflow-x-auto"
      >
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/60">
              <th className="py-3 pr-2 sm:pr-4 text-[10px] sm:text-[12px] font-semibold text-muted-foreground w-[35%] sm:w-[40%]">Feature</th>
              <th className="py-3 px-1 sm:px-2 text-center text-[10px] sm:text-[12px] font-bold text-foreground">
                <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded-full bg-primary/10 text-primary">MyTaptap</span>
              </th>
              <th className="py-3 px-1 sm:px-2 text-center text-[10px] sm:text-[12px] font-medium text-muted-foreground">Linktree</th>
              <th className="py-3 px-1 sm:px-2 text-center text-[10px] sm:text-[12px] font-medium text-muted-foreground hidden sm:table-cell">GAML</th>
              <th className="py-3 px-1 sm:px-2 text-center text-[10px] sm:text-[12px] font-medium text-muted-foreground hidden sm:table-cell">Beacons</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f, i) => (
              <motion.tr
                key={f.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <td className="py-2 sm:py-2.5 pr-2 sm:pr-4 text-[10px] sm:text-[12px] text-foreground">{f.name}</td>
                <td className="py-2 sm:py-2.5 px-1 sm:px-2 text-center"><Cell value={f.us} /></td>
                <td className="py-2 sm:py-2.5 px-1 sm:px-2 text-center"><Cell value={f.linktree} /></td>
                <td className="py-2 sm:py-2.5 px-1 sm:px-2 text-center hidden sm:table-cell"><Cell value={f.gaml} /></td>
                <td className="py-2 sm:py-2.5 px-1 sm:px-2 text-center hidden sm:table-cell"><Cell value={f.beacons} /></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  </section>
);

export default ComparisonSection;
