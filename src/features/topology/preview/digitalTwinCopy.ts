import type { Decision, DecisionActor, DecisionNotice, InputSelection } from './digitalTwinDecision';
import type { PreviewLanguage } from './previewCopy';

type Copy = {
  title: string;
  open: string;
  close: string;
  disclosure: string;
  evidence: string;
  actor: string;
  input: string;
  manifest: string;
  gas: string;
  compare: string;
  comparison: string;
  source: string;
  observed: string;
  baseline: string;
  alternative: string;
  tradeoff: string;
  propose: string;
  review: string;
  rationale: string;
  history: string;
  noHistory: string;
  outcome: string;
  unresolved: string;
  actors: Record<DecisionActor, string>;
  inputs: Record<InputSelection, string>;
  decisions: Record<Decision, string>;
  events: Record<'comparison' | 'proposal' | Decision, string>;
  notices: Record<DecisionNotice, string>;
};

export const digitalTwinCopy = {
  en: {
    title: 'Digital-twin decision preview',
    open: 'Open digital-twin decision',
    close: 'Close digital-twin decision',
    disclosure: 'Synthetic fixture · Precomputed outputs · Demo decisions',
    evidence: 'Return to station investigation',
    actor: 'Decision actor',
    input: 'Input revision fixture',
    manifest: 'Versioned input manifest',
    gas: 'Gas',
    compare: 'Load precomputed comparison',
    comparison: 'Synthetic pressure comparison',
    source: 'Source',
    observed: 'Fixture observation',
    baseline: 'Precomputed baseline',
    alternative: 'Precomputed alternative',
    tradeoff: 'The alternative shows higher outlet pressure in this fixture. Energy demand, safety limits and field performance remain unassessed.',
    propose: 'Propose the modeled alternative',
    review: 'Review proposal',
    rationale: 'Decision rationale',
    history: 'Digital-twin decision history',
    noHistory: 'No comparison or decision events in this context.',
    outcome: 'Follow-up outcome',
    unresolved: 'Unavailable · Unresolved',
    actors: { operator: 'Demo operator', engineer: 'Demo engineer', reviewer: 'Independent demo reviewer' },
    inputs: { matched: 'Matching revision', missing: 'Missing revision', incompatible: 'Incompatible revision' },
    decisions: { approve: 'Approve proposal', reject: 'Reject proposal', return: 'Return proposal' },
    events: { comparison: 'Precomputed comparison opened', proposal: 'Alternative proposed', approve: 'Proposal approved', reject: 'Proposal rejected', return: 'Proposal returned' },
    notices: {
      missing: 'The required fixture inputs are missing or degraded.',
      incompatible: 'The fixture input revision is incompatible with this comparison.',
      denied: 'This demo actor cannot perform the action.',
      unavailable: 'This action is unavailable in the current state.',
      reviewed: 'Proposal reviewed. Record a decision with a rationale.',
      stale: 'The reviewed proposal or input context has changed.',
      rationale: 'Enter a rationale of 1 to 240 characters.',
    },
  },
  fr: {
    title: 'Aperçu décisionnel du jumeau numérique',
    open: 'Ouvrir la décision du jumeau numérique',
    close: 'Fermer la décision du jumeau numérique',
    disclosure: 'Scénario synthétique · Résultats précalculés · Décisions simulées',
    evidence: 'Revenir à l’investigation de la station',
    actor: 'Acteur de la décision',
    input: 'Révision des entrées de démonstration',
    manifest: 'Manifeste des entrées versionnées',
    gas: 'Gaz',
    compare: 'Charger la comparaison précalculée',
    comparison: 'Comparaison synthétique des pressions',
    source: 'Source',
    observed: 'Observation de démonstration',
    baseline: 'Référence précalculée',
    alternative: 'Variante précalculée',
    tradeoff: 'Dans ce scénario, la variante présente une pression de sortie plus élevée. La consommation énergétique, les limites de sécurité et les performances sur le terrain restent à évaluer.',
    propose: 'Proposer la variante modélisée',
    review: 'Examiner la proposition',
    rationale: 'Justification de la décision',
    history: 'Historique des décisions du jumeau numérique',
    noHistory: 'Aucune comparaison ni décision dans ce contexte.',
    outcome: 'Résultat du suivi',
    unresolved: 'Indisponible · En suspens',
    actors: { operator: 'Opérateur de démonstration', engineer: 'Ingénieur de démonstration', reviewer: 'Examinateur indépendant de démonstration' },
    inputs: { matched: 'Révision correspondante', missing: 'Révision manquante', incompatible: 'Révision incompatible' },
    decisions: { approve: 'Approuver la proposition', reject: 'Rejeter la proposition', return: 'Renvoyer la proposition' },
    events: { comparison: 'Comparaison précalculée ouverte', proposal: 'Variante proposée', approve: 'Proposition approuvée', reject: 'Proposition rejetée', return: 'Proposition renvoyée' },
    notices: {
      missing: 'Les entrées requises sont manquantes ou dégradées.',
      incompatible: 'La révision des entrées est incompatible avec cette comparaison.',
      denied: 'Cet acteur de démonstration ne peut pas effectuer l’action.',
      unavailable: 'Cette action est indisponible dans l’état actuel.',
      reviewed: 'Proposition examinée. Enregistrez une décision avec sa justification.',
      stale: 'La proposition examinée ou le contexte des entrées a changé.',
      rationale: 'Saisissez une justification de 1 à 240 caractères.',
    },
  },
  ar: {
    title: 'معاينة قرارات التوأم الرقمي',
    open: 'فتح قرار التوأم الرقمي',
    close: 'إغلاق قرار التوأم الرقمي',
    disclosure: 'سيناريو اصطناعي · نتائج محسوبة مسبقاً · قرارات تجريبية',
    evidence: 'العودة إلى التحقيق في حالة المحطة',
    actor: 'الفاعل في القرار',
    input: 'مراجعة مدخلات العرض',
    manifest: 'بيان المدخلات بإصداراتها',
    gas: 'غاز',
    compare: 'تحميل المقارنة المحسوبة مسبقاً',
    comparison: 'مقارنة اصطناعية للضغط',
    source: 'المصدر',
    observed: 'رصد تجريبي',
    baseline: 'مرجع محسوب مسبقاً',
    alternative: 'بديل محسوب مسبقاً',
    tradeoff: 'يُظهر البديل ضغط خروج أعلى في هذا السيناريو. لم تُقيّم متطلبات الطاقة أو حدود السلامة أو الأداء الميداني.',
    propose: 'اقتراح البديل المستند إلى النموذج',
    review: 'مراجعة المقترح',
    rationale: 'مبرر القرار',
    history: 'سجل قرارات التوأم الرقمي',
    noHistory: 'لا توجد أحداث مقارنة أو قرار في هذا السياق.',
    outcome: 'نتيجة المتابعة',
    unresolved: 'غير متاحة · ما زالت معلّقة',
    actors: { operator: 'مشغل تجريبي', engineer: 'مهندس تجريبي', reviewer: 'مراجع تجريبي مستقل' },
    inputs: { matched: 'مراجعة مطابقة', missing: 'مراجعة مفقودة', incompatible: 'مراجعة غير متوافقة' },
    decisions: { approve: 'الموافقة على المقترح', reject: 'رفض المقترح', return: 'إرجاع المقترح' },
    events: { comparison: 'فُتحت المقارنة المحسوبة مسبقاً', proposal: 'اقتُرح البديل', approve: 'تمت الموافقة على المقترح', reject: 'رُفض المقترح', return: 'أُعيد المقترح' },
    notices: {
      missing: 'المدخلات المطلوبة مفقودة أو متدهورة الجودة.',
      incompatible: 'مراجعة المدخلات غير متوافقة مع هذه المقارنة.',
      denied: 'هذا الفاعل التجريبي غير مخوّل بتنفيذ الإجراء.',
      unavailable: 'هذا الإجراء غير متاح في الحالة الحالية.',
      reviewed: 'تمت مراجعة المقترح. سجّل قراراً مع مبرره.',
      stale: 'تغيّر المقترح المُراجع أو سياق المدخلات.',
      rationale: 'أدخل مبرراً من 1 إلى 240 حرفاً.',
    },
  },
} satisfies Record<PreviewLanguage, Copy>;
