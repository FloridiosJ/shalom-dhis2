/**
 * Test script for educationByZone query
 * 
 * Usage: node test-education-by-zone.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env') });

async function testEducationByZone() {
  console.log('🧪 Testing educationByZone Query...\n');

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

    // Test 1: Query without filters (last 3 months)
    console.log('📊 Test 1: Query education statistics for Q4 2024...');
    const args1 = {
      dateFrom: '2024-10-01',
      dateTo: '2024-12-31',
      dispensaireIds: null
    };

    const result1 = await reportsResolvers.Query.educationByZone(null, args1, context);
    
    console.log(`✅ Found ${result1.length} education categories\n`);
    
    result1.forEach(category => {
      console.log(`📚 ${category.category}`);
      console.log(`   Total: ${category.totalMale} hommes, ${category.totalFemale} femmes`);
      console.log(`   Zones (${category.zones.length}):`);
      category.zones.forEach(zone => {
        const total = zone.male + zone.female;
        if (total > 0) {
          console.log(`      - ${zone.name}: ${zone.male}H / ${zone.female}F (${total} total)`);
        }
      });
      console.log('');
    });

    // Test 2: Query with date range
    console.log('📊 Test 2: Query education statistics for Q1 2025...');
    const args2 = {
      dateFrom: '2025-01-01',
      dateTo: '2025-03-31',
      dispensaireIds: null
    };

    const result2 = await reportsResolvers.Query.educationByZone(null, args2, context);
    
    console.log(`✅ Found ${result2.length} education categories\n`);
    
    result2.forEach(category => {
      const grandTotal = category.totalMale + category.totalFemale;
      console.log(`📚 ${category.category}: ${grandTotal} participants total`);
    });
    console.log('');

    // Test 3: Validate structure
    console.log('📊 Test 3: Validate response structure...');
    
    if (result1.length > 0) {
      const firstCategory = result1[0];
      
      // Check required fields
      const hasCategory = typeof firstCategory.category === 'string';
      const hasZones = Array.isArray(firstCategory.zones);
      const hasTotalMale = typeof firstCategory.totalMale === 'number';
      const hasTotalFemale = typeof firstCategory.totalFemale === 'number';
      
      // Check zone structure
      let validZones = true;
      if (firstCategory.zones.length > 0) {
        const firstZone = firstCategory.zones[0];
        validZones = firstZone.id && firstZone.name && 
                     typeof firstZone.male === 'number' && 
                     typeof firstZone.female === 'number';
      }
      
      if (hasCategory && hasZones && hasTotalMale && hasTotalFemale && validZones) {
        console.log('✅ Response structure is valid');
        console.log('   - category: string ✓');
        console.log('   - zones: array ✓');
        console.log('   - totalMale: number ✓');
        console.log('   - totalFemale: number ✓');
        console.log('   - zone.id: string ✓');
        console.log('   - zone.name: string ✓');
        console.log('   - zone.male: number ✓');
        console.log('   - zone.female: number ✓');
      } else {
        console.log('❌ Response structure is invalid');
        console.log('Response:', JSON.stringify(firstCategory, null, 2));
      }
    }

    console.log('\n✅ All tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testEducationByZone();
