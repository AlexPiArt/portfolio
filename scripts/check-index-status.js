require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const { google } = require('googleapis');

const SITE_URL = 'https://alexpi.art/';
const URLS_TO_CHECK = [
    'https://alexpi.art/',
    'https://alexpi.art/about.html',
    'https://alexpi.art/marvel-rivals.html',
    'https://alexpi.art/dead-space.html',
    'https://alexpi.art/secret-level.html',
    'https://alexpi.art/ss-rajamouli-teaser.html',
    'https://alexpi.art/lak.html'
];

async function fetchSitemapUrls() {
    try {
        const response = await fetch(`${SITE_URL}sitemap.xml`);
        if (!response.ok) return [];
        const xml = await response.text();
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xml);
        if (result.urlset && result.urlset.url) {
            return result.urlset.url.map(u => u.loc[0]);
        }
    } catch (error) {
        console.error("Error fetching sitemap:", error.message);
    }
    return [];
}

async function runTechnicalCheck(url, sitemapUrls) {
    const result = {
        httpStatus: 'ERROR',
        hasNoIndex: false,
        canonical: 'NONE',
        inSitemap: sitemapUrls.includes(url),
        inRobotsTxt: true
    };
    try {
        const res = await fetch(url);
        result.httpStatus = res.status;
        if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            const robotsMeta = $('meta[name="robots"]').attr('content');
            if (robotsMeta && robotsMeta.toLowerCase().includes('noindex')) {
                result.hasNoIndex = true;
            }
            const canonicalLink = $('link[rel="canonical"]').attr('href');
            if (canonicalLink) {
                result.canonical = canonicalLink;
            }
        }
    } catch (e) {
        console.error(`Error checking ${url}:`, e.message);
    }
    return result;
}

async function getGoogleAuth() {
    let auth = null;
    try {
        if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GSC_CLIENT_EMAIL) {
            return null; // Explicitly fail if no obvious credentials exist
        }
        
        // Standard google-auth-library behavior: uses GOOGLE_APPLICATION_CREDENTIALS automatically
        // If provided via raw env vars (e.g. GitHub secrets JSON string), we can parse it:
        if (process.env.GSC_CREDENTIALS_JSON) {
            const keys = JSON.parse(process.env.GSC_CREDENTIALS_JSON);
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: keys.client_email,
                    private_key: keys.private_key,
                },
                scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
            });
        } else {
            auth = new google.auth.GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
            });
        }
        
        await auth.getClient(); // test auth
        return auth;
    } catch (e) {
        console.error("Google Auth failed:", e.message);
        return null;
    }
}

async function runGoogleInspection(url, auth) {
    if (!auth) return { verdict: 'SKIP (No Auth)', coverageState: 'N/A' };
    
    const searchconsole = google.searchconsole({ version: 'v1', auth });
    try {
        const response = await searchconsole.urlInspection.index.inspect({
            requestBody: {
                inspectionUrl: url,
                siteUrl: SITE_URL,
                languageCode: 'en-US'
            }
        });
        const ir = response.data.inspectionResult;
        if (ir && ir.indexStatusResult) {
            return {
                verdict: ir.indexStatusResult.verdict,
                coverageState: ir.indexStatusResult.coverageState
            };
        }
    } catch (error) {
        return { verdict: 'API_ERROR', coverageState: error.message.split('\n')[0] };
    }
    return { verdict: 'UNKNOWN', coverageState: 'N/A' };
}

async function main() {
    console.log("=== SEO Index Monitor ===\n");
    
    console.log("Fetching sitemap...");
    const sitemapUrls = await fetchSitemapUrls();
    console.log(`Found ${sitemapUrls.length} URLs in sitemap.xml\n`);

    console.log("Authenticating with Google Search Console API...");
    const googleAuth = await getGoogleAuth();
    if (!googleAuth) {
        console.log("⚠️  Google API credentials not found or invalid.");
        console.log("   Skipping GSC URL Inspection. See README for setup instructions.\n");
    } else {
        console.log("✅ Google API Authenticated.\n");
    }

    console.log("Checking Bing IndexNow setup...");
    const hasIndexNow = !!process.env.INDEXNOW_KEY;
    if (hasIndexNow) {
         console.log("✅ IndexNow key is configured.\n");
    } else {
         console.log("ℹ️  No IndexNow key configured. Manual Bing check required.\n");
    }

    const reportData = [];
    
    for (const url of URLS_TO_CHECK) {
        console.log(`Inspecting: ${url}...`);
        
        // Technical Check
        const tech = await runTechnicalCheck(url, sitemapUrls);
        
        // Google Search Console Check
        const googleResult = await runGoogleInspection(url, googleAuth);
        
        // Bing logic stub
        const bingResult = hasIndexNow ? "Submitted/Check UI" : "Manual Check Needed";

        reportData.push({
            URL: url.replace(SITE_URL, '/'),
            HTTP: tech.httpStatus,
            Sitemap: tech.inSitemap ? 'Yes' : 'No',
            Noindex: tech.hasNoIndex ? 'Yes' : 'No',
            Canonical: tech.canonical === url ? 'Match' : 'Mismatch',
            'Google Verdict': googleResult.verdict,
            'Coverage': googleResult.coverageState,
            Bing: bingResult
        });
    }

    console.log("\n=== Final Report ===\n");
    console.table(reportData);

    // Save Reports
    const reportsDir = path.join(__dirname, '..', 'reports');
    try {
        await fs.mkdir(reportsDir, { recursive: true });
    } catch (e) {
        // ignore if exists
    }
    
    await fs.writeFile(
        path.join(reportsDir, 'index-status.json'), 
        JSON.stringify(reportData, null, 2)
    );
    
    let mdContent = "# SEO Index Status Report\n\nGenerated on: " + new Date().toUTCString() + "\n\n";
    mdContent += "| URL | HTTP | Sitemap | Noindex | Canonical | Google Verdict | Coverage | Bing |\n";
    mdContent += "|---|---|---|---|---|---|---|---|\n";
    for (const row of reportData) {
        mdContent += `| ${row.URL} | ${row.HTTP} | ${row.Sitemap} | ${row.Noindex} | ${row.Canonical} | ${row['Google Verdict']} | ${row.Coverage} | ${row.Bing} |\n`;
    }
    
    await fs.writeFile(path.join(reportsDir, 'index-status.md'), mdContent);
    console.log("\nReports saved to /reports folder.");
    
    if (!googleAuth) {
        console.log("\n---");
        console.log("To enable Google Search Console actual index status, follow the instructions in the README.");
    }
    if (!hasIndexNow) {
        console.log("\nFor Bing, please check Webmaster Tools manually for each URL.");
    }
}

main().catch(console.error);
