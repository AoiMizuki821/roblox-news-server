import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/today", async (req, res) => {
    try {
        const response = await fetch(
            `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_KEY}&country=jp&language=ja&excludecategory=entertainment`
        );

        const data = await response.json();

        console.log("API RESPONSE:", data);

        if (data.status !== "success") {
            return res.status(500).json(data);
        }

        if (!Array.isArray(data.results)) {
            return res.status(500).json({ error: "Results is not array", raw: data });
        }
const unique = [];
const seen = new Set();

for (const article of data.results) {
    if (!seen.has(article.title)) {
        seen.add(article.title);
        unique.push(article);
    }
}
        const items = data.results.slice(0, 5).map(article => ({
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