import { ScanReport } from './types';

// Crisp vector snapshots converted to Base64 data URIs for instant preview rendering
const APPLE_SNAPSHOT = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <rect width="1200" height="750" fill="#000000"/>
  <!-- Apple Top Bar -->
  <rect width="1200" height="50" fill="#161617"/>
  <circle cx="600" cy="25" r="9" fill="#f5f5f7" opacity="0.9"/>
  <!-- Hero Content -->
  <text x="600" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="48" font-weight="bold" fill="#f5f5f7" text-anchor="middle">iPhone 16 Pro</text>
  <text x="600" y="205" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" fill="#86868b" text-anchor="middle">Hello, Apple Intelligence.</text>
  <rect x="525" y="240" width="150" height="40" rx="20" fill="#0071e3"/>
  <text x="600" y="265" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#ffffff" text-anchor="middle">Buy from $999</text>
  <!-- Device mockup container -->
  <rect x="420" y="320" width="360" height="430" rx="36" fill="#18181a" stroke="#333336" stroke-width="4"/>
  <rect x="440" y="340" width="320" height="410" rx="24" fill="#08080a"/>
  <circle cx="600" cy="360" r="7" fill="#2c2c2e"/>
  <text x="600" y="520" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="800" fill="#e5e5ea" text-anchor="middle">Apple Store</text>
  <text x="600" y="555" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="#86868b" text-anchor="middle">Official Online Shop</text>
</svg>
`).toString('base64')}`;

const STORE_SNAPSHOT = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <rect width="1200" height="750" fill="#f8fafc"/>
  <!-- Top Bar -->
  <rect width="1200" height="60" fill="#0f172a"/>
  <text x="50" y="38" font-family="sans-serif" font-size="20" font-weight="bold" fill="#38bdf8">MegaDiscount Marketplace (Sandbox)</text>
  <rect x="1020" y="14" width="130" height="32" rx="6" fill="#f59e0b"/>
  <text x="1085" y="35" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">Cart (3 items)</text>
  <!-- Urgent Promo Banner -->
  <rect x="0" y="60" width="1200" height="40" fill="#ef4444"/>
  <text x="600" y="85" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">UNVERIFIED CHECKOUT: 85% OFF SALE — EXPIRES IN 04:59</text>
  <!-- Checkout Mockup -->
  <rect x="60" y="130" width="680" height="570" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <text x="100" y="180" font-family="sans-serif" font-size="22" font-weight="bold" fill="#0f172a">Payment Information</text>
  <rect x="100" y="215" width="600" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="120" y="243" font-family="sans-serif" font-size="14" fill="#94a3b8">Cardholder Full Name</text>
  <rect x="100" y="280" width="600" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="120" y="308" font-family="sans-serif" font-size="14" fill="#94a3b8">Credit Card Number (Raw input - unencrypted)</text>
  <rect x="100" y="345" width="285" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="120" y="373" font-family="sans-serif" font-size="14" fill="#94a3b8">MM/YY</text>
  <rect x="415" y="345" width="285" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="435" y="373" font-family="sans-serif" font-size="14" fill="#94a3b8">CVV Security Code</text>
  <rect x="100" y="425" width="600" height="50" rx="8" fill="#22c55e"/>
  <text x="400" y="456" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">SUBMIT CARD DETAILS — $19.99</text>
  <!-- Right Order Summary -->
  <rect x="770" y="130" width="370" height="380" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
  <text x="800" y="180" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a">Order Summary</text>
  <text x="800" y="230" font-family="sans-serif" font-size="14" fill="#64748b">Original Total: <tspan text-decoration="line-through">$249.00</tspan></text>
  <text x="800" y="270" font-family="sans-serif" font-size="22" font-weight="bold" fill="#ef4444">Discount Total: $19.99</text>
</svg>
`).toString('base64')}`;

const PHISHING_SNAPSHOT = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <rect width="1200" height="750" fill="#202124"/>
  <!-- Red Shield Icon -->
  <circle cx="600" cy="220" r="50" fill="#d93025"/>
  <path d="M600 190 L600 230 M600 245 L600 250" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/>
  <!-- Warning Text -->
  <text x="600" y="330" font-family="sans-serif" font-size="38" font-weight="bold" fill="#ffffff" text-anchor="middle">Deceptive site ahead</text>
  <text x="600" y="375" font-family="sans-serif" font-size="16" fill="#bdc1c6" text-anchor="middle">Google Safe Browsing recently detected phishing patterns on testsafebrowsing.appspot.com.</text>
  <text x="600" y="405" font-family="sans-serif" font-size="14" fill="#9aa0a6" text-anchor="middle">Attackers on this site may trick you into revealing personal passwords, phone PINs, or banking tokens.</text>
  <!-- Buttons -->
  <rect x="430" y="470" width="160" height="44" rx="22" fill="#1a73e8"/>
  <text x="510" y="497" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">Back to safety</text>
  <rect x="610" y="470" width="160" height="44" rx="22" fill="transparent" stroke="#5f6368" stroke-width="2"/>
  <text x="690" y="497" font-family="sans-serif" font-size="14" font-weight="500" fill="#e8eaed" text-anchor="middle">Details</text>
