const express = require("express");
const path = require("path");
const fs = require("fs");

// express server

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
// TODO: fix coolify not sending env variables

app.listen(PORT, "0.0.0.0", () => {
	console.log(`http://localhost:${PORT}`);
});

// roblox api endpoints

const DETAILS_API = "https://games.roblox.com/v1/games?universeIds=";
const THUMBNAILS_API = "https://thumbnails.roblox.com/v1/games/multiget/thumbnails?format=Webp&size=768x432&universeIds=";

app.get("/roblox/details", async (req, res) => {
	const details = await fetch(DETAILS_API + req.query.ids)
		.then(response => response.json())
		.then(data => data.data);

	const thumbnails = await fetch(THUMBNAILS_API + req.query.ids)
		.then(response => response.json())
		.then(data => data.data.map(id => id.thumbnails[0].imageUrl));

	res.json({ details, thumbnails });
});
