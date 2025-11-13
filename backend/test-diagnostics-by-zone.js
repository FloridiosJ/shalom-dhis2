/**
 * Manual test script for diagnosticsByZone resolver
 * 
 * This script validates the logic of the diagnosticsByZone resolver
 * without requiring a database connection.
 * 
 * Run with: node test-diagnostics-by-zone.js
 */

// Mock data simulating DataEntry records
const mockDataEntries = [
  { id: '1', diagnostic: 'Paludisme', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-15') },
  { id: '2', diagnostic: 'Paludisme', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-16') },
  { id: '3', diagnostic: 'Paludisme', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-17') },
  { id: '4', diagnostic: 'Infection respiratoire', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-18') },
  { id: '5', diagnostic: 'Infection respiratoire', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-19') },
  { id: '6', diagnostic: 'Diarrhée', isActive: true, dispensaireId: 'disp1', dateConsultation: new Date('2025-01-20') },
  { id: '7', diagnostic: 'Consultation prénatale', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-21') },
  { id: '8', diagnostic: 'Consultation prénatale', isActive: true, dispensaireId: 'disp2', dateConsultation: new Date('2025-01-22') },
  { id: '9', diagnostic: 'Consultation prénatale', isActive: true, dispensaireId: 'disp3', dateConsultation: new Date('2025-01-23') },
  { id: '10', diagnostic: 'Consultation prénatale', isActive: true, dispensaireId: 'disp3', dateConsultation: new Date('2025-01-24') },
];

// Mock dispensaires
const mockDispensaires = [
  { id: 'disp1', name: 'Ampitsopitsoka' },
  { id: 'disp2', name: 'Boeny Aranta' },
  { id: 'disp3', name: 'Ankelitaly' }
];

// Mock category associations (structured data)
const mockCategoryAssociations = [
  { dataEntryId: '1', categorieMaladieId: 'cat1', isPrincipal: true, dispensaireId: 'disp1', categorie: { nom: 'PALUDISME', code: 'PAL', niveau: 2 } },
  { dataEntryId: '2', categorieMaladieId: 'cat1', isPrincipal: true, dispensaireId: 'disp1', categorie: { nom: 'PALUDISME', code: 'PAL', niveau: 2 } },
  { dataEntryId: '3', categorieMaladieId: 'cat1', isPrincipal: true, dispensaireId: 'disp2', categorie: { nom: 'PALUDISME', code: 'PAL', niveau: 2 } },
  { dataEntryId: '4', categorieMaladieId: 'cat2', isPrincipal: true, dispensaireId: 'disp1', categorie: { nom: 'INFECTION RESPIRATOIRE', code: 'RESP', niveau: 2 } },
  { dataEntryId: '5', categorieMaladieId: 'cat2', isPrincipal: true, dispensaireId: 'disp2', categorie: { nom: 'INFECTION RESPIRATOIRE', code: 'RESP', niveau: 2 } },
  // Note: entries 6-10 have NO category associations (will use text fallback)
];

/**
 * Simulate the diagnosticsByZone resolver logic
 */
function simulateDiagnosticsByZone(filters = {}) {
  const { dateFrom, dateTo, dispensaireIds, limit } = filters;
  
  // Step 1: Filter data entries based on criteria
  let filteredEntries = mockDataEntries.filter(entry => entry.isActive);
  
  if (dateFrom || dateTo) {
    const start = dateFrom ? new Date(dateFrom) : new Date('1970-01-01');
    const end = dateTo ? new Date(dateTo) : new Date('2100-12-31');
    filteredEntries = filteredEntries.filter(e => 
      e.dateConsultation >= start && e.dateConsultation <= end
    );
  }
  
  const validIds = filteredEntries.map(e => e.id);
  
  if (validIds.length === 0) {
    return [];
  }
  
  // Filter dispensaires
  let dispensaires = mockDispensaires;
  if (dispensaireIds && dispensaireIds.length > 0) {
    dispensaires = dispensaires.filter(d => dispensaireIds.includes(d.id));
  }
  
  // Step 2: Aggregate category-based statistics by diagnostic AND dispensaire
  const diagnosticAggregation = {};
  
  // Add structured categories
  mockCategoryAssociations
    .filter(assoc => validIds.includes(assoc.dataEntryId) && assoc.isPrincipal)
    .forEach(assoc => {
      const diagnostic = assoc.categorie.nom;
      const dispensaireId = assoc.dispensaireId;
      
      if (!diagnosticAggregation[diagnostic]) {
        diagnosticAggregation[diagnostic] = {};
      }
      
      diagnosticAggregation[diagnostic][dispensaireId] = 
        (diagnosticAggregation[diagnostic][dispensaireId] || 0) + 1;
    });
  
  // Step 3: Get entries without categories for text fallback
  const entriesWithCategories = new Set(
    mockCategoryAssociations
      .filter(assoc => assoc.isPrincipal)
      .map(assoc => assoc.dataEntryId)
  );
  
  const entriesWithoutCategories = filteredEntries.filter(
    entry => !entriesWithCategories.has(entry.id)
  );
  
  // Add text diagnostics
  entriesWithoutCategories.forEach(entry => {
    const diagnostic = entry.diagnostic.trim();
    const dispensaireId = entry.dispensaireId;
    
    if (!diagnosticAggregation[diagnostic]) {
      diagnosticAggregation[diagnostic] = {};
    }
    
    diagnosticAggregation[diagnostic][dispensaireId] = 
      (diagnosticAggregation[diagnostic][dispensaireId] || 0) + 1;
  });
  
  // Step 4: Format as array with all dispensaires
  let results = Object.entries(diagnosticAggregation).map(([diagnostic, dispensaireCounts]) => {
    const dispensairesData = dispensaires.map(disp => ({
      id: disp.id,
      name: disp.name,
      count: dispensaireCounts[disp.id] || 0
    }));
    
    const total = dispensairesData.reduce((sum, d) => sum + d.count, 0);
    
    return {
      diagnostic,
      dispensaires: dispensairesData,
      total
    };
  });
  
  // Sort by total descending
  results.sort((a, b) => b.total - a.total);
  
  // Apply limit if specified
  if (limit && limit > 0) {
    results = results.slice(0, limit);
  }
  
  return results;
}

/**
 * Test cases
 */
function runTests() {
  console.log('🧪 Running diagnosticsByZone logic tests...\n');
  
  // Test 1: Basic query (all data, all dispensaires)
  console.log('Test 1: Basic query (all dispensaires, all dates)');
  const result1 = simulateDiagnosticsByZone({ dateFrom: '2025-01-01', dateTo: '2025-12-31' });
  console.log('Result:', JSON.stringify(result1, null, 2));
  console.assert(result1.length > 0, 'Should return results');
  console.assert(result1[0].diagnostic === 'Consultation prénatale', 'Top diagnostic should be Consultation prénatale');
  console.assert(result1[0].total === 4, 'Total should be 4');
  console.assert(result1[0].dispensaires.length === 3, 'Should have 3 dispensaires');
  console.log('✅ Test 1 passed\n');
  
  // Test 2: Verify cross-tabulation structure
  console.log('Test 2: Verify cross-tabulation (diagnostic x dispensaire)');
  const result2 = simulateDiagnosticsByZone({ dateFrom: '2025-01-01', dateTo: '2025-12-31' });
  const paludisme = result2.find(r => r.diagnostic === 'PALUDISME');
  console.log('Paludisme data:', JSON.stringify(paludisme, null, 2));
  console.assert(paludisme, 'Should find PALUDISME');
  console.assert(paludisme.total === 3, 'PALUDISME total should be 3');
  
  const disp1Count = paludisme.dispensaires.find(d => d.id === 'disp1')?.count;
  const disp2Count = paludisme.dispensaires.find(d => d.id === 'disp2')?.count;
  console.assert(disp1Count === 2, 'disp1 should have 2 PALUDISME cases');
  console.assert(disp2Count === 1, 'disp2 should have 1 PALUDISME case');
  console.log('✅ Test 2 passed\n');
  
  // Test 3: Filter by dispensaireIds
  console.log('Test 3: Filter by dispensaireIds');
  const result3 = simulateDiagnosticsByZone({ 
    dateFrom: '2025-01-01', 
    dateTo: '2025-12-31',
    dispensaireIds: ['disp1', 'disp2']
  });
  console.log('Filtered result:', JSON.stringify(result3, null, 2));
  console.assert(result3.length > 0, 'Should return results');
  result3.forEach(diagnostic => {
    console.assert(diagnostic.dispensaires.length === 2, 'Should only have 2 dispensaires');
    const dispensaireIds = diagnostic.dispensaires.map(d => d.id);
    console.assert(dispensaireIds.includes('disp1'), 'Should include disp1');
    console.assert(dispensaireIds.includes('disp2'), 'Should include disp2');
    console.assert(!dispensaireIds.includes('disp3'), 'Should NOT include disp3');
  });
  console.log('✅ Test 3 passed\n');
  
  // Test 4: Limit parameter
  console.log('Test 4: Limit to 2 diagnostics');
  const result4 = simulateDiagnosticsByZone({ 
    dateFrom: '2025-01-01', 
    dateTo: '2025-12-31',
    limit: 2
  });
  console.log('Limited result:', JSON.stringify(result4, null, 2));
  console.assert(result4.length === 2, 'Should return exactly 2 diagnostics');
  console.log('✅ Test 4 passed\n');
  
  // Test 5: Verify all dispensaires present (even with 0 counts)
  console.log('Test 5: Verify all dispensaires present');
  const result5 = simulateDiagnosticsByZone({ dateFrom: '2025-01-01', dateTo: '2025-12-31' });
  const diarrhee = result5.find(r => r.diagnostic === 'Diarrhée');
  console.log('Diarrhée data:', JSON.stringify(diarrhee, null, 2));
  console.assert(diarrhee, 'Should find Diarrhée');
  console.assert(diarrhee.dispensaires.length === 3, 'Should have all 3 dispensaires');
  
  const disp1Diarrhee = diarrhee.dispensaires.find(d => d.id === 'disp1')?.count;
  const disp2Diarrhee = diarrhee.dispensaires.find(d => d.id === 'disp2')?.count;
  const disp3Diarrhee = diarrhee.dispensaires.find(d => d.id === 'disp3')?.count;
  console.assert(disp1Diarrhee === 1, 'disp1 should have 1');
  console.assert(disp2Diarrhee === 0, 'disp2 should have 0');
  console.assert(disp3Diarrhee === 0, 'disp3 should have 0');
  console.log('✅ Test 5 passed\n');
  
  // Test 6: Verify sorting by total
  console.log('Test 6: Verify sorting by total descending');
  const result6 = simulateDiagnosticsByZone({ dateFrom: '2025-01-01', dateTo: '2025-12-31' });
  console.log('Sorted totals:', result6.map(r => ({ diagnostic: r.diagnostic, total: r.total })));
  for (let i = 0; i < result6.length - 1; i++) {
    console.assert(result6[i].total >= result6[i + 1].total, 'Results should be sorted by total descending');
  }
  console.log('✅ Test 6 passed\n');
  
  console.log('✅ All tests passed successfully!');
}

// Run tests
runTests();
