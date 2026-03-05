/**
 * browser.js — Launch a stealth Puppeteer browser (visible window)
 */
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config = require('../config');
const logger = require('./logger');

// Activate all stealth evasions
puppeteer.use(StealthPlugin());

/**
 * Launch and return a configured browser + page.
 * @returns {{ browser, page }}
 */
async function launchBrowser() {
    logger.info('Launching stealth browser window...');

    const browser = await puppeteer.launch({
        headless: config.browser.headless,
        slowMo: config.browser.slowMo,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-infobars',
            '--window-size=1366,768',
            '--start-maximized',
            // Disable automation flag bar
            '--disable-extensions',
            // Randomize window position
            `--window-position=${Math.floor(Math.random() * 100)},${Math.floor(Math.random() * 50)}`,
        ],
        ignoreDefaultArgs: ['--enable-automation'],
    });

    const page = await browser.newPage();

    // Set realistic viewport
    await page.setViewport({
        width: config.browser.viewport.width + Math.floor(Math.random() * 40),
        height: config.browser.viewport.height + Math.floor(Math.random() * 40),
    });

    // Set realistic user agent
    await page.setUserAgent(config.browser.userAgent);

    // Override navigator.webdriver to hide Puppeteer
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });

    logger.success('Browser launched with stealth mode active.');
    return { browser, page };
}

module.exports = { launchBrowser };
