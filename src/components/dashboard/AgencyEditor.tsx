import { useState, useEffect } from 'react';
import { CreatorPage } from '@/hooks/useCreatorPages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { TapDollar as DollarSign, TapCheck as Check } from '@/components/icons/TapIcons';
import { Users, FileText, Activity } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';

interface AgencyEditorProps {
  page: CreatorPage;
  onUpdate: (updates: Partial<CreatorPage>) => Promise<{ error: any }>;
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  paused: { label: 'Paused', color: 'bg-red-100 text-red-700 border-red-200' },
};

const AgencyEditor = ({ page, onUpdate }: AgencyEditorProps) => {
  const [operator, setOperator] = useState(page.operator || '');
  const [notes, setNotes] = useState(page.notes || '');
  const [revenueMonthly, setRevenueMonthly] = useState(page.revenue_monthly || 0);
  const [revenueCommission, setRevenueCommission] = useState(page.revenue_commission || 20);
  const [status, setStatus] = useState(page.status || 'draft');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setOperator(page.operator || '');
    setNotes(page.notes || '');
    setRevenueMonthly(page.revenue_monthly || 0);
    setRevenueCommission(page.revenue_commission || 20);
    setStatus(page.status || 'draft');
  }, [page.id, page.operator, page.notes, page.revenue_monthly, page.revenue_commission, page.status]);

  const triggerSave = useAutoSave(async () => {
    const result = await onUpdate({
      operator,
      notes,
      revenue_monthly: revenueMonthly,
      revenue_commission: revenueCommission,
      status,
    });
    if (!result.error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast.error(result.error.message);
    }
  }, 1500);

  const netRevenue = Math.round(revenueMonthly * revenueCommission / 100);

  return (
    <div className="space-y-6">
      {/* Status */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> Statut
        </h4>
        <div className="flex gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { setStatus(key); triggerSave(); }}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all ${
                status === key
                  ? cfg.color + ' shadow-sm'
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operator */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Opérateur assigné
        </h4>
        <Input
          value={operator}
          onChange={e => { setOperator(e.target.value); triggerSave(); }}
          placeholder="Erica, Nomena, etc."
          className="h-8 text-[12px]"
        />
        <p className="text-[10px] text-muted-foreground">
          Le membre de l'équipe qui gère cette créatrice.
        </p>
      </div>

      {/* Revenue */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5" /> Revenus
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[11px]">Revenu mensuel (€)</Label>
            <Input
              type="number"
              value={revenueMonthly}
              onChange={e => { setRevenueMonthly(Number(e.target.value) || 0); triggerSave(); }}
              placeholder="0"
              className="h-8 text-[12px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px]">Commission (%)</Label>
            <Input
              type="number"
              value={revenueCommission}
              onChange={e => { setRevenueCommission(Number(e.target.value) || 0); triggerSave(); }}
              placeholder="20"
              className="h-8 text-[12px]"
            />
          </div>
        </div>
        {revenueMonthly > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <span className="text-[12px] text-emerald-700 dark:text-emerald-400">Revenu net agence</span>
            <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-400">{netRevenue} €/mois</span>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-3">
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" /> Notes internes
        </h4>
        <Textarea
          value={notes}
          onChange={e => { setNotes(e.target.value); triggerSave(); }}
          placeholder="Ex: Objectif 500 subs/mois. Ne pas poster le dimanche. Contact via Telegram uniquement."
          className="text-[12px] min-h-[100px]"
        />
        <p className="text-[10px] text-muted-foreground">
          Ces notes sont visibles uniquement dans le dashboard, jamais sur la page publique.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <Check className="w-3 h-3" /> Sauvegardé
        </div>
      )}
    </div>
  );
};

export default AgencyEditor;
