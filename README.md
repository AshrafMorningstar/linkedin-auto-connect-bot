<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=32&pause=1000&color=0A66C2&center=true&vCenter=true&width=600&lines=LinkedIn+Auto-Connect+Bot+%F0%9F%94%97;100%25+Human-Like+Behavior+%F0%9F%95%B5%EF%B8%8F;Stealth+Mode+%E2%9C%94%EF%B8%8F;Safe+%26+Smart+Automation+%F0%9F%9B%A1%EF%B8%8F" alt="Typing SVG" />

<br/>

<a href="https://github.com/search?q=linkedin+bot&type=repositories"><img src="https://img.shields.io/badge/LinkedIn-Automation-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"/></a>
<a href="#"><img src="https://img.shields.io/badge/Puppeteer-Stealth-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white"/></a>
<a href="#"><img src="https://img.shields.io/badge/Node.js-v16%2B-339933?style=for-the-badge&logo=node.js&logoColor=white"/></a>
<a href="#"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge"/></a>
<a href="#"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge"/></a>
<a href="#"><img src="https://img.shields.io/github/stars/AshrafMorningstar/linkedin-auto-connect-bot?style=for-the-badge&color=gold"/></a>

<br/><br/>

> 🚀 The **most human-like** LinkedIn automation bot ever built. Real browser. Real clicks. Zero detection.

<br/>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />

</div>

<br/>

## 🌟 Why This is the Best LinkedIn Bot Ever Built

| Feature | This Bot | Other Bots |
|---|---|---|
| **Real Visible Browser** | ✅ Full Chrome window | ❌ Headless / API |
| **Warm-up Mode** | ✅ Adaptive limit ramping | ❌ Static/Risk limits |
| **Business Hours** | ✅ 9-to-5 Scheduling | ❌ 24/7 (Bot signal) |
| **Dynamic Tags** | ✅ {{first_name}}, {{company}} | ❌ Generic text |
| **Drip Mimicry** | ✅ Pre-Connect profile view | ❌ Direct clicks |
| **Stealth Mode** | ✅ Puppeteer-Extra Stealth | ❌ Easily detected |
| **High-Profile Targeting**| ✅ CEO/Founder/VP priority | ❌ Random targets |
| **Profile Scoring** | ✅ Title + Followers + Badges | ❌ Not available |

<br/>

<div align="center">
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />
</div>

<br/>

## ✨ Pro Features (2026 Edition)

<table>
<tr>
<td width="50%">

### 🕵️ 100% Human-Like Behavior
Controls a **real, visible Chrome window**. Scrolls, moves the mouse, and views profiles for 10-25s before connecting.

### 🎯 High-Profile Targeting
Scores every person by **title**, **follower count**, **500+ badge**, and **LinkedIn Top Voice** status.

### 🏷️ Dynamic Personalization
Automatically inserts the person's **{{first_name}}**, **{{company}}**, or **{{title}}** into your connection notes.

</td>
<td width="50%">

### 📈 Smart Warm-up Mode
Gradually increases daily limits (e.g., +3 every day) to safely "warm up" your account and avoid flags.

### 📅 Working Hours Scheduler
Configurable business hours (e.g., 9 AM - 6 PM, Mon-Fri). The bot sleeps when humans sleep.

### 🛑 Multi-Layer Safety
Randomized delays, CAPTCHA awareness, and session hard-caps keep your account in the "Safe Zone".

</td>
</tr>
</table>

<br/>

<div align="center">
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" />
</div>

<br/>

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/AshrafMorningstar/linkedin-auto-connect-bot.git
cd linkedin-auto-connect-bot

# 2. Install dependencies (auto-downloads Chrome!)
npm install

# 3. Set up your credentials
cp .env.example .env
# ✏️ Edit .env with your LinkedIn email + password

# 4. Run the bot!
node index.js
```

That's it. A real Chrome window opens and the bot does everything. 🎉

<br/>

## 🎭 See It In Action

```
╔══════════════════════════════════════════════════════╗
║    🔗 LinkedIn Auto-Connect & Follow Bot v2.0       ║
║         ⚠  Educational Use Only — Use Safely         ║
╚══════════════════════════════════════════════════════╝

