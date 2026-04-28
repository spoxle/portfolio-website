const nodemailer = require("nodemailer");
const express = require("express");
const path = require("path");

const { Readable } = require("stream");
require("dotenv").config();

// express server

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT;

const server = app.listen(PORT, "0.0.0.0", () => {
	console.log(`express app now running on http://localhost:${PORT}`);
});

// email

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.NODEMAILER_EMAIL,
		pass: process.env.NODEMAILER_PASSWORD,
	},
});

app.post("/send", (req, res) => {
	const { name, email, subject, message } = req.body;

	const mailOptions = {
		from: email,
		to: process.env.NODEMAILER_EMAIL,
		subject: `PORTFOLIO CONTACT: ${subject}`,
		text: `Name: ${name}\nContact: ${email}\nMessage: ${message}`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
			res.sendStatus(500);
		} else {
			res.sendStatus(200);
		}
	});
});

// roblox api endpoints

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
					"x-api-key": process.env.ROBLOX_API_KEY,
				},
			})
				.then(response => response.json())
				.then(data => data.location);
			``;
		}),
	);

	res.json({
		details,
		thumbnails,
		cdns,
	});
});
