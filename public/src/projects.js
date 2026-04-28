const projectsContainer = document.querySelector("#projects .container");

function createProjectSection(header, i) {
	const projectSection = document.createElement("div");
	projectSection.classList = "section-header fade-in visible";
	projectSection.innerHTML = `
		<span class="section-tag">Loading...</span>
		<h2 class="section-title">${header}</h2>
	`;
	projectsContainer.appendChild(projectSection);

	const projectsSectionContainer = document.createElement("div");
	projectsSectionContainer.classList = "projects-grid projects-grid-3";
	projectsContainer.appendChild(projectsSectionContainer);

	return projectsSectionContainer;
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
		projectElement.classList = "project-card fade-in visible";
		projectElement.dataset.video = true;
		projectElement.dataset.index = i;
		projectElement.innerHTML = `
			<div class="card-media">
				<div class="card-thumbnail">
					<img src="${thumbnail}" alt="Project Thumbnail" class="thumb-img" />
					<video class="thumb-video" loop="" muted="muted" playsinline="">
						<source src="./projects/roblox/${detail.name}.webm" type="video/webm" />
					</video>
				</div>
			</div>
			<div class="card-body">
				<h3 class="card-title">${detail.name}</h3>
				<p class="card-desc">${detail.description || "No description available"}</p>
				<p class="card-desc">Created: ${new Date(detail.created).toLocaleDateString()}</p>
				<div class="card-links">
					<a href="https://roblox.com${detail.canonicalUrlPath}" class="card-link card-link-primary" target="_blank" rel="noopener">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10"></circle>
							<path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
						</svg>
						Roblox Page
					</a>
					${
						download
							? `
					<a href="${download}" class="card-link card-link-ghost" target="_blank" rel="noopener">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
							<polyline points="7 10 12 15 17 10"></polyline>
							<line x1="12" y1="15" x2="12" y2="3"></line>
						</svg>
						Download .rbxl
					</a>
					`
							: ""
					}
				</div>
			</div>
		`;
		section.appendChild(projectElement);
	}
}

// init all projects

export async function initProjects() {
	const config = await fetch("../projects/config.json").then(response => {
		if (!response.ok) {
			projectsContainer.innerHTML = `ERROR: Failed to load project data, ${response.statusText}`;

			return;
		}

		return response.json();
	});

	projectsContainer.innerText = "";

	await initRobloxProjects(config.roblox);
}
