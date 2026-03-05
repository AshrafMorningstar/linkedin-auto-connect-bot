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
  // ─── HIGH-PROFILE TARGETING ──────────────────────────────
  highProfile: {
    // Enable high-profile filtering? If false, all people are treated equally.
    enabled: true,

    // Minimum score to connect/follow a person (0 = no filter, 20 = must have a notable title)
    // Score breakdown: CEO/Founder=30, VP/Director=20, Senior/Manager=10, 500+ connections=25,
    //                  10k+ followers=30, Top Voice=25
    minScore: 20,

    // Search URLs specifically targeting high-profile people
    // These are used when highProfile.enabled = true AND connect.useSearchUrl = false
    searchUrls: [
      // CEOs, Founders and Entrepreneurs
      'https://www.linkedin.com/search/results/people/?keywords=CEO+Founder&origin=GLOBAL_SEARCH_HEADER',
      // VPs and Directors
      'https://www.linkedin.com/search/results/people/?keywords=VP+Director+LinkedIn&origin=GLOBAL_SEARCH_HEADER',
      // LinkedIn Top Voices & Influencers
      'https://www.linkedin.com/search/results/people/?keywords=LinkedIn+Top+Voice+Influencer&origin=GLOBAL_SEARCH_HEADER',
    ],

    // Extra custom keywords to boost score (add your niche here!)
    customKeywords: [
      'Entrepreneur', 'Startup', 'Growth Hacker', 'Product Leader',
    ],

    // If true, bot will visit targetProfiles list directly and connect/follow them
    useTargetProfiles: false,

    // A list of specific LinkedIn profile URLs to target
    // (only used when useTargetProfiles = true)
    targetProfiles: [],
  },

};

module.exports = config;
