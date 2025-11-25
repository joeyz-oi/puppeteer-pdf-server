import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/pdf", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send("Missing ?url= parameter");
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 120000
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation error");
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("PDF Server running on port " + PORT);
});
