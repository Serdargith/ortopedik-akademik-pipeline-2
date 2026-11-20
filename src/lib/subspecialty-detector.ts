export type OrthopedicSubspecialty =
  | 'trauma'           // Fractures, dislocations, polytrauma
  | 'arthroplasty'     // Hip/knee/shoulder replacement
  | 'spine'            // Cervical, thoracic, lumbar, deformity
  | 'oncology'         // Bone & soft tissue tumors
  | 'sports'           // ACL, meniscus, rotator cuff, cartilage
  | 'pediatric'        // DDH, Perthes, scoliosis, growth plate
  | 'hand'             // Wrist, hand, peripheral nerve
  | 'foot_ankle'       // Hallux, Achilles, flatfoot, Lisfranc
  | 'shoulder_elbow'   // Instability, RCT, tennis elbow
  | 'general';         // Default / unclassified

export interface SubspecialtyProfile {
  domain: OrthopedicSubspecialty;
  label: string;
  targetJournals: string[];
  reportingGuideline: 'STROBE' | 'CONSORT' | 'PRISMA' | 'CARE' | 'TREND';
  meshBooster: string;          // Additional MeSH terms for this domain
  statisticalPriorities: string[]; // Recommended analyses for this domain
  outcomeScales: string[];      // Relevant functional outcome scales
}

const SUBSPECIALTY_KEYWORDS: Record<OrthopedicSubspecialty, string[]> = {
  trauma: ['fracture', 'kırık', 'dislocation', 'polytrauma', 'tibial', 'femoral', 'humerus', 'radius', 'ulna', 'pelvis', 'acetabulum', 'pilon', 'plateau', 'malleolus', 'calcaneus', 'clavicle', 'fixation', 'nail', 'plate', 'external fixator', 'delta frame', 'ORIF', 'IMN', 'nonunion', 'malunion', 'delayed union', 'wound dehiscence', 'compartment syndrome'],
  arthroplasty: ['arthroplasty', 'replacement', 'THA', 'TKA', 'TSA', 'prosthesis', 'implant', 'revision', 'cemented', 'cementless', 'bearing surface', 'polyethylene', 'aseptic loosening', 'periprosthetic', 'PJI', 'dislocation arthroplasty', 'endoprosthesis', 'megaprosthesis'],
  spine: ['spine', 'omurga', 'vertebral', 'lumbar', 'cervical', 'thoracic', 'scoliosis', 'kyphosis', 'lordosis', 'stenosis', 'disc', 'fusion', 'TLIF', 'PLIF', 'ACDF', 'laminectomy', 'laminoplasty', 'corpectomy', 'pedicle screw', 'spondylolisthesis', 'myelopathy', 'radiculopathy', 'cord compression', 'tumor spine'],
  oncology: ['tumor', 'tümör', 'sarcoma', 'osteosarcoma', 'chondrosarcoma', 'Ewing', 'GCT', 'giant cell', 'metastasis', 'malignant', 'benign', 'limb salvage', 'wide resection', 'curettage', 'cementation', 'adjuvant', 'chemotherapy', 'radiation', 'MSTS', 'oncology', 'onkoloji', 'bone tumor', 'soft tissue', 'retroperitoneal'],
  sports: ['ACL', 'PCL', 'MCL', 'LCL', 'meniscus', 'rotator cuff', 'labrum', 'cartilage', 'chondral', 'microfracture', 'OATS', 'MPFL', 'patellar', 'instability', 'athlete', 'return to sport', 'KOOS', 'IKDC', 'ASES', 'Lysholm', 'arthroscopy', 'ligament reconstruction'],
  pediatric: ['pediatric', 'child', 'çocuk', 'DDH', 'developmental dysplasia', 'Perthes', 'SCFE', 'scoliosis', 'adolescent', 'growth plate', 'physeal', 'clubfoot', 'Pavlik', 'Graf', 'ultrasound hip', 'limb length discrepancy', 'Blount', 'osteogenesis imperfecta', 'cerebral palsy', 'neuromuscular'],
  hand: ['hand', 'wrist', 'finger', 'thumb', 'carpal', 'metacarpal', 'phalangeal', 'scaphoid', 'distal radius', 'TFCC', 'CTS', 'carpal tunnel', 'trigger finger', 'Dupuytren', 'tendon', 'nerve repair', 'replantation', 'DASH', 'QuickDASH', 'mallet', 'jersey finger', 'Bennett', 'Rolando'],
  foot_ankle: ['foot', 'ankle', 'Achilles', 'hallux', 'bunion', 'flatfoot', 'pes planus', 'cavus', 'Lisfranc', 'calcaneus', 'hindfoot', 'midfoot', 'forefoot', 'ATFL', 'AOFAS', 'plantar fascia', 'Morton', 'clubfoot adult', 'tibialis posterior', 'peroneal', 'ankle arthroplasty', 'ankle fusion'],
  shoulder_elbow: ['shoulder', 'elbow', 'rotator cuff', 'Bankart', 'Hill-Sachs', 'SLAP', 'biceps', 'AC joint', 'clavicle', 'tennis elbow', 'epicondylitis', 'ulnar collateral', 'cubital tunnel', 'radial head', 'olecranon', 'Constant score', 'OSS', 'Rowe', 'ASES shoulder'],
  general: [],
};

