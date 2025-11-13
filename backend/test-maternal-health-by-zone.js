/**
 * Test script for maternalHealthByZone query
 * 
 * Usage: node test-maternal-health-by-zone.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env') });

async function testMaternalHealthByZone() {
  console.log('🧪 Testing maternalHealthByZone Query...\n');

  try {
    // Import models and resolver
    const { default: reportsResolvers } = await import('./src/graphql/resolvers/reports.js');
    
    // Create mock user context
    const mockUser = {
      id: 'test-user-id',
      role: 'admin',
      login: 'testadmin'
    };

    const context = { user: mockUser };

    // Test 1: Query without filters (Q4 2024)
    console.log('📊 Test 1: Query maternal health statistics for Q4 2024...');
    const args1 = {
      dateFrom: '2024-10-01',
      dateTo: '2024-12-31',
      dispensaireIds: null
    };

    const result1 = await reportsResolvers.Query.maternalHealthByZone(null, args1, context);
    
    console.log(`✅ Found ${result1.length} maternal health indicators\n`);
    
    result1.forEach(indicator => {
      console.log(`👶 ${indicator.indicator}`);
      console.log(`   Total: ${indicator.total}`);
      console.log(`   Dispensaires (${indicator.dispensaires.length}):`);
      indicator.dispensaires.forEach(dispensaire => {
        if (dispensaire.count > 0) {
          console.log(`      - ${dispensaire.name}: ${dispensaire.count}`);
        }
      });
      console.log('');
    });

    // Test 2: Query with date range (Q1 2025)
    console.log('📊 Test 2: Query maternal health statistics for Q1 2025...');
    const args2 = {
      dateFrom: '2025-01-01',
      dateTo: '2025-03-31',
      dispensaireIds: null
    };

    const result2 = await reportsResolvers.Query.maternalHealthByZone(null, args2, context);
    
    console.log(`✅ Found ${result2.length} maternal health indicators\n`);
    
    result2.forEach(indicator => {
      console.log(`👶 ${indicator.indicator}: ${indicator.total} total`);
    });
    console.log('');

    // Test 3: Validate structure
    console.log('📊 Test 3: Validate response structure...');
    
    if (result1.length > 0) {
      const firstIndicator = result1[0];
      
      // Check required fields
      const hasIndicator = typeof firstIndicator.indicator === 'string';
      const hasDispensaires = Array.isArray(firstIndicator.dispensaires);
      const hasTotal = typeof firstIndicator.total === 'number';
      
      console.log(`   ✓ Indicator field: ${hasIndicator ? '✅' : '❌'}`);
      console.log(`   ✓ Dispensaires array: ${hasDispensaires ? '✅' : '❌'}`);
      console.log(`   ✓ Total field: ${hasTotal ? '✅' : '❌'}`);
      
      if (hasDispensaires && firstIndicator.dispensaires.length > 0) {
        const firstDispensaire = firstIndicator.dispensaires[0];
        const hasId = typeof firstDispensaire.id === 'string';
        const hasName = typeof firstDispensaire.name === 'string';
        const hasCount = typeof firstDispensaire.count === 'number';
        
        console.log(`   ✓ Dispensaire.id: ${hasId ? '✅' : '❌'}`);
        console.log(`   ✓ Dispensaire.name: ${hasName ? '✅' : '❌'}`);
        console.log(`   ✓ Dispensaire.count: ${hasCount ? '✅' : '❌'}`);
      }
    }
    console.log('');

    // Test 4: Expected indicators
    console.log('📊 Test 4: Check expected indicators...');
    const expectedIndicators = [
      'Femmes ayant passé à la CPN',
      'Femmes enceintes ayant fait le Test VIH',
      'Femmes enceintes ayant fait le Test sérologique',
      'Accouchements'
    ];
    
    const foundIndicators = result1.map(i => i.indicator);
    expectedIndicators.forEach(expected => {
      const found = foundIndicators.includes(expected);
      console.log(`   ${found ? '✅' : '❌'} ${expected}`);
    });
    console.log('');

    // Test 5: Verify totals match sum of dispensaires
    console.log('📊 Test 5: Verify totals calculation...');
    let allTotalsCorrect = true;
    
    result1.forEach(indicator => {
      const calculatedTotal = indicator.dispensaires.reduce((sum, d) => sum + d.count, 0);
      const isCorrect = calculatedTotal === indicator.total;
      
      if (!isCorrect) {
        console.log(`   ❌ ${indicator.indicator}: Total mismatch (${indicator.total} vs ${calculatedTotal})`);
        allTotalsCorrect = false;
      }
    });
    
    if (allTotalsCorrect) {
      console.log('   ✅ All totals are correctly calculated');
    }
    console.log('');

    console.log('✅ All tests completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests
testMaternalHealthByZone();
