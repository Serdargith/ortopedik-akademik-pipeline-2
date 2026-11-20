import { OrthopedicSubspecialty, buildMeshQuery } from './subspecialty-detector';

const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const PUBMED_TOOL = 'OrthopedicAcademicPipeline';
const PUBMED_EMAIL = 'research@orthopedic-pipeline.ai';

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];           // ["Smith J", "Doe A", ...]
  journal: string;
  year: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  abstract: string;
  meshTerms: string[];
  publicationTypes: string[];  // ["Journal Article", "Randomized Controlled Trial", ...]
  citationVancouver: string;   // Pre-formatted Vancouver citation
  citationAPA: string;         // Pre-formatted APA 7th citation
}

/**
 * Search PubMed and return full article records with formatted citations.
 * Uses ESearch → EFetch pipeline.
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 30,
  filters?: {
    dateFrom?: string;          // "2015/01/01"
    dateTo?: string;            // "2024/12/31"
    publicationTypes?: string[]; // ["Randomized Controlled Trial", "Meta-Analysis"]
    languages?: string[];        // ["English"]
    journals?: string[];         // ["J Bone Joint Surg Am", "Clin Orthop Relat Res"]
  }
): Promise<PubMedArticle[]> {

  // Step 1: ESearch — get PMIDs
  const searchQuery = buildPubMedQuery(query, filters);
  const searchUrl = new URL(`${PUBMED_BASE}/esearch.fcgi`);
  searchUrl.searchParams.set('db', 'pubmed');
  searchUrl.searchParams.set('term', searchQuery);
  searchUrl.searchParams.set('retmax', String(maxResults));
  searchUrl.searchParams.set('retmode', 'json');
  searchUrl.searchParams.set('sort', 'relevance');
  searchUrl.searchParams.set('tool', PUBMED_TOOL);
  searchUrl.searchParams.set('email', PUBMED_EMAIL);
  if (filters?.dateFrom || filters?.dateTo) {
    searchUrl.searchParams.set('datetype', 'pdat');
    if (filters.dateFrom) searchUrl.searchParams.set('mindate', filters.dateFrom);
    if (filters.dateTo) searchUrl.searchParams.set('maxdate', filters.dateTo);
  }

  const searchResp = await fetch(searchUrl.toString());
  const searchData = await searchResp.json();
  const pmids: string[] = searchData.esearchresult?.idlist ?? [];

  if (pmids.length === 0) return [];

  // Step 2: EFetch — get full records in XML
  const fetchUrl = new URL(`${PUBMED_BASE}/efetch.fcgi`);
  fetchUrl.searchParams.set('db', 'pubmed');
  fetchUrl.searchParams.set('id', pmids.join(','));
  fetchUrl.searchParams.set('retmode', 'xml');
  fetchUrl.searchParams.set('rettype', 'abstract');
  fetchUrl.searchParams.set('tool', PUBMED_TOOL);
  fetchUrl.searchParams.set('email', PUBMED_EMAIL);

  const fetchResp = await fetch(fetchUrl.toString());
  const xmlText = await fetchResp.text();

  // Step 3: Parse XML → PubMedArticle[]
  return parsePubMedXML(xmlText);
}

/**
 * Build structured PubMed query with MeSH terms and filters.
 */
function buildPubMedQuery(
  userQuery: string,
  filters?: any
): string {
  let query = userQuery;

  // Add publication type filters
  if (filters?.publicationTypes?.length) {
    const ptFilters = filters.publicationTypes
      .map((pt: string) => `"${pt}"[Publication Type]`)
      .join(' OR ');
    query += ` AND (${ptFilters})`;
  }

  // Add language filter
  if (filters?.languages?.length) {
    const langFilters = filters.languages
      .map((lang: string) => `${lang}[Language]`)
      .join(' OR ');
    query += ` AND (${langFilters})`;
  }

  // Add journal filter
  if (filters?.journals?.length) {
    const journalFilters = filters.journals
      .map((j: string) => `"${j}"[Journal]`)
      .join(' OR ');
    query += ` AND (${journalFilters})`;
  }

  return query;
}

/**
 * Parse PubMed XML response into structured article records.
 * Uses regex-based parsing (no xml2js dependency for lightweight builds).
 */
