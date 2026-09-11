export const telemetryMonitoringTranslations = {
  fr: {
    title: 'Opérations · télémétrie & surveillance',
    subtitle: 'Lectures, tendances, règles et écarts issus des contrats HidraAPI.',
    pointId: 'Identifiant du point de télémétrie', applyPoint: 'Charger le point', noPoint: 'Saisissez un pointId connu pour charger la télémétrie.',
    latest: 'Dernière lecture', history: 'Historique', trend: 'Tendance', state: 'État', quality: 'Qualité', timestamp: 'Horodatage', value: 'Valeur', unit: 'Unité',
    from: 'Depuis', to: 'Jusqu’à', refresh: 'Actualiser', telemetryUnavailable: 'Accès télémétrie indisponible pour cet utilisateur.', referenceUnavailable: 'Les catalogues de référence ne sont pas disponibles.',
    noReading: 'Aucune lecture retournée pour ce point.', noTrend: 'Aucune tendance numérique disponible dans cette fenêtre.', realtimeNotice: 'Mode requête/polling actif. Les événements temps réel métier ne sont pas encore vérifiés.',
    monitoring: 'Surveillance', rules: 'Règles de surveillance', deviations: 'Écarts', status: 'Statut', severity: 'Sévérité', asset: 'Actif topologique', ruleType: 'Type de règle', detectedAt: 'Détecté le', reason: 'Motif',
    monitoringUnavailable: 'Aucun droit de lecture des règles ou écarts de surveillance.', emptyRules: 'Aucune règle retournée.', emptyDeviations: 'Aucun écart retourné.', inspect: 'Examiner', backendOwned: 'Valeurs et relations affichées telles que retournées par HidraAPI; aucune sémantique métier n’est inférée côté frontend.',
    error403: 'HidraAPI a refusé cette requête (403).', genericError: 'Impossible de charger les données depuis HidraAPI.', loaded: '{{loaded}} chargés sur {{total}}',
  },
  en: {
    title: 'Operations · telemetry & monitoring', subtitle: 'Readings, trends, rules and deviations from HidraAPI contracts.',
    pointId: 'Telemetry point ID', applyPoint: 'Load point', noPoint: 'Enter a known pointId to load telemetry.', latest: 'Latest reading', history: 'History', trend: 'Trend', state: 'State', quality: 'Quality', timestamp: 'Timestamp', value: 'Value', unit: 'Unit',
    from: 'From', to: 'To', refresh: 'Refresh', telemetryUnavailable: 'Telemetry access is unavailable for this user.', referenceUnavailable: 'Reference catalogs are unavailable.', noReading: 'No reading was returned for this point.', noTrend: 'No numeric trend is available in this window.', realtimeNotice: 'Query/polling mode is active. Business realtime events are not yet verified.',
    monitoring: 'Monitoring', rules: 'Monitoring rules', deviations: 'Deviations', status: 'Status', severity: 'Severity', asset: 'Topology asset', ruleType: 'Rule type', detectedAt: 'Detected at', reason: 'Reason', monitoringUnavailable: 'No monitoring rule/deviation read grant is available.', emptyRules: 'No rules returned.', emptyDeviations: 'No deviations returned.', inspect: 'Inspect', backendOwned: 'Values and relationships are displayed exactly as returned by HidraAPI; the frontend does not infer business semantics.', error403: 'HidraAPI refused this request (403).', genericError: 'Unable to load data from HidraAPI.', loaded: '{{loaded}} loaded of {{total}}',
  },
  ar: {
    title: 'العمليات · القياس والمراقبة', subtitle: 'القراءات والاتجاهات والقواعد والانحرافات من عقود HidraAPI.',
    pointId: 'معرّف نقطة القياس', applyPoint: 'تحميل النقطة', noPoint: 'أدخل pointId معروفاً لتحميل القياسات.', latest: 'آخر قراءة', history: 'السجل', trend: 'الاتجاه', state: 'الحالة', quality: 'الجودة', timestamp: 'الوقت', value: 'القيمة', unit: 'الوحدة',
    from: 'من', to: 'إلى', refresh: 'تحديث', telemetryUnavailable: 'صلاحية قراءة القياسات غير متاحة لهذا المستخدم.', referenceUnavailable: 'كتالوجات المراجع غير متاحة.', noReading: 'لا توجد قراءة لهذه النقطة.', noTrend: 'لا يوجد اتجاه رقمي في هذه الفترة.', realtimeNotice: 'وضع الاستعلام/التحديث الدوري فعال. أحداث الزمن الحقيقي للأعمال غير موثقة بعد.',
    monitoring: 'المراقبة', rules: 'قواعد المراقبة', deviations: 'الانحرافات', status: 'الحالة', severity: 'الخطورة', asset: 'أصل طوبولوجي', ruleType: 'نوع القاعدة', detectedAt: 'وقت الاكتشاف', reason: 'السبب', monitoringUnavailable: 'لا توجد صلاحية لقراءة قواعد أو انحرافات المراقبة.', emptyRules: 'لا توجد قواعد.', emptyDeviations: 'لا توجد انحرافات.', inspect: 'فحص', backendOwned: 'تعرض القيم والعلاقات كما يعيدها HidraAPI دون استنتاج دلالات أعمال في الواجهة.', error403: 'رفض HidraAPI الطلب (403).', genericError: 'تعذر تحميل البيانات من HidraAPI.', loaded: '{{loaded}} محملة من {{total}}',
  },
} as const;
