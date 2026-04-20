const projectsContainer = document.getElementById("projects-container");

function createProjectSection(header, subtitle) {
	const projectSection = document.createElement("div");
	projectSection.classList = "project-section reveal";
	projectSection.innerHTML = `
		<h1 class="section-header">${header}</h1>
		<h2 class="section-subheader">${subtitle}</h2>
	`;
	projectsContainer.appendChild(projectSection);
}

// roblox projects

async function initRobloxProjects(config) {
	createProjectSection(config.header, config.subtitle);

	const ids = config.projects.map(project => project.id);
	const data = await fetch("/roblox/details?ids=" + ids.join(",")).then(response => response.json());

	config.projects.forEach((project, i) => {
		const detail = data.details[i];
		const thumbnail = data.thumbnails[i];

		console.log(detail);

		const projectElement = document.createElement("div");
		projectElement.classList = "project reveal";
		projectElement.innerHTML = `
			<img class="project-thumbnail" src="${thumbnail}">
			<div class="project-info">
				<h2 class="project-name">${detail.name}</h2>
				<p class="project-description">${detail.description || "No description available"}</p>
				<div class="project-links">
					<a class="project-link" href="https://roblox.com${detail.canonicalUrlPath}" target="_blank">View on Roblox</a>
				</div>
			</div>
		`;
		projectsContainer.appendChild(projectElement);
	});
}

// init all projects

export async function initProjects() {
	const config = await fetch("../projects/config.json").then(response => response.json());

	await initRobloxProjects(config.roblox);
}