function parsePubMedXML(xml: string): PubMedArticle[] {
  const articles: PubMedArticle[] = [];
  const articleMatches = xml.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g) ?? [];

  for (const articleXml of articleMatches) {
    try {
      const pmid = extractFirst(articleXml, /<PMID[^>]*>(.*?)<\/PMID>/);
      const title = cleanText(extractFirst(articleXml, /<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/));
      const abstract = cleanText(extractFirst(articleXml, /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/));
      const journal = extractFirst(articleXml, /<Title>(.*?)<\/Title>/);
      const year = extractFirst(articleXml, /<PubDate>[\s\S]*?<Year>(.*?)<\/Year>/);
      const volume = extractFirst(articleXml, /<Volume>(.*?)<\/Volume>/);
      const issue = extractFirst(articleXml, /<Issue>(.*?)<\/Issue>/);
      const pages = extractFirst(articleXml, /<MedlinePgn>(.*?)<\/MedlinePgn>/);
      const doi = extractFirst(articleXml, /<ArticleId IdType="doi">(.*?)<\/ArticleId>/);

      // Authors
      const authorMatches = articleXml.matchAll(/<Author[^>]*>[\s\S]*?<LastName>(.*?)<\/LastName>[\s\S]*?(?:<ForeName>(.*?)<\/ForeName>|<Initials>(.*?)<\/Initials>)[\s\S]*?<\/Author>/g);
      const authors: string[] = [];
      for (const m of authorMatches) {
        const last = m[1] ?? '';
        const initials = (m[3] ?? (m[2] ?? '').split(' ').map(n => n[0]).join('')).replace(/\s/g, '');
        if (last) authors.push(`${last} ${initials}`.trim());
      }

      // MeSH terms
      const meshMatches = articleXml.matchAll(/<DescriptorName[^>]*>(.*?)<\/DescriptorName>/g);
      const meshTerms = [...meshMatches].map(m => m[1]);

      // Publication types
      const ptMatches = articleXml.matchAll(/<PublicationType[^>]*>(.*?)<\/PublicationType>/g);
      const publicationTypes = [...ptMatches].map(m => m[1]);

      // Format citations
      const citationVancouver = formatVancouver({ authors, title, journal, year, volume, issue, pages, doi, pmid });
      const citationAPA = formatAPA({ authors, title, journal, year, volume, issue, pages, doi });

      articles.push({
        pmid, title, authors, journal, year, volume, issue,
        pages, doi, abstract, meshTerms, publicationTypes,
        citationVancouver, citationAPA,
      });
    } catch {
      // Skip malformed entries silently
    }
  }

  return articles;
}

function extractFirst(text: string, pattern: RegExp): string {
  return (text.match(pattern)?.[1] ?? '').trim();
}

function cleanText(text: string): string {
  return text.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}

/**
 * Format Vancouver citation (ICMJE style).
 * Example: Smith J, Doe A. Title. J Bone Joint Surg Am. 2022;104(3):210-8. doi:10.xxxx
 */
function formatVancouver(a: Partial<PubMedArticle>): string {
  const authors = (a.authors ?? []).slice(0, 6).join(', ') + ((a.authors ?? []).length > 6 ? ', et al' : '');
  const parts = [
    authors,
    a.title ? `${a.title}.` : '',
    a.journal ? `${a.journal}.` : '',
    [a.year, a.volume ? `${a.volume}` : '', a.issue ? `(${a.issue})` : '', a.pages ? `:${a.pages}` : ''].filter(Boolean).join(''),
    a.doi ? `doi:${a.doi}` : (a.pmid ? `PMID:${a.pmid}` : ''),
  ].filter(Boolean);
  return parts.join(' ');
}

/**
 * Format APA 7th edition citation.
 * Example: Smith, J., & Doe, A. (2022). Title. Journal Name, 104(3), 210–218.
 */
function formatAPA(a: Partial<PubMedArticle>): string {
  const formatAuthorAPA = (raw: string) => {
    const [last, initials] = raw.split(' ');
    return `${last}, ${(initials ?? '').split('').join('. ')}${initials ? '.' : ''}`;
  };
  const authors = (a.authors ?? []).map(formatAuthorAPA);
  const authorStr = authors.length > 1
    ? authors.slice(0, -1).join(', ') + ', & ' + authors[authors.length - 1]
    : (authors[0] ?? '');
  const vol = a.volume ? (a.issue ? `${a.volume}(${a.issue})` : a.volume) : '';
  return `${authorStr} (${a.year ?? 'n.d.'}). ${a.title} ${a.journal}${vol ? `, ${vol}` : ''}${a.pages ? `, ${a.pages}` : ''}.${a.doi ? ` https://doi.org/${a.doi}` : ''}`;
}


// ─── Scopus Search API (optional — requires institutional key) ───────────────

export interface ScopusArticle {
  scopusId: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  volume: string;
  doi: string;
  citedByCount: number;
  openAccess: boolean;
  abstractUrl: string;
  citationVancouver: string;
}

/**
 * Search Scopus via Search API.
 * Requires SCOPUS_API_KEY in environment.
 * Falls back gracefully if key is absent.
 */
