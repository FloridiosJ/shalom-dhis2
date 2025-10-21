import CategorieMaladie from '../../models/categorieMaladie.js';

const categoriesMaladies = [
  // NIVEAU 1 : Catégories principales
  {
    nom: 'Maladies infectieuses et parasitaires',
    code: 'CAT_INFECTIEUSES',
    niveau: 1,
    ordre: 1,
    description: 'Maladies causées par des agents infectieux (virus, bactéries, parasites, champignons)',
    sousCategories: [
      { nom: 'Paludisme', code: 'MAL_PALUDISME', ordre: 1 },
      { nom: 'Tuberculose', code: 'MAL_TUBERCULOSE', ordre: 2 },
      { nom: 'VIH/SIDA', code: 'MAL_VIH_SIDA', ordre: 3 },
      { nom: 'Infections respiratoires aiguës', code: 'MAL_IRA', ordre: 4 },
      { nom: 'Infections gastro-intestinales', code: 'MAL_IGI', ordre: 5 },
      { nom: 'Infections sexuellement transmissibles', code: 'MAL_IST', ordre: 6 },
      { nom: 'Rougeole', code: 'MAL_ROUGEOLE', ordre: 7 },
      { nom: 'Typhoïde', code: 'MAL_TYPHOIDE', ordre: 8 }
    ]
  },
  {
    nom: 'Maladies de l\'appareil respiratoire',
    code: 'CAT_RESPIRATOIRE',
    niveau: 1,
    ordre: 2,
    description: 'Affections touchant les voies respiratoires et les poumons',
    sousCategories: [
      { nom: 'Asthme', code: 'MAL_ASTHME', ordre: 1 },
      { nom: 'Bronchite', code: 'MAL_BRONCHITE', ordre: 2 },
      { nom: 'Pneumonie', code: 'MAL_PNEUMONIE', ordre: 3 },
      { nom: 'Rhinite allergique', code: 'MAL_RHINITE', ordre: 4 }
    ]
  },
  {
    nom: 'Maladies de l\'appareil digestif',
    code: 'CAT_DIGESTIF',
    niveau: 1,
    ordre: 3,
    description: 'Affections de l\'estomac, des intestins et organes associés',
    sousCategories: [
      { nom: 'Gastrite', code: 'MAL_GASTRITE', ordre: 1 },
      { nom: 'Ulcère gastro-duodénal', code: 'MAL_ULCERE', ordre: 2 },
      { nom: 'Diarrhée', code: 'MAL_DIARRHEE', ordre: 3 },
      { nom: 'Constipation', code: 'MAL_CONSTIPATION', ordre: 4 },
      { nom: 'Parasitoses intestinales', code: 'MAL_PARASITOSES', ordre: 5 }
    ]
  },
  {
    nom: 'Maladies cardiovasculaires',
    code: 'CAT_CARDIO',
    niveau: 1,
    ordre: 4,
    description: 'Maladies du cœur et des vaisseaux sanguins',
    sousCategories: [
      { nom: 'Hypertension artérielle', code: 'MAL_HTA', ordre: 1 },
      { nom: 'Insuffisance cardiaque', code: 'MAL_INSUF_CARD', ordre: 2 },
      { nom: 'Anémie', code: 'MAL_ANEMIE', ordre: 3 }
    ]
  },
  {
    nom: 'Maladies métaboliques et endocriniennes',
    code: 'CAT_METABOLIQUE',
    niveau: 1,
    ordre: 5,
    description: 'Troubles du métabolisme et des glandes endocrines',
    sousCategories: [
      { nom: 'Diabète', code: 'MAL_DIABETE', ordre: 1 },
      { nom: 'Malnutrition', code: 'MAL_MALNUTRITION', ordre: 2 },
      { nom: 'Obésité', code: 'MAL_OBESITE', ordre: 3 },
      { nom: 'Troubles thyroïdiens', code: 'MAL_THYROIDE', ordre: 4 }
    ]
  },
  {
    nom: 'Maladies de la peau',
    code: 'CAT_DERMATOLOGIE',
    niveau: 1,
    ordre: 6,
    description: 'Affections cutanées',
    sousCategories: [
      { nom: 'Dermatite', code: 'MAL_DERMATITE', ordre: 1 },
      { nom: 'Mycoses', code: 'MAL_MYCOSES', ordre: 2 },
      { nom: 'Gale', code: 'MAL_GALE', ordre: 3 },
      { nom: 'Urticaire', code: 'MAL_URTICAIRE', ordre: 4 }
    ]
  },
  {
    nom: 'Grossesse et accouchement',
    code: 'CAT_OBSTETRIQUE',
    niveau: 1,
    ordre: 7,
    description: 'Complications liées à la grossesse et à l\'accouchement',
    sousCategories: [
      { nom: 'Anémie de grossesse', code: 'MAL_ANEMIE_GROSSESSE', ordre: 1 },
      { nom: 'Pré-éclampsie', code: 'MAL_PREECLAMPSIE', ordre: 2 },
      { nom: 'Hémorragie post-partum', code: 'MAL_HEMORRAGIE_PP', ordre: 3 },
      { nom: 'Infection puerpérale', code: 'MAL_INFECTION_PUERP', ordre: 4 }
    ]
  },
  {
    nom: 'Traumatismes et blessures',
    code: 'CAT_TRAUMATISME',
    niveau: 1,
    ordre: 8,
    description: 'Blessures physiques et traumatismes',
    sousCategories: [
      { nom: 'Fractures', code: 'MAL_FRACTURES', ordre: 1 },
      { nom: 'Plaies', code: 'MAL_PLAIES', ordre: 2 },
      { nom: 'Brûlures', code: 'MAL_BRULURES', ordre: 3 },
      { nom: 'Entorses', code: 'MAL_ENTORSES', ordre: 4 }
    ]
  },
  {
    nom: 'Autres maladies',
    code: 'CAT_AUTRES',
    niveau: 1,
    ordre: 9,
    description: 'Maladies diverses non classées ailleurs',
    sousCategories: [
      { nom: 'Céphalées', code: 'MAL_CEPHALEES', ordre: 1 },
      { nom: 'Douleurs abdominales', code: 'MAL_DOULEURS_ABD', ordre: 2 },
      { nom: 'Fièvre d\'origine indéterminée', code: 'MAL_FIEVRE_INDET', ordre: 3 }
    ]
  }
];

