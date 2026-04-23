const { Readable } = require("node:stream");
const express = require("express");
const yauzl = require("yauzl");
const path = require("path");

// express server

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
// TODO: fix coolify not sending env variables

app.listen(PORT, "0.0.0.0", () => {
	console.log(`http://localhost:${PORT}`);
});

// roblox api endpoints

const API_KEY = "NakL806c9EaGU8TtEWFntp+cM8KH7wbo47qgko0wWtSNKkM8ZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWs1aGEwdzRNRFpqT1VWaFIxVTRWSFJGVjBadWRIQXJZMDA0UzBnM2QySnZORGR4WjJ0dk1IZFhkRk5PUzJ0Tk9DSXNJbTkzYm1WeVNXUWlPaUkyT0RNNU9ERXpORFlpTENKbGVIQWlPakUzTnpZM01UVTJNemtzSW1saGRDSTZNVGMzTmpjeE1qQXpPU3dpYm1KbUlqb3hOemMyTnpFeU1ETTVmUS5rQUU0WWw2UThzQV9zVWtHaXYxcUpwSHZURXVCdnd1eUVrZ1BROUxab3VQbFB4NER4anl4a3hld0V1LWFocnZiX1R4WmpXazlfempiZU94OVA3UW4tYk5nX3NiWTJITmxjaDlGeFMtLWtMRm1CVDdTMXY3M051RjQ3dWYxTjhiUFR5WDZsZjJubl9senlJd3A3VFdYdkJqUjR4Rm14aDZseHVOOXo2eGp0X1Bod2JkdW9Kb2huaGZaTTlxaHlZNUM0b1M3TFJYSlRkTEg0TUdhbi1RRThwaUdodVg0akRuVmFfVkxuRTRuUldoZWRBUkl4VG9OX2NyQjk3QU5xeENDNHczUm9sWl81WG43UnY2VTB1WXpOTURxTFhJaXhZbVowVGtuYTY5Y0RlLUtPeTdQeU8zdFdlcEozWEMyRkdKb2FYSkoxM2JadThMZEFrbTBYeUdBZGc=";

const DETAILS_API = "https://games.roblox.com/v1/games?universeIds=";
const THUMBNAILS_API = "https://thumbnails.roblox.com/v1/games/multiget/thumbnails?format=Webp&size=768x432&universeIds=";
const ASSETS_API = "https://apis.roblox.com/asset-delivery-api/v1/assetId/";

app.get("/roblox/download", async (req, res) => {
	const { cdn, name } = req.query;

	const response = await fetch(decodeURIComponent(cdn));

	res.setHeader("Content-Disposition", `attachment; filename="${name}.rbxl"`);
	res.setHeader("Content-Type", "application/octet-stream");

	const body = Readable.fromWeb(response.body);
	body.pipe(res);
});

app.get("/roblox/info", async (req, res) => {
	const details = await fetch(DETAILS_API + req.query.ids)
		.then(response => response.json())
		.then(data => data.data);

	const thumbnails = await fetch(THUMBNAILS_API + req.query.ids)
		.then(response => response.json())
		.then(data => data.data.map(id => id.thumbnails[0].imageUrl));

	const cdns = await Promise.all(
		details.map(async experience => {
			return fetch(ASSETS_API + experience.rootPlaceId, {
				headers: {
					"x-api-key": API_KEY,
				},
			})
				.then(response => response.json())
				.then(data => data.location);
		}),
	);

	res.json({ details, thumbnails, cdns });
});
