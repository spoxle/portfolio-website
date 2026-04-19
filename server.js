const express = require("express");
const path = require("path");
const zlib = require("zlib");
const fs = require("fs");

// express server

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
// TODO: fix coolify not sending env variables

app.listen(PORT, "0.0.0.0", () => {
	console.log(`http://localhost:${PORT}`);
});

// roblox api

const ROBLOX_API_KEY = "NakL806c9EaGU8TtEWFntor9tPMvvZe7fcjj0W+fVF5fo+6AZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SWs1aGEwdzRNRFpqT1VWaFIxVTRWSFJGVjBadWRHOXlPWFJRVFhaMldtVTNabU5xYWpCWEsyWldSalZtYnlzMlFTSXNJbTkzYm1WeVNXUWlPaUkyT0RNNU9ERXpORFlpTENKbGVIQWlPakUzTnpZMU56QXhOamNzSW1saGRDSTZNVGMzTmpVMk5qVTJOeXdpYm1KbUlqb3hOemMyTlRZMk5UWTNmUS5MakJPWUFKRmhlbmJRcFlTUjVqVUxlTE1KbjVJQy1HRVBIRUUya1AxeFdMNjdWVkVsTVR4M0xfVWRhODNva2hHTmMwdTZhSlF5c244ZDVPalF0MTFGclVYZjR5ckVQamlqYU1MQWlYUFE5Z3loamV4emo5NWk0czhTdlNPX3NiU3BodDRTbGhzeVllT1k3QTYzUVVKYlhfWkhLTHJPUmxDVlJUbmUtWm43VWx4YUVMWjExeUpCRW9ZampUUlBmV1ExQXc0U0tsN1g5ZGFjZEt0MzBhSjBvYi1scDdNUnFCd0RtMG9KUUd4QmRNblFGc0JuTjZZN3VvOEhQZ251U3VJWlpBNkhXdU9ndWRKT3hteUQ2SmZyX2Niamk4MlV0Z3doMFh2dTA3d0Eyc0lIdkU4X1IteFBEQ243ODl6T0owc0lON2NrZWpwTXNrS1Y4cXB1eFJhUEE=";
const ROBLOX_USER_ID = 683981346;
const ROBLOX_API_HEADERS = {
	"Content-Type": "application/json",
	"x-api-key": ROBLOX_API_KEY,
};

const USER_GAMES_API = "https://games.roblox.com/v2/users/*/games";
const GAMES_API = "https://games.roblox.com/v1/games?universeIds=*";
const ASSETS_API = "https://apis.roblox.com/asset-delivery-api/v1/assetId/*";

// projects endpoint

async function getRobloxThumbnails(assets) {
	const requests = assets.map(asset => {
		return {
			requestId: asset.id,
			targetId: asset.id,
			type: asset.type,
			size: "512x512",
			format: "WebP",
		};
	});

	const thumbnails = await fetch("https://thumbnails.roblox.com/v1/batch", {
		method: "POST",
		headers: ROBLOX_API_HEADERS,
		body: JSON.stringify(requests),
	})
		.then(res => res.json())
		.then(data => data.data.map(thumbnail => thumbnail.imageUrl));

	return thumbnails;
}

async function getRobloxUserExperiences(userId) {
	const response = await fetch(USER_GAMES_API.replace("*", userId), {
		headers: ROBLOX_API_HEADERS,
	})
		.then(res => res.json())
		.then(data => data.data);

	return response;
}

async function getRobloxExperiencesDetails(ids) {
	const response = await fetch(GAMES_API.replace("*", ids.join(",")), {
		headers: ROBLOX_API_HEADERS,
	})
		.then(res => res.json())
		.then(data =>
			data.data.map(game => ({
				copyable: game.copyingAllowed,
				url: game.canonicalUrlPath,
			})),
		);

	return response;
}

async function getRobloxExperienceFile(assetId) {
	const response = await fetch(ASSETS_API.replace("*", assetId), {
		headers: ROBLOX_API_HEADERS,
	});

	const blob = await response.blob();
	const blobURL = URL.createObjectURL(blob);

	return blobURL;
}

// projects endpoint

const PROJECTS_CACHE = {};

app.get("/projects", async (req, res) => {
	const type = req.query.type;

	if (PROJECTS_CACHE[type]) {
		res.json(PROJECTS_CACHE[type]);
		console.log(`pulled ${type} projects from cache`);
		return;
	}

	switch (type) {
		case "roblox": {
			const experiences = await getRobloxUserExperiences(ROBLOX_USER_ID);
			const ids = experiences.map(experience => experience.id);
			const assets = ids.map(id => ({ id, type: "GameIcon" }));
			const thumbnails = await getRobloxThumbnails(assets);
			const details = await getRobloxExperiencesDetails(ids);

			const projects = await Promise.all(
				experiences.map(async (experience, index) => {
					const links = [{ url: "https://roblox.com" + details[index].url }];

					if (details[index].copyable) {
						links.push({
							name: experience.name,
							url: "N/A", // need to get actual download contents for this, data.location is gzipped
							download: true,
						});
					}

					return {
						name: experience.name,
						description: experience.description,
						created: experience.created,
						thumbnail: thumbnails[index],
						links: links,
					};
				}),
			);

			PROJECTS_CACHE[type] = projects;

			res.json(projects);

			break;
		}
	}
});