</svg>
`).toString('base64')}`;

export const DEMO_REPORTS: Record<string, ScanReport> = {
  'demo-safe-apple': {
    id: 'demo-safe-apple',
    targetUrl: 'https://www.apple.com/shop',
    finalUrl: 'https://www.apple.com/shop',
    domain: 'apple.com',
    timestamp: new Date().toISOString(),
    overallScore: 96,
    riskLevel: 'SAFE',
    summary: 'Verified authentic retail platform. Cryptographic EV SSL certificate is valid and issued to Apple Inc. DNSSEC authenticated routing with strict TLS 1.3 encryption. Checkout processing utilizes certified Apple Pay and enterprise PCI-DSS tokenized gateways.',
    redFlags: [],
    pillars: {
      domainLegitimacy: {
        name: 'Domain Legitimacy',
        status: 'pass',
        score: 25,
        details: 'Domain registered in 1987 by Apple Inc. Verified corporate DNSSEC routing with zero typosquatting flags.',
      },
      brandSafety: {
        name: 'Brand Safety',
        status: 'pass',
        score: 25,
        details: 'Official trademark holder with zero deceptive brand mimicking or unauthorized asset copying.',
      },
      paymentSecurity: {
        name: 'Payment Security',
        status: 'pass',
        score: 24,
        details: 'Native encrypted checkout tokenization over HTTPS with strict CSP headers and TLS 1.3.',
      },
      uxPatterns: {
        name: 'UX Patterns',
        status: 'pass',
        score: 22,
        details: 'Transparent pricing with no artificial urgency countdowns, hidden subscription checkouts, or deceptive popups.',
      },
    },
    redirectCount: 0,
    screenshotBase64: APPLE_SNAPSHOT,
    metrics: {
      browserLatencyMs: 1100,
      totalScanTimeMs: 2300,
    },
    networkForensics: {
      ip: '17.253.144.10',
      server: 'Apple Web Server / AkamaiGHost',
      sslIssuer: 'Apple Public EV Server RSA CA 1 - G1',
      sslProtocol: 'TLS 1.3',
      sslValid: true,
      domainAge: '37 years old (1987)',
      creationDate: '1987-02-19T05:00:00Z',
      registrar: 'CSC Corporate Domains, Inc.',
    },
    formForensics: {
      totalForms: 1,
      forms: [
        {
          action: 'https://www.apple.com/shop/bag',
          method: 'POST',
          inputs: [{ name: 'item_id', type: 'hidden' }],
          isCrossDomain: false,
        },
      ],
      externalScriptCount: 8,
    },
    securityAdvice: {
      verdict: 'AUTHENTIC & VERIFIED RETAIL PLATFORM',
      actionItems: [
        'Official Apple Inc. digital storefront verified with EV SSL certification.',
        'Enterprise PCI-DSS tokenized checkout gateway (Apple Pay) active.',
        'Zero deceptive typosquatting or credential intake patterns detected.',
      ],
    },
  },

  'demo-fake-store': {
    id: 'demo-fake-store',
    targetUrl: 'https://ecommerce-playground.lambdatest.io',
    finalUrl: 'https://ecommerce-playground.lambdatest.io',
    domain: 'ecommerce-playground.lambdatest.io',
    timestamp: new Date().toISOString(),
    overallScore: 42,
    riskLevel: 'SUSPICIOUS',
    summary: 'Detected multiple anomalous merchant signals. The site operates an uncertified checkout gateway with mock payment credentials, lacks registered business merchant verification, and features unverified seller contact details. High caution advised before submitting real credit card information.',
    redFlags: [
      'Uncertified payment processing gateway lacking verified PCI-DSS merchant certification',
      'Unverified business registration footprint on WHOIS and domain records',
      'Checkout forms collect raw billing details without secure third-party iframes',
      'Missing verifiable physical company address and merchant contact phone',
    ],
    pillars: {
      domainLegitimacy: {
        name: 'Domain Legitimacy',
        status: 'warning',
        score: 11,
        details: 'Subdomain hosted on generic cloud testing infrastructure lacking corporate retail accreditation.',
      },
      brandSafety: {
        name: 'Brand Safety',
        status: 'warning',
        score: 12,
        details: 'Displays generic consumer electronics and fashion catalogs without verified authorized dealership seals.',
      },
      paymentSecurity: {
        name: 'Payment Security',
        status: 'fail',
        score: 9,
        details: 'Checkout forms submit card information directly to non-PCI-compliant testing endpoints.',
      },
      uxPatterns: {
        name: 'UX Patterns',
        status: 'pass',
        score: 10,
        details: 'Standard e-commerce layout structure, though lacking third-party buyer protection guarantees.',
      },
    },
    redirectCount: 0,
    screenshotBase64: STORE_SNAPSHOT,
    metrics: {
      browserLatencyMs: 1350,
      totalScanTimeMs: 2450,
    },
    networkForensics: {
      ip: '104.26.12.31',
      server: 'cloudflare',
      sslIssuer: 'Cloudflare Inc ECC CA-3 (DV)',
      sslProtocol: 'TLS 1.3',
      sslValid: true,
      domainAge: '5 years old (2019)',
      creationDate: '2019-04-10T12:00:00Z',
      registrar: 'NameCheap, Inc.',
    },
    formForensics: {
      totalForms: 3,
      forms: [
        {
          action: 'https://ecommerce-playground.lambdatest.io/index.php?route=checkout/confirm',
          method: 'POST',
          inputs: [
            { name: 'card_number', type: 'text' },
            { name: 'cvv', type: 'password' },
          ],
          isCrossDomain: false,
        },
      ],
      externalScriptCount: 14,
    },
    securityAdvice: {
      verdict: 'EXERCISE EXTREME CAUTION - UNVERIFIED MERCHANT',
      actionItems: [
        'Do NOT submit real credit card, CVV, or banking credentials on this site.',
        'Checkout forms harvest raw payment inputs without certified payment gateways (Stripe/PayPal).',
        'Verify corporate registration and independent merchant reviews before engaging.',
      ],
    },
  },

  'demo-phishing-threat': {
    id: 'demo-phishing-threat',
    targetUrl: 'https://testsafebrowsing.appspot.com/s/phishing.html',
    finalUrl: 'https://testsafebrowsing.appspot.com/s/phishing.html',
    domain: 'testsafebrowsing.appspot.com',
    timestamp: new Date().toISOString(),
    overallScore: 14,
    riskLevel: 'CRITICAL',
    summary: 'CRITICAL PHISHING PATTERN DETECTED. Flagged by Google Safe Browsing and Chromium Phishing Intelligence telemetry. The site mimics account login authentication flows designed to harvest user credentials and sensitive identity tokens.',
    redFlags: [
      'Flagged in Google Safe Browsing and Chromium Threat Intelligence blacklist feeds',
      'Deceptive login form engineered to harvest authentication credentials',
      'Hosted on generic public app engine container rather than verified institutional server',
      'Zero corporate identity verification or legitimate business SSL provenance',
    ],
    pillars: {
      domainLegitimacy: {
        name: 'Domain Legitimacy',
        status: 'fail',
        score: 4,
        details: 'Generic testing container flagged on multiple global threat intelligence registries.',
      },
      brandSafety: {
        name: 'Brand Safety',
        status: 'fail',
        score: 3,
        details: 'Simulates high-risk credential intake forms designed for phishing vulnerability demonstration.',
      },
      paymentSecurity: {
        name: 'Payment Security',
        status: 'fail',
        score: 2,
        details: 'Contains insecure input mechanisms designed to simulate unencrypted credential capture.',
      },
      uxPatterns: {
        name: 'UX Patterns',
        status: 'fail',
        score: 5,
        details: 'Engineered as a deceptive interaction trap mimicking account security verification.',
      },
    },
    redirectCount: 0,
    screenshotBase64: PHISHING_SNAPSHOT,
    metrics: {
      browserLatencyMs: 950,
      totalScanTimeMs: 2100,
    },
    networkForensics: {
      ip: '142.250.190.84',
      server: 'Google Frontend / gws',
      sslIssuer: 'GTS CA 1C3 (Generic DV)',
      sslProtocol: 'TLS 1.3',
      sslValid: true,
      domainAge: '16 years old (appspot generic platform)',
      creationDate: '2008-04-07T00:00:00Z',
      registrar: 'MarkMonitor Inc.',
    },
    formForensics: {
      totalForms: 1,
      forms: [
        {
          action: 'https://testsafebrowsing.appspot.com/s/harvest.php',
          method: 'POST',
          inputs: [
            { name: 'username', type: 'text' },
            { name: 'password', type: 'password' },
          ],
          isCrossDomain: true,
        },
      ],
      externalScriptCount: 2,
    },
    securityAdvice: {
      verdict: 'CRITICAL THREAT - DO NOT SUBMIT PASSWORDS',
      actionItems: [
        'Leave this page immediately without entering any passwords or PINs.',
        'If you already entered account details, immediately change your password on the genuine provider.',
        'Report this URL to Google Safe Browsing and your network security administrator.',
      ],
    },
  },
};

export const DEMO_URL_MAP: Record<string, string> = {
  'https://www.apple.com': 'demo-safe-apple',
  'https://www.apple.com/shop': 'demo-safe-apple',
  'https://www.apple.com/store': 'demo-safe-apple',
  'https://ecommerce-playground.lambdatest.io': 'demo-fake-store',
  'https://ecommerce-playground.lambdatest.io/': 'demo-fake-store',
  'https://testsafebrowsing.appspot.com/s/phishing.html': 'demo-phishing-threat',
  'https://testsafebrowsing.appspot.com/s/phishing.html/': 'demo-phishing-threat',
};
