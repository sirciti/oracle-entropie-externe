import { initIcosahedronVisualizer } from "./icosahedron.js";
import { initPyramidsVisualizer } from "./pyramids_visualizer.js";
import { initCubesVisualizer } from "./cubes_visualizer.js";
import * as Sentry from "@sentry/browser";
Sentry.init({ dsn: "https://29f8b7efc9e08f8ab4f63a42a7947b7e@o4509440127008768.ingest.de.sentry.io/4509440193396816", tracesSampleRate: 1.0 });

document.addEventListener("DOMContentLoaded", () => {
    // Gestion des états des visualiseurs
    const visualizerStates = {
        icosahedron: { isRunning: false, visualizer: null },
        pyramids: { isRunning: false, visualizer: null },
        cubes: { isRunning: false, visualizer: null }
    };

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

    function showSection(sectionId) {
        // Cacher toutes les sections
        [mainInterfaceSection, icosahedronInterfaceSection, pyramidsInterfaceSection, cubesInterfaceSection, internalToolInterfaceSection].forEach(section => {
            if (section) section.classList.add("hidden");
        });

        // Cacher tous les conteneurs 3D
        if (icosahedron3DContainer) icosahedron3DContainer.style.display = "none";
        if (pyramids3DContainer) pyramids3DContainer.style.display = "none";
        if (cubes3DContainer) cubes3DContainer.style.display = "none";

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.remove("hidden");

        // Gérer les classes actives des boutons
        [navMainButton, navIcosahedronButton, navPyramidsButton, navCubesButton, navInternalToolButton].forEach(btn => {
            if (btn) btn.classList.remove("active");
        });
        const activeButton = document.getElementById(`nav-${sectionId.replace("-interface", "")}`);
        if (activeButton) activeButton.classList.add("active");

        // Afficher et restaurer l'état de l'animation
        if (sectionId === "icosahedron-interface") {
            if (icosahedron3DContainer) icosahedron3DContainer.style.display = "flex";
            if (!visualizerStates.icosahedron.visualizer) {
                setTimeout(() => {
                    visualizerStates.icosahedron.visualizer = initIcosahedronVisualizer("icosahedron-3d");
                    if (visualizerStates.icosahedron.isRunning) {
                        visualizerStates.icosahedron.visualizer.start();
                        document.getElementById("toggle-icosahedron-animation").textContent = "Stop Animation";
                    } else {
                        document.getElementById("toggle-icosahedron-animation").textContent = "Start Animation";
                    }
                }, 50);
            } else {
                if (visualizerStates.icosahedron.isRunning) {
                    visualizerStates.icosahedron.visualizer.start();
                    document.getElementById("toggle-icosahedron-animation").textContent = "Stop Animation";
                } else {
                    visualizerStates.icosahedron.visualizer.stop();
                    document.getElementById("toggle-icosahedron-animation").textContent = "Start Animation";
                }
            }
        } else if (sectionId === "pyramids-interface") {
            if (pyramids3DContainer) pyramids3DContainer.style.display = "flex";
            if (!visualizerStates.pyramids.visualizer) {
                setTimeout(() => {
                    visualizerStates.pyramids.visualizer = initPyramidsVisualizer("icosahedron-3d-pyramids");
                    if (visualizerStates.pyramids.isRunning) {
                        visualizerStates.pyramids.visualizer.start();
                        document.getElementById("toggle-pyramids-animation").textContent = "Stop Animation";
                    } else {
                        document.getElementById("toggle-pyramids-animation").textContent = "Start Animation";
                    }
                }, 50);
            } else {
                if (visualizerStates.pyramids.isRunning) {
                    visualizerStates.pyramids.visualizer.start();
                    document.getElementById("toggle-pyramids-animation").textContent = "Stop Animation";
                } else {
                    visualizerStates.pyramids.visualizer.stop();
                    document.getElementById("toggle-pyramids-animation").textContent = "Start Animation";
                }
            }
        } else if (sectionId === "cubes-interface") {
            if (cubes3DContainer) cubes3DContainer.style.display = "flex";
            if (!visualizerStates.cubes.visualizer) {
                setTimeout(() => {
                    visualizerStates.cubes.visualizer = initCubesVisualizer("icosahedron-3d-cubes");
                    if (visualizerStates.cubes.isRunning) {
                        visualizerStates.cubes.visualizer.start();
                        document.getElementById("toggle-cubes-animation").textContent = "Stop Animation";
                    } else {
                        document.getElementById("toggle-cubes-animation").textContent = "Start Animation";
                    }
                }, 50);
            } else {
                if (visualizerStates.cubes.isRunning) {
                    visualizerStates.cubes.visualizer.start();
                    document.getElementById("toggle-cubes-animation").textContent = "Stop Animation";
                } else {
                    visualizerStates.cubes.visualizer.stop();
                    document.getElementById("toggle-cubes-animation").textContent = "Start Animation";
                }
            }
        }
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
        if (visualizerStates.icosahedron.visualizer) {
            const isRunning = visualizerStates.icosahedron.isRunning;
            if (isRunning) {
                visualizerStates.icosahedron.visualizer.stop();
                visualizerStates.icosahedron.isRunning = false;
                toggleIcosahedronAnimationButton.textContent = "Start Animation";
            } else {
                visualizerStates.icosahedron.visualizer.start();
                visualizerStates.icosahedron.isRunning = true;
                toggleIcosahedronAnimationButton.textContent = "Stop Animation";
            }
        }
    });

    const togglePyramidsAnimationButton = document.getElementById("toggle-pyramids-animation");
    togglePyramidsAnimationButton?.addEventListener("click", () => {
        if (visualizerStates.pyramids.visualizer) {
            const isRunning = visualizerStates.pyramids.isRunning;
            if (isRunning) {
                visualizerStates.pyramids.visualizer.stop();
                visualizerStates.pyramids.isRunning = false;
                togglePyramidsAnimationButton.textContent = "Start Animation";
            } else {
                visualizerStates.pyramids.visualizer.start();
                visualizerStates.pyramids.isRunning = true;
                togglePyramidsAnimationButton.textContent = "Stop Animation";
            }
        }
    });

    const toggleCubesAnimationButton = document.getElementById("toggle-cubes-animation");
    toggleCubesAnimationButton?.addEventListener("click", () => {
        if (visualizerStates.cubes.visualizer) {
            const isRunning = visualizerStates.cubes.isRunning;
            if (isRunning) {
                visualizerStates.cubes.visualizer.stop();
                visualizerStates.cubes.isRunning = false;
                toggleCubesAnimationButton.textContent = "Start Animation";
            } else {
                visualizerStates.cubes.visualizer.start();
                visualizerStates.cubes.isRunning = true;
                toggleCubesAnimationButton.textContent = "Stop Animation";
            }
        }
    });

    // Gestion du bouton de génération de token
    const generateTokenButton = document.getElementById("generate-token-btn");
    generateTokenButton?.addEventListener("click", async () => {
        const weatherEnabled = document.getElementById("weather-enabled")?.checked || false;
        const geometries = [];
        if (document.getElementById("cubes")?.checked) geometries.push("cubes");
        if (document.getElementById("icosahedron")?.checked) geometries.push("icosahedron");
        if (document.getElementById("pyramids")?.checked) geometries.push("pyramids");
        await generateToken(geometries, weatherEnabled);
    });

    // Afficher la section principale par défaut
    showSection("main-interface");
});

async function generateToken(geometries = ["cubes", "icosahedron", "pyramids"], weatherEnabled = true) {
    try {
        const response = await fetch("http://127.0.0.1:5000/generate_token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ geometries, weather_enabled: weatherEnabled })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        document.getElementById("token-output")?.setAttribute("value", data.token);
        return data.token;
    } catch (error) {
        console.error("Erreur génération token:", error);
        const tokenErrorElem = document.getElementById("token-error");
        if (tokenErrorElem) tokenErrorElem.textContent = `Erreur: ${error.message}`;
        throw error;
    }
}