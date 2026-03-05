/**
 * logger.js — Colored, timestamped terminal output
 */
const chalk = require('chalk');

const getTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0]; // HH:MM:SS
};

const logger = {
    info: (msg) => console.log(`${chalk.gray(getTime())} ${chalk.blueBright('ℹ')}  ${chalk.white(msg)}`),
    success: (msg) => console.log(`${chalk.gray(getTime())} ${chalk.greenBright('✔')}  ${chalk.greenBright(msg)}`),
    warn: (msg) => console.log(`${chalk.gray(getTime())} ${chalk.yellowBright('⚠')}  ${chalk.yellowBright(msg)}`),
    error: (msg) => console.log(`${chalk.gray(getTime())} ${chalk.redBright('✖')}  ${chalk.redBright(msg)}`),
    action: (msg) => console.log(`${chalk.gray(getTime())} ${chalk.magentaBright('➤')}  ${chalk.magentaBright(msg)}`),
    limit: (msg) => console.log(`${chalk.gray(getTime())} ${chalk.cyanBright('🛑')} ${chalk.cyanBright(msg)}`),
    divider: () => console.log(chalk.gray('─'.repeat(60))),
    banner: () => {
        console.log('');
        console.log(chalk.bold.cyanBright('╔══════════════════════════════════════════════════════╗'));
        console.log(chalk.bold.cyanBright('║') + chalk.bold.whiteBright('    🔗 LinkedIn Auto-Connect & Follow Bot v2.0       ') + chalk.bold.cyanBright('║'));
        console.log(chalk.bold.cyanBright('║') + chalk.yellowBright('         ⚠  Educational Use Only — Use Safely         ') + chalk.bold.cyanBright('║'));
        console.log(chalk.bold.cyanBright('╚══════════════════════════════════════════════════════╝'));
        console.log('');
    },
};

module.exports = logger;
