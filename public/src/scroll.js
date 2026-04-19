const modelViewer = document.querySelector("model-viewer");

function updateModelView() {
	const scrollY = window.scrollY;
	const modelCenter = modelViewer.offsetTop + modelViewer.offsetHeight / 2;
	const ratio = Math.min(scrollY / modelCenter, 1);

	modelViewer.cameraOrbit = `${ratio * 90 + 30}deg ${ratio * 30 + 60}deg ${ratio * 100 + 50}m`;
}

export function initScroll() {
	window.addEventListener("scroll", updateModelView);
	updateModelView();

	const observer = new IntersectionObserver(
		entries => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add("active");
				} else {
					entry.target.classList.remove("active");
				}
			}
		},
		{ threshold: 0.1 },
	);

	for (const element of document.querySelectorAll(".reveal")) {
		observer.observe(element);
	}
}

initScroll();
