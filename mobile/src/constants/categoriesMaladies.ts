/**
 * Catégories de maladies avec structure hiérarchique (2 niveaux)
 * Ces données sont embarquées côté front (pas d'appel réseau requis initialement)
 */

export interface CategorieSubMaladie {
  code: string;
  nom: string;
  description: string;
}

export interface CategorieMaladie {
  code: string;
  nom: string;
  description: string;
  sousCategories: CategorieSubMaladie[];
}

export const CATEGORIES_MALADIES: CategorieMaladie[] = [
  {
    code: 'INFECTIEUSES',
    nom: 'Maladies Infectieuses',
    description: 'Infections bactériennes, virales et parasitaires',
    sousCategories: [
      {
        code: 'RESPIRATOIRES',
        nom: 'Infections Respiratoires',
        description: 'Pneumonie, bronchite, grippe',
      },
      {
        code: 'DIGESTIVES',
        nom: 'Infections Digestives',
        description: 'Diarrhée, gastro-entérite, dysenterie',
      },
      {
        code: 'CUTANEES',
        nom: 'Infections Cutanées',
        description: 'Dermite, gale, mycoses',
      },
      {
        code: 'URINAIRES',
        nom: 'Infections Urinaires',
        description: 'Cystite, pyélonéphrite',
      },
    ],
  },
  {
    code: 'PARASITAIRES',
    nom: 'Maladies Parasitaires',
    description: 'Infections parasitaires diverses',
    sousCategories: [
      {
        code: 'PALUDISME',
        nom: 'Paludisme',
        description: 'Infection par plasmodium',
      },
      {
        code: 'HELMINTHIASES',
        nom: 'Helminthiases',
        description: 'Vers intestinaux',
      },
      {
        code: 'AUTRES_PARASITES',
        nom: 'Autres Parasitoses',
        description: 'Amibiase, giardiase',
      },
    ],
  },
  {
    code: 'CHRONIQUES',
    nom: 'Maladies Chroniques',
    description: 'Pathologies de longue durée',
    sousCategories: [
      {
        code: 'DIABETE',
        nom: 'Diabète',
        description: 'Type 1 et Type 2',
      },
      {
        code: 'HYPERTENSION',
        nom: 'Hypertension Artérielle',
        description: 'HTA',
      },
      {
        code: 'ASTHME',
        nom: 'Asthme',
        description: 'Maladie respiratoire chronique',
      },
      {
        code: 'EPILEPSIE',
        nom: 'Épilepsie',
        description: 'Troubles neurologiques',
      },
    ],
  },
  {
    code: 'NUTRITIONNELLES',
    nom: 'Troubles Nutritionnels',
    description: 'Malnutrition et carences',
    sousCategories: [
      {
        code: 'MALNUTRITION_AIGUE',
        nom: 'Malnutrition Aiguë',
        description: 'MAM, MAS',
      },
      {
        code: 'MALNUTRITION_CHRONIQUE',
        nom: 'Malnutrition Chronique',
        description: 'Retard de croissance',
      },
      {
        code: 'ANEMIE',
        nom: 'Anémie',
        description: 'Carence en fer',
      },
      {
        code: 'KWASHIORKOR',
        nom: 'Kwashiorkor',
        description: 'Malnutrition protéino-énergétique',
      },
    ],
  },
  {
    code: 'MATERNITE',
    nom: 'Santé Maternelle',
    description: 'Pathologies liées à la grossesse et accouchement',
    sousCategories: [
      {
        code: 'GROSSESSE_RISQUE',
        nom: 'Grossesse à Risque',
        description: 'Complications obstétricales',
      },
      {
        code: 'HEMORRAGIES',
        nom: 'Hémorragies',
        description: 'Post-partum, ante-partum',
      },
      {
        code: 'INFECTIONS_MATERNELLES',
        nom: 'Infections Maternelles',
        description: 'Infections pendant grossesse',
      },
      {
        code: 'HYPERTENSION_GRAVIDIQUE',
        nom: 'HTA Gravidique',
        description: 'Pré-éclampsie, éclampsie',
      },
    ],
  },
  {
    code: 'PEDIATRIQUES',
    nom: 'Maladies Pédiatriques',
    description: 'Pathologies infantiles',
    sousCategories: [
      {
        code: 'NEONATALES',
        nom: 'Pathologies Néonatales',
        description: 'Prématurité, ictère néonatal',
      },
      {
        code: 'INFECTIONS_PEDIATRIQUES',
        nom: 'Infections Infantiles',
        description: 'Rougeole, coqueluche, varicelle',
      },
      {
        code: 'MALFORMATIONS',
        nom: 'Malformations Congénitales',
        description: 'Anomalies à la naissance',
      },
    ],
  },
  {
    code: 'IST',
    nom: 'IST et VIH/SIDA',
    description: 'Infections sexuellement transmissibles',
    sousCategories: [
      {
        code: 'VIH_SIDA',
        nom: 'VIH/SIDA',
        description: 'Infection à VIH',
      },
      {
        code: 'SYPHILIS',
        nom: 'Syphilis',
        description: 'Infection bactérienne',
      },
      {
        code: 'GONORRHEE',
        nom: 'Gonorrhée',
        description: 'Infection bactérienne',
      },
      {
        code: 'AUTRES_IST',
        nom: 'Autres IST',
        description: 'Chlamydia, herpès, etc.',
      },
    ],
  },
  {
    code: 'TRAUMATISMES',
    nom: 'Traumatismes et Blessures',
    description: 'Accidents et blessures',
    sousCategories: [
      {
        code: 'FRACTURES',
        nom: 'Fractures',
        description: 'Fractures osseuses',
      },
      {
        code: 'PLAIES',
        nom: 'Plaies',
        description: 'Coupures, lacérations',
      },
      {
        code: 'BRULURES',
        nom: 'Brûlures',
        description: 'Brûlures thermiques, chimiques',
      },
      {
        code: 'TRAUMATISMES_CRANIENS',
        nom: 'Traumatismes Crâniens',
        description: 'TCC',
      },
    ],
  },
  {
    code: 'DERMATOLOGIQUES',
    nom: 'Maladies Dermatologiques',
    description: 'Affections de la peau',
    sousCategories: [
      {
        code: 'ECZEMA',
        nom: 'Eczéma',
        description: 'Dermatite atopique',
      },
      {
        code: 'MYCOSES',
        nom: 'Mycoses',
        description: 'Infections fongiques',
      },
      {
        code: 'GALE',
        nom: 'Gale',
        description: 'Infection parasitaire cutanée',
      },
      {
        code: 'AUTRES_DERMATO',
        nom: 'Autres Affections',
        description: 'Psoriasis, urticaire',
      },
    ],
  },
  {
    code: 'AUTRES',
    nom: 'Autres Pathologies',
    description: 'Maladies non classées ailleurs',
    sousCategories: [
      {
        code: 'OPHTALMOLOGIQUES',
        nom: 'Affections Ophtalmologiques',
        description: 'Conjonctivite, cataracte',
      },
      {
        code: 'ORL',
        nom: 'Affections ORL',
        description: 'Otite, sinusite, angine',
      },
      {
        code: 'DENTAIRES',
        nom: 'Affections Dentaires',
        description: 'Caries, abcès dentaires',
      },
      {
        code: 'NON_SPECIFIQUES',
        nom: 'Symptômes Non Spécifiques',
        description: 'Fièvre, douleurs',
      },
    ],
  },
];

/**
 * Récupérer une catégorie principale par son code
 */
export function getCategorieByCode(
  code: string,
): CategorieMaladie | undefined {
  return CATEGORIES_MALADIES.find(cat => cat.code === code);
}

/**
 * Récupérer une sous-catégorie par le code de la catégorie principale et le code de la sous-catégorie
 */
export function getSubCategorieByCode(
  categorieCode: string,
  subCategorieCode: string,
): CategorieSubMaladie | undefined {
  const categorie = getCategorieByCode(categorieCode);
  if (!categorie) return undefined;
  return categorie.sousCategories.find(sub => sub.code === subCategorieCode);
}
