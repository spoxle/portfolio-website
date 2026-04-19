const projectsContainer = document.getElementById("projects-container");

function updateFadeDelays() {
	const styles = window.getComputedStyle(projectsContainer);
	const columnTracks = styles.getPropertyValue("grid-template-columns");
	const columnCount = columnTracks.split(" ").filter(v => v !== "").length;

	Array.from(projectsContainer.children).forEach((child, i) => {
		const delay = (i % columnCount) / 10;
		child.style.transitionDelay = `${delay}s`;
	});
}

export async function initRobloxProjects() {
	window.addEventListener("resize", updateFadeDelays);

	return fetch("/projects?type=roblox")
		.then(res => res.json())
		.then(projects => {
			projects.forEach((project, i) => {
				const projectElement = document.createElement("div");
				projectElement.className = `project reveal`;
				projectElement.innerHTML = `
					<img class="project-thumbnail" src="${project.thumbnail}" alt="${project.name}" />
					<div class="project-info">
						<h2 class="project-name">${project.name}</h2>
						<p class="project-description">${project.description || "No description available"}</p>
						<p class="project-date">${new Date(project.created).toLocaleDateString()}</p>
						<div class="project-links">
							${project.links
								.map(link => {
									return `<a
										class="project-link"
										href="${link.url}"
										${link.download ? `download=${link.filename}.rbxl` : 'target="_blank"'}
									>
										${link.download ? "Download - Not yet" : "View on Roblox"}
									</a>`;
								})
								.join("\n")}
						</div>
					</div>
				`;
				projectsContainer.appendChild(projectElement);
			});

			return projects;
		})
		.then(updateFadeDelays);
}
