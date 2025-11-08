import React, { useState } from "react";
import Layout from '../components/Layout';
import styles from "./Reports.module.css";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { StatCardSkeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import reportService from "../services/reports";
import {
  useDispensaires,
  useGlobalStats,
  useDispensaireStats,
  useTopDiagnostics,
  useTopMedications,
  useConsultationsEvolution,
  useStatsByPeriod,
} from "../hooks/useReports";

const Reports = () => {
  const { showToast } = useToast();
  const [selectedDispensaire, setSelectedDispensaire] = useState('all');
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch data using react-query hooks
  const { data: dispensaires = [], isLoading: dispensairesLoading } = useDispensaires();
  
  const { data: globalStats, isLoading: globalStatsLoading } = useGlobalStats();
  
  const { 
    data: dispensaireStats, 
    isLoading: dispensaireStatsLoading 
  } = useDispensaireStats(
    selectedDispensaire,
    dateRange.startDate,
    dateRange.endDate,
    selectedDispensaire !== 'all'
  );
  
  const { 
    data: topDiagnostics = [], 
    isLoading: diagnosticsLoading 
  } = useTopDiagnostics(5, selectedDispensaire, dateRange.startDate, dateRange.endDate);
  
  const { 
    data: topMedications = [], 
    isLoading: medicationsLoading 
  } = useTopMedications(10, selectedDispensaire, dateRange.startDate, dateRange.endDate);
  
  const { 
    data: evolution = [], 
    isLoading: evolutionLoading 
  } = useConsultationsEvolution(period, selectedDispensaire, dateRange.startDate, dateRange.endDate);
  
  const { 
    data: periodStats, 
    isLoading: periodStatsLoading 
  } = useStatsByPeriod(dateRange.startDate, dateRange.endDate, selectedDispensaire);

  // Calculate combined loading state
  const loading = dispensairesLoading || 
    (selectedDispensaire === 'all' ? globalStatsLoading : dispensaireStatsLoading) ||
    diagnosticsLoading || 
    medicationsLoading || 
    evolutionLoading || 
    periodStatsLoading;

  const handleExport = async (format) => {
    setExportLoading(true);

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
        showToast(result.message || `Export ${format.toUpperCase()} réussi`, 'success');
        
        // Trigger download
        if (result.url) {
          window.open(result.url, '_blank');
        }
      } else {
        showToast(result.message || `Erreur lors de l'export ${format.toUpperCase()}`, 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast(`Erreur lors de l'export: ${error.message}`, 'error');
    } finally {
      setExportLoading(false);
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

  // Show loading state on initial load
  if (loading && !globalStats && !dispensaireStats) {
    return (
      <Layout title="Rapports & Analytics">
        <div className={styles.pageBg}>
          <div className={styles.container}>
            {/* Skeleton for filters */}
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <div className={styles.skeletonFilter} />
              </div>
              <div className={styles.filterGroup}>
                <div className={styles.skeletonFilter} />
              </div>
              <div className={styles.filterGroup}>
                <div className={styles.skeletonFilter} />
              </div>
              <div className={styles.filterGroup}>
                <div className={styles.skeletonFilter} />
              </div>
            </div>
            
            {/* Skeleton for stats */}
            <div className={styles.statsGrid}>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Rapports & Analytics">
      <div className={styles.pageBg}>
        <div className={styles.container}>
          {/* Page Header - Centered */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Rapports & Analytique</h1>
          </div>

        {/* Filtres - Compact Card */}
        <div className={styles.filtersCard}>
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.label}>Dispensaire:</label>
              <select 
                className={styles.select}
                value={selectedDispensaire}
                onChange={(e) => setSelectedDispensaire(e.target.value)}
                aria-label="Sélectionner un dispensaire"
              >
                <option value="all">Tous</option>
                {dispensaires.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>Période:</label>
              <select 
                className={styles.select}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                aria-label="Sélectionner une période"
              >
                <option value="day">Jour</option>
                <option value="week">Semaine</option>
                <option value="month">Ce mois-ci</option>
                <option value="year">Année</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>Date début:</label>
              <input
                type="date"
                className={styles.input}
                value={dateRange.startDate}
                onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                aria-label="Sélectionner la date de début"
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>Date fin:</label>
              <input
                type="date"
                className={styles.input}
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                aria-label="Sélectionner la date de fin"
              />
            </div>

            <div className={styles.exportButtons}>
              <button 
                className={styles.exportBtn} 
                onClick={() => handleExport('pdf')}
                disabled={exportLoading}
                aria-label="Exporter en PDF"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Patients"
            value={displayStats?.totalPatients || 0}
            icon="👥"
            color="blue"
            trend={{ value: +5.2, isPositive: true }}
          />
          <StatCard
            title="Total Consultations"
            value={displayStats?.totalConsultations || 0}
            icon="🏥"
            color="green"
            trend={{ value: +8.1, isPositive: true }}
          />
          <StatCard
            title="Dispensaires Actifs"
            value={displayStats?.totalDispensaires || 0}
            icon="🏢"
            color="purple"
            trend={{ value: -1.5, isPositive: false }}
          />
        </div>

        {/* Charts Grid */}
        <div className={styles.chartsGrid}>
          {/* Top 5 Diagnostics */}
          <ChartCard title="Top 5 Diagnostics">
            {diagnosticsLoading ? (
              <div className={styles.loading}>Chargement...</div>
            ) : topDiagnostics && topDiagnostics.length > 0 ? (
              <div className={styles.diagnosticsList}>
                {topDiagnostics.map((item, index) => (
                  <div key={index} className={styles.diagnosticItem}>
                    <div className={styles.diagnosticName}>{item.diagnostic}</div>
                    <div className={styles.diagnosticBar}>
                      <div 
                        className={styles.diagnosticProgress}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className={styles.diagnosticCount}>{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noData}>Aucun diagnostic disponible</div>
            )}
          </ChartCard>

          {/* Top 5 Médicaments */}
          <ChartCard title="Top 5 Médicaments">
            {medicationsLoading ? (
              <div className={styles.loading}>Chargement...</div>
            ) : topMedications && topMedications.length > 0 ? (
              <div className={styles.medicationsList}>
                {topMedications.slice(0, 5).map((item, index) => (
                  <div key={index} className={styles.medicationItem}>
                    <div className={styles.medicationName}>{item.medicament}</div>
                    <div className={styles.medicationCount}>{item.count} Unités</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noData}>Aucun médicament disponible</div>
            )}
          </ChartCard>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;