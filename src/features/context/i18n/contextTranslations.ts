export const contextTranslations = {
  fr: {
    search: 'Rechercher',
    workbenchCapabilityUnavailable: 'La capacité workbench requise n’est pas publiée par HidraAPI.',
    loadingResourceContract: 'Chargement du contrat de ressource',
    loadingRecords: 'Chargement des enregistrements',
    emptyRecords: 'Aucun enregistrement.',
    resourceUnavailable: 'La ressource backend {{module}}/{{resource}} n’est pas publiée par le workbench.',
    commandUnavailable: 'Cette commande n’est pas publiée dans les métadonnées de capacité HidraAPI.',
    identity: {
      title: 'Identité & accès',
      subtitle: 'Comptes d’identité, rôles, permissions et décisions d’autorisation exposés par HidraAPI.',
      contractNotice: 'Le backend expose la création d’utilisateur et l’évaluation de permission. Les listes utilisateurs/rôles/permissions sont lues via le workbench générique. Aucun endpoint de mutation de rôle ou de permission n’est inventé.',
      workspaceTabs: 'Espaces identité', users: 'Utilisateurs', roles: 'Rôles', permissions: 'Permissions',
      usersDescription: 'Lecture via identity/users du workbench; création via POST /api/v1/identity/users.',
      readOnlyDescription: 'Lecture via le workbench HidraAPI; aucune commande dédiée de modification n’est actuellement exposée.',
      createUser: 'Créer un utilisateur',
      credentialsNotice: 'Le contrat de création ne contient aucun mot de passe. Les identifiants de connexion restent une responsabilité du module identity et du fournisseur d’authentification.',
      userCreated: 'Utilisateur créé : {{id}}',
      evaluatePermission: 'Évaluer une permission',
      evaluationNotice: 'Cette décision provient de POST /api/v1/identity/permissions/evaluations; elle ne remplace pas l’autorisation finale appliquée par le backend.',
      permissionDecision: 'Décision : {{decision}} · {{reason}}',
    },
    organization: {
      title: 'Organisation',
      subtitle: 'Unités organisationnelles, employés et affectations opérationnelles appartenant au module organization.',
      contractNotice: 'Le backend expose les commandes de création d’unité, d’enregistrement d’employé et d’affectation. Les vues de lecture utilisent les ressources organization du workbench.',
      workspaceTabs: 'Espaces organisation', units: 'Unités', employees: 'Employés', assignments: 'Affectations',
      unitsDescription: 'Hiérarchie et contexte des unités organisationnelles.', employeesDescription: 'Référentiel des employés, avec référence optionnelle vers une identité.', assignmentsDescription: 'Affectations des employés aux unités, positions et portées opérationnelles.',
      createUnit: 'Créer une unité', hierarchyNotice: 'La hiérarchie des employés et unités reste propriété du module organization.', unitCreated: 'Unité créée : {{id}}',
      registerEmployee: 'Enregistrer un employé', employeeRegistered: 'Employé enregistré : {{id}}', assignEmployee: 'Affecter un employé', employeeAssigned: 'Affectation créée : {{id}}',
    },
    fields: {
      username: 'Nom d’utilisateur', emailAddress: 'Adresse e-mail', displayName: 'Nom affiché', userType: 'Type d’utilisateur', employeeReferenceId: 'Référence employé',
      userId: 'ID utilisateur', permissionCode: 'Code permission', resourceType: 'Type ressource', resourceReferenceId: 'Référence ressource', scopeType: 'Type de portée', scopeReferenceId: 'Référence portée', scopeCodeSnapshot: 'Code portée (snapshot)',
      code: 'Code', nameAr: 'Nom arabe', nameFr: 'Nom français', nameEn: 'Nom anglais', unitTypeId: 'ID type unité', parentUnitId: 'ID unité parente', status: 'Statut', validFrom: 'Valide à partir de', validTo: 'Valide jusqu’à',
      employeeNumber: 'Matricule', firstNameAr: 'Prénom arabe', lastNameAr: 'Nom arabe', firstNameLt: 'Prénom latin', lastNameLt: 'Nom latin', displayNameAr: 'Nom affiché arabe', displayNameLt: 'Nom affiché latin', mobileNumber: 'Mobile', employeeType: 'Type employé', identityUserReference: 'Référence utilisateur identity',
      employeeId: 'ID employé', organizationUnitId: 'ID unité', positionId: 'ID position', assignmentType: 'Type affectation', operationalScopeType: 'Type portée opérationnelle', operationalScopeId: 'ID portée opérationnelle', operationalScopeCode: 'Code portée opérationnelle', operationalScopeName: 'Nom portée opérationnelle',
    },
  },
  en: {
    search: 'Search', workbenchCapabilityUnavailable: 'The required workbench capability is not published by HidraAPI.', loadingResourceContract: 'Loading resource contract', loadingRecords: 'Loading records', emptyRecords: 'No records.', resourceUnavailable: 'Backend resource {{module}}/{{resource}} is not published by the workbench.', commandUnavailable: 'This command is not published in HidraAPI capability metadata.',
    identity: {
      title: 'Identity & Access', subtitle: 'Identity accounts, roles, permissions, and authorization decisions exposed by HidraAPI.', contractNotice: 'The backend exposes user creation and permission evaluation. User/role/permission lists are read through the generic workbench. No role or permission mutation endpoint is invented.', workspaceTabs: 'Identity workspaces', users: 'Users', roles: 'Roles', permissions: 'Permissions', usersDescription: 'Read through workbench identity/users; create through POST /api/v1/identity/users.', readOnlyDescription: 'Read through the HidraAPI workbench; no dedicated mutation command is currently exposed.', createUser: 'Create user', credentialsNotice: 'The create-user contract contains no password. Login credentials remain owned by identity and the authentication provider.', userCreated: 'User created: {{id}}', evaluatePermission: 'Evaluate permission', evaluationNotice: 'This decision comes from POST /api/v1/identity/permissions/evaluations; it does not replace backend authorization enforcement.', permissionDecision: 'Decision: {{decision}} · {{reason}}',
    },
    organization: {
      title: 'Organization', subtitle: 'Organization units, employees, and operational assignments owned by the organization module.', contractNotice: 'The backend exposes create-unit, register-employee, and assign-employee commands. Read views use organization workbench resources.', workspaceTabs: 'Organization workspaces', units: 'Units', employees: 'Employees', assignments: 'Assignments', unitsDescription: 'Organization unit hierarchy and context.', employeesDescription: 'Employee directory with an optional identity reference.', assignmentsDescription: 'Employee assignments to units, positions, and operational scopes.', createUnit: 'Create unit', hierarchyNotice: 'Employee and organization hierarchy remains owned by the organization module.', unitCreated: 'Unit created: {{id}}', registerEmployee: 'Register employee', employeeRegistered: 'Employee registered: {{id}}', assignEmployee: 'Assign employee', employeeAssigned: 'Assignment created: {{id}}',
    },
    fields: {
      username: 'Username', emailAddress: 'Email address', displayName: 'Display name', userType: 'User type', employeeReferenceId: 'Employee reference', userId: 'User ID', permissionCode: 'Permission code', resourceType: 'Resource type', resourceReferenceId: 'Resource reference', scopeType: 'Scope type', scopeReferenceId: 'Scope reference', scopeCodeSnapshot: 'Scope code snapshot', code: 'Code', nameAr: 'Arabic name', nameFr: 'French name', nameEn: 'English name', unitTypeId: 'Unit type ID', parentUnitId: 'Parent unit ID', status: 'Status', validFrom: 'Valid from', validTo: 'Valid to', employeeNumber: 'Employee number', firstNameAr: 'Arabic first name', lastNameAr: 'Arabic last name', firstNameLt: 'Latin first name', lastNameLt: 'Latin last name', displayNameAr: 'Arabic display name', displayNameLt: 'Latin display name', mobileNumber: 'Mobile number', employeeType: 'Employee type', identityUserReference: 'Identity user reference', employeeId: 'Employee ID', organizationUnitId: 'Organization unit ID', positionId: 'Position ID', assignmentType: 'Assignment type', operationalScopeType: 'Operational scope type', operationalScopeId: 'Operational scope ID', operationalScopeCode: 'Operational scope code', operationalScopeName: 'Operational scope name',
    },
  },
  ar: {
    search: 'بحث', workbenchCapabilityUnavailable: 'قدرة workbench المطلوبة غير منشورة من HidraAPI.', loadingResourceContract: 'تحميل عقد المورد', loadingRecords: 'تحميل السجلات', emptyRecords: 'لا توجد سجلات.', resourceUnavailable: 'المورد {{module}}/{{resource}} غير منشور في workbench.', commandUnavailable: 'هذا الأمر غير منشور ضمن بيانات قدرات HidraAPI.',
    identity: {
      title: 'الهوية والوصول', subtitle: 'حسابات الهوية والأدوار والصلاحيات وقرارات التفويض التي يعرضها HidraAPI.', contractNotice: 'يعرض backend إنشاء المستخدم وتقييم الصلاحية. تتم قراءة المستخدمين والأدوار والصلاحيات عبر workbench العام، ولا يتم اختراع أوامر تعديل غير موجودة.', workspaceTabs: 'مساحات الهوية', users: 'المستخدمون', roles: 'الأدوار', permissions: 'الصلاحيات', usersDescription: 'قراءة عبر identity/users وإنشاء عبر endpoint الموثق.', readOnlyDescription: 'قراءة عبر workbench فقط؛ لا يوجد أمر تعديل مخصص موثق حاليًا.', createUser: 'إنشاء مستخدم', credentialsNotice: 'عقد إنشاء المستخدم لا يحتوي كلمة مرور. تبقى بيانات الدخول ضمن مسؤولية identity ومزود المصادقة.', userCreated: 'تم إنشاء المستخدم: {{id}}', evaluatePermission: 'تقييم صلاحية', evaluationNotice: 'القرار صادر عن endpoint التقييم ولا يستبدل فرض الصلاحيات في backend.', permissionDecision: 'القرار: {{decision}} · {{reason}}',
    },
    organization: {
      title: 'التنظيم', subtitle: 'الوحدات التنظيمية والموظفون والتعيينات التشغيلية المملوكة لوحدة organization.', contractNotice: 'يعرض backend أوامر إنشاء الوحدة وتسجيل الموظف وتعيينه، بينما تستخدم القراءة موارد workbench الخاصة بـ organization.', workspaceTabs: 'مساحات التنظيم', units: 'الوحدات', employees: 'الموظفون', assignments: 'التعيينات', unitsDescription: 'هيكل وسياق الوحدات التنظيمية.', employeesDescription: 'دليل الموظفين مع مرجع هوية اختياري.', assignmentsDescription: 'تعيينات الموظفين للوحدات والمناصب والنطاقات التشغيلية.', createUnit: 'إنشاء وحدة', hierarchyNotice: 'تبقى هرمية الموظفين والوحدات مملوكة لوحدة organization.', unitCreated: 'تم إنشاء الوحدة: {{id}}', registerEmployee: 'تسجيل موظف', employeeRegistered: 'تم تسجيل الموظف: {{id}}', assignEmployee: 'تعيين موظف', employeeAssigned: 'تم إنشاء التعيين: {{id}}',
    },
    fields: {
      username: 'اسم المستخدم', emailAddress: 'البريد الإلكتروني', displayName: 'الاسم المعروض', userType: 'نوع المستخدم', employeeReferenceId: 'مرجع الموظف', userId: 'معرف المستخدم', permissionCode: 'رمز الصلاحية', resourceType: 'نوع المورد', resourceReferenceId: 'مرجع المورد', scopeType: 'نوع النطاق', scopeReferenceId: 'مرجع النطاق', scopeCodeSnapshot: 'رمز النطاق', code: 'الرمز', nameAr: 'الاسم العربي', nameFr: 'الاسم الفرنسي', nameEn: 'الاسم الإنجليزي', unitTypeId: 'معرف نوع الوحدة', parentUnitId: 'معرف الوحدة الأم', status: 'الحالة', validFrom: 'صالح من', validTo: 'صالح إلى', employeeNumber: 'رقم الموظف', firstNameAr: 'الاسم العربي', lastNameAr: 'اللقب العربي', firstNameLt: 'الاسم اللاتيني', lastNameLt: 'اللقب اللاتيني', displayNameAr: 'الاسم المعروض بالعربية', displayNameLt: 'الاسم المعروض باللاتينية', mobileNumber: 'الهاتف', employeeType: 'نوع الموظف', identityUserReference: 'مرجع مستخدم الهوية', employeeId: 'معرف الموظف', organizationUnitId: 'معرف الوحدة', positionId: 'معرف المنصب', assignmentType: 'نوع التعيين', operationalScopeType: 'نوع النطاق التشغيلي', operationalScopeId: 'معرف النطاق التشغيلي', operationalScopeCode: 'رمز النطاق التشغيلي', operationalScopeName: 'اسم النطاق التشغيلي',
    },
  },
} as const;
