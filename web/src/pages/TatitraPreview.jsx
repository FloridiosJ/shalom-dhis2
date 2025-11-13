import React, { useState, useMemo } from 'react';
import { useFitorianaStats, useConsultantsByZone, useDiagnosticsByZone, useEducationByZone, useMaternalHealthByZone, useEventsByZone } from '../hooks/useReports';
import Layout from '../components/Layout';
import styles from './TatitraPreview.module.css';

const TatitraPreview = () => {
  // Date range state - default to last quarter
  const getDefaultDates = () => {
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
    return {
      startDate: threeMonthsAgo.toISOString().split('T')[0],
      endDate: currentDate.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaultDates.startDate);
  const [dateTo, setDateTo] = useState(defaultDates.endDate);

  // Fetch Fitoriana statistics
  const { 
    data: fitorianaStats, 
    isLoading: fitorianaLoading, 
    error: fitorianaError 
  } = useFitorianaStats(dateFrom, dateTo, null, null);

  // Fetch non-Christian statistics separately for the "Tsy Kristianina" row
  const { 
    data: nonChristianStats,
    isLoading: nonChristianLoading
  } = useFitorianaStats(dateFrom, dateTo, null, ['Musulman', 'traditionnelle']);

  // Fetch consultants and consultations by zone
  const { 
    data: consultantsByZone, 
    isLoading: consultantsLoading, 
    error: consultantsError 
  } = useConsultantsByZone(dateFrom, dateTo, null);

  // Fetch diagnostics by zone for section 2
  const { 
    data: diagnosticsByZone, 
    isLoading: diagnosticsLoading, 
    error: diagnosticsError 
  } = useDiagnosticsByZone(dateFrom, dateTo, null, null);

  // Fetch education statistics by zone for section 3
  const { 
    data: educationByZone, 
    isLoading: educationLoading, 
    error: educationError 
  } = useEducationByZone(dateFrom, dateTo, null);

  // Fetch maternal health statistics by zone for section 4
  const { 
    data: maternalHealthByZone, 
    isLoading: maternalHealthLoading, 
    error: maternalHealthError 
  } = useMaternalHealthByZone(dateFrom, dateTo, null);

  // Fetch events by zone for section 5
  const { 
    data: eventsByZone, 
    isLoading: eventsLoading, 
    error: eventsError 
  } = useEventsByZone(dateFrom, dateTo, null);

  // Sample data matching the structure from the PDF generator
  const reportData = {
    period: {
      year: new Date(dateTo).getFullYear(),
      quarter: 'EFATRA',
      startDate: new Date(dateFrom).toLocaleDateString('fr-FR'),
      endDate: new Date(dateTo).toLocaleDateString('fr-FR')
    },
    zones: fitorianaStats?.rows[0]?.valuesByDispensaire?.map(d => d.dispensaireName) || 
           ['Ampitsopitsoka', 'Boeny Aranta', 'Ankelitaly', 'Ampanasina', 'Mananara', 'Onara', 'Andamonty'],
    section1: {
      prayerMeetings: 19,
      visitorsReceived: fitorianaStats?.totalConsultations || 470,
      nonChristians: nonChristianStats?.totalConsultations || 85,
      birthsByZone: []  // Will be populated from fitorianaStats
    },
    section2: {
      consultants: 158,
      consultations: 1247,
      consultantsByZone: [
        { zone: 'Ampitsopitsoka', consultants: 25, consultations: 180 },
        { zone: 'Boeny Aranta', consultants: 22, consultations: 165 },
        { zone: 'Ankelitaly', consultants: 20, consultations: 155 },
        { zone: 'Ampanasina', consultants: 18, consultations: 145 },
        { zone: 'Mananara', consultants: 15, consultations: 130 },
        { zone: 'Onara', consultants: 12, consultations: 120 },
        { zone: 'Andamonty', consultants: 10, consultations: 110 }
      ],
      diseasesByZone: [
        {
          disease: 'Hypertension artérielle essentielle non spécifiée',
          zones: [12, 10, 8, 7, 6, 5, 4],
          isSubcategory: false
        },
        {
          disease: 'Infections respiratoires aigües des voies supérieures',
          zones: [25, 22, 20, 18, 15, 12, 10],
          isSubcategory: false
        },
        {
          disease: 'Paludisme',
          zones: [35, 30, 28, 25, 22, 20, 18],
          isSubcategory: false
        },
        {
          disease: '  Paludisme à Plasmodium falciparum',
          zones: [30, 25, 23, 20, 18, 16, 15],
          isSubcategory: true
        },
        {
          disease: '  Paludisme à Plasmodium vivax',
          zones: [5, 5, 5, 5, 4, 4, 3],
          isSubcategory: true
        },
        {
          disease: 'Diarrhée et gastro-entérite',
          zones: [20, 18, 16, 14, 12, 10, 8],
          isSubcategory: false
        },
        {
          disease: 'Malnutrition',
          zones: [15, 12, 10, 8, 7, 6, 5],
          isSubcategory: false
        },
        {
          disease: '  Kwashiorkor',
          zones: [8, 6, 5, 4, 3, 3, 2],
          isSubcategory: true
        },
        {
          disease: '  Marasme',
          zones: [7, 6, 5, 4, 4, 3, 3],
          isSubcategory: true
        },
        {
          disease: 'Tuberculose',
          zones: [10, 8, 7, 6, 5, 4, 3],
          isSubcategory: false
        },
        {
          disease: 'Infections cutanées',
          zones: [18, 15, 13, 11, 9, 7, 6],
          isSubcategory: false
        },
        {
          disease: 'Anémie',
          zones: [22, 18, 16, 14, 12, 10, 8],
          isSubcategory: false
        }
      ]
    },
    section3: {
      title: 'III. FANDRIANDRAM-PITERAHANA',
      events: [
        { zone: 'Ampitsopitsoka', participants: 45, sessions: 3 },
        { zone: 'Boeny Aranta', participants: 38, sessions: 3 },
        { zone: 'Ankelitaly', participants: 35, sessions: 2 },
        { zone: 'Ampanasina', participants: 30, sessions: 2 },
        { zone: 'Mananara', participants: 25, sessions: 2 },
        { zone: 'Onara', participants: 20, sessions: 2 },
        { zone: 'Andamonty', participants: 18, sessions: 1 }
      ]
    },
    section4: {
      title: 'IV. MOMBA IREO RENY BEVOAKA',
      data: [
        { zone: 'Ampitsopitsoka', cpn: 35, hivTests: 32, deliveries: 28 },
        { zone: 'Boeny Aranta', cpn: 30, hivTests: 28, deliveries: 25 },
        { zone: 'Ankelitaly', cpn: 28, hivTests: 26, deliveries: 22 },
        { zone: 'Ampanasina', cpn: 25, hivTests: 23, deliveries: 20 },
        { zone: 'Mananara', cpn: 22, hivTests: 20, deliveries: 18 },
        { zone: 'Onara', cpn: 18, hivTests: 17, deliveries: 15 },
        { zone: 'Andamonty', cpn: 15, hivTests: 14, deliveries: 12 }
      ]
    },
    section5: {
      title: 'V. FANENTANANA NATAO',
      events: [
        { theme: 'Éducation sanitaire', location: 'Ampitsopitsoka', date: '15/10/2024', participants: 85 },
        { theme: 'Planification familiale', location: 'Boeny Aranta', date: '22/10/2024', participants: 70 },
        { theme: 'Prévention paludisme', location: 'Ankelitaly', date: '05/11/2024', participants: 65 },
        { theme: 'Nutrition infantile', location: 'Ampanasina', date: '18/11/2024', participants: 60 },
        { theme: 'Hygiène et assainissement', location: 'Mananara', date: '02/12/2024', participants: 55 },
        { theme: 'Vaccination', location: 'Onara', date: '15/12/2024', participants: 50 }
      ]
    },
    section6: {
      title: 'VI. VAOVAO AMPITAINA',
      news: [
        { zone: 'Ampitsopitsoka', content: 'Nouvelle campagne de vaccination lancée avec succès. Taux de participation: 92%.' },
        { zone: 'Boeny Aranta', content: 'Formation du personnel sur la prise en charge des cas de malnutrition sévère.' },
        { zone: 'Ankelitaly', content: 'Réception de nouveaux équipements médicaux pour améliorer les consultations.' },
        { zone: 'Ampanasina', content: 'Partenariat avec ONG locale pour programme eau potable et assainissement.' },
        { zone: 'Mananara', content: 'Organisation de journée de dépistage gratuit pour diabète et hypertension.' }
      ]
    }
  };

  // Transform fitorianaStats data to match the expected structure
  const transformedFitorianaData = useMemo(() => {
    if (!fitorianaStats || !fitorianaStats.rows) return [];
    
    return fitorianaStats.rows.map(row => {
      // Transform valuesByDispensaire to match the zones array structure
      const zones = row.valuesByDispensaire.map(disp => ({
        male: disp.values.lahy,
        female: disp.values.vavy
      }));
      
      return {
        category: row.label,
        zones: zones,
        fitambarany: {
          male: row.fitambarany.lahy,
          female: row.fitambarany.vavy
        }
      };
    });
  }, [fitorianaStats]);

  // Transform non-Christian stats to match the expected structure
  const nonChristianRow = useMemo(() => {
    if (!nonChristianStats || !nonChristianStats.rows) return null;
    
    // Combine all age groups for non-Christians
    const zones = [];
    const numDispensaires = nonChristianStats.rows[0]?.valuesByDispensaire?.length || 0;
    
    for (let i = 0; i < numDispensaires; i++) {
      let totalMale = 0;
      let totalFemale = 0;
      
      nonChristianStats.rows.forEach(row => {
        if (row.valuesByDispensaire[i]) {
          totalMale += row.valuesByDispensaire[i].values.lahy;
          totalFemale += row.valuesByDispensaire[i].values.vavy;
        }
      });
      
      zones.push({ male: totalMale, female: totalFemale });
    }
    
    // Calculate total fitambarany
    const totalFitambaranyMale = zones.reduce((sum, z) => sum + z.male, 0);
    const totalFitambaranyFemale = zones.reduce((sum, z) => sum + z.female, 0);
    
    return {
      category: 'Tsy Kristianina (Non-chrétiens)',
      zones: zones,
      fitambarany: {
        male: totalFitambaranyMale,
        female: totalFitambaranyFemale
      }
    };
  }, [nonChristianStats]);

  // Combine all rows including non-Christians
  const allFitorianaRows = useMemo(() => {
    const rows = [...transformedFitorianaData];
    if (nonChristianRow) {
      rows.push(nonChristianRow);
    }
    return rows;
  }, [transformedFitorianaData, nonChristianRow]);

  // Transform diagnosticsByZone data to match the expected diseasesByZone structure
  const transformedDiseasesByZone = useMemo(() => {
    if (!diagnosticsByZone || diagnosticsByZone.length === 0) {
      return [];
    }

    // Get zone names from dispensaires (assuming they match fitorianaStats zones order)
    const zones = fitorianaStats?.rows[0]?.valuesByDispensaire?.map(d => d.dispensaireName) || [];
    
    return diagnosticsByZone.map(diagnostic => {
      // Create zones array with counts in the same order as zones
      const zoneCounts = [];
      
      zones.forEach(zoneName => {
        // Find the matching dispensaire count
        const dispensaireData = diagnostic.dispensaires.find(d => d.name === zoneName);
        zoneCounts.push(dispensaireData ? dispensaireData.count : 0);
      });
      
      // Add total at the end
      zoneCounts.push(diagnostic.total);
      
      return {
        disease: diagnostic.diagnostic,
        zones: zoneCounts,
        isSubcategory: false // We don't have hierarchy info yet, could be enhanced
      };
    });
  }, [diagnosticsByZone, fitorianaStats]);

  // Transform maternalHealthByZone data to match the expected structure for Section 4
  const transformedMaternalHealthData = useMemo(() => {
    if (!maternalHealthByZone || maternalHealthByZone.length === 0) {
      return {
        zones: [],
        indicators: {}
      };
    }

    // Extract zone names from the first indicator's dispensaires
    const zones = maternalHealthByZone[0]?.dispensaires.map(d => d.name) || [];
    
    // Create a map of indicator -> zone counts
    const indicators = {};
    maternalHealthByZone.forEach(indicator => {
      indicators[indicator.indicator] = {
        dispensaires: indicator.dispensaires,
        total: indicator.total
      };
    });
    
    return {
      zones,
      indicators
    };
  }, [maternalHealthByZone]);

  // Calculate totals for birth statistics (backward compatibility)
  const calculateBirthTotals = (category) => {
    if (category.fitambarany) {
      return { totalMale: category.fitambarany.male, totalFemale: category.fitambarany.female };
    }
    let totalMale = 0;
    let totalFemale = 0;
    category.zones.forEach(zone => {
      totalMale += zone.male;
      totalFemale += zone.female;
    });
    return { totalMale, totalFemale };
  };

  return (
    <Layout title="Aperçu Tatitra">
      {/* Date Filter Controls */}
      <div className={styles.filterControls}>
        <div className={styles.dateInputs}>
          <div className={styles.dateGroup}>
            <label htmlFor="dateFrom">Date début:</label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.dateGroup}>
            <label htmlFor="dateTo">Date fin:</label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>
        {(fitorianaLoading || nonChristianLoading || consultantsLoading || diagnosticsLoading || educationLoading || maternalHealthLoading) && (
          <div className={styles.loadingIndicator}>Chargement des données...</div>
        )}
        {fitorianaError && (
          <div className={styles.errorIndicator}>
            Erreur: {fitorianaError.message}
          </div>
        )}
        {consultantsError && (
          <div className={styles.errorIndicator}>
            Erreur consultants: {consultantsError.message}
          </div>
        )}
        {diagnosticsError && (
          <div className={styles.errorIndicator}>
            Erreur diagnostics: {diagnosticsError.message}
          </div>
        )}
        {educationError && (
          <div className={styles.errorIndicator}>
            Erreur éducation: {educationError.message}
          </div>
        )}
      </div>

      <div className={styles.previewContainer}>
        <div className={styles.previewPage}>
          {/* Header Section */}
          <header className={styles.header}>
            <h1 className={styles.mainTitle}>TATITRA FANARAKETANA NY ASA</h1>
            <h2 className={styles.subtitle}>CSB LOTERANA</h2>
            <div className={styles.periodInfo}>
              <p>Taona: {reportData.period.year} - Taonjato: {reportData.period.quarter}</p>
              <p>Daty: {reportData.period.startDate} - {reportData.period.endDate}</p>
              <p>Toerana: {reportData.zones.join(', ')}</p>
            </div>
        </header>

        {/* Section 1: MAHAKASIKA NY ASA FITORIANA */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>I. MAHAKASIKA NY ASA FITORIANA</h2>
          
          <div className={styles.summaryInfo}>
            <p>· Isan'ny fotoam-bavaka tao amin'ny toeram-pitsaboana : {reportData.section1.prayerMeetings}</p>
            <p>· Isan'ny Hasila nitady fitsaboana tao : {reportData.section1.visitorsReceived}</p>
          </div>

          {fitorianaLoading ? (
            <div className={styles.loadingSection}>Chargement des statistiques...</div>
          ) : fitorianaError ? (
            <div className={styles.errorSection}>Erreur de chargement des statistiques</div>
          ) : allFitorianaRows.length > 0 ? (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th rowSpan="2" className={styles.categoryHeader}>Toerana :</th>
                  {reportData.zones.map((zone, idx) => (
                    <th key={idx} colSpan="2" className={styles.zoneHeader}>{zone}</th>
                  ))}
                  <th colSpan="2" className={styles.totalHeader}>Fitambarany</th>
                </tr>
                <tr>
                  {[...Array(reportData.zones.length + 1)].map((_, idx) => (
                    <React.Fragment key={idx}>
                      <th className={styles.genderHeader}>Lahy</th>
                      <th className={styles.genderHeader}>Vavy</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFitorianaRows.map((category, catIdx) => {
                  const totals = calculateBirthTotals(category);
                  return (
                    <tr key={catIdx}>
                      <td className={styles.categoryCell}>{category.category}</td>
                      {category.zones.map((zone, zoneIdx) => (
                        <React.Fragment key={zoneIdx}>
                          <td className={styles.dataCell}>{String(zone.male).padStart(2, '0')}</td>
                          <td className={styles.dataCell}>{String(zone.female).padStart(2, '0')}</td>
                        </React.Fragment>
                      ))}
                      <td className={styles.totalCell}>{String(totals.totalMale).padStart(2, '0')}</td>
                      <td className={styles.totalCell}>{String(totals.totalFemale).padStart(2, '0')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className={styles.noDataSection}>Aucune donnée disponible pour cette période</div>
          )}
        </section>

        {/* Section 2: MAHAKASIKA NY ASA FITSABOANA */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>II. MAHAKASIKA NY ASA FITSABOANA</h2>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Consultants et Consultations</h3>
            
            {consultantsLoading ? (
              <div className={styles.loadingSection}>Chargement des statistiques consultants...</div>
            ) : consultantsError ? (
              <div className={styles.errorSection}>
                Erreur de chargement des consultants: {consultantsError.message}
              </div>
            ) : consultantsByZone && consultantsByZone.length > 0 ? (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th className={styles.categoryHeader}>Toerana :</th>
                    {consultantsByZone.slice(0, -1).map((item) => (
                      <th key={item.dispensaire.id} className={styles.zoneHeader}>
                        {item.dispensaire.name}
                      </th>
                    ))}
                    <th className={styles.totalHeader}>Fitambarany</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.categoryCell}>Hasila (Consultants)</td>
                    {consultantsByZone.slice(0, -1).map((item) => (
                      <td key={item.dispensaire.id} className={styles.dataCell}>
                        {item.consultants}
                      </td>
                    ))}
                    <td className={styles.totalCell}>
                      {consultantsByZone[consultantsByZone.length - 1]?.consultants || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.categoryCell}>Consultation</td>
                    {consultantsByZone.slice(0, -1).map((item) => (
                      <td key={item.dispensaire.id} className={styles.dataCell}>
                        {item.consultations}
                      </td>
                    ))}
                    <td className={styles.totalCell}>
                      {consultantsByZone[consultantsByZone.length - 1]?.consultations || 0}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className={styles.noDataSection}>Aucune donnée de consultants disponible pour cette période</div>
            )}
          </div>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Désignations des maladies / Diagnostics</h3>
            
            {diagnosticsLoading ? (
              <div className={styles.loadingSection}>Chargement des diagnostics...</div>
            ) : diagnosticsError ? (
              <div className={styles.errorSection}>
                Erreur de chargement des diagnostics: {diagnosticsError.message}
              </div>
            ) : transformedDiseasesByZone && transformedDiseasesByZone.length > 0 ? (
              <table className={styles.diseaseTable}>
                <thead>
                  <tr>
                    <th className={styles.diseaseHeader}>Areti-mifindra sy ny Aretina hafa</th>
                    {reportData.zones.map((zone, idx) => (
                      <th key={idx} className={styles.zoneHeaderSmall}>{zone}</th>
                    ))}
                    <th className={styles.totalHeaderSmall}>Fitambarany</th>
                  </tr>
                </thead>
                <tbody>
                  {transformedDiseasesByZone.map((disease, idx) => (
                    <tr key={idx}>
                      <td className={disease.isSubcategory ? styles.subcategoryCell : styles.diseaseName}>
                        {disease.disease}
                      </td>
                      {disease.zones.slice(0, -1).map((count, zoneIdx) => (
                        <td key={zoneIdx} className={styles.diseaseCount}>{String(count).padStart(2, '0')}</td>
                      ))}
                      <td className={styles.diseaseTotalCell}>{String(disease.zones[disease.zones.length - 1]).padStart(2, '0')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.noDataSection}>Aucune donnée de diagnostics disponible pour cette période</div>
            )}
          </div>
        </section>

        {/* Section 3: Fandriandram-piterahana (Education Statistics) */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>III. FANDRIANDRAM-PITERAHANA</h2>
          
          {educationLoading ? (
            <div className={styles.loadingSection}>Chargement des statistiques d'éducation...</div>
          ) : educationError ? (
            <div className={styles.errorSection}>Erreur de chargement des statistiques d'éducation</div>
          ) : educationByZone && educationByZone.length > 0 ? (
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th rowSpan="2" className={styles.categoryHeader}>Catégorie :</th>
                  {educationByZone[0].zones.map((zone, idx) => (
                    <th key={idx} colSpan="2" className={styles.zoneHeader}>{zone.name}</th>
                  ))}
                  <th colSpan="2" className={styles.totalHeader}>Fitambarany</th>
                </tr>
                <tr>
                  {[...Array(educationByZone[0].zones.length + 1)].map((_, idx) => (
                    <React.Fragment key={idx}>
                      <th className={styles.genderHeader}>Lahy</th>
                      <th className={styles.genderHeader}>Vavy</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {educationByZone.map((category, catIdx) => (
                  <tr key={catIdx}>
                    <td className={styles.categoryCell}>{category.category}</td>
                    {category.zones.map((zone, zoneIdx) => (
                      <React.Fragment key={zoneIdx}>
                        <td className={styles.dataCell}>{String(zone.male).padStart(2, '0')}</td>
                        <td className={styles.dataCell}>{String(zone.female).padStart(2, '0')}</td>
                      </React.Fragment>
                    ))}
                    <td className={styles.dataCell}>{String(category.totalMale).padStart(2, '0')}</td>
                    <td className={styles.dataCell}>{String(category.totalFemale).padStart(2, '0')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noDataSection}>Aucune donnée d'éducation disponible pour cette période</div>
          )}
        </section>

        {/* Section 4: Momba ireo Reny Bevoaka */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>IV. MOMBA IREO RENY BEVOAKA</h2>
          {maternalHealthByZone && maternalHealthByZone.length > 0 ? (
            <table className={styles.simpleTable}>
              <thead>
                <tr>
                  <th>Toerana</th>
                  <th>CPN</th>
                  <th>Tests VIH</th>
                  <th>Tests Sérologiques</th>
                  <th>Accouchements</th>
                </tr>
              </thead>
              <tbody>
                {transformedMaternalHealthData.zones.map((zoneName, idx) => {
                  const cpnData = transformedMaternalHealthData.indicators['Femmes ayant passé à la CPN']?.dispensaires.find(d => d.name === zoneName);
                  const hivData = transformedMaternalHealthData.indicators['Femmes enceintes ayant fait le Test VIH']?.dispensaires.find(d => d.name === zoneName);
                  const seroData = transformedMaternalHealthData.indicators['Femmes enceintes ayant fait le Test sérologique']?.dispensaires.find(d => d.name === zoneName);
                  const deliveryData = transformedMaternalHealthData.indicators['Accouchements']?.dispensaires.find(d => d.name === zoneName);
                  
                  return (
                    <tr key={idx}>
                      <td>{zoneName}</td>
                      <td>{cpnData?.count || 0}</td>
                      <td>{hivData?.count || 0}</td>
                      <td>{seroData?.count || 0}</td>
                      <td>{deliveryData?.count || 0}</td>
                    </tr>
                  );
                })}
                <tr className={styles.totalRow}>
                  <td>Fitambarany (Total)</td>
                  <td>{transformedMaternalHealthData.indicators['Femmes ayant passé à la CPN']?.total || 0}</td>
                  <td>{transformedMaternalHealthData.indicators['Femmes enceintes ayant fait le Test VIH']?.total || 0}</td>
                  <td>{transformedMaternalHealthData.indicators['Femmes enceintes ayant fait le Test sérologique']?.total || 0}</td>
                  <td>{transformedMaternalHealthData.indicators['Accouchements']?.total || 0}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className={styles.noDataSection}>Aucune donnée de santé maternelle disponible pour cette période</div>
          )}
        </section>

        {/* Section 5: Fanentanana natao */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>V. FANENTANANA NATAO</h2>
          {eventsLoading ? (
            <div className={styles.loadingSection}>Chargement des événements...</div>
          ) : eventsError ? (
            <div className={styles.errorSection}>Erreur lors du chargement des événements: {eventsError.message}</div>
          ) : eventsByZone && eventsByZone.length > 0 && eventsByZone.some(zone => zone.events.length > 0) ? (
            <div className={styles.eventsByZone}>
              {eventsByZone.filter(zone => zone.events.length > 0).map((zone, zoneIdx) => (
                <div key={zoneIdx} className={styles.zoneEvents}>
                  <h3 className={styles.zoneName}>{zone.zone}</h3>
                  <table className={styles.simpleTable}>
                    <thead>
                      <tr>
                        <th>Thème</th>
                        <th>Date</th>
                        <th>Participants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zone.events.map((event, eventIdx) => (
                        <tr key={eventIdx}>
                          <td>{event.theme}</td>
                          <td>{event.date}</td>
                          <td>{event.participants}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={styles.totalRow}>
                        <td><strong>Total</strong></td>
                        <td><strong>{zone.totalSessions} session(s)</strong></td>
                        <td><strong>{zone.totalParticipants} participants</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noDataSection}>Aucun événement disponible pour cette période</div>
          )}
        </section>

        {/* Section 6: Vaovao ampitaina */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{reportData.section6.title}</h2>
          <div className={styles.newsList}>
            {reportData.section6.news.map((item, idx) => (
              <div key={idx} className={styles.newsItem}>
                <h4 className={styles.newsZone}>{item.zone}</h4>
                <p className={styles.newsContent}>{item.content}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.signatureBlock}>
            <div className={styles.signature}>
              <p>Fait à : __________________</p>
              <p>Le : __________________</p>
            </div>
            <div className={styles.signature}>
              <p>Signature du Responsable</p>
              <p>__________________</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Print Button */}
      <div className={styles.printControls}>
        <button onClick={() => window.print()} className={styles.printButton}>
          🖨️ Imprimer / Exporter PDF
        </button>
      </div>
    </div>
    </Layout>
  );
};

export default TatitraPreview;
