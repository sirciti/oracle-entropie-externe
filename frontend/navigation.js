// frontend/navigation.js

// Importe les fonctions d'initialisation des visualiseurs 3D
import { initIcosahedronVisualizer } from "./icosahedron.js";
import { initPyramidsVisualizer } from "./pyramids_visualizer.js";
import { initCubesVisualizer } from "./cubes_visualizer.js";

document.addEventListener("DOMContentLoaded", () => {
    // Boutons de navigation
    const navMainButton = document.getElementById("nav-main");
    const navIcosahedronButton = document.getElementById("nav-icosahedron");
    const navPyramidsButton = document.getElementById("nav-pyramids");
    const navCubesButton = document.getElementById("nav-cubes");
    const navInternalToolButton = document.getElementById("nav-internal-tool");

    // Sections d'interface
    const mainInterfaceSection = document.getElementById("main-interface");
    const icosahedronInterfaceSection = document.getElementById("icosahedron-interface");
    const pyramidsInterfaceSection = document.getElementById("pyramids-interface");
    const cubesInterfaceSection = document.getElementById("cubes-interface");
    const internalToolInterfaceSection = document.getElementById("internal-tool-interface");

    // Conteneurs 3D
    const icosahedron3DContainer = document.getElementById("icosahedron-3d");
    const pyramids3DContainer = document.getElementById("icosahedron-3d-pyramids");
    const cubes3DContainer = document.getElementById("icosahedron-3d-cubes");

    // Instances de visualiseur
    let icosahedronVisualizer = null;
    let pyramidsVisualizer = null;
    let cubesVisualizer = null;

    function showSection(sectionId) {
        // Cacher toutes les sections
        [mainInterfaceSection, icosahedronInterfaceSection, pyramidsInterfaceSection, cubesInterfaceSection, internalToolInterfaceSection].forEach(section => {
            if (section) section.classList.add("hidden");
        });

        // Arrêter toutes les animations
        if (icosahedronVisualizer) icosahedronVisualizer.stop();
        if (pyramidsVisualizer) pyramidsVisualizer.stop();
        if (cubesVisualizer) cubesVisualizer.stop();

        // Cacher tous les conteneurs 3D
        if (icosahedron3DContainer) icosahedron3DContainer.style.display = "none";
        if (pyramids3DContainer) pyramids3DContainer.style.display = "none";
        if (cubes3DContainer) cubes3DContainer.style.display = "none";

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.remove("hidden");

        // Afficher et démarrer l'animation correspondante
        if (sectionId === "icosahedron-interface") {
            if (icosahedron3DContainer) icosahedron3DContainer.style.display = "flex";
            if (!icosahedronVisualizer) {
                setTimeout(() => {
                    icosahedronVisualizer = initIcosahedronVisualizer("icosahedron-3d");
                    icosahedronVisualizer?.start();
                    const toggleBtn = document.getElementById("toggle-icosahedron-animation");
                    if (toggleBtn) toggleBtn.textContent = "Stop Animation";
                }, 50);
            } else {
                icosahedronVisualizer.start();
                const toggleBtn = document.getElementById("toggle-icosahedron-animation");
                if (toggleBtn) toggleBtn.textContent = "Stop Animation";
            }
        } else if (sectionId === "pyramids-interface") {
            if (pyramids3DContainer) pyramids3DContainer.style.display = "flex";
            if (!pyramidsVisualizer) {
                setTimeout(() => {
                    pyramidsVisualizer = initPyramidsVisualizer("icosahedron-3d-pyramids");
                    pyramidsVisualizer?.start();
                    const toggleBtn = document.getElementById("toggle-pyramids-animation");
                    if (toggleBtn) toggleBtn.textContent = "Stop Animation";
                }, 50);
            } else {
                pyramidsVisualizer.start();
                const toggleBtn = document.getElementById("toggle-pyramids-animation");
                if (toggleBtn) toggleBtn.textContent = "Stop Animation";
            }
        } else if (sectionId === "cubes-interface") {
            if (cubes3DContainer) cubes3DContainer.style.display = "flex";
            if (!cubesVisualizer) {
                setTimeout(() => {
                    cubesVisualizer = initCubesVisualizer("icosahedron-3d-cubes");
                    cubesVisualizer?.start();
                    const toggleBtn = document.getElementById("toggle-cubes-animation");
                    if (toggleBtn) toggleBtn.textContent = "Stop Animation";
                }, 50);
            } else {
                cubesVisualizer.start();
                const toggleBtn = document.getElementById("toggle-cubes-animation");
                if (toggleBtn) toggleBtn.textContent = "Stop Animation";
            }
        }

        // Gérer les classes actives des boutons
        [navMainButton, navIcosahedronButton, navPyramidsButton, navCubesButton, navInternalToolButton].forEach(btn => {
            if (btn) btn.classList.remove("active");
        });
        const activeButton = document.getElementById(`nav-${sectionId.replace("-interface", "")}`);
        if (activeButton) activeButton.classList.add("active");
    }

    // Écouteurs des boutons de navigation
    navMainButton?.addEventListener("click", () => showSection("main-interface"));
    navIcosahedronButton?.addEventListener("click", () => showSection("icosahedron-interface"));
    navPyramidsButton?.addEventListener("click", () => showSection("pyramids-interface"));
    navCubesButton?.addEventListener("click", () => showSection("cubes-interface"));
    navInternalToolButton?.addEventListener("click", () => showSection("internal-tool-interface"));

    // Boutons d’animation
    const toggleIcosahedronAnimationButton = document.getElementById("toggle-icosahedron-animation");
toggleIcosahedronAnimationButton?.addEventListener("click", () => {
    if (icosahedronVisualizer) {
        const isRunning = icosahedronVisualizer.isRunning();
        isRunning ? icosahedronVisualizer.stop() : icosahedronVisualizer.start();
        toggleIcosahedronAnimationButton.textContent = isRunning ? "Start Animation" : "Stop Animation";
    }
});

    const togglePyramidsAnimationButton = document.getElementById("toggle-pyramids-animation");
togglePyramidsAnimationButton?.addEventListener("click", () => {
    if (pyramidsVisualizer) {
        const isRunning = pyramidsVisualizer.isRunning();
        isRunning ? pyramidsVisualizer.stop() : pyramidsVisualizer.start();
        togglePyramidsAnimationButton.textContent = isRunning ? "Start Animation" : "Stop Animation";
    }
});
    const toggleCubesAnimationButton = document.getElementById("toggle-cubes-animation");
    toggleCubesAnimationButton?.addEventListener("click", () => {
    if (cubesVisualizer) {
        const isRunning = cubesVisualizer.isRunning(); // Appeler la fonction
        isRunning ? cubesVisualizer.stop() : cubesVisualizer.start();
        toggleCubesAnimationButton.textContent = isRunning ? "Start Animation" : "Stop Animation";
    }
});
    // Afficher la section principale par défaut
    showSection("main-interface");
});
