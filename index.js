import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/today", async (req, res) => {
    try {
        const response = await fetch(
            "https://www3.nhk.or.jp/rss/news/cat0.xml"
        );

        const xmlText = await response.text();

        const parser = new XMLParser();
        const jsonData = parser.parse(xmlText);

       const items = jsonData.rss.channel.item.slice(0, 5).map(item => {
    const date = new Date(item.pubDate);
    const formatted = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;

    return {
        title: item.title,
        pubDate: formatted,
        description: item.description || ""
    };
});

        res.json(items);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch NHK RSS" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});