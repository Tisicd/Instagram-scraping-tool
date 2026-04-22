function parseCountValue(text) {
  if (!text) return 0;
  const normalized = text.toLowerCase().replace(/\s/g, "");
  const value = parseFloat(normalized.replace(",", "."));
  if (Number.isNaN(value)) return 0;
  if (normalized.includes("m")) return Math.round(value * 1000000);
  if (normalized.includes("k")) return Math.round(value * 1000);
  return Math.round(value);
}

function normalizeInstagramUrl(url) {
  if (typeof url !== "string" || !url.trim()) {
    throw new Error("URL inválida");
  }

  const parsed = new URL(url.trim());
  if (!parsed.hostname.includes("instagram.com")) {
    throw new Error("Solo se permiten URLs de Instagram");
  }

  parsed.search = "";
  parsed.hash = "";
  return parsed.toString().replace(/\/+$/, "/");
}

export async function scrapeProfile(page, rawUrl, maxPosts = 10) {
  const profileUrl = normalizeInstagramUrl(rawUrl);

  await page.goto(profileUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector('a[href*="/p/"]', { timeout: 20000 });

  const seenLinks = new Set();
  let previousCount = 0;
  let stagnantCycles = 0;

  while (seenLinks.size < maxPosts && stagnantCycles < 4) {
    const links = await page.$$eval('a[href*="/p/"]', (anchors) =>
      anchors.map((anchor) => anchor.href).filter((href) => /\/p\/[^/]+\/?/.test(href))
    );

    links.forEach((link) => seenLinks.add(link));

    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 1.5);
    });

    await page.waitForFunction(
      ({ oldCount }) => document.querySelectorAll('a[href*="/p/"]').length > oldCount,
      { timeout: 3500 },
      { oldCount: previousCount }
    ).catch(() => null);

    const currentCount = seenLinks.size;
    stagnantCycles = currentCount === previousCount ? stagnantCycles + 1 : 0;
    previousCount = currentCount;
  }

  const targetLinks = Array.from(seenLinks).slice(0, maxPosts);

  const posts = await page.evaluate(
    ({ links }) => {
      const cleanText = (value) => (typeof value === "string" ? value.trim() : "");
      const cleanDate = (value) => (typeof value === "string" ? value : "");

      return links
        .map((targetLink) => {
          const postAnchor = Array.from(document.querySelectorAll('a[href*="/p/"]')).find(
            (anchor) => anchor.href === targetLink
          );
          if (!postAnchor) return null;

          const article = postAnchor.closest("article") || postAnchor.closest("div");
          const imageNode = postAnchor.querySelector("img");
          const img = imageNode?.src || imageNode?.getAttribute("src") || "";
          const description =
            cleanText(imageNode?.getAttribute("alt")) ||
            cleanText(postAnchor.getAttribute("aria-label")) ||
            "";

          const timeNode =
            article?.querySelector("time") ||
            postAnchor.querySelector("time") ||
            article?.parentElement?.querySelector("time");
          const date = cleanDate(timeNode?.getAttribute("datetime"));

          const metadataText = cleanText(article?.textContent || postAnchor.textContent || "");
          const compact = metadataText.toLowerCase();
          const likesMatch = compact.match(/([\d.,]+[km]?)\s*(likes?|me gusta)/i);
          const commentsMatch = compact.match(/([\d.,]+[km]?)\s*(comments?|comentarios?)/i);

          return {
            img,
            description,
            likes: likesMatch ? likesMatch[1] : "0",
            comments: commentsMatch ? commentsMatch[1] : "0",
            date
          };
        })
        .filter((item) => item && item.img);
    },
    { links: targetLinks }
  );

  return posts.map((post) => ({
    ...post,
    likes: parseCountValue(post.likes),
    comments: parseCountValue(post.comments),
    date: post.date || null
  }));
}