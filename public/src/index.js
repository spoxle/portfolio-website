import { initProjects } from "./projects.js";
import { initEffects } from "./effects.js";
import "./model.js";

initProjects().then(initEffects);

// nodemailer

const form = document.getElementById("contactForm");

form.addEventListener("submit", async event => {
	event.preventDefault();

	const data = new FormData(form);

	const response = await fetch("/send", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (response.ok) {
		alert("Sent! Thank you for reaching out, I'll get back to you as soon as I can");
		event.target.reset(); // Clear form
	} else {
		alert("Error sending message.");
	}
});

// github stats

fetch("https://api.github.com/users/spoxle")
	.then(response => response.json())
	.then(data => {
		document.querySelectorAll(".github-repos").forEach(element => {
			element.textContent = element.textContent.replace("Loading...", data.public_repos);
		});
	});

// update dates

const now = new Date();

const codingStart = new Date("2022-5-1");
const codingYears = Math.round((now - codingStart) / 31471200000);

document.querySelectorAll(".coding-year").forEach(element => {
	element.textContent = element.textContent.replace("Loading...", codingYears);
});

document.querySelectorAll(".copyright-year").forEach(element => {
	element.textContent = now.getFullYear();
});
