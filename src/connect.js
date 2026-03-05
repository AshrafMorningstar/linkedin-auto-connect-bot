/**
 * connect.js — Auto-connect with people on LinkedIn
 * 
 * Strategy:
 * 1. Go to "People You May Know" or a custom search URL
 * 2. Find Connect buttons on the page
 * 3. Click each with human-like delays & randomized behavior
 * 4. Optionally add a personalized note
 * 5. Stop after maxConnections limit
 */
require('dotenv').config();
const config = require('../config');
const logger = require('./logger');
const { randomDelay, humanScroll, humanHover, randomMouseMove, waitForPageLoad } = require('./humanizer');
const { filterHighProfile } = require('./profiler');

// CSS Selectors (updated for current LinkedIn DOM — May 2024+)
const SELECTORS = {
    // Connect buttons on "People You May Know" (mynetwork page)
    connectBtn: 'button[aria-label*="Invite"][aria-label*="connect"], button[aria-label*="Connect"]',

    // Modal that appears when adding a note
    addNoteBtn: 'button[aria-label="Add a note"]',
    noteTextarea: 'textarea[name="message"]',
    sendWithNoteBtn: 'button[aria-label="Send invitation"]',
    sendWithoutNoteBtn: 'button[aria-label="Send without a note"]',

    // Search result connect buttons
    searchConnectBtn: 'button.artdeco-button--secondary[aria-label*="Connect"]',

    // "Show more" / load more results
    showMoreBtn: '.scaffold-finite-scroll__load-button',
};

/**
 * Run auto-connect session
 * @param {Page} page - Puppeteer page
 * @returns {number} - Number of connections sent
 */
