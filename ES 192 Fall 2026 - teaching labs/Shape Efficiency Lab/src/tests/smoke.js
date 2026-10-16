// Smoke test + screenshots for the Shape Efficiency Lab.  Usage: node smoke.js [page] [outdir]
const puppeteer = require("puppeteer-core");
const path = require("path"), fs = require("fs");
const arg = process.argv[2] || path.join(__dirname, "..", "site", "index.html");
const out = path.resolve(process.argv[3] || path.join(__dirname, "out"));
fs.mkdirSync(out, { recursive: true });
const url = /^(https?|file):/.test(arg) ? arg : "file://" + path.resolve(arg);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = []; const ok = (c, m) => log.push((c ? "PASS " : "FAIL ") + m);
const TABS = { column: ["c-F", [0.25, 0.3, 0.75, 0.82]], wall: ["w-F", [300, 700, 1100]], cells: ["m-P", [0.2, 0.5, 1.15, 1.6]], lattice: ["l-P", [0.2, 0.3, 0.45, 0.9]], sheet: ["s-P", [0.2, 0.31, 0.6, 1]] };
(async () => {
  const browser = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"] });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: process.env.DARK ? "dark" : "light" }]);
  const W = +(process.env.W || 1440), H = +(process.env.H || 900);
  await page.setViewport({ width: W, height: H });
  await page.goto(url, { waitUntil: "load" }); await sleep(1200);
  const setVal = async (id, v) => { await page.evaluate((id, v) => { const s = document.getElementById(id); s.value = v; s.dispatchEvent(new Event("input")); }, id, v); };
  const only = process.env.ONLY ? process.env.ONLY.split(",") : Object.keys(TABS);
  for (const [i, t] of Object.keys(TABS).entries()) {
    if (!only.includes(t)) continue;
    await page.keyboard.press(String(i + 1)); await sleep(600);
    await page.click("#b-new"); await sleep(200);
    const [sl, vals] = TABS[t];
    for (const [k, v] of vals.entries()) {
      await setVal(sl, v); await sleep(1300);
      if (process.env.STRAIN && k === vals.length - 1) { await page.keyboard.press("s"); await sleep(500); }
      await page.screenshot({ path: path.join(out, `${t}-${k}${process.env.DARK ? "-dark" : ""}${W < 800 ? "-m" : ""}.png`), fullPage: W < 800 });
      if (process.env.STRAIN && k === vals.length - 1) { await page.keyboard.press("s"); await sleep(200); }
    }
    const info = await page.evaluate(() => ({ paths: document.querySelectorAll("#ch-svg path").length, step: document.querySelector("#m-steps .on")?.textContent, hd: document.getElementById("w-hd").textContent, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    ok(info.paths > 0, `${t}: chart drawn (${info.paths} paths); stage "${info.step}" — ${info.hd}`);
    ok(info.sw <= info.cw + 1, `${t}: no sideways scroll (${info.sw} vs ${info.cw})`);
    if (process.env.DESIGN) { await page.click('#ch-pick button[data-c="design"]'); await sleep(300); await page.screenshot({ path: path.join(out, `${t}-design.png`) }); await page.click('#ch-pick button[data-c="test"]'); }
  }
  ok(errors.length === 0, "no page errors" + (errors.length ? ":\n  " + [...new Set(errors)].slice(0, 12).join("\n  ") : ""));
  console.log(log.join("\n"));
  await browser.close();
  setTimeout(() => process.exit(0), 300);
})().catch(e => { console.error(e); process.exit(1); });
