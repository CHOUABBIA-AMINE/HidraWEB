import {
  observedAt, windows,
  type Organization, type RoleId, type StationId, type StationKind, type SystemId, type TechnicalDescription, type WindowId,
} from './fixtures';
import type { InvestigationAction, InvestigationNotice } from './stationInvestigation';

type PreviewCopy = {
  badge: string;
  heading: string;
  intro: string;
  reset: string;
  workspace: string;
  role: string;
  system: string;
  noSystem: string;
  time: string;
  scope: string;
  noScope: string;
  scopeStatus: string;
  deniedTitle: string;
  denied: string;
  topology: string;
  assetTree: string;
  stationsLabel: string;
  linkedAlarms: string;
  noLinkedAlarms: string;
  geographicMap: string;
  stationMap: string;
  readOnly: string;
  layers: string;
  pipelines: string;
  selectOnMap: (name: string) => string;
  corridor: string;
  fictionalOverlay: string;
  stationEvidence: string;
  chooseStation: string;
  useMapOrTree: string;
  syntheticDisclosure: string;
  fixture: string;
  technical: string;
  telemetry: string;
  pressure: string;
  alarm: string;
  lowDischarge: string;
  samples: string;
  source: string;
  empty: string;
  unavailable: string;
  mapUnavailable: string;
  locale: Record<string, string>;
  states: Record<'available' | 'stale' | 'empty' | 'unavailable', string>;
  roles: Record<RoleId, string>;
  systems: Record<SystemId, string>;
  stations: Record<StationId, string>;
  kinds: Record<StationKind, string>;
  company: string;
  organizations: Record<Organization, string>;
  descriptions: Record<TechnicalDescription, string>;
};

