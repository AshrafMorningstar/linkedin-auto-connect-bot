/**
 * connect.js — Auto-connect with people on LinkedIn (2026 Edition)
 */
require('dotenv').config();
const config = require('../config');
const logger = require('./logger');
const { randomDelay, humanScroll, humanHover, randomMouseMove, waitForPageLoad, humanViewProfile } = require('./humanizer');
const { filterHighProfile } = require('./profiler');
const { isWorkTime, getTargetLimit } = require('./scheduler');

// CSS Selectors
const SELECTORS = {
    connectBtn: 'button[aria-label*="Invite"][aria-label*="connect"], button[aria-label*="Connect"]',
    addNoteBtn: 'button[aria-label="Add a note"]',
    noteTextarea: 'textarea[name="message"]',
    sendWithNoteBtn: 'button[aria-label="Send invitation"]',
    sendWithoutNoteBtn: 'button[aria-label="Send without a note"]',
    showMoreBtn: '.scaffold-finite-scroll__load-button',
};

/**
 * Replace tags like {{first_name}}, {{company}}, {{title}} in the note
 */
async function personalizeNote(noteTemplate, card) {
    if (!noteTemplate) return "";
    try {
        const data = await card.evaluate(el => {
            const text = el.innerText || "";
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const name = lines[0] || "";
            const firstName = name.split(' ')[0];
            const title = lines[1] || "";
            const companyMatch = text.match(/at\s+([^\n•]+)/i) || text.match(/@\s+([^\n•]+)/i);
            const company = companyMatch ? companyMatch[1].trim() : "";
            return { firstName, title, company };
        });

        return noteTemplate
            .replace(/{{first_name}}/gi, data.firstName || config.personalization.defaultFirstName)
            .replace(/{{company}}/gi, data.company || config.personalization.defaultCompany)
            .replace(/{{title}}/gi, data.title || "your role");
    } catch (e) {
        return noteTemplate;
    }
}

/**
 * Run auto-connect session
 */
async function autoConnect(page) {
    logger.divider();
    logger.action('Starting AUTO-CONNECT session...');

    if (!isWorkTime()) {
        logger.warn("Stopping connect session: Outside working hours.");
        return 0;
    }

    const sessionLimit = getTargetLimit(config.maxConnections, 'connect');
    logger.info(`Limit: ${sessionLimit} connections this session.`);

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

    while (connectCount < sessionLimit) {
        await randomMouseMove(page);
        await humanScroll(page);

        const buttons = await page.$$(SELECTORS.connectBtn);

        if (buttons.length === 0) {
            noButtonRounds++;
            if (noButtonRounds >= MAX_NO_BUTTON_ROUNDS) {
                const showMore = await page.$(SELECTORS.showMoreBtn);
                if (showMore) {
                    await humanHover(page, showMore);
                    await showMore.click();
                    await waitForPageLoad();
                    noButtonRounds = 0;
                } else {
                    break;
                }
            }
            continue;
        }

        noButtonRounds = 0;
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
        logger.info(`Processing ${filteredCards.length} candidates on screen...`);

        for (const cardEl of filteredCards) {
            if (connectCount >= sessionLimit) break;
            if (!isWorkTime()) break;

            const button = cardMap.get(cardEl);
            try {
                await humanHover(page, cardEl);
                if (Math.random() > 0.4) {
                    await humanViewProfile(page);
                }

                await humanHover(page, button);
                const isVisible = await button.isIntersectingViewport().catch(() => false);
                if (!isVisible) continue;

                logger.action(`Sending request...`);
                await button.click();
                await randomDelay(1500, 3500);

                const noteModal = await page.$(SELECTORS.addNoteBtn).catch(() => null);
                const sendWithout = await page.$(SELECTORS.sendWithoutNoteBtn).catch(() => null);

                if (config.connect.sendNote && noteModal && process.env.CONNECT_NOTE) {
                    await noteModal.click();
                    await randomDelay(800, 1500);
                    const textarea = await page.$(SELECTORS.noteTextarea);
                    if (textarea) {
                        const note = await personalizeNote(process.env.CONNECT_NOTE, cardEl);
                        logger.info(`  📝 Personalizing note...`);
                        await textarea.type(note.substring(0, 300), { delay: 60 });
                        await randomDelay(500, 1200);
                    }
                    const sendBtn = await page.$(SELECTORS.sendWithNoteBtn);
                    if (sendBtn) { await humanHover(page, sendBtn); await sendBtn.click(); }
                } else if (sendWithout) {
                    await humanHover(page, sendWithout);
                    await sendWithout.click();
                }

                await randomDelay(config.delays.postConnectMin, config.delays.postConnectMax);
                connectCount++;
                logger.success(`Connection request sent! [${connectCount}/${sessionLimit}]`);

                if (Math.random() < 0.15) await randomDelay(8000, 15000);
            } catch (err) {
                logger.error(`Error: ${err.message}`);
                await randomDelay(2000, 4000);
            }
        }

        await humanScroll(page);
        await randomDelay(config.delays.actionMin, config.delays.actionMax);
    }

    logger.success(`Auto-connect session complete. Total sent: ${connectCount}`);
    return connectCount;
}

module.exports = { autoConnect };
