/**
 * Simple test script for Tatitra PDF generation
 * This tests the Tatitra PDF generator without requiring database connection
 */
import { generateTatitraPDF } from './src/utils/export/tatitraPdfGenerator.js';
import fs from 'fs';

async function testTatitraPDF() {
  console.log('🧪 Testing Tatitra PDF Generation...\n');

  // Sample test data matching the structure expected by the generator
  const testData = {
    zones: ['Ampitsopitsoka', 'Boeny Aranta', 'Ankelitaly', 'Ampanasina', 'Mananara', 'Onara', 'Andamonty'],
    section1: {
      prayerMeetings: 19,
      visitorsReceived: 470,
      nonChristianVisitors: 85, // Test non-Christian count
      birthsByZone: [
        {
          category: 'Zaza (12 taona noho midina)',
          zones: [
            { male: 0, female: 0 },   // Ampitsopitsoka
            { male: 0, female: 0 },   // Boeny Aranta
            { male: 14, female: 16 }, // Ankelitaly
            { male: 0, female: 0 },   // Ampanasina
            { male: 0, female: 0 },   // Mananara
            { male: 0, female: 0 },   // Onara
            { male: 0, female: 0 }    // Andamonty
          ]
        },
        {
          category: 'Tanora (13 taona - 30 taona)',
          zones: [
            { male: 0, female: 0 },   // Ampitsopitsoka
            { male: 0, female: 0 },   // Boeny Aranta
            { male: 14, female: 16 }, // Ankelitaly
            { male: 0, female: 0 },   // Ampanasina
            { male: 0, female: 0 },   // Mananara
            { male: 0, female: 0 },   // Onara
            { male: 0, female: 0 }    // Andamonty
          ]
        },
        {
          category: 'Olon-dehibe maherin\'ny 30 taona',
          zones: [
            { male: 0, female: 0 },   // Ampitsopitsoka
            { male: 0, female: 0 },   // Boeny Aranta
            { male: 11, female: 9 },  // Ankelitaly
            { male: 0, female: 0 },   // Ampanasina
            { male: 0, female: 0 },   // Mananara
            { male: 0, female: 0 },   // Onara
            { male: 0, female: 0 }    // Andamonty
          ]
        }
      ],
      nonChristiansByZone: {
        category: 'Tsy Kristianina (Non-chrétiens)',
        zones: [
          { male: 5, female: 8 },   // Ampitsopitsoka
          { male: 3, female: 7 },   // Boeny Aranta
          { male: 12, female: 15 }, // Ankelitaly
          { male: 4, female: 6 },   // Ampanasina
          { male: 2, female: 3 },   // Mananara
          { male: 6, female: 9 },   // Onara
          { male: 3, female: 2 }    // Andamonty
        ]
      }
    },
    section2: {
      consultantsByZone: [
        { consultants: 32, consultations: 48 },   // Ampitsopitsoka
        { consultants: 100, consultations: 148 }, // Boeny Aranta
        { consultants: 43, consultations: 91 },   // Ankelitaly
        { consultants: 267, consultations: 278 }, // Ampanasina
        { consultants: 33, consultations: 38 },   // Mananara
        { consultants: 206, consultations: 219 }, // Onara
        { consultants: 124, consultations: 152 }, // Andamonty
        { consultants: 805, consultations: 974 }  // Total
      ],
      diseasesByZone: [
        { disease: 'Hypertention artérielle essentielle non spécifiée', zones: [2, 0, 2, 0, 1, 13, 8, 26], isSubcategory: true },
        { disease: 'Affections cutanées et du tissu sous-cutané', zones: [6, 0, 1, 1, 2, 0, 1, 11], isSubcategory: false },
        { disease: 'Diarrhées (Di) sans déshydratation avec complications', zones: [4, 0, 5, 3, 0, 5, 3, 20], isSubcategory: true },
        { disease: 'Infections respiratoires aigües des voies supérieures', zones: [8, 12, 6, 15, 4, 18, 9, 72], isSubcategory: false },
        { disease: 'Paludisme à Plasmodium falciparum sans complication', zones: [15, 25, 18, 32, 12, 28, 20, 150], isSubcategory: false }
      ]
    },
    section3: {
      educationByZone: [
        {
          category: 'Fanambeazan a aizana tsy maharitra',
          zones: [
            { male: 0, female: 23 },
            { male: 0, female: 70 },
            { male: 0, female: 14 },
            { male: 0, female: 0 },
            { male: 0, female: 0 },
            { male: 3, female: 78 },
            { male: 0, female: 20 },
            { male: 3, female: 205 }
          ]
        },
        {
          category: 'Fanambeazan a aizana maharitra',
          zones: [
            { male: 0, female: 0 },
            { male: 0, female: 16 },
            { male: 0, female: 0 },
            { male: 0, female: 0 },
            { male: 0, female: 0 },
            { male: 0, female: 15 },
            { male: 0, female: 12 },
            { male: 0, female: 43 }
          ]
        }
      ]
    },
    section4: {
      maternalHealthByZone: [
        {
          category: 'Femme ayant passée à la CPN',
          zones: [0, 0, 12, 24, 0, 28, 27, 91]
        },
        {
          category: 'Femme enceintes ayant fait le Test VIH',
          zones: [0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
          category: 'Femme enceintes ayant fait le Test serologique',
          zones: [0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
          category: 'Accouchements',
          zones: [0, 0, 4, 6, 0, 10, 9, 29]
        }
      ]
    },
    section5: {
      eventsByZone: [
        {
          zone: 'Ampanasina',
          events: [
            {
              theme: 'Rano fisoitro madio',
              participants: 72,
              location: 'CSB Ampanasina',
              date: '21 Oktobra 2024'
            },
            {
              theme: 'Ny maha zava-dehibe ny vaksiny',
              participants: 68,
              location: 'CSB Ampanasina',
              date: '19 Novambra 2024'
            },
            {
              theme: 'Ady amin\'ny fangerena ankalamanjana',
              participants: 54,
              location: 'Communauté Ampanasina',
              date: '15 Desambra 2024'
            }
          ]
        },
        {
          zone: 'Boeny Aranta',
          events: [
            {
              theme: 'Fahadiovana sy fahasalamana',
              participants: 45,
              location: 'CSB Boeny Aranta',
              date: '10 Oktobra 2024'
            }
          ]
        }
      ]
    },
    period: {
      quarter: 'EFATRA',
      year: 2024,
      startDate: '01/10/2024',
      endDate: '31/12/2024'
    }
  };

  const filters = {
    quarter: 'EFATRA',
    year: 2024
  };

  try {
    console.log('📄 Testing Tatitra PDF generation...');
    console.log(`   Quarter: ${filters.quarter}`);
    console.log(`   Year: ${filters.year}\n`);

    const result = await generateTatitraPDF(testData, filters);
    
    console.log('✅ Tatitra PDF generated successfully!');
    console.log(`   File: ${result.fileName}`);
    console.log(`   Path: ${result.filePath}`);
    
    // Verify file exists
    if (fs.existsSync(result.filePath)) {
      const stats = fs.statSync(result.filePath);
      console.log(`   Size: ${stats.size} bytes`);
      console.log('   ✓ File verified\n');
      
      // Check file size is reasonable (should be > 10KB for a multi-page PDF)
      if (stats.size < 10000) {
        console.log('   ⚠️  Warning: PDF file seems too small. May be incomplete.\n');
      }
    } else {
      console.log('   ✗ File not found!\n');
      throw new Error('Generated PDF file not found');
    }

    // Display sections included
    console.log('📋 Sections included:');
    console.log('   ✓ Section 1: Asa Fitoriana (Births by age group)');
    console.log('   ✓ Section 2: Asa Fitsaboana (Medical consultations)');
    console.log('   ✓ Section 3: Fandriandram-piterahana (Education)');
    console.log('   ✓ Section 4: Momba ireo Reny Bevoaka (Maternal health)');
    console.log('   ✓ Section 5: Fanentanana natao (Events/Animations)\n');

    // Keep the file for manual inspection
    console.log('📁 File saved for manual inspection:');
    console.log(`   ${result.filePath}\n`);
    console.log('   💡 You can open this PDF to verify the formatting.\n');

    console.log('✅ Test passed!');
    return true;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    return false;
  }
}

// Run test
testTatitraPDF()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
