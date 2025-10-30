import React from 'react';
import AccordionSection from './AccordionSection';
import styles from './ReportsSidebar.module.css';

const ReportsSidebar = ({ 
  activeWidget, 
  onWidgetSelect,
  evolutionData,
  topDiagnostics,
  topMedications,
  evolutionLoading,
  diagnosticsLoading,
  medicationsLoading
}) => {
  
  // Calculate summary stats for each section
  const evolutionTotal = evolutionData?.reduce((sum, item) => sum + item.count, 0) || 0;
  const diagnosticsTotal = topDiagnostics?.reduce((sum, item) => sum + item.count, 0) || 0;
  const medicationsTotal = topMedications?.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <aside className={styles.sidebar} role="complementary" aria-label="Navigation des rapports">
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>📊 Sections</h2>
      </div>

      <div className={styles.accordions}>
        <AccordionSection
          title="Évolution globale"
          icon="📈"
          badge={evolutionTotal > 0 ? evolutionTotal : null}
          isActive={activeWidget === 'evolution'}
          onClick={() => onWidgetSelect('evolution')}
          summary={
            evolutionLoading ? (
              <div className={styles.loadingText}>Chargement...</div>
            ) : evolutionData && evolutionData.length > 0 ? (
              <div className={styles.miniStats}>
                <div className={styles.miniStat}>
                  <span className={styles.miniLabel}>Total consultations:</span>
                  <span className={styles.miniValue}>{evolutionTotal}</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniLabel}>Période analysée:</span>
                  <span className={styles.miniValue}>{evolutionData.length} points</span>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>Aucune donnée disponible</div>
            )
          }
        >
          {evolutionData && evolutionData.length > 0 && (
            <div className={styles.miniChart}>
              {evolutionData.slice(0, 5).map((item, index) => (
                <div key={index} className={styles.miniChartItem}>
                  <div className={styles.miniChartLabel}>{item.period}</div>
                  <div className={styles.miniChartValue}>{item.count}</div>
                </div>
              ))}
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          title="Top 5 Diagnostics"
          icon="🏥"
          badge={topDiagnostics?.length > 0 ? topDiagnostics.length : null}
          isActive={activeWidget === 'diagnostics'}
          onClick={() => onWidgetSelect('diagnostics')}
          summary={
            diagnosticsLoading ? (
              <div className={styles.loadingText}>Chargement...</div>
            ) : topDiagnostics && topDiagnostics.length > 0 ? (
              <div className={styles.miniStats}>
                <div className={styles.miniStat}>
                  <span className={styles.miniLabel}>Total cas:</span>
                  <span className={styles.miniValue}>{diagnosticsTotal}</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniLabel}>Plus fréquent:</span>
                  <span className={styles.miniValue}>{topDiagnostics[0]?.diagnostic}</span>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>Aucun diagnostic disponible</div>
            )
          }
        >
          {topDiagnostics && topDiagnostics.length > 0 && (
            <div className={styles.miniList}>
              {topDiagnostics.map((item, index) => (
                <div key={index} className={styles.miniListItem}>
                  <span className={styles.miniRank}>{index + 1}</span>
                  <span className={styles.miniListText}>{item.diagnostic}</span>
                  <span className={styles.miniCount}>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          title="Top 10 Médicaments"
          icon="💊"
          badge={topMedications?.length > 0 ? topMedications.length : null}
          isActive={activeWidget === 'medications'}
          onClick={() => onWidgetSelect('medications')}
          summary={
            medicationsLoading ? (
              <div className={styles.loadingText}>Chargement...</div>
            ) : topMedications && topMedications.length > 0 ? (
              <div className={styles.miniStats}>
                <div className={styles.miniStat}>
                  <span className={styles.miniLabel}>Total prescriptions:</span>
                  <span className={styles.miniValue}>{medicationsTotal}</span>
                </div>
                <div className={styles.miniStat}>
                  <span className={styles.miniLabel}>Plus prescrit:</span>
                  <span className={styles.miniValue}>{topMedications[0]?.medicament}</span>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>Aucun médicament disponible</div>
            )
          }
        >
          {topMedications && topMedications.length > 0 && (
            <div className={styles.miniList}>
              {topMedications.slice(0, 5).map((item, index) => (
                <div key={index} className={styles.miniListItem}>
                  <span className={styles.miniRank}>{index + 1}</span>
                  <span className={styles.miniListText}>{item.medicament}</span>
                  <span className={styles.miniCount}>{item.count}</span>
                </div>
              ))}
              {topMedications.length > 5 && (
                <div className={styles.miniListMore}>
                  +{topMedications.length - 5} autres
                </div>
              )}
            </div>
          )}
        </AccordionSection>
      </div>
    </aside>
  );
};

export default ReportsSidebar;
