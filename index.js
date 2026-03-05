/**
 * index.js — LinkedIn Auto-Connect & Follow Bot
 * Main entry point with interactive terminal menu
 *
 * ⚠️  Educational use only. Use responsibly.
 *     Always keep limits low to protect your account.
 */
require('dotenv').config();
const readline = require('readline');
const logger = require('./src/logger');
const { launchBrowser } = require('./src/browser');
const { login } = require('./src/auth');
const { autoConnect } = require('./src/connect');
const { autoFollow } = require('./src/follow');
const config = require('./config');

// ── Parse optional CLI args ──────────────────────────────────
const args = process.argv.slice(2);
const cliMode = args.find(a => a.startsWith('--mode='))?.split('=')[1];

// ── Session stats ────────────────────────────────────────────
let sessionStats = {
    connects: 0,
    follows: 0,
    startTime: null,
};

/**
 * Display the interactive menu and return user choice
 */
function showMenu() {
    return new Promise((resolve) => {
        console.log('');
        console.log('  ┌─────────────────────────────────────┐');
        console.log('  │       What should the bot do?       │');
        console.log('  ├─────────────────────────────────────┤');
        console.log('  │  1.  Auto Connect (People You May   │');
        console.log('  │      Know / Search URL)             │');
        console.log('  │  2.  Auto Follow                    │');
        console.log('  │  3.  Both (Connect then Follow)     │');
        console.log('  │  4.  Exit                           │');
        console.log('  └─────────────────────────────────────┘');
        console.log('');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('  Enter your choice (1-4): ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Print session summary
 */
function printSummary() {
    const elapsed = ((Date.now() - sessionStats.startTime) / 1000 / 60).toFixed(1);
    logger.divider();
    logger.success(`Session Complete!`);
    logger.info(`  ⏱  Duration   : ${elapsed} minutes`);
    logger.info(`  🔗 Connects   : ${sessionStats.connects}`);
    logger.info(`  👁  Follows    : ${sessionStats.follows}`);
    logger.info(`  📊 Total acts  : ${sessionStats.connects + sessionStats.follows}`);
    logger.divider();
}

const { isWorkTime } = require('./src/scheduler');

/**
 * Main bot runner
 */
async function main() {
    logger.banner();

    if (!isWorkTime() && cliMode) {
        logger.error("❌ SCHEDULER: Current time is outside allowed working hours. Bot will not run.");
        logger.info("Edit config.js -> schedule to change working hours.");
        process.exit(1);
    }

    // Show configured limits
    logger.info(`Safety Config:`);
    logger.info(`  Max Connects/session : ${config.maxConnections}`);
    logger.info(`  Max Follows/session  : ${config.maxFollows}`);
    logger.info(`  Action delay         : ${config.delays.actionMin / 1000}s – ${config.delays.actionMax / 1000}s`);
    logger.info(`  Schedule Enforcement : ${config.schedule.enabled ? 'Enabled' : 'Disabled'}`);
    logger.divider();

    // Determine mode from CLI arg or interactive menu
    let choice = cliMode;
    if (!choice) {
        choice = await showMenu();
    }

    if (choice === '4' || choice === 'exit') {
        logger.info('Goodbye!');
        process.exit(0);
    }

    // Check again after menu selection if not already checked
    if (!isWorkTime()) {
        logger.error("❌ SCHEDULER: Current time is outside allowed working hours.");
        logger.info("Edit config.js -> schedule to change working hours.");
        process.exit(1);
    }

    sessionStats.startTime = Date.now();

    // Launch browser
    const { browser, page } = await launchBrowser();

    // Graceful shutdown on Ctrl+C
    process.on('SIGINT', async () => {
        logger.warn('Interrupted! Closing browser gracefully...');
        printSummary();
        await browser.close();
        process.exit(0);
    });

    try {
        // Login
        await login(page);

        // Run selected mode
        if (choice === '1' || choice === 'connect') {
            sessionStats.connects = await autoConnect(page);

        } else if (choice === '2' || choice === 'follow') {
            sessionStats.follows = await autoFollow(page);

        } else if (choice === '3' || choice === 'both') {
            // Connect first, then follow
            sessionStats.connects = await autoConnect(page);
            logger.info('Connect phase complete. Starting follow phase...');
            await new Promise(r => setTimeout(r, 5000));
            sessionStats.follows = await autoFollow(page);
        }

        printSummary();

    } catch (err) {
        logger.error(`Fatal error: ${err.message}`);
        if (config.logging.verbose) console.error(err.stack);
    } finally {
        logger.info('Closing browser...');
        await browser.close();
    }
}

main();