02:51:12 ℹ  Safety Config:
02:51:12 ℹ    Max Connects/session : 50
02:51:12 ℹ    Max Follows/session  : 30
02:51:12 ℹ    Action delay         : 5s – 15s
02:51:12 ℹ    Browser mode         : Visible window ✔
────────────────────────────────────────────────────────
02:51:13 ✔  Browser launched with stealth mode active.
02:51:23 ℹ  Logging in as: your@email.com
02:52:12 ✔  Login successful! ✔
02:52:23 ➤  Starting AUTO-CONNECT session...
02:52:30 🎯 High-Profile mode ON — targeting CEOs & Founders
02:52:35 ⭐ Score 55: Tier-1 title: "CEO", 500+ connections
02:52:35 ⭐ Score 45: Tier-2 title: "VP", 10,500 followers
02:52:45 ✔  Connection request sent! [1/50]
```

<br/>

## 🎯 High-Profile Scoring System

The bot **automatically prioritizes** high-value connections:

```
CEO / Founder / President / Investor    →  +30 points
CTO / VP / Director / Head of          →  +20 points
Senior / Manager / Advisor / Speaker   →  +10 points
500+ connections badge                  →  +25 points
10,000+ followers                       →  +30 points
LinkedIn Top Voice / Creator Badge      →  +25 points
```

Set `minScore: 30` in `config.js` to connect **only with C-suite executives**.

<br/>

## ⚙️ Configuration

Edit `config.js` to customize everything:

```js
const config = {
  maxConnections: 50,       // Max connects per session (keep ≤ 25 for safety)
  maxFollows: 30,           // Max follows per session

  highProfile: {
    enabled: true,          // 🎯 Prioritize CEOs, Founders, VPs
    minScore: 20,           // Minimum profile score to connect
    customKeywords: [       // Add your niche keywords
      'Entrepreneur', 'Startup', 'Growth Hacker'
    ],
  },

  delays: {
    actionMin: 5000,        // 5s min between actions
    actionMax: 15000,       // 15s max between actions
  },

  connect: {
    sendNote: false,        // Send personalized note with requests
  }
};
```

<br/>

## 📁 Project Structure

```
linkedin-auto-connect-bot/
├── 📄 index.js           ← Main entry + interactive menu
├── ⚙️  config.js          ← All safety limits and settings
├── 🔒 .env.example       ← Credential template (copy → .env)
└── src/
    ├── 🌐 browser.js     ← Stealth Chrome launcher
    ├── 🔑 auth.js        ← Auto-login with human typing
    ├── 🔗 connect.js     ← Auto-connect module
    ├── 👁️  follow.js      ← Auto-follow module
    ├── 🎯 profiler.js    ← High-profile scoring engine
    ├── 🤖 humanizer.js   ← Random delays, mouse, scroll
    └── 📝 logger.js      ← Colored terminal output
```

<br/>

## 🛡️ Safety Tips

> **Start small. Grow safely.**

- ✅ Set `maxConnections: 5` for your **first test run**
- ✅ Run **at most once per day**
- ✅ Keep the browser window **visible** (never use headless mode)
- ✅ Monitor LinkedIn for **"Unusual activity"** warnings
- ✅ Add a custom search URL to target **your specific niche**
- ❌ Never run more than **50 actions** in a single session

<br/>

## 🤝 Contributing

Contributions are what make the open source community amazing! Pull requests are welcome.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br/>

## ⭐ Support This Project

If this project helped you grow your LinkedIn network, **please give it a star!** ⭐

It helps other developers find this tool and motivates further development.

[![Star History Chart](https://api.star-history.com/svg?repos=AshrafMorningstar/linkedin-auto-connect-bot&type=Date)](https://star-history.com/#AshrafMorningstar/linkedin-auto-connect-bot&Date)

<br/>

## ⚖️ Disclaimer

> This project is for **educational purposes only**. Web scraping and automation may violate LinkedIn's Terms of Service. The author is not responsible for any account restrictions or bans. Always use responsibly with low limits.

<br/>

<div align="center">

Made with ❤️ for the developer community

<a href="https://github.com/AshrafMorningstar/linkedin-auto-connect-bot/stargazers">⭐ Star this repo</a> · 
<a href="https://github.com/AshrafMorningstar/linkedin-auto-connect-bot/issues">🐛 Report Bug</a> · 
<a href="https://github.com/AshrafMorningstar/linkedin-auto-connect-bot/pulls">✨ Request Feature</a>

</div>
