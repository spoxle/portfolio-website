export function initEffects() {
	// add correct number to section tags

	const sectionTags = document.querySelectorAll(".section-tag");

	sectionTags.forEach((tag, i) => {
		tag.innerText = `0${i + 1}`;
	});

	// updaate nav bar on scroll

	const sections = document.querySelectorAll("section[id], div[id]");
	const navLinks = document.querySelectorAll(".nav-link");

	const navObserver = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					navLinks.forEach(link => {
						link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
					});
				}
			});
		},
		{ threshold: 0.5 },
	);

	document.querySelectorAll("#projects, #about, #contact").forEach(sec => {
		if (sec) navObserver.observe(sec);
	});

	// ── Collect all project data ─────────────────────────────────────
	const allCards = Array.from(document.querySelectorAll(".project-card"));

	const projectData = allCards.map(card => ({
		index: parseInt(card.dataset.index),
		hasVideo: card.dataset.video === "true",
		videoSrc: card.querySelector(".thumb-video source")?.src || "",
		imgSrc: card.querySelector(".thumb-img")?.src || "",
		title: card.querySelector(".card-title")?.textContent || "",
		desc: card.querySelector(".card-desc")?.textContent || "",
		el: card,
	}));

	// ── Hover video preview ──────────────────────────────────────────
	allCards.forEach(card => {
		const video = card.querySelector(".thumb-video");
		const hasVideo = card.dataset.video === "true";
		if (!hasVideo || !video) return;

		const videoSrc = video.querySelector("source")?.getAttribute("src");
		if (!videoSrc) return; // no actual file attached yet

		card.addEventListener("mouseenter", () => {
			video.currentTime = 0;
			video.play().catch(() => {});
			card.classList.add("video-playing");
		});

		card.addEventListener("mouseleave", () => {
			video.pause();
			video.currentTime = 0;
			card.classList.remove("video-playing");
		});
	});

	// ── Modal ────────────────────────────────────────────────────────
	const modal = document.getElementById("videoModal");
	const modalVideo = document.getElementById("modalVideo");
	const modalVideoSource = modalVideo.querySelector("source");
	const modalNoVideo = document.getElementById("modalNoVideo");
	const modalFallbackImg = document.getElementById("modalFallbackImg");
	const modalTitle = document.getElementById("modalTitle");
	const modalDesc = document.getElementById("modalDesc");
	const modalClose = document.getElementById("modalClose");
	const modalPrev = document.getElementById("modalPrev");
	const modalNext = document.getElementById("modalNext");

	let currentModalIndex = 0;

	function openModal(projectIndex) {
		currentModalIndex = projectIndex;
		loadModal(currentModalIndex);
		modal.classList.add("open");
		document.body.style.overflow = "hidden";
	}

	function closeModal() {
		modal.classList.remove("open");
		document.body.style.overflow = "";
		modalVideo.pause();
		modalVideo.src = "";
	}

	function loadModal(index) {
		const p = projectData[index];

		modalTitle.textContent = p.title;
		modalDesc.textContent = p.desc;

		// Update nav buttons
		modalPrev.disabled = index === 0;
		modalNext.disabled = index === projectData.length - 1;

		if (p.hasVideo && p.videoSrc) {
			modalVideoSource.src = p.videoSrc;
			modalVideo.load();
			modalVideo.play().catch(() => {});
			modalVideo.style.display = "block";
			modalNoVideo.classList.remove("show");
		} else {
			modalVideo.pause();
			modalVideo.style.display = "none";
			modalFallbackImg.src = p.imgSrc;
			modalNoVideo.classList.add("show");
		}
	}

	// Open modal on card click (only if has video)
	allCards.forEach(card => {
		card.addEventListener("click", e => {
			// Don't open modal if clicking a link
			if (e.target.closest(".card-link")) return;

			const idx = parseInt(card.dataset.index);
			openModal(idx);
		});
	});

	modalClose.addEventListener("click", closeModal);

	modal.addEventListener("click", e => {
		if (e.target === modal) closeModal();
	});

	modalPrev.addEventListener("click", () => {
		if (currentModalIndex > 0) {
			currentModalIndex--;
			loadModal(currentModalIndex);
		}
	});

	modalNext.addEventListener("click", () => {
		if (currentModalIndex < projectData.length - 1) {
			currentModalIndex++;
			loadModal(currentModalIndex);
		}
	});

	// Keyboard navigation
	document.addEventListener("keydown", e => {
		if (!modal.classList.contains("open")) return;
		if (e.key === "Escape") closeModal();
		if (e.key === "ArrowLeft" && currentModalIndex > 0) {
			currentModalIndex--;
			loadModal(currentModalIndex);
		}
		if (e.key === "ArrowRight" && currentModalIndex < projectData.length - 1) {
			currentModalIndex++;
			loadModal(currentModalIndex);
		}
	});

	// hero eyebrow cycle

	const eyebrow = document.querySelector(".eyebrow");
	const skillsContainer = document.querySelector(".about-skills");
	const skills = ["Scripting", "UI Integration", "Dev Operations"];
	let i = 0;

	setInterval(() => {
		i++;
		if (i == skills.length) i = 0;

		eyebrow.textContent = `Developer - ${skills[i]}`;
	}, 1000);

	skillsContainer.innerHTML = "";

	for (let i = 0; i < skills.length; i++) {
		const skill = document.createElement("p");
		skill.className = "card-link card-link-ghost";
		skill.textContent = skills[i];
		skillsContainer.appendChild(skill);
	}
}