async function autoConnect(page) {
    logger.divider();
    logger.action('Starting AUTO-CONNECT session...');
    logger.info(`Limit: ${config.maxConnections} connections this session.`);

    // Determine start URL — high-profile mode uses curated CEO/Founder search URLs
    let startUrl;
    if (config.highProfile && config.highProfile.enabled && !config.connect.useSearchUrl) {
        const urls = config.highProfile.searchUrls;
        startUrl = urls[Math.floor(Math.random() * urls.length)];
        logger.info(`🎯 High-Profile mode ON — targeting: ${startUrl}`);
    } else {
        startUrl = (config.connect.useSearchUrl && process.env.SEARCH_URL)
            ? process.env.SEARCH_URL
            : config.connect.peopleYouMayKnowUrl;
    }

    logger.info(`Navigating to: ${startUrl}`);
    try {
        await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    } catch (e) {
        logger.warn('Page load timeout — continuing anyway...');
    }
    await waitForPageLoad();

    let connectCount = 0;
    let noButtonRounds = 0;
    const MAX_NO_BUTTON_ROUNDS = 3;

    while (connectCount < config.maxConnections) {
        // Simulate browsing before acting
        await randomMouseMove(page);
        await humanScroll(page);

        // Find all visible Connect buttons
        const buttons = await page.$$(SELECTORS.connectBtn);

        if (buttons.length === 0) {
            noButtonRounds++;
            logger.warn(`No Connect buttons found (attempt ${noButtonRounds}/${MAX_NO_BUTTON_ROUNDS}). Scrolling for more...`);

            if (noButtonRounds >= MAX_NO_BUTTON_ROUNDS) {
                // Try clicking "Show more" if available
                const showMore = await page.$(SELECTORS.showMoreBtn);
                if (showMore) {
                    logger.info('Clicking "Show more results"...');
                    await humanHover(page, showMore);
                    await showMore.click();
                    await waitForPageLoad();
                    noButtonRounds = 0;
                } else {
                    logger.warn('No more results to load. Ending connect session.');
                    break;
                }
            }
            continue;
        }

        noButtonRounds = 0;

        // ── High-Profile Filtering ────────────────────────────────
        // Try to find parent card elements, score and sort them
        let orderedButtons = buttons;
        if (config.highProfile && config.highProfile.enabled) {
            // Collect parent li/article cards for each button
            const cards = [];
            for (const btn of buttons) {
                const card = await btn.evaluateHandle(el => {
                    let node = el;
                    for (let i = 0; i < 6; i++) {
                        node = node.parentElement;
                        if (node && (node.tagName === 'LI' || node.tagName === 'ARTICLE')) return node;
                    }
                    return el; // fallback to button itself
                });
                cards.push(card.asElement() || btn);
            }
            const filteredCards = await filterHighProfile(cards, config.highProfile.minScore);
            // Rebuild button list in the new order
            orderedButtons = [];
            for (const card of filteredCards) {
                const btn = await card.$('button[aria-label*="Connect"]').catch(() => null)
                    || await card.$('button[aria-label*="Invite"]').catch(() => null);
                if (btn) orderedButtons.push(btn);
            }
            if (orderedButtons.length === 0) {
                logger.warn('No high-profile people found on this page — scrolling for more...');
                await humanScroll(page);
                await randomDelay(config.delays.actionMin, config.delays.actionMax);
                continue;
            }
        }

        logger.info(`Connecting with ${orderedButtons.length} high-profile candidate(s) on screen.`);

        for (const button of orderedButtons) {
            if (connectCount >= config.maxConnections) {
                logger.limit(`Connection limit reached: ${config.maxConnections}. Stopping.`);
                return connectCount;
            }

            try {
                // Hover over button naturally
                await humanHover(page, button);

                // Check button is still visible/valid
                const isVisible = await button.isIntersectingViewport().catch(() => false);
                if (!isVisible) continue;

                const label = await button.evaluate(el => el.getAttribute('aria-label') || el.innerText);
                logger.action(`Clicking Connect: "${label.trim()}"`);

                await button.click();
                await randomDelay(1500, 3500);

                // Handle the "How do you know this person?" or note modal
                const noteModal = await page.$(SELECTORS.addNoteBtn).catch(() => null);
                const sendWithout = await page.$(SELECTORS.sendWithoutNoteBtn).catch(() => null);

                if (config.connect.sendNote && noteModal && process.env.CONNECT_NOTE) {
                    // Click "Add a note" and type the custom message
                    await noteModal.click();
                    await randomDelay(800, 1500);
                    const textarea = await page.$(SELECTORS.noteTextarea);
                    if (textarea) {
                        const note = process.env.CONNECT_NOTE.substring(0, 300);
                        await textarea.type(note, { delay: 60 });
                        await randomDelay(500, 1200);
                    }
                    const sendBtn = await page.$(SELECTORS.sendWithNoteBtn);
                    if (sendBtn) {
                        await humanHover(page, sendBtn);
                        await sendBtn.click();
                    }
                } else if (sendWithout) {
                    // Click "Send without a note"
                    await humanHover(page, sendWithout);
                    await sendWithout.click();
                }

                await randomDelay(config.delays.postConnectMin, config.delays.postConnectMax);

                connectCount++;
                logger.success(`Connection request sent! [${connectCount}/${config.maxConnections}]`);

                // Random break: occasionally pause longer (simulate checking notifications)
                if (Math.random() < 0.15) {
                    const longBreak = Math.floor(Math.random() * 15000) + 8000;
                    logger.info(`  💭 Taking a natural break (${(longBreak / 1000).toFixed(0)}s)...`);
                    await new Promise(r => setTimeout(r, longBreak));
                }

            } catch (err) {
                logger.error(`Error clicking connect button: ${err.message}`);
                await randomDelay(2000, 4000);
            }
        } // end button loop

        // After processing all visible buttons, scroll down for more
        await humanScroll(page);
        await randomDelay(config.delays.actionMin, config.delays.actionMax);
    }

    logger.success(`Auto-connect session complete. Total sent: ${connectCount}`);
    return connectCount;
}

module.exports = { autoConnect };
