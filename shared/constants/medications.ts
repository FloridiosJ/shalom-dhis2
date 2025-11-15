// Liste des médicaments couramment utilisés pour l'autocomplete
// Cette liste peut être étendue selon les besoins du terrain

export const COMMON_MEDICATIONS = [
  // Antibiotiques
  "Amoxicilline",
  "Amoxicilline + Acide clavulanique",
  "Azithromycine",
  "Ciprofloxacine",
  "Métronidazole",
  "Doxycycline",
  "Cotrimoxazole (Sulfaméthoxazole + Triméthoprime)",
  "Ceftriaxone",
  "Pénicilline",
  "Érythromycine",
  
  // Antipaludéens
  "Artéméther + Luméfantrine (Coartem)",
  "Artésunate",
  "Quinine",
  "Chloroquine",
  "Primaquine",
  
  // Antipyrétiques / Analgésiques
  "Paracétamol",
  "Ibuprofène",
  "Aspirine",
  "Diclofénac",
  
  // Antihistaminiques
  "Chlorphéniramine",
  "Loratadine",
  "Cétirizine",
  
  // Antitussifs / Expectorants
  "Sirop contre la toux",
  "Bromhexine",
  "Ambroxol",
  
  // Médicaments gastro-intestinaux
  "Oméprazole",
  "Ranitidine",
  "Métoclopramide",
  "Sels de réhydratation orale (SRO)",
  "Lopéramide",
  "Albendazole",
  "Mébendazole",
  
  // Antihypertenseurs
  "Amlodipine",
  "Nifédipine",
  "Énalapril",
  "Hydrochlorothiazide",
  "Méthyldopa",
  
  // Antidiabétiques
  "Metformine",
  "Glibenclamide",
  "Insuline",
  
  // Vitamines et suppléments
  "Acide folique",
  "Fer + Acide folique",
  "Vitamine B complexe",
  "Vitamine C",
  "Vitamine A",
  "Zinc",
  "Multivitamines",
  
  // Soins prénataux
  "Sulfate ferreux",
  "Calcium",
  "Misoprostol",
  "Ocytocine",
  
  // Contraceptifs
  "Pilule contraceptive",
  "Dépo-Provera (injection)",
  "Implant contraceptif",
  
  // Antiseptiques / Topiques
  "Bétadine",
  "Alcool à 70%",
  "Pommade antibiotique",
  "Crème antifongique",
  
  // Autres
  "Prednisolone",
  "Dexaméthasone",
  "Salbutamol",
  "Théophylline",
  "Captopril",
].sort();

// Fréquences d'administration communes
export const COMMON_FREQUENCIES = [
  "1x/jour",
  "2x/jour",
  "3x/jour",
  "4x/jour",
  "Matin",
  "Soir",
  "Matin et soir",
  "Matin, midi et soir",
  "Toutes les 6 heures",
  "Toutes les 8 heures",
  "Toutes les 12 heures",
  "Au besoin",
  "Selon prescription",
];

// Durées de traitement communes
export const COMMON_DURATIONS = [
  "3 jours",
  "5 jours",
  "7 jours",
  "10 jours",
  "14 jours",
  "2 semaines",
  "3 semaines",
  "1 mois",
  "2 mois",
  "3 mois",
  "En continu",
  "Jusqu'à amélioration",
];
