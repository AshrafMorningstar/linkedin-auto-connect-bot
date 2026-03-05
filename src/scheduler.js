/**
 * scheduler.js — Business Hours & Warm-up Logic
 */
const config = require('../config');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

const STATS_FILE = path.join(__dirname, '../.bot_stats.json');

/**
 * Check if current time is within allowed working hours
 */
function isWorkTime() {
    if (!config.schedule.enabled) return true;

    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    // Check day of week
    if (!config.schedule.days.includes(day)) {
        logger.warn(`Current day (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}) is not a scheduled work day.`);
        return false;
    }

    // Check hour
    if (hour < config.schedule.startHour || hour >= config.schedule.endHour) {
        logger.warn(`Current time (${hour}:00) is outside working hours (${config.schedule.startHour}:00 - ${config.schedule.endHour}:00).`);
        return false;
    }

    return true;
}

/**
 * Calculate dynamic limit based on warm-up period
 */
function getTargetLimit(baseLimit, type = 'connect') {
    if (!config.warmUp.enabled) return baseLimit;

    let stats = { firstRun: Date.now() };
    try {
        if (fs.existsSync(STATS_FILE)) {
            stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
        } else {
            fs.writeFileSync(STATS_FILE, JSON.stringify(stats), 'utf8');
        }
    } catch (e) { /* ignore */ }

    const daysActive = Math.floor((Date.now() - stats.firstRun) / (1000 * 60 * 60 * 24));
    const warmedLimit = config.warmUp.startLimit + (daysActive * config.warmUp.incrementPerDay);

    const finalLimit = Math.min(warmedLimit, config.warmUp.maxRampLimit, baseLimit);

    if (finalLimit < baseLimit) {
        logger.info(`🔥 Warm-up Active (Day ${daysActive + 1}): Limit reduced to ${finalLimit} (target was ${baseLimit}).`);
    }

    return finalLimit;
}

module.exports = { isWorkTime, getTargetLimit };
