const projectsContainer = document.getElementById("projects-container");

function createProjectSection(header) {
	const projectSection = document.createElement("div");
	projectSection.classList = "project-section";
	projectSection.innerText = `Loading ${header}...`;
	projectsContainer.appendChild(projectSection);
	return projectSection;
}

// roblox projects

async function initRobloxProjects(config) {
	const section = createProjectSection(config.header);

	const data = await fetch("/roblox/info?ids=" + config.projects.join(",")).then(response => response.json());

	for (let i = 0; i < config.projects.length; i++) {
		const detail = data.details[i];
		const thumbnail = data.thumbnails[i];
		const cdn = data.cdns[i];

		const download = detail.copyingAllowed ? `/roblox/download?cdn=${encodeURIComponent(cdn)}&name=${detail.name}` : false;

		const projectElement = document.createElement("div");
		projectElement.classList = "project reveal";
		projectElement.innerHTML = `
			<div class="project-media">
				<img class="project-image" src="${thumbnail}" preload="none">
				<video muted class="project-video">
					<source src="../projects/roblox/${detail.name}.webm" type="video/webm">
				</video>
			</div>
			<div class="project-info">
				<h2 class="project-name">${detail.name}</h2>
				<p class="project-description">${detail.description || "No description available"}</p>
				<div class="project-links">
					<a class="project-link" href="https://roblox.com${detail.canonicalUrlPath}" target="_blank">Open on Roblox</a>
					${download ? `<a class="project-link" href="${download}">Download RBXL</a>` : ""}
				</div>
			</div>
		`;
		projectsContainer.appendChild(projectElement);
	}

	section.innerHTML = `
		<h1 class="section-header">${config.header}</h1>
		<h2 class="section-subheader">${config.subtitle}</h2>
	`;
}

// init all projects

export async function initProjects() {
	const config = await fetch("../projects/config.json").then(response => {
		if (!response.ok) {
			projectsContainer.innerText = `ERROR: Failed to load project data, ${response.statusText}`;

			return;
		}

		return response.json();
	});

	projectsContainer.innerText = "";

	await initRobloxProjects(config.roblox);
}
