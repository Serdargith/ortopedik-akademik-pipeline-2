import { Step } from './types';

export const STEPS: Step[] = [
  { id: 1, name: 'Data Understanding', phase: 'A', phaseColor: '#10b981' },
  { id: 2, name: 'Data Cleaning', phase: 'A', phaseColor: '#10b981' },
  { id: 3, name: 'Study Design Inference', phase: 'A', phaseColor: '#10b981' },
  { id: 4, name: 'Descriptive Analysis (Table 1)', phase: 'B', phaseColor: '#3b82f6' },
  { id: 5, name: 'Univariate Analysis (Table 2)', phase: 'B', phaseColor: '#3b82f6' },
  { id: 6, name: 'Multivariable Analysis (Table 3)', phase: 'B', phaseColor: '#3b82f6' },
  { id: 7, name: 'Model Diagnostics', phase: 'B', phaseColor: '#3b82f6' },
  { id: 8, name: 'Advanced Analysis', phase: 'B', phaseColor: '#3b82f6' },
  { id: 9, name: 'Results Output', phase: 'B', phaseColor: '#3b82f6' },
  { id: 10, name: 'Gap Analysis (Real Lit)', phase: 'C', phaseColor: '#8b5cf6' },
  { id: 11, name: 'Literature Synthesis', phase: 'C', phaseColor: '#8b5cf6' },
  { id: 12, name: 'Introduction Writing', phase: 'C', phaseColor: '#8b5cf6' },
  { id: 13, name: 'Methods Writing', phase: 'C', phaseColor: '#8b5cf6' },
  { id: 14, name: 'Results Writing', phase: 'D', phaseColor: '#f59e0b' },
  { id: 15, name: 'Discussion Writing', phase: 'D', phaseColor: '#f59e0b' },
  { id: 16, name: 'Limitations', phase: 'D', phaseColor: '#f59e0b' },
  { id: 17, name: 'Conclusion', phase: 'D', phaseColor: '#f59e0b' },
  { id: 18, name: 'Abstract', phase: 'D', phaseColor: '#f59e0b' },
  { id: 19, name: 'Reviewer Simulation', phase: 'E', phaseColor: '#ef4444' },
  { id: 20, name: 'Final Check', phase: 'E', phaseColor: '#ef4444' },
];

export const DATA_CONTEXT = `
DATASET: Cartilage-Origin Tumors According to WHO 2020 Classification
Total patients: 914 | Number of variables: 45
Benign: 852 (93.2%) | Malignant (Chondrosarcoma): 62 (6.8%)
Diagnoses: Osteochondroma=457, Enchondroma=392, Chondrosarcoma=62, Chondroblastoma=3

DEMOGRAPHICS:
- Age: mean=36.6±19.9 years, median=38, range 0-88
- Gender: Female=501 (54.8%), Male=413 (45.2%)
- Benign age: median=38 (IQR: 17-51)
- Malignant age: median=44 (IQR: 29-56), Mann-Whitney p=0.034, z=-2.11

LOCATION:
- Femur=226, Knee=99, Humerus=79, Hand=76, Tibia=69, Shoulder=60, Vertebra(L)=31
- Lower Extremity: Benign=552 (64.8%) Malignant=38 (61.3%)
- Upper Extremity: Benign=259 (30.4%) Malignant=17 (27.4%)
- Vertebra: Benign=31 (3.6%) Malignant=5 (8.1%), OR=2.32
- Pelvis: Benign=10 (1.2) Malignant=2 (3.2%), OR=2.81

IMAGING and DIAGNOSIS:
- CT: Benign=39.3% Malignant=45.2% OR=1.27 p=0.662
- PET-CT: Benign=6.6% Malignant=22.6% OR=4.15 p<0.001
- MRI: Benign=6.5% Malignant=17.7% OR=3.13 p<0.001
- Biopsy: Benign=6.9% Malignant=19.4% OR=3.23 p<0.001
- Suspicion of Malignancy: Sensitivity=100% Specificity=46.7% PPV=12.0% (chi2=51.3 p<0.001)

LESION SIZE:
- Benign: n=504 median=35mm | Malignant: n=42 median=38mm, p=0.888

IMAGING FEATURES (high missing rate):
- Contrast enhancement: present in 66 patients (all MRI performed)
- Soft tissue extension: Benign=23 Malignant=2 (missing=95.2%)
- Bone invasion: Benign=28 Malignant=1 (missing=88.6%)
- Calcification: present in 60 patients
- PET SUVmax: n=11, median=5.9 (missing=98.8%)

GENDER x MALIGNANCY: OR=1.00 p=1.000 (no difference)
SIDE: Right=50.7% Left=46.8% Bilateral=2.5% (malignancy rates similar)

MISSINGNESS ANALYSIS:
- Lesion length: 40.3% missing
- Lesion width: 49.5% missing
- Contrast_Enhancement_MRI: 91.1% missing
- Soft tissue extension: 95.2% missing
- Bone invasion: 88.6% missing
- PET SUVmax: 98.8% missing
- Primary/Metastatic: 93.2% missing (only recorded for malignant cases)
`;

