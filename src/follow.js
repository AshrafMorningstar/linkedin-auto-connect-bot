/**
 * follow.js — Auto-follow people on LinkedIn
 *
 * Strategy:
 * 1. Navigate to a search results page (configurable)
 * 2. Find all "Follow" buttons
 * 3. Click each with human-like delays
 * 4. Stop after maxFollows limit
 */
require('dotenv').config();
const config = require('../config');
const logger = require('./logger');
const { randomDelay, humanScroll, humanHover, randomMouseMove, waitForPageLoad } = require('./humanizer');
const { filterHighProfile } = require('./profiler');

const SELECTORS = {
    // Follow buttons in search results / profile pages
    followBtn: 'button[aria-label*="Follow"]',

    // "Show more" to load more results
    showMoreBtn: '.scaffold-finite-scroll__load-button',
};

/**
 * Run auto-follow session
 * @param {Page} page - Puppeteer page
 * @returns {number} - Number of follows completed
 */
async function autoFollow(page) {
    logger.divider();
    logger.action('Starting AUTO-FOLLOW session...');
    logger.info(`Limit: ${config.maxFollows} follows this session.`);

    let startUrl;
    if (config.highProfile && config.highProfile.enabled) {
        const urls = config.highProfile.searchUrls;
        startUrl = process.env.SEARCH_URL || urls[Math.floor(Math.random() * urls.length)];
        logger.info(`🎯 High-Profile mode ON — targeting: ${startUrl}`);
    } else {
        startUrl = process.env.SEARCH_URL || config.follow.defaultSearchUrl;
    }

    logger.info(`Navigating to: ${startUrl}`);
    try {
        await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    } catch (e) {
        logger.warn('Page load timeout — continuing anyway...');
    }
    await waitForPageLoad();

    let followCount = 0;
    let noButtonRounds = 0;
    const MAX_NO_BUTTON_ROUNDS = 3;

    while (followCount < config.maxFollows) {
        // Natural browsing behavior
        await randomMouseMove(page);
        await humanScroll(page);

        // Find visible Follow buttons
        const buttons = await page.$$(SELECTORS.followBtn);

        if (buttons.length === 0) {
            noButtonRounds++;
            logger.warn(`No Follow buttons found (attempt ${noButtonRounds}/${MAX_NO_BUTTON_ROUNDS}). Scrolling...`);

            if (noButtonRounds >= MAX_NO_BUTTON_ROUNDS) {
                const showMore = await page.$(SELECTORS.showMoreBtn);
                if (showMore) {
                    logger.info('Clicking "Show more results"...');
                    await humanHover(page, showMore);
                    await showMore.click();
                    await waitForPageLoad();
                    noButtonRounds = 0;
                } else {
                    logger.warn('No more results to load. Ending follow session.');
                    break;
                }
            }
            continue;
        }

        noButtonRounds = 0;

        // ── High-Profile Filtering ────────────────────────────────
        let orderedButtons = buttons;
        if (config.highProfile && config.highProfile.enabled) {
            const cards = [];
            for (const btn of buttons) {
                const card = await btn.evaluateHandle(el => {
                    let node = el;
                    for (let i = 0; i < 6; i++) {
                        node = node.parentElement;
                        if (node && (node.tagName === 'LI' || node.tagName === 'ARTICLE')) return node;
                    }
                    return el;
                });
                cards.push(card.asElement() || btn);
            }
            const filteredCards = await filterHighProfile(cards, config.highProfile.minScore);
            orderedButtons = [];
            for (const card of filteredCards) {
                const btn = await card.$('button[aria-label*="Follow"]').catch(() => null);
                if (btn) orderedButtons.push(btn);
            }
            if (orderedButtons.length === 0) {
                logger.warn('No high-profile people to follow on this page — scrolling...');
                await humanScroll(page);
                await randomDelay(config.delays.actionMin, config.delays.actionMax);
                continue;
            }
        }

        logger.info(`Following ${orderedButtons.length} high-profile candidate(s) on screen.`);

        for (const button of orderedButtons) {
            if (followCount >= config.maxFollows) {
                logger.limit(`Follow limit reached: ${config.maxFollows}. Stopping.`);
                return followCount;
            }

            try {
                // Skip if this button text is already "Following"
                const btnText = await button.evaluate(el =>
                    el.getAttribute('aria-label') || el.innerText || ''
                );
                if (btnText.toLowerCase().includes('following') || btnText.toLowerCase().includes('unfollow')) {
                    logger.info(`  Skipping already-followed person.`);
                    continue;
                }

                await humanHover(page, button);

                const isVisible = await button.isIntersectingViewport().catch(() => false);
                if (!isVisible) continue;

                logger.action(`Clicking Follow: "${btnText.trim()}"`);
                await button.click();

                await randomDelay(config.delays.actionMin, config.delays.actionMax);

                followCount++;
                logger.success(`Followed! [${followCount}/${config.maxFollows}]`);

                // Occasional long pause to simulate real behavior
                if (Math.random() < 0.15) {
                    const longBreak = Math.floor(Math.random() * 12000) + 6000;
                    logger.info(`  💭 Natural pause (${(longBreak / 1000).toFixed(0)}s)...`);
                    await new Promise(r => setTimeout(r, longBreak));
                }

            } catch (err) {
                logger.error(`Error clicking follow button: ${err.message}`);
                await randomDelay(2000, 4000);
            }
        }

        // Scroll and wait for more results
        await humanScroll(page);
        await randomDelay(config.delays.actionMin, config.delays.actionMax);
    }

    logger.success(`Auto-follow session complete. Total followed: ${followCount}`);
    return followCount;
}

module.exports = { autoFollow };
