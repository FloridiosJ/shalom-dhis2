import React, { useState } from "react";
import Layout from '../components/Layout';
import styles from "./Reports.module.css";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import { StatCardSkeleton } from "../components/Skeleton";
import TatitraExportModal from "../components/TatitraExportModal";
import reportsService from "../services/reports";
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
  const [selectedDispensaire, setSelectedDispensaire] = useState('all');
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showTatitraModal, setShowTatitraModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleTatitraExport = async (quarter, year) => {
    try {
      const dispensaireId = selectedDispensaire !== 'all' ? selectedDispensaire : null;
      const result = await reportsService.exportTatitraReport(quarter, year, dispensaireId);
      
      if (result.success && result.url) {
        // Trigger download
        window.open(result.url, '_blank');
        showToast(result.message || 'Rapport Tatitra généré avec succès', 'success');
      } else {
        throw new Error(result.message || 'Échec de la génération du rapport');
      }
    } catch (error) {
      console.error('Error exporting Tatitra report:', error);
      showToast(error.message || 'Erreur lors de l\'export du rapport', 'error');
      throw error;
    }
  };

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
          </div>
        </div>

        {/* Export Button Section */}
        <div className={styles.exportSection}>
          <button
            className={styles.tatitraButton}
            onClick={() => setShowTatitraModal(true)}
            aria-label="Exporter le rapport Tatitra"
          >
            <span className={styles.buttonIcon}>📄</span>
            <span className={styles.buttonText}>Rapport Tatitra</span>
          </button>
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

      {/* Tatitra Export Modal */}
      <TatitraExportModal
        isOpen={showTatitraModal}
        onClose={() => setShowTatitraModal(false)}
        onExport={handleTatitraExport}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}
    </Layout>
  );
};

export default Reports;