export function detectSubspecialty(text: string): OrthopedicSubspecialty {
  const lower = text.toLowerCase();
  const scores: Record<OrthopedicSubspecialty, number> = {} as Record<OrthopedicSubspecialty, number>;

  for (const [domain, keywords] of Object.entries(SUBSPECIALTY_KEYWORDS) as [OrthopedicSubspecialty, string[]][]) {
    scores[domain] = keywords.filter(kw => lower.includes(kw.toLowerCase())).length;
  }

  const best = (Object.entries(scores) as [OrthopedicSubspecialty, number][])
    .sort((a, b) => b[1] - a[1])[0];

  return best[1] > 0 ? best[0] : 'general';
}

export const SUBSPECIALTY_PROFILES: Record<OrthopedicSubspecialty, SubspecialtyProfile> = {
  trauma: {
    domain: 'trauma',
    label: 'Trauma & Fracture Surgery',
    targetJournals: ['Injury', 'Journal of Orthopaedic Trauma', 'Archives of Orthopaedic and Trauma Surgery', 'European Journal of Orthopaedic Surgery & Traumatology'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Fractures, Bone[MeSH] OR Fracture Fixation[MeSH] OR Fractures, Closed[MeSH]',
    statisticalPriorities: ['complication rates', 'union rate', 'time to union', 'functional scores', 'reoperation rate', 'logistic regression for complications', 'Kaplan-Meier for implant survival'],
    outcomeScales: ['DASH', 'ASES', 'Constant', 'Oxford Shoulder', 'WOMAC', 'SF-36', 'VAS pain', 'AOFAS'],
  },
  arthroplasty: {
    domain: 'arthroplasty',
    label: 'Arthroplasty & Joint Reconstruction',
    targetJournals: ['Journal of Arthroplasty', 'Bone & Joint Journal', 'Journal of Bone and Joint Surgery Am', 'Clinical Orthopaedics and Related Research'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Arthroplasty, Replacement[MeSH] OR Prosthesis Failure[MeSH] OR Periprosthetic Fractures[MeSH]',
    statisticalPriorities: ['implant survival Kaplan-Meier', 'revision rate', 'PJI rate', 'patient-reported outcomes', 'competing risk analysis', 'Cox regression for implant failure'],
    outcomeScales: ['KOOS', 'HOOS', 'Oxford Knee Score', 'Oxford Hip Score', 'WOMAC', 'Harris Hip Score', 'Knee Society Score', 'SF-12'],
  },
  spine: {
    domain: 'spine',
    label: 'Spine Surgery',
    targetJournals: ['Spine', 'European Spine Journal', 'Spine Journal', 'Journal of Neurosurgery: Spine'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Spinal Fusion[MeSH] OR Intervertebral Disc Degeneration[MeSH] OR Spinal Stenosis[MeSH]',
    statisticalPriorities: ['neurological improvement rates', 'fusion rate', 'subsidence', 'alignment parameters', 'EQ-5D', 'ordinal logistic regression for mJOA', 'propensity score matching'],
    outcomeScales: ['VAS', 'ODI', 'NDI', 'mJOA', 'SF-36', 'EQ-5D', 'Nurick', 'Frankel'],
  },
  oncology: {
    domain: 'oncology',
    label: 'Orthopedic Oncology',
    targetJournals: ['Journal of Bone Oncology', 'Cancer', 'Bone', 'Sarcoma', 'Annals of Surgical Oncology', 'Clinical Orthopaedics and Related Research'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Bone Neoplasms[MeSH] OR Soft Tissue Neoplasms[MeSH] OR Sarcoma[MeSH] OR Limb Salvage[MeSH]',
    statisticalPriorities: ['overall survival Kaplan-Meier', 'disease-free survival', 'local recurrence rate', 'limb salvage rate', 'MSTS score', 'Cox proportional hazards', 'competing risk for cancer-specific mortality'],
    outcomeScales: ['MSTS', 'TESS', 'SF-36', 'VAS', 'ECOG Performance Status'],
  },
  sports: {
    domain: 'sports',
    label: 'Sports Medicine & Arthroscopy',
    targetJournals: ['American Journal of Sports Medicine', 'Arthroscopy', 'Knee Surgery Sports Traumatology Arthroscopy', 'Orthopaedic Journal of Sports Medicine'],
    reportingGuideline: 'CONSORT',
    meshBooster: 'Anterior Cruciate Ligament Reconstruction[MeSH] OR Knee Injuries[MeSH] OR Athletic Injuries[MeSH]',
    statisticalPriorities: ['return-to-sport rate', 'graft failure rate', 'functional score improvement', 'time-to-event analysis', 'mixed ANOVA for repeated measures', 'minimal clinically important difference (MCID)'],
    outcomeScales: ['KOOS', 'IKDC', 'Lysholm', 'ASES', 'ASES Shoulder', 'Rowe', 'VAS', 'Tegner Activity Scale'],
  },
  pediatric: {
    domain: 'pediatric',
    label: 'Pediatric Orthopedics',
    targetJournals: ['Journal of Pediatric Orthopedics', 'Journal of Children\'s Orthopaedics', 'JPO-B'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Developmental Dysplasia of the Hip[MeSH] OR Scoliosis[MeSH] OR Bone Diseases, Developmental[MeSH]',
    statisticalPriorities: ['radiographic outcomes', 'reintervention rate', 'growth impact', 'inter-rater reliability (Kappa/ICC)', 'ROC curve for diagnostic thresholds'],
    outcomeScales: ['Graf classification', 'Catterall', 'Tönnis', 'SRS-22', 'PODCI', 'CPCHILD'],
  },
  hand: {
    domain: 'hand',
    label: 'Hand Surgery & Upper Extremity',
    targetJournals: ['Journal of Hand Surgery Am', 'Journal of Hand Surgery Eur', 'Hand', 'Plastic and Reconstructive Surgery'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Hand Injuries[MeSH] OR Wrist Injuries[MeSH] OR Carpal Tunnel Syndrome[MeSH] OR Tendon Injuries[MeSH]',
    statisticalPriorities: ['range of motion', 'grip strength', 'functional score', 'nerve conduction', 'VAS pain', 'MCID calculation', 'paired t-test / Wilcoxon'],
    outcomeScales: ['DASH', 'QuickDASH', 'PRWE', 'MHQ', 'VAS', 'Disabilities of the Arm Shoulder Hand'],
  },
  foot_ankle: {
    domain: 'foot_ankle',
    label: 'Foot & Ankle Surgery',
    targetJournals: ['Foot & Ankle International', 'Foot and Ankle Surgery', 'Journal of Foot and Ankle Research'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Foot Diseases[MeSH] OR Ankle Injuries[MeSH] OR Achilles Tendon[MeSH] OR Hallux Valgus[MeSH]',
    statisticalPriorities: ['functional outcome scores', 'radiographic angles', 'complication rates', 'reoperation', 'VAS', 'paired analysis for pre-post'],
    outcomeScales: ['AOFAS', 'Manchester-Oxford', 'FAOS', 'FAAM', 'VISA-A', 'VAS pain'],
  },
  shoulder_elbow: {
    domain: 'shoulder_elbow',
    label: 'Shoulder & Elbow Surgery',
    targetJournals: ['Journal of Shoulder and Elbow Surgery', 'JSES International', 'Knee Surgery Sports Traumatology Arthroscopy'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Rotator Cuff[MeSH] OR Shoulder Joint[MeSH] OR Elbow Joint[MeSH] OR Shoulder Dislocation[MeSH]',
    statisticalPriorities: ['re-tear rate', 'recurrence rate', 'functional score improvement', 'return to activity', 'ROM', 'strength testing', 'survival analysis'],
    outcomeScales: ['ASES', 'Constant-Murley', 'OSS', 'WOSI', 'Rowe', 'PROM', 'Oxford Shoulder', 'MEPS'],
  },
  general: {
    domain: 'general',
    label: 'Orthopedics & Traumatology (General)',
    targetJournals: ['Acta Orthopaedica', 'International Orthopaedics', 'Archives of Orthopaedic and Trauma Surgery'],
    reportingGuideline: 'STROBE',
    meshBooster: 'Orthopedic Procedures[MeSH] OR Musculoskeletal Diseases[MeSH]',
    statisticalPriorities: ['descriptive epidemiology', 'complication rates', 'logistic regression', 'survival analysis'],
    outcomeScales: ['VAS', 'SF-36', 'EQ-5D'],
  },
};

/**
 * Build a MeSH-enriched PubMed query for the detected subspecialty.
 */
export function buildMeshQuery(topic: string, subspecialty: OrthopedicSubspecialty): string {
  const booster = SUBSPECIALTY_PROFILES[subspecialty].meshBooster;
  return `(${topic}[Title/Abstract]) AND (${booster}) AND (orthopedic[Title/Abstract] OR surgery[Title/Abstract] OR surgical[Title/Abstract])`;
}
