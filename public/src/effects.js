function updateProjectFadeDelays() {
	const projects = Array.from(document.querySelectorAll(".project"));

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

function initMedia() {
	const medias = Array.from(document.querySelectorAll(".project-media"));
	const modal = document.getElementById("modal");
	const modalVideo = document.getElementById("modal-video");

	modal.addEventListener("click", () => {
		modal.close();
	});

	medias.forEach(media => {
		const video = media.querySelector(".project-video");

		video.addEventListener("load", () => {
			console.log("loaded");
		});

		media.addEventListener("click", () => {
			modal.showModal();
			modalVideo.querySelector("source").src = video.querySelector("source").src;
			modalVideo.load();
			modalVideo.play();
			modalVideo.currentTime = video.currentTime;
		});

		media.addEventListener("mouseenter", () => {
			video.play();
		});

		media.addEventListener("mouseleave", () => {
			video.pause();
			video.currentTime = 0;
		});
	});
}

const indicator = document.getElementById("nav-indicator");
const nav = document.querySelector("nav");

function moveIndicator(link) {
	const navRect = nav.getBoundingClientRect();
	const rect = link.getBoundingClientRect();
	const linkCenter = rect.left - navRect.left + rect.width / 2;

	indicator.style.width = `${rect.width}px`;
	indicator.style.transform = `translateX(${linkCenter}px) translateX(-50%)`;
}

moveIndicator(document.querySelector(".nav-link.selected"));

function initNav() {
	const sections = document.querySelectorAll("section");

	const observer = new IntersectionObserver(
		entries => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					const id = entry.target.id;
					const target = document.querySelector(`.nav-link[href="#${id}"]`);

					history.replaceState(null, null, `#${id}`);
					moveIndicator(target);
				}
			}
		},
		{ threshold: 0.5 },
	);

	sections.forEach(section => observer.observe(section));
}

export function initEffects() {
	window.addEventListener("resize", updateProjectFadeDelays);
	window.addEventListener("scroll", updateScrollTip);
	updateProjectFadeDelays();
	updateScrollTip();

	initNav();
	initMedia();

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
