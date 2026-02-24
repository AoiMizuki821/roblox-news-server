import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // ← 先に実行

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/today", async (req, res) => {
    try {

        const url =
            `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}` +
            `&country=jp&language=ja` +
            `&excludecategory=entertainment` +
            `&excludedomain=5ch.net,hayabusa5ch.net,blog.jp,fc2.com,ameblo.jp`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "success") {
            return res.status(500).json(data);
        }

        if (!Array.isArray(data.results)) {
            return res.status(500).json({ error: "Results is not array", raw: data });
        }

        // 🔹 重複除去
        const unique = [];
        const seen = new Set();

        for (const article of data.results) {
            if (article.title && !seen.has(article.title)) {
                seen.add(article.title);
                unique.push(article);
            }
        }

        // 🔹 まとめ・煽り除外
        const NG_TITLE_PATTERNS = ["【画像】", "【動画】", "ｗｗ", "まとめ", "炎上", "衝撃"];
        const filtered = unique.filter(a => {
            const t = a.title || "";
            return !NG_TITLE_PATTERNS.some(p => t.includes(p));
        });

        // 🔹 ここで slice
        const items = filtered.slice(0, 5).map(article => ({
            title: article.title,
            description: article.description || "",
            pubDate: article.pubDate || ""
        }));

        res.json(items);

    } catch (err) {
        console.error("ERROR:", err);
        res.status(500).json({ error: "Failed to fetch NewsData" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});