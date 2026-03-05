/**
 * profiler.js — High-Profile People Targeting
 *
 * Evaluates a person card on LinkedIn and scores them based on:
 *  1. Job title keywords (CEO, Founder, VP, Director, Influencer, etc.)
 *  2. Connection count (500+ badge = established network)
 *  3. Follower count if visible
 *  4. "LinkedIn Top Voice" / "Creator" badge
 *
 * Only people who pass the minimum score threshold get a connect/follow.
 */
const config = require('../config');
const logger = require('./logger');

// ─── High-Profile Title Keywords ──────────────────────────────────────────────
// Scored by tier: Tier 1 = biggest, Tier 3 = good but common
const TITLE_TIERS = {
    tier1: [
        'CEO', 'Chief Executive', 'Founder', 'Co-Founder', 'President',
        'Managing Director', 'Board Member', 'Chairman', 'Chairwoman',
        'Executive Director', 'Partner', 'Investor', 'Venture Capital',
        'Angel Investor', 'General Partner',
    ],
    tier2: [
        'CTO', 'CFO', 'COO', 'CMO', 'CPO', 'CRO', 'CHRO', 'CDO',
        'VP', 'Vice President', 'SVP', 'EVP', 'Head of', 'Global Head',
        'Director', 'Principal', 'Managing Partner', 'Entrepreneur',
    ],
    tier3: [
        'Senior', 'Lead', 'Manager', 'Consultant', 'Advisor', 'Speaker',
        'Author', 'Influencer', 'Strategist', 'Thought Leader',
    ],
};

/**
 * Score a single person card element.
 * Returns a numeric score — higher = more high-profile.
 * Returns -1 if the person should be SKIPPED entirely.
 *
 * @param {ElementHandle} card - The person card element (li or article)
 * @returns {Promise<{ score: number, reasons: string[] }>}
 */
async function scorePersonCard(card) {
    let score = 0;
    const reasons = [];

    try {
        const cardText = await card.evaluate(el => el.innerText || '');
        const cardHTML = await card.evaluate(el => el.innerHTML || '');
        const textUpper = cardText.toUpperCase();

        // ── Tier 1 Titles (high weight) ────────────────────────────
        for (const kw of TITLE_TIERS.tier1) {
            if (textUpper.includes(kw.toUpperCase())) {
                score += 30;
                reasons.push(`Tier-1 title: "${kw}"`);
                break; // Only count one tier1 match
            }
        }

        // ── Tier 2 Titles ───────────────────────────────────────────
        for (const kw of TITLE_TIERS.tier2) {
            if (textUpper.includes(kw.toUpperCase())) {
                score += 20;
                reasons.push(`Tier-2 title: "${kw}"`);
                break;
            }
        }

        // ── Tier 3 Titles ───────────────────────────────────────────
        for (const kw of TITLE_TIERS.tier3) {
            if (textUpper.includes(kw.toUpperCase())) {
                score += 10;
                reasons.push(`Tier-3 title: "${kw}"`);
                break;
            }
        }

        // ── 500+ Connections Badge ──────────────────────────────────
        if (textUpper.includes('500+') || textUpper.includes('CONNECTIONS')) {
            score += 25;
            reasons.push('500+ connections');
        }

        // ── Follower Count (e.g. "12,345 followers") ────────────────
        const followerMatch = cardText.match(/([\d,]+)\s*follower/i);
        if (followerMatch) {
            const followers = parseInt(followerMatch[1].replace(/,/g, ''), 10);
            if (followers >= 10000) { score += 30; reasons.push(`${followers.toLocaleString()} followers`); }
            else if (followers >= 1000) { score += 15; reasons.push(`${followers.toLocaleString()} followers`); }
            else if (followers >= 500) { score += 8; reasons.push(`${followers.toLocaleString()} followers`); }
        }

        // ── LinkedIn Top Voice / Creator Badge ──────────────────────
        if (textUpper.includes('TOP VOICE') || cardHTML.includes('top-voice') || cardHTML.includes('creator-badge')) {
            score += 25;
            reasons.push('LinkedIn Top Voice / Creator');
        }

        // ── Verified / Open to Work (lower priority signals) ────────
        if (textUpper.includes('VERIFIED')) {
            score += 5;
            reasons.push('Verified');
        }

        // ── Custom title keywords from config ───────────────────────
        if (config.highProfile && config.highProfile.customKeywords) {
            for (const kw of config.highProfile.customKeywords) {
                if (textUpper.includes(kw.toUpperCase())) {
                    score += 15;
                    reasons.push(`Custom keyword: "${kw}"`);
                }
            }
        }

        // ── Target Professions from config ──────────────────────────
        if (config.highProfile && config.highProfile.targetProfessions) {
            for (const prof of config.highProfile.targetProfessions) {
                if (textUpper.includes(prof.toUpperCase())) {
                    score += 20;
                    reasons.push(`Pref. Profession: "${prof}"`);
                }
            }
        }

    } catch (err) {
        // If we can't read the card, give neutral score
        return { score: 0, reasons: ['Could not read card'] };
    }

    return { score, reasons };
}

/**
 * Filter and sort an array of card elements by high-profile score.
 * Cards below the minimum threshold are dropped.
 *
 * @param {ElementHandle[]} cards - Array of card elements
 * @param {number} minScore - Minimum score to include (from config)
 * @returns {Promise<ElementHandle[]>} - Sorted high-to-low, filtered
 */
async function filterHighProfile(cards, minScore = 0) {
    logger.info(`  🎯 Profiling ${cards.length} people for high-profile score...`);

    const scored = [];
    for (const card of cards) {
        const { score, reasons } = await scorePersonCard(card);
        scored.push({ card, score, reasons });
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Log top profiles found
    const top = scored.slice(0, 5);
    for (const { score, reasons } of top) {
        if (score > 0) {
            logger.info(`  ⭐ Score ${score}: ${reasons.join(', ')}`);
        }
    }

    // Filter by minimum threshold
    const filtered = scored.filter(s => s.score >= minScore);
    const skipped = scored.length - filtered.length;

    if (minScore > 0) {
        logger.info(`  🎯 High-profile filter: keeping ${filtered.length}/${scored.length} (skipped ${skipped} low-profile)`);
    }

    return filtered.map(s => s.card);
}

module.exports = { scorePersonCard, filterHighProfile };
