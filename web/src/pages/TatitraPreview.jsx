import React from 'react';
import styles from './TatitraPreview.module.css';

const TatitraPreview = () => {
  // Sample data matching the structure from the PDF generator
  const reportData = {
    period: {
      year: 2024,
      quarter: 'EFATRA',
      startDate: '01/10/2024',
      endDate: '31/12/2024'
    },
    zones: ['Ampitsopitsoka', 'Boeny Aranta', 'Ankelitaly', 'Ampanasina', 'Mananara', 'Onara', 'Andamonty'],
    section1: {
      prayerMeetings: 19,
      visitorsReceived: 470,
      nonChristians: 85,
      birthsByZone: [
        {
          category: 'Zaza (12 taona noho midina)',
          zones: [
            { male: 15, female: 18 },
            { male: 12, female: 14 },
            { male: 10, female: 11 },
            { male: 8, female: 9 },
            { male: 7, female: 8 },
            { male: 6, female: 7 },
            { male: 5, female: 6 }
          ]
        },
        {
          category: 'Tanora (13 taona - 30 taona)',
          zones: [
            { male: 25, female: 30 },
            { male: 20, female: 25 },
            { male: 18, female: 22 },
            { male: 15, female: 18 },
            { male: 12, female: 15 },
            { male: 10, female: 12 },
            { male: 8, female: 10 }
          ]
        },
        {
          category: "Olon-dehibe maherin'ny 30 taona",
          zones: [
            { male: 35, female: 40 },
            { male: 30, female: 35 },
            { male: 28, female: 32 },
            { male: 25, female: 28 },
            { male: 22, female: 25 },
            { male: 20, female: 22 },
            { male: 18, female: 20 }
          ]
        },
        {
          category: 'Tsy Kristianina (Non-chrétiens)',
          zones: [
            { male: 5, female: 8 },
            { male: 3, female: 7 },
            { male: 4, female: 6 },
            { male: 2, female: 5 },
            { male: 3, female: 4 },
            { male: 2, female: 3 },
            { male: 1, female: 2 }
          ]
        }
      ]
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

  // Calculate totals for birth statistics
  const calculateBirthTotals = (category) => {
    let totalMale = 0;
    let totalFemale = 0;
    category.zones.forEach(zone => {
      totalMale += zone.male;
      totalFemale += zone.female;
    });
    return { totalMale, totalFemale };
  };

  // Calculate totals for disease statistics
  const calculateDiseaseTotals = (zones) => {
    return zones.reduce((sum, count) => sum + count, 0);
  };

  return (
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
              {reportData.section1.birthsByZone.map((category, catIdx) => {
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
        </section>

        {/* Section 2: MAHAKASIKA NY ASA FITSABOANA */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>II. MAHAKASIKA NY ASA FITSABOANA</h2>
          
          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Consultants et Consultations</h3>
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
                <tr>
                  <td className={styles.categoryCell}>Hasila</td>
                  {reportData.section2.consultantsByZone.map((zone, idx) => (
                    <React.Fragment key={idx}>
                      <td className={styles.dataCell}>{zone.consultants}</td>
                      <td className={styles.dataCell}>-</td>
                    </React.Fragment>
                  ))}
                  <td className={styles.totalCell}>{reportData.section2.consultants}</td>
                  <td className={styles.totalCell}>-</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>Consultation</td>
                  {reportData.section2.consultantsByZone.map((zone, idx) => (
                    <React.Fragment key={idx}>
                      <td className={styles.dataCell}>{zone.consultations}</td>
                      <td className={styles.dataCell}>-</td>
                    </React.Fragment>
                  ))}
                  <td className={styles.totalCell}>{reportData.section2.consultations}</td>
                  <td className={styles.totalCell}>-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.subsection}>
            <h3 className={styles.subsectionTitle}>Désignations des maladies / Diagnostics</h3>
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
                {reportData.section2.diseasesByZone.map((disease, idx) => (
                  <tr key={idx}>
                    <td className={disease.isSubcategory ? styles.subcategoryCell : styles.diseaseName}>
                      {disease.disease}
                    </td>
                    {disease.zones.map((count, zoneIdx) => (
                      <td key={zoneIdx} className={styles.diseaseCount}>{String(count).padStart(2, '0')}</td>
                    ))}
                    <td className={styles.diseaseTotalCell}>{String(calculateDiseaseTotals(disease.zones)).padStart(2, '0')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Fandriandram-piterahana */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{reportData.section3.title}</h2>
          <table className={styles.simpleTable}>
            <thead>
              <tr>
                <th>Toerana</th>
                <th>Sessions</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {reportData.section3.events.map((event, idx) => (
                <tr key={idx}>
                  <td>{event.zone}</td>
                  <td>{event.sessions}</td>
                  <td>{event.participants}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td>Total</td>
                <td>{reportData.section3.events.reduce((sum, e) => sum + e.sessions, 0)}</td>
                <td>{reportData.section3.events.reduce((sum, e) => sum + e.participants, 0)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section 4: Momba ireo Reny Bevoaka */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{reportData.section4.title}</h2>
          <table className={styles.simpleTable}>
            <thead>
              <tr>
                <th>Toerana</th>
                <th>CPN</th>
                <th>Tests VIH</th>
                <th>Accouchements</th>
              </tr>
            </thead>
            <tbody>
              {reportData.section4.data.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.zone}</td>
                  <td>{row.cpn}</td>
                  <td>{row.hivTests}</td>
                  <td>{row.deliveries}</td>
                </tr>
              ))}
              <tr className={styles.totalRow}>
                <td>Total</td>
                <td>{reportData.section4.data.reduce((sum, r) => sum + r.cpn, 0)}</td>
                <td>{reportData.section4.data.reduce((sum, r) => sum + r.hivTests, 0)}</td>
                <td>{reportData.section4.data.reduce((sum, r) => sum + r.deliveries, 0)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Section 5: Fanentanana natao */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{reportData.section5.title}</h2>
          <table className={styles.simpleTable}>
            <thead>
              <tr>
                <th>Thème</th>
                <th>Lieu</th>
                <th>Date</th>
                <th>Participants</th>
              </tr>
            </thead>
            <tbody>
              {reportData.section5.events.map((event, idx) => (
                <tr key={idx}>
                  <td>{event.theme}</td>
                  <td>{event.location}</td>
                  <td>{event.date}</td>
                  <td>{event.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
  );
};

export default TatitraPreview;
