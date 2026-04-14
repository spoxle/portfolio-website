document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll(".copyright-year").forEach(el => (el.textContent = new Date().getFullYear()));

	initNav();
	Promise.all([loadProjects(), loadDevTools()]).then(() => {
		initVideoCards();
		initScrollReveal();
	});
	initActiveNav();
});

const slugify = s =>
	String(s || "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
const $id = id => document.getElementById(id);
let projectsList = [];
let devtoolsList = [];
let modalKeyHandler = null;
let currentModalIndex = -1;

async function loadProjects() {
	const grid = $id("projectsGrid");
	if (!grid) return;
	const res = await fetch("projects/config.json", { cache: "no-cache" });
	if (!res.ok) {
		grid.innerHTML = '<div class="placeholder">Projects failed to load.</div>';
		return;
	}
	const projects = await res.json();
	projectsList = new Array(projects.length);
	grid.innerHTML = "";
	projects.forEach((p, i) => {
		const article = document.createElement("article");
		article.className = "project-card reveal" + (i % 3 === 1 ? " reveal-delay-1" : i % 3 === 2 ? " reveal-delay-2" : "");
		const slug = p.slug ? String(p.slug) : slugify(p.name);
		const imagePath = p.imagepath || (slug ? `projects/images/${slug}.webp` : null);
		const videoPath = p.videopath || (slug ? `projects/videos/${slug}.webm` : null);
		projectsList[i] = { name: p.name, image: imagePath, video: videoPath, raw: p };
		if (videoPath) article.dataset.video = videoPath;
		const media = document.createElement("div");
		media.className = "card-media";
		if (imagePath) {
			const placeholder = document.createElement("div");
			placeholder.className = "card-placeholder";
			placeholder.style.backgroundImage = `url(${imagePath})`;
			media.appendChild(placeholder);
		}
		if (videoPath) {
			const video = document.createElement("video");
			video.className = "card-video";
			video.muted = false;
			video.volume = 0.15;
			video.loop = true;
			video.setAttribute("playsinline", "");
			video.preload = "none";
			const src = document.createElement("source");
			src.src = videoPath;
			src.type = videoPath && videoPath.includes(".webm") ? "video/webm" : "video/mp4";
			video.appendChild(src);
			media.appendChild(video);
		}
		const overlay = document.createElement("div");
		overlay.className = "card-overlay";
		media.appendChild(overlay);
		media.style.cursor = "pointer";
		media.addEventListener("click", () => openMediaModal(i, projectsList));

		const body = document.createElement("div");
		body.className = "card-body";
		const tagsWrap = document.createElement("div");
		tagsWrap.className = "card-tags";
		(p.tags || []).forEach(t => {
			const s = document.createElement("span");
			s.className = "tag";
			s.textContent = t;
			tagsWrap.appendChild(s);
		});
		const title = document.createElement("h3");
		title.className = "card-title";
		title.textContent = p.name;
		const desc = document.createElement("p");
		desc.className = "card-desc";
		desc.textContent = p.description;
		const links = document.createElement("div");
		links.className = "card-links";
		const dl = document.createElement("a");
		dl.className = "card-link";
		const downloadHref = p.download || (slug ? `projects/downloads/${slug}.rbxl` : "#");
		dl.href = downloadHref;
		dl.textContent = "Download RBXL";
		dl.setAttribute("download", "");
		const openPlace = document.createElement("a");
		openPlace.className = "card-link";
		openPlace.target = "_blank";
		openPlace.rel = "noopener noreferrer";
		openPlace.textContent = "Open Experience";
		openPlace.href = p.link || "#";
		if (!p.link) {
			openPlace.classList.add("disabled");
			openPlace.href = "#";
			openPlace.setAttribute("aria-disabled", "true");
			openPlace.removeAttribute("target");
		}
		links.appendChild(openPlace);
		links.appendChild(dl);
		(async () => {
			if (!downloadHref || downloadHref === "#") {
				dl.classList.add("disabled");
				dl.removeAttribute("download");
				dl.href = "#";
				dl.textContent = "Download N/A";
				dl.setAttribute("aria-disabled", "true");
				return;
			}
			try {
				const res2 = await fetch(downloadHref, { method: "HEAD", cache: "no-cache" });
				if (!res2.ok) throw new Error("not found");
			} catch (err) {
				dl.classList.add("disabled");
				dl.removeAttribute("download");
				dl.href = "#";
				dl.textContent = "Download N/A";
				dl.setAttribute("aria-disabled", "true");
			}
		})();
		body.appendChild(tagsWrap);
		body.appendChild(title);
		body.appendChild(desc);
		body.appendChild(links);
		article.appendChild(media);
		article.appendChild(body);
		grid.appendChild(article);
	});
}

async function loadDevTools() {
	const grid = $id("devtoolsGrid");
	if (!grid) return;
	const res = await fetch("tools/config.json", { cache: "no-cache" });
	if (!res.ok) {
		grid.innerHTML = '<div class="placeholder">Developer tools failed to load.</div>';
		return;
	}
	const items = await res.json();
	devtoolsList = new Array(items.length);
	grid.innerHTML = "";
	items.forEach((p, i) => {
		const article = document.createElement("article");
		article.className = "project-card reveal" + (i % 3 === 1 ? " reveal-delay-1" : i % 3 === 2 ? " reveal-delay-2" : "");
		const slug = p.slug ? String(p.slug) : slugify(p.name);
		const imagePath = p.imagepath || (slug ? `tools/${slug}.png` : null);
		devtoolsList[i] = { name: p.name, image: imagePath, raw: p };
		const media = document.createElement("div");
		media.className = "card-media";
		if (imagePath) {
			const placeholder = document.createElement("div");
			placeholder.className = "card-placeholder";
			placeholder.style.backgroundImage = `url(${imagePath})`;
			media.appendChild(placeholder);
		} else {
			const placeholder = document.createElement("div");
			placeholder.className = "card-placeholder card-placeholder--empty";
			media.appendChild(placeholder);
		}
		const overlay = document.createElement("div");
		overlay.className = "card-overlay";
		media.appendChild(overlay);
		media.style.cursor = p.link ? "pointer" : "default";
		media.addEventListener("click", () => {
			if (p.link) window.open(p.link, "_blank", "noopener");
		});
		const body = document.createElement("div");
		body.className = "card-body";
		const tagsWrap = document.createElement("div");
		tagsWrap.className = "card-tags";
		(p.tags || []).forEach(t => {
			const s = document.createElement("span");
			s.className = "tag";
			s.textContent = t;
			tagsWrap.appendChild(s);
		});
		const title = document.createElement("h3");
		title.className = "card-title";
		title.textContent = p.name;
		const desc = document.createElement("p");
		desc.className = "card-desc";
		desc.textContent = p.description;
		const links = document.createElement("div");
		links.className = "card-links";
		const openLink = document.createElement("a");
		openLink.className = "card-link";
		openLink.target = "_blank";
		openLink.rel = "noopener noreferrer";
		openLink.textContent = "Open Plugin";
		openLink.href = p.link || "#";
		if (!p.link) {
			openLink.classList.add("disabled");
			openLink.href = "#";
			openLink.setAttribute("aria-disabled", "true");
			openLink.removeAttribute("target");
		}
		links.appendChild(openLink);
		body.appendChild(tagsWrap);
		body.appendChild(title);
		body.appendChild(desc);
		body.appendChild(links);
		article.appendChild(media);
		article.appendChild(body);
		grid.appendChild(article);
	});
}

function openMediaModal(index, listArg) {
	const list = Array.isArray(listArg) ? listArg : projectsList;
	if (!Array.isArray(list) || list.length === 0) return;
	const len = list.length;
	if (index < 0 || index >= len) return;
	let modal = document.querySelector(".media-modal");
	if (!modal) {
		modal = document.createElement("div");
		modal.className = "media-modal";
		modal.innerHTML = `
            <div class="media-modal-content" role="dialog" aria-modal="true">
                <button class="media-close" aria-label="Close">✕</button>
                <button class="media-prev" aria-label="Previous">‹</button>
                <div class="media-modal-body"></div>
                <button class="media-next" aria-label="Next">›</button>
                <div class="media-caption"></div>
            </div>
        `;
		document.body.appendChild(modal);
		modal.querySelector(".media-close").addEventListener("click", closeMediaModal);
		modal.addEventListener("click", e => {
			if (e.target === modal) closeMediaModal();
		});
	}
	const body = modal.querySelector(".media-modal-body");
	const caption = modal.querySelector(".media-caption");
	const btnPrev = modal.querySelector(".media-prev");
	const btnNext = modal.querySelector(".media-next");
	function showAt(i) {
		if (!modal) return;
		currentModalIndex = ((i % len) + len) % len;
		const proj = list[currentModalIndex];
		if (!proj) return;
		const prevVideo = body.querySelector("video");
		if (prevVideo) prevVideo.pause();
		body.innerHTML = "";
		caption.textContent = proj.name || "";
		if (proj.video) {
			const v = document.createElement("video");
			v.src = proj.video;
			v.controls = true;
			v.autoplay = true;
			v.muted = true;
			v.volume = 0.025;
			v.setAttribute("playsinline", "");
			v.style.maxWidth = "100%";
			v.style.maxHeight = "90vh";
			const cards = document.querySelectorAll(".project-card");
			const card = cards && cards[currentModalIndex];
			const cardVideo = card ? card.querySelector("video") : null;
			if (cardVideo) {
				const desiredTime = Number(cardVideo.currentTime) || 0;
				v.addEventListener("loadedmetadata", () => {
					if (desiredTime > 0 && v.duration && v.duration > desiredTime) v.currentTime = desiredTime;
				});
				if (!cardVideo.paused) v.autoplay = true;
			}
			body.appendChild(v);
		} else if (proj.image) {
			const img = document.createElement("img");
			img.src = proj.image;
			img.alt = proj.name || "Preview";
			body.appendChild(img);
		}
	}
	const goPrev = () => showAt(currentModalIndex - 1);
	const goNext = () => showAt(currentModalIndex + 1);
	btnPrev.onclick = goPrev;
	btnNext.onclick = goNext;
	if (modalKeyHandler) document.removeEventListener("keydown", modalKeyHandler);
	modalKeyHandler = e => {
		if (e.key === "Escape") return closeMediaModal();
		if (e.key === "ArrowLeft") return showAt(currentModalIndex - 1);
		if (e.key === "ArrowRight") return showAt(currentModalIndex + 1);
	};
	document.addEventListener("keydown", modalKeyHandler);
	showAt(index);
	requestAnimationFrame(() => modal.classList.add("open"));
}

function closeMediaModal() {
	const modal = document.querySelector(".media-modal");
	if (!modal) return;
	if (modalKeyHandler) {
		document.removeEventListener("keydown", modalKeyHandler);
		modalKeyHandler = null;
	}
	const video = modal.querySelector("video");
	if (video) video.pause();
	modal.classList.remove("open");
	setTimeout(() => {
		const body = modal.querySelector(".media-modal-body");
		if (body) body.innerHTML = "";
	}, 300);
}

function initNav() {
	const pill = document.getElementById("navPill");
	const toggle = document.getElementById("navToggle");
	const mobile = document.getElementById("navMobile");
	if (pill) window.addEventListener("scroll", () => pill.classList.toggle("scrolled", window.scrollY > 30), { passive: true });
	if (toggle && mobile) {
		toggle.addEventListener("click", () => {
			const isOpen = toggle.classList.toggle("open");
			mobile.classList.toggle("open", isOpen);
			pill && pill.classList.toggle("open", isOpen);
		});
		mobile.querySelectorAll(".nav-mobile-link").forEach(link => {
			link.addEventListener("click", () => {
				toggle.classList.remove("open");
				mobile.classList.remove("open");
				pill && pill.classList.remove("open");
			});
		});
	}
}

function initActiveNav() {
	const sections = document.querySelectorAll("section[id]");
	const links = document.querySelectorAll(".nav-link");
	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					links.forEach(l => l.classList.remove("active"));
					const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
					if (active) active.classList.add("active");
				}
			});
		},
		{ rootMargin: "-40% 0px -55% 0px" },
	);
	sections.forEach(s => observer.observe(s));
}