export const STEP_PROMPTS = [
  // Step 1
  `Expert {SUBSPECIALTY_LABEL} data engineer. Step 1/20.
Task: Data understanding report.
1. Classify variables (cat, cont, ord, dt).
2. Identify outcome (scales: {OUTCOME_SCALES}), exposure, confounders.
3. Report sample size/structure.
4. Detect missingness, outliers, errors, implausible clinical values.
Output: Structured markdown tables.`,

  // Step 2
  `Expert {SUBSPECIALTY_LABEL} data engineer. Step 2/20.
Task: Data cleaning report.
1. Report missingness (%) per variable in a table.
2. Detect outliers using IQR for continuous variables.
3. Recommend handling strategy (Complete case vs. imputation) based on MCAR/MAR/MNAR.
4. Flag clinically implausible values ({OUTCOME_SCALES}).
5. If missing data > 5%, recommend sensitivity analysis.
Output: Structured report with tables.`,

  // Step 3
  `Expert {SUBSPECIALTY_LABEL} research methodologist. Step 3/20.
Task: Infer study design and framework.
1. Infer study type (cohort, case-control, RCT, etc.).
2. Select guideline: {REPORTING_GUIDELINE}.
3. Define PICO (Population, Intervention, Comparator, Outcomes).
4. State primary hypothesis with direction.
5. List recommended statistical analyses: {STATISTICAL_PRIORITIES}.
Output: Structured PICO + study design recommendation.`,

  // Step 4
  `Expert {SUBSPECIALTY_LABEL} biostatistician. Step 4/20.
Task: Descriptive analysis and Table 1 (Baseline Characteristics).
1. Continuous: mean ± SD or median [IQR]. Include range for {OUTCOME_SCALES}.
2. Categorical: n (%).
3. Table 1: Variable | Total (n=XX) | Group A (n=XX) | Group B (n=XX) | p-value.
4. Tests: t-test/Mann-Whitney/Chi-square/Fisher.
5. Include ALL variables; flag >5% missing.
Output: Publication-ready Table 1.`,

  // Step 5
  `Expert {SUBSPECIALTY_LABEL} biostatistician. Step 5/20.
Task: Univariate analysis for each predictor vs. outcome.
1. Continuous vs. binary: logistic regression → OR (95% CI), p.
2. Continuous vs. continuous: Pearson/Spearman r, p.
3. Time-to-event: univariate Cox → HR (95% CI), p.
4. Report effect sizes (Cohen's d, Cliff's delta, Cramér's V).
5. Use p < 0.10 threshold for multivariable inclusion.
Output: Table 2 with clinical interpretation.`,

  // Step 6
  `Expert {SUBSPECIALTY_LABEL} biostatistician. Step 6/20.
Task: Build and report multivariable model.
Priorities: {STATISTICAL_PRIORITIES}
1. Model: Binary (logistic, OR+CI), Continuous (linear, β+CI+R²), Time-to-event (Cox, HR+CI).
2. Selection: enter all p<0.10 from univariate; backward elimination or LASSO if n<10 EPV.
3. Report EPV, AUC/C-index/R², and adjusted vs. unadjusted estimates.
Output: Table 3 (Variable | Unadjusted OR | Adjusted OR | p-value).`,

  // Step 7
  `Expert {SUBSPECIALTY_LABEL} biostatistician. Step 7/20.
Task: Model diagnostics.
1. Check multicollinearity (VIF).
2. Assess goodness-of-fit (Hosmer-Lemeshow).
3. Check residuals and influential points.
4. Validate assumptions for model type.`,

  // Step 8
  `Expert {SUBSPECIALTY_LABEL} biostatistician. Step 8/20.
Task: Advanced analyses.
Priorities: {STATISTICAL_PRIORITIES}
Perform ONLY what is applicable:
1. Survival analysis (KM + log-rank) if time-to-event.
2. Subgroup analyses with interaction tests.
3. Sensitivity analysis (complete case vs. imputed).
4. Propensity score matching if observational treatment comparison.
5. MCID assessment for {OUTCOME_SCALES}.
6. Competing risk (Fine-Gray) for arthroplasty/oncology.
7. Mixed-effects models for repeated measures.
8. Inter-rater reliability (ICC/Kappa).`,

  // Step 9
  `Expert {SUBSPECIALTY_LABEL} biostatistician. Step 9/20.
Task: Compile tables and suggest figures.
1. Finalize Tables 1, 2, and 3.
2. Suggest 2-3 key figures (KM curves, Forest plots, Correlation plots).
3. Summary of statistical findings.`,

  // Step 10
  `Expert {SUBSPECIALTY_LABEL} research methodologist. Step 10/20.
Literature: {LITERATURE_BUNDLE_JSON}
Task: Critical gap analysis using real literature.
1. Known: Synthesize findings and effect sizes (OR, HR, RR, CI) from retrieved papers.
2. Controversial: Conflicting evidence or methodological disputes.
3. Gap: Specific question not answered by retrieved literature.
4. How this study fills the gap.
Rule: Cite ONLY from retrieved bundle as (Author et al., Year; PMID).`,

  // Step 11
  `Expert {SUBSPECIALTY_LABEL} systematic reviewer. Step 11/20.
Literature: {LITERATURE_BUNDLE_JSON}
Task: Thematic narrative synthesis.
1. Themes: Epidemiology, current approaches, outcomes/complications, risk factors, controversies.
2. Cite from bundle (Author et al., Year; PMID). Include effect sizes.
3. Narrative synthesis with inline citations.
4. Full citation list in Vancouver format.
5. Identify top 20 relevant articles.`,

  // Step 12
  `Expert {SUBSPECIALTY_LABEL} medical writer. Step 12/20.
Journal: {TARGET_JOURNAL}. Guideline: {REPORTING_GUIDELINE}.
Task: Write Introduction (400-600 words).
1. Hook: Epidemiological significance with citation.
2. Clinical Problem: Define condition/outcome for {SUBSPECIALTY_LABEL}.
3. Existing Evidence: Synthesize from bundle with effect sizes.
4. Knowledge Gap: Specific gap confirmed by literature.
5. Aim: "The aim of this study was to..."
Rule: Cite ONLY from retrieved bundle with PMID.`,

  // Step 13
  `Expert {SUBSPECIALTY_LABEL} research methodologist. Step 13/20.
Guideline: {REPORTING_GUIDELINE}. Checklist: {REPORTING_CHECKLIST_ITEMS}
Task: Write Methods (700-1000 words).
1. Design: Type, period, setting, ethics statement.
2. Participants: Inclusion/exclusion criteria.
3. Variables: Outcome ({OUTCOME_SCALES}), covariates.
4. Data Sources: Registry, medical records, imaging.
5. Statistics: Sample size, methods ({STATISTICAL_PRIORITIES}), software.
Rule: Past tense. Address checklist items.`,

  // Step 14
  `Expert {SUBSPECIALTY_LABEL} medical writer. Step 14/20.
Task: Write Results (800-1200 words).
1. No interpretation. Report findings only.
2. Patient flow (Table 1).
3. Primary outcome (effect size, CI, p).
4. Secondary outcomes.
5. Multivariable analysis (Table 3).
6. Advanced/sensitivity analyses.
Rule: Every claim must have a number. Reference tables/figures.`,

  // Step 15
  `Expert {SUBSPECIALTY_LABEL} medical writer. Step 15/20.
Literature: {LITERATURE_BUNDLE_SUMMARY}
Task: Write Discussion (1000-1500 words).
1. Key Findings: Start with most important result + effect size.
2. Comparison: Compare with bundle citations (Author et al., Year; PMID) including effect sizes.
3. Mechanism: Pathophysiological reasoning for {SUBSPECIALTY_LABEL}.
4. Clinical Relevance: Practice change implications, MCID context ({OUTCOME_SCALES}).
5. Opposing Evidence: Acknowledge contradictory findings.
Rule: Cite ONLY from retrieved bundle (15-20 real citations).`,

  // Step 16
  `Expert {SUBSPECIALTY_LABEL} research methodologist. Step 16/20.
Task: Write Limitations.
1. Design limitations.
2. Data quality/missingness.
3. Sample size/power.
4. Selection bias.
5. Generalizability.
Specify mitigation or context for each.`,

  // Step 17
  `Expert {SUBSPECIALTY_LABEL} medical writer. Step 17/20.
Task: Write Conclusion (max 150 words).
1. Restate primary finding with effect size.
2. Clinical implication.
3. Future directions.
Start with "In this study,".`,

  // Step 18
  `Expert {SUBSPECIALTY_LABEL} medical writer. Step 18/20.
Journal: {TARGET_JOURNAL}. Guideline: {REPORTING_GUIDELINE}.
Task: Write structured abstract (250-300 words).
Background, Methods, Results, Conclusion.
Rule: Report exact numbers + effect sizes ({OUTCOME_SCALES}). Past tense.`,

  // Step 19
  `Senior reviewer for {TARGET_JOURNALS_FOR_SUBSPECIALTY}. Step 19/20.
Task: Peer review.
1. Assessment: Summary, contribution, recommendation (Accept/Minor/Major/Reject).
2. Major Concerns: Design, stats ({STATISTICAL_PRIORITIES}), overinterpretation.
3. Minor Concerns.
4. Strengths.
5. Questions for Authors.
Check: {REPORTING_GUIDELINE}, {OUTCOME_SCALES}, MCID.`,

  // Step 20
  `Senior editorial assistant. Step 20/20.
Task: Final quality check.
1. {REPORTING_GUIDELINE} compliance.
2. Effect sizes + 95% CI for all results.
3. Internal consistency (text vs tables).
4. Reference quality (PMIDs provided).
5. Subspecialty standards ({OUTCOME_SCALES}, MCID).
6. Clinical relevance.
7. Language/tone.
Output: PASS/FAIL per item + corrective action. Recommendation.`
];