export async function seedCategorieMaladie() {
  try {
    console.log('🌱 Seeding CategorieMaladie...');
    
    for (const categorie of categoriesMaladies) {
      // Créer ou trouver la catégorie principale
      const [categorieParent, created] = await CategorieMaladie.findOrCreate({
        where: { code: categorie.code },
        defaults: {
          nom: categorie.nom,
          code: categorie.code,
          niveau: categorie.niveau,
          ordre: categorie.ordre,
          description: categorie.description,
          parentId: null
        }
      });
      
      if (created) {
        console.log(`  ✅ Catégorie créée: ${categorie.nom}`);
      }
      
      // Créer les sous-catégories
      if (categorie.sousCategories) {
        for (const sousCategorie of categorie.sousCategories) {
          const [sc, scCreated] = await CategorieMaladie.findOrCreate({
            where: { code: sousCategorie.code },
            defaults: {
              nom: sousCategorie.nom,
              code: sousCategorie.code,
              niveau: 2,
              ordre: sousCategorie.ordre,
              parentId: categorieParent.id
            }
          });
          
          if (scCreated) {
            console.log(`    ➡️  Sous-catégorie créée: ${sousCategorie.nom}`);
          }
        }
      }
    }
    
    console.log('✅ CategorieMaladie seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding CategorieMaladie:', error);
    throw error;
  }
}