import express from "express";
import archiver from "archiver";
import cors from "cors";
import { createBrowser } from "../services/browser.service.js";
import { scrapeProfile } from "../services/scraper.service.js";

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/scrape", async (req, res) => {
  const { url } = req.body ?? {};

  if (!url || typeof url !== "string") {
    return res.status(400).json({ success: false, error: "URL requerida" });
  }

  let browser;

  try {
    const instance = await createBrowser();
    browser = instance.browser;

    const data = await scrapeProfile(instance.page, url, 10);

    return res.json({
      success: true,
      total: data.length,
      data
    });
  } catch (error) {
    console.error("Error en /scrape:", error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Scraping failed"
    });
  } finally {
    if (browser) {
      await browser.close().catch(() => null);
    }
  }
});


// 🔥 NUEVO ENDPOINT: DESCARGA ZIP
app.post("/download", async (req, res) => {
  const { data } = req.body ?? {};

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: "No hay datos para descargar" });
  }

  try {
    // headers para descarga
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=scraping_result.zip"
    );

    const archive = archiver("zip", {
      zlib: { level: 9 }
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(res);

    // 🔥 añadir metadata
    archive.append(JSON.stringify(data, null, 2), {
      name: "data.json"
    });

    // 🔥 añadir imágenes (stream directo, sin guardar en disco)
    for (let i = 0; i < data.length; i++) {
      const item = data[i];

      if (!item?.img) continue;

      try {
        const response = await fetch(item.img);

        if (!response.ok) continue;

        const buffer = Buffer.from(await response.arrayBuffer());

        archive.append(buffer, {
          name: `images/image_${i}.jpg`
        });

      } catch (err) {
        console.warn(`⚠️ Error descargando imagen ${i}`, err.message);
      }
    }

    await archive.finalize();

  } catch (error) {
    console.error("Error en /download:", error);

    return res.status(500).json({
      error: "Error generando ZIP"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});