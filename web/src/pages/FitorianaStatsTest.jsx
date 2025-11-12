import React, { useState } from 'react';
import { useFitorianaStats, useDispensaires } from '../hooks/useReports';
import Layout from '../components/Layout';
import styles from './FitorianaStatsTest.module.css';

const FitorianaStatsTest = () => {
  const currentDate = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

  const [dateFrom, setDateFrom] = useState(threeMonthsAgo.toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(currentDate.toISOString().split('T')[0]);
  const [selectedDispensaires, setSelectedDispensaires] = useState([]);
  const [selectedReligions, setSelectedReligions] = useState([]);

  const { data: dispensaires = [], isLoading: dispensairesLoading } = useDispensaires();
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch 
  } = useFitorianaStats(
    dateFrom, 
    dateTo, 
    selectedDispensaires.length > 0 ? selectedDispensaires : null,
    selectedReligions.length > 0 ? selectedReligions : null
  );

  const handleDispensaireToggle = (dispensaireId) => {
    setSelectedDispensaires(prev => 
      prev.includes(dispensaireId) 
        ? prev.filter(id => id !== dispensaireId)
        : [...prev, dispensaireId]
    );
  };

  const handleReligionToggle = (religion) => {
    setSelectedReligions(prev => 
      prev.includes(religion) 
        ? prev.filter(r => r !== religion)
        : [...prev, religion]
    );
  };

  const religions = ['Kristianina', 'Musulman', 'traditionnelle'];

  return (
    <Layout title="Test Fitoriana Stats">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Statistiques Fitoriana - Test</h1>
          <p className={styles.subtitle}>
            Section "MAHAKASIKA NY ASA FITORIANA" du rapport Tatitra
          </p>
        </div>

        {/* Filtres */}
        <div className={styles.filtersCard}>
          <h2 className={styles.sectionTitle}>Filtres</h2>
          
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Date début:</label>
              <input
                type="date"
                className={styles.input}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>Date fin:</label>
              <input
                type="date"
                className={styles.input}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Dispensaires (optionnel):</label>
            <div className={styles.checkboxGroup}>
              {dispensairesLoading ? (
                <div>Chargement...</div>
              ) : (
                dispensaires.map(disp => (
                  <label key={disp.id} className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={selectedDispensaires.includes(disp.id)}
                      onChange={() => handleDispensaireToggle(disp.id)}
                    />
                    <span>{disp.name}</span>
                  </label>
                ))
              )}
            </div>
            {selectedDispensaires.length === 0 && (
              <small className={styles.hint}>Tous les dispensaires si aucun sélectionné</small>
            )}
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Religions (optionnel):</label>
            <div className={styles.checkboxGroup}>
              {religions.map(religion => (
                <label key={religion} className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedReligions.includes(religion)}
                    onChange={() => handleReligionToggle(religion)}
                  />
                  <span>{religion}</span>
                </label>
              ))}
            </div>
            {selectedReligions.length === 0 && (
              <small className={styles.hint}>Toutes les religions si aucune sélectionnée</small>
            )}
          </div>

          <button 
            className={styles.refreshButton}
            onClick={() => refetch()}
            disabled={statsLoading}
          >
            {statsLoading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        {/* Résultats */}
        {statsError && (
          <div className={styles.errorCard}>
            <h3>Erreur</h3>
            <p>{statsError.message}</p>
          </div>
        )}

        {statsLoading && (
          <div className={styles.loadingCard}>
            <div className={styles.spinner}></div>
            <p>Chargement des statistiques...</p>
          </div>
        )}

        {stats && !statsLoading && (
          <>
            {/* Métadonnées */}
            <div className={styles.metadataCard}>
              <h2 className={styles.sectionTitle}>Informations</h2>
              <div className={styles.metadataGrid}>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Période:</span>
                  <span className={styles.metadataValue}>{stats.dateFrom} → {stats.dateTo}</span>
                </div>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Total consultations:</span>
                  <span className={styles.metadataValue}>{stats.totalConsultations}</span>
                </div>
                <div className={styles.metadataItem}>
                  <span className={styles.metadataLabel}>Tranches d'âge:</span>
                  <span className={styles.metadataValue}>{stats.rows.length}</span>
                </div>
                {stats.rows.length > 0 && stats.rows[0].valuesByDispensaire && (
                  <div className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Dispensaires:</span>
                    <span className={styles.metadataValue}>
                      {stats.rows[0].valuesByDispensaire.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tableau */}
            <div className={styles.tableCard}>
              <h2 className={styles.sectionTitle}>Tableau Fitoriana</h2>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th rowSpan="2" className={styles.ageHeader}>Tranche d'âge</th>
                      {stats.rows.length > 0 && stats.rows[0].valuesByDispensaire.map(disp => (
                        <th key={disp.dispensaireName} colSpan="2" className={styles.dispensaireHeader}>
                          {disp.dispensaireName}
                        </th>
                      ))}
                      <th colSpan="2" className={styles.totalHeader}>Fitambarany</th>
                    </tr>
                    <tr>
                      {stats.rows.length > 0 && stats.rows[0].valuesByDispensaire.map(disp => (
                        <React.Fragment key={disp.dispensaireName}>
                          <th className={styles.genderHeader}>Lahy</th>
                          <th className={styles.genderHeader}>Vavy</th>
                        </React.Fragment>
                      ))}
                      <th className={styles.genderHeader}>Lahy</th>
                      <th className={styles.genderHeader}>Vavy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.rows.map((row, idx) => (
                      <tr key={row.ageGroup} className={idx % 2 === 0 ? styles.evenRow : ''}>
                        <td className={styles.ageCell}>{row.label}</td>
                        {row.valuesByDispensaire.map(disp => (
                          <React.Fragment key={disp.dispensaireName}>
                            <td className={styles.valueCell}>{disp.values.lahy}</td>
                            <td className={styles.valueCell}>{disp.values.vavy}</td>
                          </React.Fragment>
                        ))}
                        <td className={styles.totalCell}>{row.fitambarany.lahy}</td>
                        <td className={styles.totalCell}>{row.fitambarany.vavy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* JSON brut pour debug */}
            <details className={styles.debugCard}>
              <summary className={styles.debugSummary}>
                Voir la réponse JSON complète (debug)
              </summary>
              <pre className={styles.debugPre}>
                {JSON.stringify(stats, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </Layout>
  );
};

export default FitorianaStatsTest;
