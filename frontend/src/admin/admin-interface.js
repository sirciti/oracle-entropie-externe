// admin-interface.js

// Gestion de l'interface admin Oracle d'Entropie

// Afficher/Masquer la section admin
function showAdminInterface() {
  document.querySelectorAll('.interface-section').forEach(section => {
    section.classList.add('hidden');
  });
  document.getElementById('admin-interface').classList.remove('hidden');
}

// ❌ Suppression de la navigation obsolète basée sur <a data-section>

// Gestion des événements du DOM pour les contrôles admin
document.addEventListener('DOMContentLoaded', () => {
  // Gestion des contrôles météo
  const weatherEnabledCheckbox = document.getElementById('weather-enabled');
  const weatherStationsSlider = document.getElementById('weather-stations-slider');
  const weatherFreqSlider = document.getElementById('weather-freq-slider');

  if (weatherEnabledCheckbox) {
    weatherEnabledCheckbox.addEventListener('change', () => {
      console.log('🌤️ Météo activée:', weatherEnabledCheckbox.checked);
    });
  }

  if (weatherStationsSlider) {
    weatherStationsSlider.addEventListener('input', () => {
      document.getElementById('weather-stations').textContent = weatherStationsSlider.value;
    });
  }

  if (weatherFreqSlider) {
    weatherFreqSlider.addEventListener('input', () => {
      document.getElementById('weather-freq').textContent = weatherFreqSlider.value + 's';
    });
  }

  // Gestion des contrôles quantiques
  const quantumEnabledCheckbox = document.getElementById('quantum-enabled');
  const quantumNodesSlider = document.getElementById('quantum-nodes-slider');
  const quantumDecoherenceSlider = document.getElementById('quantum-decoherence-slider');

  if (quantumEnabledCheckbox) {
    quantumEnabledCheckbox.addEventListener('change', () => {
      console.log('⚛️ Quantique activé:', quantumEnabledCheckbox.checked);
    });
  }

  if (quantumNodesSlider) {
    quantumNodesSlider.addEventListener('input', () => {
      document.getElementById('quantum-nodes').textContent = quantumNodesSlider.value;
    });
  }

  if (quantumDecoherenceSlider) {
    quantumDecoherenceSlider.addEventListener('input', () => {
      document.getElementById('quantum-decoherence').textContent = quantumDecoherenceSlider.value;
    });
  }

  // Gestion des contrôles géométriques
  const geometryEnabledCheckbox = document.getElementById('geometry-enabled');
  const geometryResolutionSelect = document.getElementById('geometry-resolution-select');
  const geometryFpsSlider = document.getElementById('geometry-fps-slider');

  if (geometryEnabledCheckbox) {
    geometryEnabledCheckbox.addEventListener('change', () => {
      console.log('🔷 Géométries activées:', geometryEnabledCheckbox.checked);
    });
  }

  if (geometryResolutionSelect) {
    geometryResolutionSelect.addEventListener('change', () => {
      document.getElementById('geometry-resolution').textContent = geometryResolutionSelect.value + 'x' + geometryResolutionSelect.value;
    });
  }

  if (geometryFpsSlider) {
    geometryFpsSlider.addEventListener('input', () => {
      document.getElementById('geometry-fps').textContent = geometryFpsSlider.value;
    });
  }

  // Gestion des boutons d'action
  const saveConfigBtn = document.getElementById('save-config');
  const resetConfigBtn = document.getElementById('reset-config');
  const exportLogsBtn = document.getElementById('export-logs');
  const emergencyStopBtn = document.getElementById('emergency-stop');

  if (saveConfigBtn) {
    saveConfigBtn.addEventListener('click', () => {
      console.log('💾 Sauvegarde configuration...');
      alert('Configuration sauvegardée !');
    });
  }

  if (resetConfigBtn) {
    resetConfigBtn.addEventListener('click', () => {
      console.log('🔄 Réinitialisation...');
      if (confirm('Réinitialiser la configuration ?')) {
        alert('Configuration réinitialisée !');
      }
    });
  }

  if (exportLogsBtn) {
    exportLogsBtn.addEventListener('click', () => {
      console.log('📊 Export des logs...');
      alert('Logs exportés !');
    });
  }

  if (emergencyStopBtn) {
    emergencyStopBtn.addEventListener('click', () => {
      console.log('🚨 Arrêt d\'urgence !');
      if (confirm('ARRÊT D\'URGENCE - Êtes-vous sûr ?')) {
        alert('Système arrêté !');
      }
    });
  }
});

export { showAdminInterface };