function initVideoCards() {
	const cards = document.querySelectorAll(".project-card[data-video]");
	cards.forEach(card => {
		const video = card.querySelector(".card-video");
		if (!video) return;
		let playTimeout;
		card.addEventListener("mouseenter", () => {
			playTimeout = setTimeout(() => {
				video.muted = true;
				video
					.play()
					.then(() => video.classList.add("playing"))
					.catch(() => {});
			}, 80);
		});
		card.addEventListener("mouseleave", () => {
			clearTimeout(playTimeout);
			video.pause();
			video.classList.remove("playing");
			video.currentTime = 0;
		});
	});
}

function initScrollReveal() {
	const cards = document.querySelectorAll(".project-card");
	cards.forEach((card, i) => {
		card.classList.add("reveal");
		if (i % 3 === 1) card.classList.add("reveal-delay-1");
		if (i % 3 === 2) card.classList.add("reveal-delay-2");
	});
	document.querySelectorAll(".stat-card").forEach((el, i) => {
		el.classList.add("reveal");
		if (i === 1) el.classList.add("reveal-delay-1");
		if (i === 2) el.classList.add("reveal-delay-2");
	});
	document.querySelectorAll(".section-header, .about-text, .contact-left").forEach(el => el.classList.add("reveal"));
	const contactRight = document.querySelector(".contact-right");
	if (contactRight) {
		contactRight.classList.add("reveal");
		contactRight.classList.add("reveal-delay-1");
	}
	const observer = new IntersectionObserver(
		entries => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.1 },
	);
	document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

const WEBHOOK_URL = "https://discord.com/api/webhooks/1493143255750283344/1bfjd2Sww_EcnTBp0htfLnp8roVXm5W19Jux-sNclXdNswf9wuTDVfLhc2Q2SWWLPsl1";

function formatForDiscord(data) {
	let formatted = `>>> \n\n`;

	for (const [key, value] of Object.entries(data)) {
		formatted += `**${key.charAt(0).toUpperCase() + key.slice(1)}**\n\`\`\`${value}\`\`\``;
	}

	return formatted;
}

const form = document.getElementById("contactForm");

form.addEventListener("submit", e => {
	e.preventDefault();

	const data = new FormData(form);
	const formatted = formatForDiscord(Object.fromEntries(data.entries()));

	fetch(WEBHOOK_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ content: formatted }),
	});
});

fetch("https://thumbnails.roblox.com/v1/assets?assetIds=135649239598036&returnPolicy=PlaceHolder&size=512x512&format=Webp&isCircular=false")
	.then(res => res.json())
	.then(data => console.log(data))
	.catch(err => console.error("Failed to fetch thumbnail:", err));
