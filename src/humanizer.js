/**
 * humanizer.js — Human-like interaction utilities
 * Randomized delays, typing, scrolling, and mouse movement
 */
const config = require('../config');
const logger = require('./logger');

/**
 * Wait for a random amount of time between min and max milliseconds.
 */
async function randomDelay(min, max) {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    logger.info(`  ⏱  Waiting ${(ms / 1000).toFixed(1)}s...`);
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type text into a field one character at a time, simulating human typing speed.
 * @param {Page} page - Puppeteer page
 * @param {string} selector - CSS selector of the input element
 * @param {string} text - Text to type
 */
async function humanType(page, selector, text) {
    await page.focus(selector);
    for (const char of text) {
        await page.keyboard.type(char);
        const delay = Math.floor(Math.random() * (config.delays.typeMax - config.delays.typeMin)) + config.delays.typeMin;
        await new Promise((r) => setTimeout(r, delay));
    }
}

/**
 * Perform a series of random scrolls to simulate browsing behavior.
 * @param {Page} page - Puppeteer page
 */
async function humanScroll(page) {
    const steps = config.scroll.stepsPerBrowse;
    for (let i = 0; i < steps; i++) {
        const scrollAmount = Math.floor(
            Math.random() * (config.scroll.stepMax - config.scroll.stepMin) + config.scroll.stepMin
        );
        const direction = Math.random() > 0.2 ? 1 : -1; // Mostly scroll down, occasionally up
        await page.evaluate((amount) => {
            window.scrollBy({ top: amount, behavior: 'smooth' });
        }, scrollAmount * direction);

        const pause = Math.floor(Math.random() * (config.delays.scrollMax - config.delays.scrollMin)) + config.delays.scrollMin;
        await new Promise((r) => setTimeout(r, pause));
    }
}

/**
 * Move the mouse to a random position on the page viewport.
 * @param {Page} page - Puppeteer page
 */
async function randomMouseMove(page) {
    const viewport = page.viewport();
    const x = Math.floor(Math.random() * (viewport ? viewport.width : 1366));
    const y = Math.floor(Math.random() * (viewport ? viewport.height : 768));
    await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 10) + 5 });
}

/**
 * Move mouse smoothly to an element's center before clicking.
 * @param {Page} page - Puppeteer page
 * @param {ElementHandle} element - Element to hover over
 */
async function humanHover(page, element) {
    const box = await element.boundingBox();
    if (!box) return;
    // Add slight offset so we don't always hit dead center
    const x = box.x + box.width / 2 + (Math.random() * 10 - 5);
    const y = box.y + box.height / 2 + (Math.random() * 6 - 3);
    await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 15) + 8 });
    // Brief pause before click
    await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 400) + 100));
}

/**
 * Simulate a human-like page load wait (random within range).
 */
async function waitForPageLoad() {
    await randomDelay(config.delays.pageLoadMin, config.delays.pageLoadMax);
}

module.exports = {
    randomDelay,
    humanType,
    humanScroll,
    randomMouseMove,
    humanHover,
    waitForPageLoad,
};