export const previewCopy = {
  en: {
    badge: 'Synthetic data',
    heading: 'Synthetic network preview',
    intro: 'Explore a fictional gas corridor and its station evidence.',
    reset: 'Reset preview',
    workspace: 'Workspace context',
    role: 'Demo role',
    system: 'Pipeline system',
    noSystem: 'No system available',
    time: 'Time window',
    scope: 'Company and organization',
    noScope: 'Scope unavailable',
    scopeStatus: 'Scope status',
    deniedTitle: 'Workspace unavailable',
    denied: 'No workspace is available in this demo scope.',
    topology: 'Topology',
    assetTree: 'Asset tree',
    stationsLabel: 'Stations',
    linkedAlarms: 'Linked alarms',
    noLinkedAlarms: 'No linked alarm records in this window.',
    geographicMap: 'Geographic map',
    stationMap: 'Station map',
    readOnly: 'Read only',
    layers: 'Map layers',
    pipelines: 'Pipelines',
    selectOnMap: (name) => 'Select ' + name + ' on map',
    corridor: 'Gas corridor',
    fictionalOverlay: 'Synthetic infrastructure · Basemap by Natural Earth',
    stationEvidence: 'Station evidence',
    chooseStation: 'Select a station',
    useMapOrTree: 'Use the map, asset tree or linked alarms.',
    syntheticDisclosure: 'All assets, measurements and access scenarios are synthetic.',
    fixture: 'Fixture',
    technical: 'Technical revision',
    telemetry: 'Telemetry',
    pressure: 'Station outlet pressure',
    alarm: 'Alarm',
    lowDischarge: 'Low discharge pressure',
    samples: 'Pressure samples in bar gauge',
    source: 'Fixture evidence',
    empty: 'No records in this window.',
    unavailable: 'Evidence source unavailable.',
    mapUnavailable: 'The map could not load. Use the asset tree to select a station.',
    locale: {
      'Map.Title': 'Map',
      'NavigationControl.ResetBearing': 'Reset map bearing to north',
      'NavigationControl.ZoomIn': 'Zoom in',
      'NavigationControl.ZoomOut': 'Zoom out',
    },
    states: { available: 'Available', stale: 'Stale', empty: 'Empty', unavailable: 'Unavailable' },
    roles: { operator: 'Scoped operator', observer: 'Read-only observer', otherScope: 'Same company · outside asset grant', otherCompany: 'Different company' },
    systems: { gz2: 'GZ2 Reference', orion: 'Orion Gas Link' },
    stations: {
      'demo-gz2-west': 'West Intake', 'demo-gz2-atlas': 'Atlas Compression', 'demo-gz2-east': 'East Delivery',
      'demo-orion-cedar': 'Cedar Entry', 'demo-orion-ridge': 'Ridge Delivery',
    },
    kinds: { inlet: 'Inlet station', compressor: 'Compressor station', delivery: 'Delivery station' },
    company: 'Demo Gas Operations',
    organizations: { westControl: 'West Gas Control', eastControl: 'East Gas Control' },
    descriptions: {
      meteringInlet: 'Metering and inlet manifold', compression: 'Compression train and discharge header',
      meteringOutlet: 'Delivery metering and outlet header', intakeValves: 'Intake manifold and isolation valves', deliveryMetering: 'Delivery metering',
    },
  },
  fr: {
    badge: 'Données synthétiques',
    heading: 'Aperçu synthétique du réseau',
    intro: 'Explorez un corridor gazier fictif et les données de ses stations.',
    reset: 'Réinitialiser l’aperçu',
    workspace: 'Contexte de l’espace de travail',
    role: 'Rôle de démonstration',
    system: 'Système de transport',
    noSystem: 'Aucun système disponible',
    time: 'Plage horaire',
    scope: 'Entreprise et organisation',
    noScope: 'Périmètre indisponible',
    scopeStatus: 'État du périmètre',
    deniedTitle: 'Espace de travail indisponible',
    denied: 'Aucun espace de travail n’est accessible dans ce périmètre de démonstration.',
    topology: 'Topologie',
    assetTree: 'Arborescence des actifs',
    stationsLabel: 'Stations',
    linkedAlarms: 'Alarmes associées',
    noLinkedAlarms: 'Aucune alarme associée sur cette plage horaire.',
    geographicMap: 'Carte géographique',
    stationMap: 'Carte des stations',
    readOnly: 'Lecture seule',
    layers: 'Couches cartographiques',
    pipelines: 'Gazoducs',
    selectOnMap: (name) => 'Sélectionner ' + name + ' sur la carte',
    corridor: 'Corridor gazier',
    fictionalOverlay: 'Infrastructure synthétique · Fond de carte Natural Earth',
    stationEvidence: 'Données de la station',
    chooseStation: 'Sélectionnez une station',
    useMapOrTree: 'Utilisez la carte, l’arborescence ou les alarmes associées.',
    syntheticDisclosure: 'Les actifs, les mesures et les scénarios d’accès sont synthétiques.',
    fixture: 'Jeu de données',
    technical: 'Révision technique',
    telemetry: 'Télémétrie',
    pressure: 'Pression en sortie de station',
    alarm: 'Alarme',
    lowDischarge: 'Pression de refoulement basse',
    samples: 'Mesures de pression en bar relatif',
    source: 'Données de démonstration',
    empty: 'Aucun enregistrement sur cette plage horaire.',
    unavailable: 'Source de données indisponible.',
    mapUnavailable: 'La carte n’a pas pu être chargée. Sélectionnez une station dans l’arborescence.',
    locale: {
      'Map.Title': 'Carte',
      'NavigationControl.ResetBearing': 'Réorienter la carte vers le nord',
      'NavigationControl.ZoomIn': 'Agrandir la carte',
      'NavigationControl.ZoomOut': 'Réduire la carte',
    },
    states: { available: 'Disponible', stale: 'Ancien', empty: 'Vide', unavailable: 'Indisponible' },
    roles: { operator: 'Opérateur autorisé', observer: 'Observateur en lecture seule', otherScope: 'Même entreprise · actif hors périmètre', otherCompany: 'Autre entreprise' },
    systems: { gz2: 'Référence GZ2', orion: 'Liaison gazière Orion' },
    stations: {
      'demo-gz2-west': 'Entrée Ouest', 'demo-gz2-atlas': 'Compression Atlas', 'demo-gz2-east': 'Livraison Est',
      'demo-orion-cedar': 'Entrée Cèdre', 'demo-orion-ridge': 'Livraison Crête',
    },
    kinds: { inlet: 'Station d’entrée', compressor: 'Station de compression', delivery: 'Station de livraison' },
    company: 'Exploitation gazière de démonstration',
    organizations: { westControl: 'Conduite gazière Ouest', eastControl: 'Conduite gazière Est' },
    descriptions: {
      meteringInlet: 'Comptage et collecteur d’entrée', compression: 'Train de compression et collecteur de refoulement',
      meteringOutlet: 'Comptage de livraison et collecteur de sortie', intakeValves: 'Collecteur d’entrée et vannes d’isolement', deliveryMetering: 'Comptage de livraison',
    },
  },
  ar: {
    badge: 'بيانات اصطناعية',
    heading: 'معاينة الشبكة الاصطناعية',
    intro: 'استكشف مسار غاز افتراضياً وبيانات محطاته.',
    reset: 'إعادة ضبط المعاينة',
    workspace: 'سياق مساحة العمل',
    role: 'الدور التجريبي',
    system: 'منظومة نقل الغاز',
    noSystem: 'لا توجد منظومة متاحة',
    time: 'الفترة الزمنية',
    scope: 'الشركة والوحدة التنظيمية',
    noScope: 'النطاق غير متاح',
    scopeStatus: 'حالة النطاق',
    deniedTitle: 'مساحة العمل غير متاحة',
    denied: 'لا توجد مساحة عمل متاحة في هذا النطاق التجريبي.',
    topology: 'طوبولوجيا الشبكة',
    assetTree: 'شجرة الأصول',
    stationsLabel: 'المحطات',
    linkedAlarms: 'الإنذارات المرتبطة',
    noLinkedAlarms: 'لا توجد إنذارات مرتبطة في هذه الفترة.',
    geographicMap: 'خريطة جغرافية',
    stationMap: 'خريطة المحطات',
    readOnly: 'للقراءة فقط',
    layers: 'طبقات الخريطة',
    pipelines: 'أنابيب الغاز',
    selectOnMap: (name) => 'اختر ' + name + ' على الخريطة',
    corridor: 'مسار الغاز',
    fictionalOverlay: 'بنية تحتية اصطناعية · خريطة أساسية من Natural Earth',
    stationEvidence: 'بيانات المحطة',
    chooseStation: 'اختر محطة',
    useMapOrTree: 'استخدم الخريطة أو شجرة الأصول أو الإنذارات المرتبطة.',
    syntheticDisclosure: 'جميع الأصول والقياسات وسيناريوهات الوصول اصطناعية.',
    fixture: 'مجموعة البيانات',
    technical: 'المراجعة الفنية',
    telemetry: 'القياسات عن بُعد',
    pressure: 'ضغط مخرج المحطة',
    alarm: 'إنذار',
    lowDischarge: 'انخفاض ضغط الطرد',
    samples: 'قراءات الضغط بالبار النسبي',
    source: 'بيانات تجريبية',
    empty: 'لا توجد سجلات في هذه الفترة.',
    unavailable: 'مصدر البيانات غير متاح.',
    mapUnavailable: 'تعذر تحميل الخريطة. اختر محطة من شجرة الأصول.',
    locale: {
      'Map.Title': 'الخريطة',
      'NavigationControl.ResetBearing': 'إعادة توجيه الخريطة نحو الشمال',
      'NavigationControl.ZoomIn': 'تكبير الخريطة',
      'NavigationControl.ZoomOut': 'تصغير الخريطة',
    },
    states: { available: 'متاح', stale: 'قديم', empty: 'فارغ', unavailable: 'غير متاح' },
    roles: { operator: 'مشغل مخول', observer: 'مراقب للقراءة فقط', otherScope: 'الشركة نفسها · أصل خارج النطاق', otherCompany: 'شركة أخرى' },
    systems: { gz2: 'المرجع GZ2', orion: 'خط أوريون للغاز' },
    stations: {
      'demo-gz2-west': 'المدخل الغربي', 'demo-gz2-atlas': 'محطة ضغط الأطلس', 'demo-gz2-east': 'التسليم الشرقي',
      'demo-orion-cedar': 'مدخل الأرز', 'demo-orion-ridge': 'تسليم المرتفعات',
    },
    kinds: { inlet: 'محطة إدخال', compressor: 'محطة ضغط', delivery: 'محطة تسليم' },
    company: 'شركة تشغيل الغاز التجريبية',
    organizations: { westControl: 'مركز التحكم الغربي', eastControl: 'مركز التحكم الشرقي' },
    descriptions: {
      meteringInlet: 'القياس ومجمع الدخول', compression: 'قطار الضغط ومجمع الطرد',
      meteringOutlet: 'قياس التسليم ومجمع الخروج', intakeValves: 'مجمع الدخول وصمامات العزل', deliveryMetering: 'قياس التسليم',
    },
  },
} satisfies Record<'en' | 'fr' | 'ar', PreviewCopy>;

