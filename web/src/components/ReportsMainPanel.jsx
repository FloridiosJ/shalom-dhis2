import React, { useState, useEffect } from 'react';
import ChartCard from './ChartCard';
import styles from './ReportsMainPanel.module.css';

const ReportsMainPanel = ({ 
  activeWidget,
  evolutionData,
  topDiagnostics,
  topMedications,
  period,
  onExport,
  selectedDispensaire,
  evolutionLoading,
  diagnosticsLoading,
  medicationsLoading
}) => {
  const [drilldownData, setDrilldownData] = useState(null);

  const handleDrilldown = (type, item) => {
    // Simulate drilldown - in real app, this would fetch related consultations
    setDrilldownData({
      type,
      item,
      // Mock data - replace with actual API call
      consultations: []
    });
  };

  const closeDrilldown = () => {
    setDrilldownData(null);
  };

  // Add keyboard support to close modal with Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && drilldownData) {
        closeDrilldown();
      }
    };

    if (drilldownData) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [drilldownData]);

  const renderEvolutionWidget = () => (
    <ChartCard 
      title={`📈 Évolution ${selectedDispensaire !== 'all' ? 'du dispensaire' : 'globale'}`}
      actions={
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => onExport && onExport('evolution')}
            aria-label="Exporter les données d'évolution"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter
          </button>
        </div>
      }
    >
      {evolutionLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement des données...</p>
        </div>
      ) : evolutionData && evolutionData.length > 0 ? (
        <div className={styles.barChart}>
          {evolutionData.map((item, index) => (
            <div key={index} className={styles.barItem}>
              <div 
                className={styles.bar}
                style={{
                  height: `${(item.count / Math.max(...evolutionData.map(e => e.count))) * 100}%`
                }}
              >
                <span className={styles.barValue}>{item.count}</span>
              </div>
              <div className={styles.barLabel}>{item.period}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noData}>
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>Aucune donnée disponible pour cette période</p>
        </div>
      )}
    </ChartCard>
  );

  const renderDiagnosticsWidget = () => (
    <ChartCard 
      title="🏥 Top 5 Diagnostics"
      actions={
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => onExport && onExport('diagnostics')}
            aria-label="Exporter les diagnostics"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter
          </button>
        </div>
      }
    >
      {diagnosticsLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement des diagnostics...</p>
        </div>
      ) : topDiagnostics && topDiagnostics.length > 0 ? (
        <div className={styles.diagnosticsList}>
          {topDiagnostics.map((item, index) => (
            <div 
              key={index} 
              className={styles.diagnosticItem}
              onClick={() => handleDrilldown('diagnostic', item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDrilldown('diagnostic', item);
                }
              }}
              aria-label={`Voir les détails pour ${item.diagnostic}`}
            >
              <div className={styles.diagnosticRank}>{index + 1}</div>
              <div className={styles.diagnosticInfo}>
                <div className={styles.diagnosticName}>{item.diagnostic}</div>
                <div className={styles.diagnosticBar}>
                  <div 
                    className={styles.diagnosticProgress}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
              <div className={styles.diagnosticStats}>
                <div className={styles.diagnosticCount}>{item.count}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noData}>
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Aucun diagnostic disponible pour cette période</p>
        </div>
      )}
    </ChartCard>
  );

  const renderMedicationsWidget = () => (
    <ChartCard 
      title="💊 Top 10 Médicaments Prescrits"
      actions={
        <div className={styles.actions}>
          <button 
            className={styles.actionBtn}
            onClick={() => onExport && onExport('medications')}
            aria-label="Exporter les médicaments"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter
          </button>
        </div>
      }
    >
      {medicationsLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Chargement des médicaments...</p>
        </div>
      ) : topMedications && topMedications.length > 0 ? (
        <div className={styles.medicationsList}>
          {topMedications.map((item, index) => (
            <div 
              key={index} 
              className={styles.medicationItem}
              onClick={() => handleDrilldown('medication', item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDrilldown('medication', item);
                }
              }}
              aria-label={`Voir les détails pour ${item.medicament}`}
            >
              <div className={styles.medicationRank}>{index + 1}</div>
              <div className={styles.medicationInfo}>
                <div className={styles.medicationName}>{item.medicament}</div>
                <div className={styles.medicationDetails}>
                  <span className={styles.medicationCount}>
                    {item.count} prescription{item.count > 1 ? 's' : ''}
                  </span>
                  {item.avgDuree && (
                    <span className={styles.medicationDuration}>
                      • Durée moy: {item.avgDuree}
                    </span>
                  )}
                  {item.totalDuree && (
                    <span className={styles.medicationTotal}>
                      • Total: {item.totalDuree}
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.medicationStats}>
                <div className={styles.medicationBadge}>{item.count}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noData}>
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p>Aucun médicament prescrit pour cette période</p>
        </div>
      )}
    </ChartCard>
  );

  const renderDefaultView = () => (
    <div className={styles.defaultView}>
      <div className={styles.welcomeCard}>
        <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3>Bienvenue dans les Rapports & Analytics</h3>
        <p>Sélectionnez une section dans la barre latérale pour visualiser les données en détail.</p>
        <div className={styles.hints}>
          <div className={styles.hint}>
            <span className={styles.hintIcon}>📈</span>
            <span>Évolution globale des consultations</span>
          </div>
          <div className={styles.hint}>
            <span className={styles.hintIcon}>🏥</span>
            <span>Top 5 des diagnostics les plus fréquents</span>
          </div>
          <div className={styles.hint}>
            <span className={styles.hintIcon}>💊</span>
            <span>Top 10 des médicaments les plus prescrits</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.mainPanel} role="main" aria-label="Panneau principal des rapports">
      {activeWidget === 'evolution' && renderEvolutionWidget()}
      {activeWidget === 'diagnostics' && renderDiagnosticsWidget()}
      {activeWidget === 'medications' && renderMedicationsWidget()}
      {!activeWidget && renderDefaultView()}

      {/* Drilldown Modal */}
      {drilldownData && (
        <div 
          className={styles.drilldownModal} 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="drilldown-title"
          onClick={closeDrilldown}
        >
          <div 
            className={styles.drilldownContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.drilldownHeader}>
              <h3 id="drilldown-title">
                Détails: {drilldownData.item?.diagnostic || drilldownData.item?.medicament}
              </h3>
              <button
                className={styles.closeBtn}
                onClick={closeDrilldown}
                aria-label="Fermer"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={styles.drilldownBody}>
              <p className={styles.drilldownInfo}>
                Cette fonctionnalité affichera les consultations associées à ce {drilldownData.type === 'diagnostic' ? 'diagnostic' : 'médicament'}.
              </p>
              <div className={styles.drilldownStats}>
                <div className={styles.drilldownStat}>
                  <span className={styles.drilldownLabel}>Total cas:</span>
                  <span className={styles.drilldownValue}>{drilldownData.item?.count}</span>
                </div>
                {drilldownData.item?.percentage && (
                  <div className={styles.drilldownStat}>
                    <span className={styles.drilldownLabel}>Pourcentage:</span>
                    <span className={styles.drilldownValue}>{drilldownData.item.percentage}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsMainPanel;
