// The page must keep working (microscope, equations, charts) when WebGL is unavailable.
const puppeteer = require("puppeteer-core"), path = require("path");
const url = "file://" + path.resolve(process.argv[2] || "../site/index.html");
(async () => {
  const b = await puppeteer.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: "new", args: ["--disable-3d-apis", "--disable-webgl"] });
  const p = await b.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.setViewport({ width: 1280, height: 800 }); await p.goto(url, { waitUntil: "load" }); await new Promise(r => setTimeout(r, 800));
  for (const k of ["1", "2", "3", "4", "5"]) { await p.keyboard.press(k); await new Promise(r => setTimeout(r, 300)); }
  const r = await p.evaluate(() => ({ fb: !!document.getElementById("fallback"), paths: document.querySelectorAll("#ch-svg path").length, hd: document.getElementById("w-hd").textContent, eq: document.getElementById("eq-s2").textContent }));
  console.log((r.fb && r.paths > 0 && r.hd && r.eq && !errs.length ? "PASS" : "FAIL") + " no-WebGL: fallback note, chart, microscope text and equations still work", JSON.stringify(r), errs.join("; "));
  await b.close(); setTimeout(() => process.exit(0), 200);
})();