export type PreviewLanguage = keyof typeof previewCopy;

export function formatTime(iso: string, language: PreviewLanguage) {
  return new Intl.DateTimeFormat(language, {
    timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(iso));
}

export function windowLabel(windowId: WindowId, language: PreviewLanguage) {
  return windows[windowId].map((time) => formatTime(observedAt(time), language)).join('–') + ' UTC';
}

type InvestigationCopy = {
  heading: string;
  open: string;
  close: string;
  review: string;
  timeline: string;
  noHistory: string;
  provenance: string;
  original: string;
  active: string;
  resolved: string;
  fixtureActor: string;
  actorTime: string;
  buttons: Record<InvestigationAction, string>;
  events: Record<InvestigationAction, string>;
  notices: Record<InvestigationNotice, string>;
};

export const investigationCopy = {
  en: {
    heading: 'Station investigation',
    open: 'Open investigation',
    close: 'Close investigation',
    review: 'Review fixture evidence',
    timeline: 'Simulated investigation timeline',
    noHistory: 'No simulated events in this context.',
    provenance: 'Synthetic scenario · Simulated actions and readback',
    original: 'Original fixture evidence',
    active: 'Condition active',
    resolved: 'Condition resolved by fixture',
    fixtureActor: 'Fixture scenario',
    actorTime: 'Simulated actor and time',
    buttons: { acknowledge: 'Simulate acknowledgement', followUp: 'Add simulated follow-up', resolve: 'Advance fixture to resolution' },
    events: { acknowledge: 'Alarm acknowledged', followUp: 'Follow-up recorded', resolve: 'Condition resolved by fixture' },
    notices: {
      reviewed: 'Evidence reviewed for the next simulated action.',
      reviewRequired: 'Review the fixture evidence before recording an action.',
      stale: 'The reviewed context has changed. Review the current evidence again.',
      degraded: 'Current evidence is incomplete or degraded. No simulated action was recorded.',
      denied: 'This demo role cannot act on the investigation.',
      unavailable: 'This action is unavailable in the current fixture state.',
      recorded: 'Simulated event recorded.',
    },
  },
  fr: {
    heading: 'Investigation de la station',
    open: 'Ouvrir l’investigation',
    close: 'Fermer l’investigation',
    review: 'Examiner les données de démonstration',
    timeline: 'Historique de l’investigation simulée',
    noHistory: 'Aucun événement simulé dans ce contexte.',
    provenance: 'Scénario synthétique · Actions et historique simulés',
    original: 'Données de démonstration d’origine',
    active: 'Anomalie active',
    resolved: 'Anomalie résolue par le scénario',
    fixtureActor: 'Scénario de démonstration',
    actorTime: 'Acteur et heure simulés',
    buttons: { acknowledge: 'Simuler l’acquittement', followUp: 'Ajouter un suivi simulé', resolve: 'Faire évoluer le scénario vers la résolution' },
    events: { acknowledge: 'Alarme acquittée', followUp: 'Suivi enregistré', resolve: 'Anomalie résolue par le scénario' },
    notices: {
      reviewed: 'Données examinées pour la prochaine action simulée.',
      reviewRequired: 'Examinez les données de démonstration avant d’enregistrer une action.',
      stale: 'Le contexte examiné a changé. Examinez les données actuelles.',
      degraded: 'Les données actuelles sont incomplètes ou dégradées. Aucune action simulée n’a été enregistrée.',
      denied: 'Ce rôle de démonstration ne peut pas agir sur l’investigation.',
      unavailable: 'Cette action est indisponible dans l’état actuel du scénario.',
      recorded: 'Événement simulé enregistré.',
    },
  },
  ar: {
    heading: 'التحقيق في حالة المحطة',
    open: 'فتح التحقيق',
    close: 'إغلاق التحقيق',
    review: 'مراجعة بيانات العرض',
    timeline: 'السجل الزمني للتحقيق المحاكى',
    noHistory: 'لا توجد أحداث محاكاة في هذا السياق.',
    provenance: 'سيناريو اصطناعي · إجراءات وسجل محاكيان',
    original: 'بيانات العرض الأصلية',
    active: 'الحالة غير الطبيعية مستمرة',
    resolved: 'عولجت الحالة ضمن السيناريو',
    fixtureActor: 'سيناريو العرض',
    actorTime: 'المنفذ والوقت في المحاكاة',
    buttons: { acknowledge: 'محاكاة الإقرار بالإنذار', followUp: 'إضافة متابعة محاكاة', resolve: 'نقل السيناريو إلى مرحلة المعالجة' },
    events: { acknowledge: 'تم الإقرار بالإنذار', followUp: 'تم تسجيل المتابعة', resolve: 'عولجت الحالة ضمن السيناريو' },
    notices: {
      reviewed: 'تمت مراجعة البيانات للإجراء المحاكى التالي.',
      reviewRequired: 'راجع بيانات العرض قبل تسجيل إجراء.',
      stale: 'تغيّر السياق الذي تمت مراجعته. راجع البيانات الحالية.',
      degraded: 'البيانات الحالية ناقصة أو متدهورة الجودة. لم يُسجّل أي إجراء محاكى.',
      denied: 'هذا الدور التجريبي لا يملك صلاحية اتخاذ إجراء في التحقيق.',
      unavailable: 'هذا الإجراء غير متاح في الحالة الحالية للسيناريو.',
      recorded: 'تم تسجيل الحدث المحاكى.',
    },
  },
} satisfies Record<PreviewLanguage, InvestigationCopy>;
