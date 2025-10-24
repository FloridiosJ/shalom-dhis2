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
  const [dispensaires, setDispensaires] = useState([]);
  const [selectedDispensaire, setSelectedDispensaire] = useState('all');
  const [period, setPeriod] = useState('month');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [periodStats, setPeriodStats] = useState(null);
  const [topDiagnostics, setTopDiagnostics] = useState([]);
  const [evolution, setEvolution] = useState([]);

  useEffect(() => {
    fetchData();
  }, [selectedDispensaire, dateRange, period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ diagnostics, evo] = await Promise.all([
        // dispensaireService.getAll(),
        // reportService.getTopDiagnostics(10),
        // reportService.getConsultationsEvolution(period),
      ]);
      const stats = await reportService.getGlobalStats();
      const disps = await dispensaireService.getAll();
      setGlobalStats(stats);
      setDispensaires(disps);
      // setTopDiagnostics(diagnostics);
      // setEvolution(evo);

      // Charger les stats de période
      if (dateRange.startDate && dateRange.endDate) {
        const pStats = await reportService.getStatsByPeriod(
          dateRange.startDate,
          dateRange.endDate
        );
        setPeriodStats(pStats);
      }
    } catch (error) {
      console.error('Erreur chargement rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    // TODO: Implémenter l'export
    console.log(`Export en ${format}`);
  };

  if (loading && !globalStats) {
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
          <h1 className={styles.title}>📊 Rapports & Analytics</h1>
        </div>

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
                <option key={d.id} value={d.id}>{d.name}</option>
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
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
              <option value="year">Année</option>
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

          <button className={styles.exportBtn} onClick={() => handleExport('pdf')}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter PDF
          </button>
        </div>

        {/* Statistiques globales */}
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Patients"
            value={globalStats?.totalPatients || 0}
            icon="👥"
            color="blue"
            trend={{ value: 12, isPositive: true }}
            subtitle="Depuis le début"
          />
          <StatCard
            title="Consultations"
            value={globalStats?.totalConsultations || 0}
            icon="🏥"
            color="green"
            trend={{ value: 8, isPositive: true }}
            subtitle={`Ce ${period === 'month' ? 'mois' : period === 'week' ? 'semaine' : 'jour'}`}
          />
          <StatCard
            title="Dispensaires"
            value={globalStats?.totalDispensaires || 0}
            icon="🏢"
            color="purple"
            subtitle="Actifs"
          />
          <StatCard
            title="Utilisateurs"
            value={globalStats?.totalUsers || 0}
            icon="👨‍⚕️"
            color="orange"
            subtitle="Agents de santé"
          />
        </div>

        {/* Graphiques */}
        <div className={styles.chartsGrid}>
          {/* Évolution des consultations */}
          <ChartCard 
            title="Évolution des consultations"
            actions={
              <button className={styles.chartBtn}>Voir détails</button>
            }
          >
            <div className={styles.barChart}>
              {evolution.map((item, index) => (
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
              ))}
            </div>
          </ChartCard>

          {/* Top diagnostics */}
          <ChartCard title="Top 10 Diagnostics">
            <div className={styles.diagnosticsList}>
              {topDiagnostics.map((item, index) => (
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
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Tableau de statistiques détaillées */}
        {periodStats && (
          <ChartCard title="Statistiques détaillées de la période">
            <div className={styles.statsTable}>
              <div className={styles.statsRow}>
                <div className={styles.statsLabel}>Total consultations</div>
                <div className={styles.statsValue}>{periodStats.totalConsultations}</div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statsLabel}>Nouveaux patients</div>
                <div className={styles.statsValue}>{periodStats.totalPatients}</div>
              </div>
              <div className={styles.statsRow}>
                <div className={styles.statsLabel}>Moyenne par jour</div>
                <div className={styles.statsValue}>
                  {(periodStats.totalConsultations / periodStats.consultationsByDay?.length || 0).toFixed(1)}
                </div>
              </div>
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

export default Reports;