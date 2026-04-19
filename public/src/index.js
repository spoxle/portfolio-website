import { initRobloxProjects } from "./projects.js";
import { initScroll } from "./scroll.js";

document.addEventListener("DOMContentLoaded", () => {
	initRobloxProjects().then(initScroll);
});
