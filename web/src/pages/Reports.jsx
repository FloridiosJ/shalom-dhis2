import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./Reports.module.css";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import reportService from "../services/reports";
import dispensaireService from "../services/dispensaires";

const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState(null);
  const [dispensaireStats, setDispensaireStats] = useState(null);
  const [dispensaires, setDispensaires] = useState([]);
  const [selectedDispensaire, setSelectedDispensaire] = useState('all');
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [periodStats, setPeriodStats] = useState(null);
  const [topDiagnostics, setTopDiagnostics] = useState([]);
  const [topMedications, setTopMedications] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDispensaire, dateRange, period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Dispensaires
      const disps = await dispensaireService.getAll();
      setDispensaires(disps);
      
      // Si un dispensaire est sélectionné, récupérer ses stats spécifiques
      if (selectedDispensaire !== 'all') {
        const dispStats = await reportService.getStatsByDispensaire(
          selectedDispensaire,
          dateRange.startDate,
          dateRange.endDate
        );
        setDispensaireStats(dispStats);
        setGlobalStats(null); // Reset global stats
      } else {
        // Stats globales tous dispensaires
        const stats = await reportService.getGlobalStats();
        setGlobalStats(stats);
        setDispensaireStats(null);
      }

      // Charger les données en parallèle avec gestion d'erreur individuelle
      const dispensaireFilter = selectedDispensaire !== 'all' ? selectedDispensaire : null;
      
      const [diagnostics, medications, evo, pStats] = await Promise.allSettled([
        reportService.getTopDiagnostics(5, dispensaireFilter, dateRange.startDate, dateRange.endDate),
        reportService.getTopMedications(10, dispensaireFilter, dateRange.startDate, dateRange.endDate),
        reportService.getConsultationsEvolution(period, dispensaireFilter, dateRange.startDate, dateRange.endDate),
        reportService.getStatsByPeriod(dateRange.startDate, dateRange.endDate, dispensaireFilter)
      ]);

      // Traiter les résultats
      if (diagnostics.status === 'fulfilled') {
        setTopDiagnostics(diagnostics.value || []);
      } else {
        console.error('Erreur chargement diagnostics:', diagnostics.reason);
        setTopDiagnostics([]);
      }

      if (medications.status === 'fulfilled') {
        setTopMedications(medications.value || []);
      } else {
        console.error('Erreur chargement médicaments:', medications.reason);
        setTopMedications([]);
      }

      if (evo.status === 'fulfilled') {
        setEvolution(evo.value || []);
      } else {
        console.error('Erreur chargement évolution:', evo.reason);
        setEvolution([]);
      }

      if (pStats.status === 'fulfilled') {
        setPeriodStats(pStats.value || null);
      } else {
        console.error('Erreur chargement statistiques période:', pStats.reason);
        setPeriodStats(null);
      }

    } catch (error) {
      console.error('Erreur chargement rapports:', error);
      // Reset states to prevent displaying stale data
      setTopDiagnostics([]);
      setTopMedications([]);
      setEvolution([]);
      setPeriodStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    setExportMessage(null);

    try {
      // Build filters object
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      if (selectedDispensaire !== 'all') {
        filters.dispensaireId = selectedDispensaire;
      }

      // Call export mutation
      const result = await reportService.exportReport(format, filters);

      if (result.success) {
        setExportMessage({ type: 'success', text: result.message });
        
        // Trigger download
        if (result.url) {
          window.open(result.url, '_blank');
        }
      } else {
        setExportMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportMessage({ 
        type: 'error', 
        text: `Erreur lors de l'export: ${error.message}` 
      });
    } finally {
      setExportLoading(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setExportMessage(null);
      }, 5000);
    }
  };

  // Déterminer quelles stats afficher
  const displayStats = selectedDispensaire !== 'all'
    ? {
        totalPatients: dispensaireStats?.totalPatients || 0,
        totalConsultations: dispensaireStats?.totalConsultations || 0,
        totalDispensaires: 1, // Le dispensaire sélectionné
        totalUsers: dispensaireStats?.totalUsers || 0
      }
    : {
        totalPatients: globalStats?.totalPatients ?? 0,
        totalConsultations: periodStats?.total ?? (globalStats?.totalConsultations ?? 0),
        totalDispensaires: globalStats?.totalDispensaires ?? (dispensaires?.length || 0),
        totalUsers: globalStats?.totalUsers ?? 0
      };

  if (loading && !displayStats) {
    return (
      <div className={styles.pageBg}>
        <div className={styles.container}>
          <div className={styles.loading}>Chargement des rapports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageBg}>
      <div className={styles.container}>
        {/* En-tête */}
        <div className={styles.header}>
          <button
            className={styles.actionBtn}
            type="button"
            onClick={() => navigate('/dashboard')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </button>
          <div>
            <h1 className={styles.title}>📊 Rapports & Analytics</h1>
            {selectedDispensaire !== 'all' && dispensaireStats && (
              <p className={styles.subtitle}>
                {dispensaireStats.dispensaire.name} - {dispensaireStats.dispensaire.code}
              </p>
            )}
          </div>
        </div>

        {/* Export message */}
        {exportMessage && (
          <div 
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              backgroundColor: exportMessage.type === 'success' ? '#d4edda' : '#f8d7da',
              color: exportMessage.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${exportMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{exportMessage.type === 'success' ? '✅' : '❌'}</span>
            <span>{exportMessage.text}</span>
          </div>
        )}

        {/* Filtres */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.label}>Dispensaire</label>
            <select 
              className={styles.select}
              value={selectedDispensaire}
              onChange={(e) => setSelectedDispensaire(e.target.value)}
            >
              <option value="all">Tous les dispensaires</option>
              {dispensaires.map(d => (
                <option key={d.id} value={d.id}> {d.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Période</label>
            <select 
              className={styles.select}
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="day">📅 Jour</option>
              <option value="week">📆 Semaine</option>
              <option value="month">📊 Mois</option>
              <option value="year">📈 Année</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Date début</label>
            <input
              type="date"
              className={styles.input}
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>Date fin</label>
            <input
              type="date"
              className={styles.input}
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button 
              className={styles.exportBtn} 
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              style={{ opacity: exportLoading ? 0.6 : 1 }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exportLoading ? 'Export en cours...' : 'Exporter CSV'}
            </button>
            
            <button 
              className={styles.exportBtn} 
              onClick={() => handleExport('pdf')}
              disabled={exportLoading}
              style={{ opacity: exportLoading ? 0.6 : 1 }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {exportLoading ? 'Export en cours...' : 'Exporter PDF'}
            </button>
          </div>
        </div>

        {/* Statistiques globales ou du dispensaire */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Patients"
            value={displayStats?.totalPatients || 0}
            icon="👥"
            color="blue"
            trend={{ value: 12, isPositive: true }}
            subtitle={selectedDispensaire !== 'all' ? 'De ce dispensaire' : 'Tous dispensaires'}
          />
          <StatCard
            title="Consultations"
            value={displayStats?.totalConsultations || 0}
            icon="🏥"
            color="green"
            trend={{ value: 8, isPositive: true }}
            subtitle={`Période sélectionnée`}
          />
          <StatCard
            title="Dispensaires"
            value={displayStats?.totalDispensaires || 0}
            icon="🏢"
            color="purple"
            subtitle={selectedDispensaire !== 'all' ? 'Sélectionné' : 'Actifs'}
          />
          {/* <StatCard
            title="Moyenne/jour"
            value={periodStats ? (periodStats.total / (periodStats.consultationsByDay?.length || 1)).toFixed(1) : 0}
            icon="📊"
            color="orange"
            subtitle="Sur la période"
          /> */}
        </div>

        {/* Consultations par type (pour dispensaire sélectionné) */}
        {selectedDispensaire !== 'all' && dispensaireStats?.consultationsByType && (
          <div className={styles.chartsGrid}>
            <ChartCard title="Répartition par type de consultation">
              <div className={styles.typesList}>
                {dispensaireStats.consultationsByType.map((item, index) => (
                  <div key={index} className={styles.typeItem}>
                    <div className={styles.typeInfo}>
                      <div className={styles.typeName}>{item.type}</div>
                      <div className={styles.typeBar}>
                        <div 
                          className={styles.typeProgress}
                          style={{ width: `${item.pourcentage}%` }}
                        />
                      </div>
                    </div>
                    <div className={styles.typeStats}>
                      <span className={styles.typeCount}>{item.count}</span>
                      <span className={styles.typePercent}>{item.pourcentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Graphiques */}
        <div className={styles.chartsGrid}>
          {/* Évolution des consultations */}
          <ChartCard 
            title={`Évolution ${selectedDispensaire !== 'all' ? 'du dispensaire' : 'globale'}`}
            actions={
              <button className={styles.chartBtn}>Voir détails</button>
            }
          >
            <div className={styles.barChart}>
              {evolution && evolution.length > 0 ? (
                evolution.map((item, index) => (
                  <div key={index} className={styles.barItem}>
                    <div 
                      className={styles.bar}
                      style={{
                        height: `${(item.count / Math.max(...evolution.map(e => e.count))) * 100}%`
                      }}
                    >
                      <span className={styles.barValue}>{item.count}</span>
                    </div>
                    <div className={styles.barLabel}>{item.period}</div>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>Aucune donnée pour cette période</div>
              )}
            </div>
          </ChartCard>

          {/* Top diagnostics */}
          <ChartCard title="Top 5 Diagnostics">
            <div className={styles.diagnosticsList}>
              {topDiagnostics && topDiagnostics.length > 0 ? (
                topDiagnostics.map((item, index) => (
                  <div key={index} className={styles.diagnosticItem}>
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
                    <div className={styles.diagnosticCount}>{item.count}</div>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>Aucun diagnostic pour cette période</div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Top médicaments prescrits */}
        <div className={styles.chartsGrid}>
          <ChartCard title="💊 Top 10 Médicaments Prescrits">
            <div className={styles.medicationsList}>
              {topMedications && topMedications.length > 0 ? (
                topMedications.map((item, index) => (
                  <div key={index} className={styles.medicationItem}>
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
                    <div className={styles.medicationBadge}>
                      {item.count}
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noData}>Aucun médicament prescrit pour cette période</div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Top catégories de maladies (pour dispensaire sélectionné) */}
        {selectedDispensaire !== 'all' && dispensaireStats?.topCategories && (
          <ChartCard title="Top catégories de maladies">
            <div className={styles.categoriesList}>
              {dispensaireStats.topCategories.map((item, index) => (
                <div key={index} className={styles.categoryItem}>
                  <div className={styles.categoryRank}>{index + 1}</div>
                  <div className={styles.categoryInfo}>
                    <div className={styles.categoryName}>{item.categorie.nom}</div>
                    <div className={styles.categoryCode}>{item.categorie.code}</div>
                  </div>
                  <div className={styles.categoryCount}>{item.nombreConsultations}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {/* Tableau de statistiques détaillées */}
        {periodStats && (
          <ChartCard title={`Statistiques détaillées ${selectedDispensaire !== 'all' ? 'du dispensaire' : 'globales'}`}>
            <div className={styles.statsTable}>
              <div className={styles.statsRow}>
                <div className={styles.statsLabel}>📊 Total consultations</div>
                <div className={styles.statsValue}>{periodStats.total}</div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statsLabel}>📅 Ce mois</div>
                <div className={styles.statsValue}>{periodStats.thisMonth}</div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statsLabel}>🗓️ Cette semaine</div>
                <div className={styles.statsValue}>{periodStats.thisWeek}</div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statsLabel}>📆 Aujourd'hui</div>
                <div className={styles.statsValue}>{periodStats.today}</div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statsLabel}>📈 Moyenne par jour</div>
                <div className={styles.statsValue}>{periodStats.averagePerDay ? periodStats.averagePerDay.toFixed(1) : '0'}</div>
              </div>
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default Reports;