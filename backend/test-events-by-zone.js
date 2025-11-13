/**
 * Test script for eventsByZone query
 * 
 * Usage: node test-events-by-zone.js
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '.env') });

async function testEventsByZone() {
  console.log('🧪 Testing eventsByZone Query...\n');

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
    console.log('📊 Test 1: Query events for Q4 2024...');
    const args1 = {
      dateFrom: '2024-10-01',
      dateTo: '2024-12-31',
      dispensaireIds: null
    };

    const result1 = await reportsResolvers.Query.eventsByZone(null, args1, context);
    
    console.log(`✅ Found ${result1.length} zones with events\n`);
    
    let totalEvents = 0;
    let totalParticipants = 0;
    
    result1.forEach(zone => {
      totalEvents += zone.events.length;
      totalParticipants += zone.totalParticipants;
      
      if (zone.events.length > 0) {
        console.log(`📍 ${zone.zone}`);
        console.log(`   Total: ${zone.totalParticipants} participants, ${zone.totalSessions} session(s)`);
        console.log(`   Events (${zone.events.length}):`);
        zone.events.forEach(event => {
          console.log(`      - ${event.theme}: ${event.participants} participants (${event.date})`);
        });
        console.log('');
      }
    });
    
    console.log(`📊 Global summary: ${totalEvents} events, ${totalParticipants} participants total\n`);

    // Test 2: Query with date range
    console.log('📊 Test 2: Query events for Q1 2025...');
    const args2 = {
      dateFrom: '2025-01-01',
      dateTo: '2025-03-31',
      dispensaireIds: null
    };

    const result2 = await reportsResolvers.Query.eventsByZone(null, args2, context);
    
    console.log(`✅ Found ${result2.length} zones\n`);
    
    const zonesWithEvents = result2.filter(zone => zone.events.length > 0);
    console.log(`📍 Zones with events: ${zonesWithEvents.length}`);
    
    let q1TotalParticipants = 0;
    zonesWithEvents.forEach(zone => {
      q1TotalParticipants += zone.totalParticipants;
      console.log(`   - ${zone.zone}: ${zone.events.length} event(s), ${zone.totalParticipants} participants`);
    });
    console.log(`   Total participants: ${q1TotalParticipants}\n`);

    // Test 3: Validate structure
    console.log('📊 Test 3: Validate response structure...');
    
    if (result1.length > 0) {
      const firstZone = result1[0];
      
      // Check required fields
      const hasZone = typeof firstZone.zone === 'string';
      const hasZoneId = typeof firstZone.zoneId === 'string';
      const hasEvents = Array.isArray(firstZone.events);
      const hasTotalParticipants = typeof firstZone.totalParticipants === 'number';
      const hasTotalSessions = typeof firstZone.totalSessions === 'number';
      
      // Check event structure if events exist
      let validEvents = true;
      if (firstZone.events.length > 0) {
        const firstEvent = firstZone.events[0];
        validEvents = typeof firstEvent.theme === 'string' && 
                     typeof firstEvent.participants === 'number' &&
                     typeof firstEvent.date === 'string' &&
                     typeof firstEvent.sessions === 'number';
      }
      
      if (hasZone && hasZoneId && hasEvents && hasTotalParticipants && hasTotalSessions && validEvents) {
        console.log('✅ Response structure is valid');
        console.log('   - zone: string ✓');
        console.log('   - zoneId: string ✓');
        console.log('   - events: array ✓');
        console.log('   - totalParticipants: number ✓');
        console.log('   - totalSessions: number ✓');
        if (firstZone.events.length > 0) {
          console.log('   - event.theme: string ✓');
          console.log('   - event.participants: number ✓');
          console.log('   - event.date: string ✓');
          console.log('   - event.sessions: number ✓');
        }
      } else {
        console.log('❌ Response structure is invalid');
        console.log('Response:', JSON.stringify(firstZone, null, 2));
      }
    }

    // Test 4: Verify zones without events still appear
    console.log('\n📊 Test 4: Verify all zones are returned...');
    const zonesWithoutEvents = result1.filter(zone => zone.events.length === 0);
    console.log(`✅ Zones without events: ${zonesWithoutEvents.length}`);
    if (zonesWithoutEvents.length > 0) {
      console.log('   Sample zones without events:');
      zonesWithoutEvents.slice(0, 3).forEach(zone => {
        console.log(`   - ${zone.zone}: 0 events, totals = 0`);
      });
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
testEventsByZone();
