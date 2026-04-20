const projectContainer = document.getElementById("projects-container");

function updateProjectFadeDelays() {
	const projects = Array.from(projectContainer.querySelectorAll(".project"));

	const firstTop = projects[0].offsetTop;
	const columnCount = projects.filter(p => p.offsetTop === firstTop).length;

	projects.forEach((child, i) => {
		const delay = (i % columnCount) * 0.1;
		child.style.transitionDelay = `${delay}s`;
	});
}

const scrollTip = document.getElementById("scroll-tip");

function updateScrollTip() {
	if (window.scrollY > 1) {
		scrollTip.classList.remove("visible");
	} else {
		scrollTip.classList.add("reveal", "visible");
	}
}

export function initEffects() {
	window.addEventListener("resize", updateProjectFadeDelays);
	window.addEventListener("scroll", updateScrollTip);
	updateProjectFadeDelays();
	updateScrollTip();

	const observer = new IntersectionObserver(
		entries => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.1 },
	);

	for (const element of document.querySelectorAll(".reveal")) {
		observer.observe(element);
	}
}
