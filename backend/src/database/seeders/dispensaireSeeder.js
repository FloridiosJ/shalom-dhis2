import Dispensaire from '../../models/dispensaire.js';

export async function seedDispensaire() {
  try {
    console.log('🌱 Seeding Dispensaires...');

    const dispensaires = [
      {
        name: "Mananara",
        fileovana: "Antsiranana",
        synoda: "SPA",
        isActive: true
      },
      {
        name: "Ampanasina",
        fileovana: "Ambilobe",
        synoda: "SPA",
        isActive: true
      },
      {
        name: "Andamoty",
        fileovana: "Marovantaza",
        synoda: "SPSofia",
        isActive: true
      },
      {
        name: "Boeny Aranta",
        fileovana: "Namakia",
        synoda: "SPBM",
        isActive: true
      },
      {
        name: "Ampitsopitsoka",
        fileovana: "Namakia",
        synoda: "SPBM",
        isActive: true
      },
      {
        name: "Ankelilaly",
        fileovana: "Besalampy",
        synoda: "SPMel",
        isActive: true
      },
      {
        name: "Onara",
        fileovana: "Ankoro Vahiny",
        synoda: "SPMel",
        isActive: true
      }
    ];

    for (const dispensaireData of dispensaires) {
      const [dispensaire, created] = await Dispensaire.findOrCreate({
        where: { 
          name: dispensaireData.name,
          fileovana: dispensaireData.fileovana
        },
        defaults: dispensaireData
      });

      if (created) {
        console.log(`  ✅ Dispensaire créé: ${dispensaire.name} (${dispensaire.fileovana} - ${dispensaire.synoda})`);
      } else {
        // Mettre à jour si existe déjà
        await dispensaire.update(dispensaireData);
        console.log(`  ♻️  Dispensaire mis à jour: ${dispensaire.name}`);
      }
    }

    console.log('✅ Dispensaires seeded successfully');
    console.log(`📊 Total: ${dispensaires.length} dispensaires`);
  } catch (error) {
    console.error('❌ Error seeding Dispensaires:', error);
    throw error;
  }
}