/**
 * ============================================================
 *  LinkedIn Auto-Connect Bot — Safety Configuration
 * ============================================================
 *  Edit these values to tune bot behavior and safety limits.
 *  Keep limits LOW to avoid detection and account restrictions.
 * ============================================================
 */

const config = {
  // ─── SAFETY LIMITS ───────────────────────────────────────
  // Maximum connection requests to send per session
  maxConnections: 50,

  // Maximum follow actions per session
  maxFollows: 30,

  // Maximum total actions in a single run (connect + follow combined)
  maxTotalActions: 60,

  // ─── HUMAN-LIKE DELAY SETTINGS (milliseconds) ────────────
  delays: {
    // Delay between major actions (connect/follow clicks)
    actionMin: 5000,    // 5 seconds minimum
    actionMax: 15000,   // 15 seconds maximum

    // Delay between page scrolls
    scrollMin: 2000,
    scrollMax: 5000,

    // Delay between keyboard characters (typing simulation)
    typeMin: 50,
    typeMax: 220,

    // Delay after page navigation / waiting for content
    pageLoadMin: 3000,
    pageLoadMax: 7000,

    // Short pause before clicking an element
    preClickMin: 500,
    preClickMax: 2000,

    // Delay after sending a connection request
    postConnectMin: 3000,
    postConnectMax: 8000,
  },

  // ─── SCROLL BEHAVIOR ─────────────────────────────────────
  scroll: {
    // How many pixels to scroll per step
    stepMin: 200,
    stepMax: 600,

    // Number of scroll steps per "browsing" phase
    stepsPerBrowse: 3,
  },

  // ─── CONNECTION SETTINGS ─────────────────────────────────
  connect: {
    // Send a personalized note with each request? true/false
    // Note text is set in .env as CONNECT_NOTE
    sendNote: false,

    // If true, only connect with people with 500+ connections (more real)
    preferEstablished: false,

    // LinkedIn People You May Know URL
    peopleYouMayKnowUrl: 'https://www.linkedin.com/mynetwork/grow/',

    // Alternatively, use search results (set SEARCH_URL in .env)
    useSearchUrl: false,
  },

  // ─── FOLLOW SETTINGS ─────────────────────────────────────
  follow: {
    // Default search URL for finding people to follow
    defaultSearchUrl: 'https://www.linkedin.com/search/results/people/?keywords=linkedin&origin=GLOBAL_SEARCH_HEADER',
  },

  // ─── BROWSER SETTINGS ────────────────────────────────────
  browser: {
    // Show the browser window (true = visible, false = headless)
    // ALWAYS keep this true — headless mode is much more detectable!
    headless: false,

    // Slow down Puppeteer actions by N milliseconds (extra human-like)
    slowMo: 20,

    // Viewport size (match a common screen resolution)
    viewport: {
      width: 1366,
      height: 768,
    },

    // User agent string (Chrome on Windows 11)
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  },

  // ─── LOGGING ─────────────────────────────────────────────
  logging: {
    // Print detailed step-by-step logs
    verbose: true,

    // Save logs to a file (logs/session.log)
    saveToFile: false,
  },
  // ─── ADVANCED 2026 FEATURES ─────────────────────────────

  // WARM-UP MODE: Gradually increases activity for new accounts
  warmUp: {
    enabled: true,
    startLimit: 5,        // Start with 5 actions on Day 1
    incrementPerDay: 3,   // Add 3 actions to the limit each day
    maxRampLimit: 40,     // Stop ramping once we hit 40
  },

  // WORKING HOURS: Only run during human business hours
  schedule: {
    enabled: true,
    startHour: 9,         // 9 AM
    endHour: 18,          // 6 PM
    days: [1, 2, 3, 4, 5] // Monday - Friday (0=Sun, 6=Sat)
  },

  // PERSONALIZATION: Dynamic message tags
  personalization: {
    // Available tags: {{first_name}}, {{company}}, {{title}}
    defaultFirstName: "there",
    defaultCompany: "your company",
  },

  // ─── HIGH-PROFILE TARGETING ──────────────────────────────
  highProfile: {
    enabled: true,
    minScore: 20,
    searchUrls: [
      'https://www.linkedin.com/search/results/people/?keywords=CEO+Founder&origin=GLOBAL_SEARCH_HEADER',
      'https://www.linkedin.com/search/results/people/?keywords=VP+Director+LinkedIn&origin=GLOBAL_SEARCH_HEADER',
      'https://www.linkedin.com/search/results/people/?keywords=LinkedIn+Top+Voice+Influencer&origin=GLOBAL_SEARCH_HEADER',
    ],
    customKeywords: ['Entrepreneur', 'Startup', 'Growth Hacker', 'Product Leader'],

    // Target specific professions (e.g. 'IT Professional', 'CA', 'Chartered Accountant')
    targetProfessions: [
      'IT Professional', 'Software Engineer', 'Developer', 'Full Stack',
      'Chartered Accountant', 'CA', 'Finance', 'Investment Banker',
      'Doctor', 'Physician', 'Surgeon', 'Medical Professional',
      'Advocate', 'Lawyer', 'Legal Advisor',
      'Architect', 'Civil Engineer', 'Real Estate',
      'Sales Manager', 'Marketing Specialist', 'Content Creator',
      'HR Professional', 'Recruiter', 'Talent Acquisition',
      'Data Scientist', 'AI Specialist'
    ],

    useTargetProfiles: false,
    targetProfiles: [],
  },
};

module.exports = config;
