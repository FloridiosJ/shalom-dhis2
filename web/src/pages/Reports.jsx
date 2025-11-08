import React, { useState } from "react";
import Layout from '../components/Layout';
import styles from "./Reports.module.css";
import StatCard from "../components/StatCard";
import { StatCardSkeleton } from "../components/Skeleton";
import ReportsSidebar from "../components/ReportsSidebar";
import ReportsMainPanel from "../components/ReportsMainPanel";
import Tooltip from "../components/Tooltip";
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
  const [selectedDispensaire, setSelectedDispensaire] = useState('all');
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);
  const [activeWidget, setActiveWidget] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        <div style={{ marginBottom: '1.5rem' }} />
        <div className={styles.container}>
          {/* En-tête */}
          <div className={styles.header}>
            {selectedDispensaire !== 'all' && dispensaireStats && (
              <p className={styles.subtitle}>
                {dispensaireStats.dispensaire.name} - {dispensaireStats.dispensaire.code}
              </p>
            )}
            <button
              className={`${styles.sidebarToggle} ${styles.mobileOnly}`}
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Fermer la barre latérale" : "Ouvrir la barre latérale"}
              aria-expanded={isSidebarOpen}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
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
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label className={styles.label}>
                Dispensaire
                <Tooltip text="Sélectionnez un dispensaire spécifique ou tous les dispensaires">
                  <span className={styles.infoIcon}>ℹ️</span>
                </Tooltip>
              </label>
              <select 
                className={styles.select}
                value={selectedDispensaire}
                onChange={(e) => setSelectedDispensaire(e.target.value)}
                aria-label="Sélectionner un dispensaire"
              >
                <option value="all">Tous les dispensaires</option>
                {dispensaires.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>
                Période
                <Tooltip text="Choisissez la granularité des données (jour, semaine, mois, année)">
                  <span className={styles.infoIcon}>ℹ️</span>
                </Tooltip>
              </label>
              <select 
                className={styles.select}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                aria-label="Sélectionner une période"
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
                aria-label="Sélectionner la date de début"
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.label}>Date fin</label>
              <input
                type="date"
                className={styles.input}
                value={dateRange.endDate}
                onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                aria-label="Sélectionner la date de fin"
              />
            </div>
          </div>

          <div className={styles.exportGroup}>
            <Tooltip text="Exporter les données au format CSV">
              <button 
                className={styles.exportBtn} 
                onClick={() => handleExport('csv')}
                disabled={exportLoading}
                aria-label="Exporter en CSV"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exportLoading ? 'Export...' : 'CSV'}
              </button>
            </Tooltip>
            
            <Tooltip text="Exporter les données au format PDF">
              <button 
                className={styles.exportBtn} 
                onClick={() => handleExport('pdf')}
                disabled={exportLoading}
                aria-label="Exporter en PDF"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {exportLoading ? 'Export...' : 'PDF'}
              </button>
            </Tooltip>
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
            tooltip={selectedDispensaire !== 'all' 
              ? 'Nombre total de patients enregistrés dans ce dispensaire' 
              : 'Nombre total de patients enregistrés dans tous les dispensaires'}
          />
          <StatCard
            title="Consultations"
            value={displayStats?.totalConsultations || 0}
            icon="🏥"
            color="green"
            trend={{ value: 8, isPositive: true }}
            subtitle={`Période sélectionnée`}
            tooltip="Nombre total de consultations effectuées durant la période sélectionnée"
          />
          <StatCard
            title="Dispensaires"
            value={displayStats?.totalDispensaires || 0}
            icon="🏢"
            color="purple"
            subtitle={selectedDispensaire !== 'all' ? 'Sélectionné' : 'Actifs'}
            tooltip={selectedDispensaire !== 'all' 
              ? 'Dispensaire actuellement sélectionné' 
              : 'Nombre total de dispensaires actifs dans le système'}
          />
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

        {/* Sidebar and Main Panel Layout */}
        <div className={`${styles.reportsLayout} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
          <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.open : ''}`}>
            <ReportsSidebar
              activeWidget={activeWidget}
              onWidgetSelect={setActiveWidget}
              evolutionData={evolution}
              topDiagnostics={topDiagnostics}
              topMedications={topMedications}
              evolutionLoading={evolutionLoading}
              diagnosticsLoading={diagnosticsLoading}
              medicationsLoading={medicationsLoading}
            />
          </div>
          
          <ReportsMainPanel
            activeWidget={activeWidget}
            evolutionData={evolution}
            topDiagnostics={topDiagnostics}
            topMedications={topMedications}
            period={period}
            selectedDispensaire={selectedDispensaire}
            evolutionLoading={evolutionLoading}
            diagnosticsLoading={diagnosticsLoading}
            medicationsLoading={medicationsLoading}
            onExport={handleExport}
          />
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;