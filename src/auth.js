/**
 * auth.js — Auto-login to LinkedIn with human-like behavior
 */
require('dotenv').config();
const logger = require('./logger');
const { humanType, randomDelay, humanScroll, waitForPageLoad } = require('./humanizer');

const LINKEDIN_LOGIN_URL = 'https://www.linkedin.com/login';
const LINKEDIN_FEED_URL = 'https://www.linkedin.com/feed/';

/**
 * Log into LinkedIn using credentials from .env
 * @param {Page} page - Puppeteer page instance
 */
async function login(page) {
    logger.info('Navigating to LinkedIn login page...');
    await page.goto(LINKEDIN_LOGIN_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await waitForPageLoad();

    // --- Check if already logged in ---
    if (page.url().includes('/feed') || page.url().includes('/mynetwork')) {
        logger.success('Already logged in! Skipping login step.');
        return;
    }

    const email = process.env.LINKEDIN_EMAIL;
    const password = process.env.LINKEDIN_PASSWORD;

    if (!email || !password) {
        logger.error('Missing credentials! Please set LINKEDIN_EMAIL and LINKEDIN_PASSWORD in your .env file.');
        process.exit(1);
    }

    logger.info(`Logging in as: ${email}`);

    // Type email
    await page.waitForSelector('#username', { timeout: 15000 });
    await humanType(page, '#username', email);
    await randomDelay(500, 1500);

    // Type password
    await page.waitForSelector('#password', { timeout: 10000 });
    await humanType(page, '#password', password);
    await randomDelay(800, 2000);

    // Move mouse around then click submit
    logger.info('Submitting login form...');
    await page.click('[type="submit"]');

    // Wait for successful redirect to feed or checkpoint
    try {
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    } catch (e) {
        logger.warn('Navigation timeout — checking current page...');
    }

    await waitForPageLoad();

    const currentUrl = page.url();

    if (currentUrl.includes('/checkpoint') || currentUrl.includes('/challenge')) {
        logger.warn('⚠️  LinkedIn is asking for a security verification (CAPTCHA / phone check).');
        logger.warn('    Please complete the verification manually in the browser window.');
        logger.warn('    Waiting up to 60 seconds for you to complete it...');
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
    }

    if (currentUrl.includes('/feed') || page.url().includes('/mynetwork') || page.url() === 'https://www.linkedin.com/') {
        logger.success('Login successful! ✔');
        await humanScroll(page);
    } else {
        logger.error(`Login may have failed. Current URL: ${page.url()}`);
        logger.warn('Check your credentials in .env or complete any verification in the browser.');
    }
}

module.exports = { login };