export async function searchScopus(
  query: string,
  maxResults: number = 25,
  options?: { startYear?: number; endYear?: number; subjectArea?: string }
): Promise<ScopusArticle[]> {
  const apiKey = (import.meta as any).env?.VITE_SCOPUS_API_KEY;
  if (!apiKey) {
    console.warn('[literature-engine] VITE_SCOPUS_API_KEY not set — skipping Scopus search');
    return [];
  }

  let scopusQuery = `TITLE-ABS-KEY(${query})`;
  if (options?.startYear || options?.endYear) {
    const from = options.startYear ?? 2000;
    const to = options.endYear ?? new Date().getFullYear();
    scopusQuery += ` AND PUBYEAR > ${from - 1} AND PUBYEAR < ${to + 1}`;
  }
  if (options?.subjectArea) {
    scopusQuery += ` AND SUBJAREA(${options.subjectArea})`;
  }

  const url = new URL('https://api.elsevier.com/content/search/scopus');
  url.searchParams.set('query', scopusQuery);
  url.searchParams.set('count', String(maxResults));
  url.searchParams.set('sort', 'citedby-count');
  url.searchParams.set('field', 'dc:identifier,dc:title,dc:creator,prism:publicationName,prism:coverDate,prism:volume,prism:doi,citedby-count,openaccess,prism:url');

  const resp = await fetch(url.toString(), {
    headers: {
      'X-ELS-APIKey': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!resp.ok) return [];

  const data = await resp.json();
  const entries = data['search-results']?.entry ?? [];

  return entries.map((e: Record<string, any>) => {
    const authors = String(e['dc:creator'] ?? '');
    const title = String(e['dc:title'] ?? '');
    const journal = String(e['prism:publicationName'] ?? '');
    const year = String(e['prism:coverDate'] ?? '').substring(0, 4);
    const volume = String(e['prism:volume'] ?? '');
    const doi = String(e['prism:doi'] ?? '');
    const citedByCount = Number(e['citedby-count'] ?? 0);
    const openAccess = Boolean(e['openaccess']);
    const abstractUrl = String(e['prism:url'] ?? '');
    const scopusId = String(e['dc:identifier'] ?? '').replace('SCOPUS_ID:', '');
    const citationVancouver = `${authors}. ${title}. ${journal}. ${year};${volume}. doi:${doi}`;

    return { scopusId, title, authors, journal, year, volume, doi, citedByCount, openAccess, abstractUrl, citationVancouver };
  });
}


// ─── Combined Literature Search for Pipeline Steps 10–12 ────────────────────

export interface LiteratureBundle {
  pubmedArticles: PubMedArticle[];
  scopusArticles: ScopusArticle[];
  meshTermsUsed: string[];
  totalFound: number;
  searchStrategy: string;  // Human-readable search string for Methods section
  retrievedAt: string;
}

/**
 * Main function called by pipeline Steps 10, 11, 12.
 * Accepts topic + subspecialty and returns combined literature bundle.
 */
export async function fetchLiteratureBundle(
  topic: string,
  subspecialty: OrthopedicSubspecialty,
  options?: {
    maxPubMed?: number;
    maxScopus?: number;
    yearFrom?: number;
    yearTo?: number;
    studyDesignFilter?: 'RCT' | 'META' | 'COHORT' | 'ANY';
  }
): Promise<LiteratureBundle> {

  const meshTerms = buildMeshQuery(topic, subspecialty);
  const yearFrom = options?.yearFrom ?? (new Date().getFullYear() - 10);
  const yearTo = options?.yearTo ?? new Date().getFullYear();

  // Map study design filter to PubMed publication types
  const pubTypes: string[] = [];
  if (options?.studyDesignFilter === 'RCT') pubTypes.push('Randomized Controlled Trial');
  if (options?.studyDesignFilter === 'META') pubTypes.push('Meta-Analysis', 'Systematic Review');
  if (options?.studyDesignFilter === 'COHORT') pubTypes.push('Observational Study', 'Journal Article');

  const [pubmedArticles, scopusArticles] = await Promise.all([
    searchPubMed(meshTerms, options?.maxPubMed ?? 30, {
      dateFrom: `${yearFrom}/01/01`,
      dateTo: `${yearTo}/12/31`,
      publicationTypes: pubTypes.length ? pubTypes : undefined,
      languages: ['English'],
    }),
    searchScopus(topic, options?.maxScopus ?? 20, {
      startYear: yearFrom,
      endYear: yearTo,
      subjectArea: 'MEDI',
    }),
  ]);

  const searchStrategy = `PubMed search: (${meshTerms}) filtered to ${yearFrom}–${yearTo}, English language${pubTypes.length ? `, publication types: ${pubTypes.join(', ')}` : ''}. Scopus search: TITLE-ABS-KEY(${topic}), SUBJAREA(MEDI), years ${yearFrom}–${yearTo}.`;

  return {
    pubmedArticles,
    scopusArticles,
    meshTermsUsed: meshTerms.split(' AND ').map(t => t.replace(/[\[\]"]/g, '').trim()),
    totalFound: pubmedArticles.length + scopusArticles.length,
    searchStrategy,
    retrievedAt: new Date().toISOString(),
  };
}
