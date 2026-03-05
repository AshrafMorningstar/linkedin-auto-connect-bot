/**
 * follow.js — Auto-follow people on LinkedIn (2026 Edition)
 */
require('dotenv').config();
const config = require('../config');
const logger = require('./logger');
const { randomDelay, humanScroll, humanHover, randomMouseMove, waitForPageLoad, humanViewProfile } = require('./humanizer');
const { filterHighProfile } = require('./profiler');
const { isWorkTime, getTargetLimit } = require('./scheduler');

const SELECTORS = {
    followBtn: 'button[aria-label*="Follow"]',
    showMoreBtn: '.scaffold-finite-scroll__load-button',
};

/**
 * Run auto-follow session
 */
async function autoFollow(page) {
    logger.divider();
    logger.action('Starting AUTO-FOLLOW session...');

    if (!isWorkTime()) {
        logger.warn("Stopping follow session: Outside working hours.");
        return 0;
    }

    const sessionLimit = getTargetLimit(config.maxFollows, 'follow');
    logger.info(`Limit: ${sessionLimit} follows this session.`);

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
    while (followCount < sessionLimit) {
        if (!isWorkTime()) break;

        await randomMouseMove(page);
        await humanScroll(page);

        const buttons = await page.$$(SELECTORS.followBtn);
        if (buttons.length === 0) break;

        let cardMap = new Map();
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
            const cardEl = card.asElement();
            if (cardEl) {
                cards.push(cardEl);
                cardMap.set(cardEl, btn);
            }
        }

        const filteredCards = await filterHighProfile(cards, config.highProfile.minScore);

        for (const cardEl of filteredCards) {
            if (followCount >= sessionLimit) break;
            const button = cardMap.get(cardEl);

            try {
                const btnText = await button.evaluate(el => el.getAttribute('aria-label') || el.innerText || '');
                if (btnText.toLowerCase().includes('following') || btnText.toLowerCase().includes('unfollow')) {
                    continue;
                }

                await humanHover(page, cardEl);
                if (Math.random() > 0.5) await humanViewProfile(page);

                await humanHover(page, button);
                const isVisible = await button.isIntersectingViewport().catch(() => false);
                if (!isVisible) continue;

                logger.action(`Clicking Follow...`);
                await button.click();
                await randomDelay(config.delays.actionMin, config.delays.actionMax);

                followCount++;
                logger.success(`Followed! [${followCount}/${sessionLimit}]`);

                if (Math.random() < 0.1) await randomDelay(6000, 12000);
            } catch (err) {
                logger.error(`Error: ${err.message}`);
                await randomDelay(2000, 4000);
            }
        }

        await humanScroll(page);
        await randomDelay(config.delays.actionMin, config.delays.actionMax);
    }

    logger.success(`Auto-follow session complete. Total followed: ${followCount}`);
    return followCount;
}

module.exports = { autoFollow };
