const modelViewer = document.querySelector(".hero-model");

function updateModelView() {
	const scrollY = window.scrollY;
	const modelCenter = modelViewer.offsetTop + modelViewer.offsetHeight / 2;
	const ratio = scrollY / modelCenter;

	modelViewer.cameraOrbit = `${-ratio * 135 + 30}deg ${ratio * 30 + 60}deg 100m`;
}

window.addEventListener("scroll", updateModelView);
updateModelView();

// modelViewer.addEventListener("load", () => {
// 	modelViewer.toBlob({ idealAspect: false }).then(blob => {
// 		const url = URL.createObjectURL(blob);
// 		const a = document.createElement("a");
// 		a.href = url;
// 		a.download = "model-placeholder.png";
// 		a.click();
// 		URL.revokeObjectURL(url);
// 	});
// });
