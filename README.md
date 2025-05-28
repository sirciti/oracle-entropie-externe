# oracle-entropie-externe

# ⚛️ Oracle d'Entropie Quantique-Géométrique 🎲

Ce projet est un générateur d'entropie innovant, conçu pour produire des nombres aléatoires et des tokens cryptographiquement sûrs en combinant diverses sources d'aléa complexes et imprévisibles. Il explore la fusion d'événements du monde réel, de dynamiques géométriques chaotiques et de principes inspirés de la mécanique quantique pour créer une source d'entropie unique et difficilement reproductible.

## 💡 Innovation et Objectifs

L'objectif principal est de développer un "Oracle d'Entropie" qui ne dépend pas d'une seule source, mais mélange de multiples contributeurs, créant ainsi une graine aléatoire d'une robustesse inégalée. Ce projet est une preuve de concept pour des applications en cybersécurité, blockchain, simulations complexes, ou toute autre situation nécessitant une source d'aléa de très haute qualité.

Les sources d'entropie utilisées incluent :
-   **Données Météo Géolocalisées :** Fluctuations en temps réel (température, humidité, pression, vent, nuages, précipitations) agrégées depuis plusieurs points géographiques.
-   **Géométrie Dynamique de l'Icosaèdre :** L'évolution chaotique d'un icosaèdre subdivisé selon des règles non-linéaires.
-   **Entropie Temporelle Mondiale :** Des "super timestamps" mondiaux créés par le mélange aléatoire des heures et dates de multiples fuseaux horaires et régions du monde.
-   **Bruit Système Local :** Des sources d'aléa générées par le système d'exploitation.
-   **Mécanique Quantique Simulée :** Des nœuds quantiques simulant la décohérence et l'intrication pour contribuer à l'aléa.
-   **(NOUVEAU) Géométrie Dynamique des Cubes :** Un système de cubes rebondissants avec des billes internes générant du chaos (à finaliser visuellement).

Le projet met en avant la modularité, la testabilité et l'utilisation de pratiques de développement professionnel.



## ✨ Fonctionnalités

-   **Générateur Aléatoire Classique :** Génère un nombre aléatoire hexadécimal à partir de l'entropie combinée.
-   **Outil Interne de Sécurité :** Permet de générer des tokens cryptographiquement sûrs et personnalisables (longueur, composition : minuscules, majuscules, chiffres, symboles).
-   **Visualisation 3D de l'Icosaèdre Dynamique :** Représentation interactive d'un icosaèdre dont l'évolution contribue à l'entropie.
-   **Visualisation 3D des Pyramides Dynamiques :** (En cours de finalisation visuelle) Représentation d'un système de pyramides creuses avec des billes internes, source d'entropie chaotique.
-   **Visualisation 3D des Cubes Dynamiques :** (En cours de développement) Représentation d'un système de cubes et de billes rebondissantes, nouvelle source d'entropie.
-   **API Backend Robuste :** Fournit des endpoints pour la génération d'entropie, la récupération de données géométriques et la génération de tokens.
-   **Architecture Modulaire :** Organisation claire du code en modules (géométrie, entropie, API) pour une meilleure maintenabilité.
-   **Tests Automatisés :** Suites de tests Pytest (backend) et Playwright (frontend) pour garantir la fiabilité.


## 🏗️ Architecture Technique

Le projet est divisé en deux parties principales : un backend (API) et un frontend (interface utilisateur).

### Backend
-   **Langage :** Python 3.10+
-   **Framework :** Flask (pour l'API RESTful)
-   **Bibliothèques clés :**
    -   `requests` : Requêtes HTTP vers des APIs externes (météo, QRNG).
    -   `numpy` : Opérations numériques et calculs géométriques (icosaèdre, pyramides, cubes).
    -   `scipy` : Transformations spatiales (rotations 3D des objets géométriques).
    -   `pytz` : Gestion des fuseaux horaires mondiaux pour l'entropie temporelle.
    -   `hashlib` : Fonctions de hachage cryptographiques (BLAKE2b, SHA256) pour mixer l'entropie.
    -   `secrets` : Génération de nombres aléatoires cryptographiquement sûrs.
    -   `Flask-CORS` : Gestion des requêtes Cross-Origin pour la communication frontend/backend.
    -   `logging` : Système de logs robuste.
-   **Structure modulaire :**
    -   `app.py` : Point d'entrée principal de l'application Flask, expose les routes API.
    -   `config.json` : Configuration de l'application (coordonnées météo, etc.).
    -   `entropy_oracle.py` : Orchestre la collecte et le mélange des différentes sources d'entropie.
    -   `temporal_entropy.py` : Logique spécifique pour l'entropie basée sur les timestamps mondiaux.
    -   `weather_data.py` : Fonctions pour la récupération et la combinaison des données météo.
    -   `quantum_nodes.py` : Simulation des nœuds quantiques (avec fallback si Qiskit n'est pas installé).
    -   `fractal_lsystem.py` : Génération de chaînes fractales pour l'entropie.
    -   `geometry/` : Package dédié aux modèles géométriques dynamiques.
        -   `geometry/icosahedron/` : Génération et dynamique de l'icosaèdre.
        -   `geometry/pyramids/` : Génération et dynamique des pyramides creuses.
        -   `geometry/cubes/` : Génération et dynamique des cubes et billes rebondissantes.
        -   `geometry/common.py` : Fonctions utilitaires géométriques partagées (rotation, subdivision, voisins).
    -   `geometry_api.py` : Blueprint Flask exposant les routes API pour les différents modèles géométriques.
    -   `test_backend/` : Suite de tests unitaires Pytest pour le backend.

### Frontend
-   **Technologies :** HTML5, CSS3, JavaScript (ES Modules)
-   **Framework de développement :** Vite (pour le développement rapide et le Hot Module Replacement - HMR)
-   **Bibliothèques clés :**
    -   `Three.js` : Moteur de rendu 3D pour la visualisation des formes géométriques.
    -   `three_utils.js` : Module utilitaire pour importer et gérer `Three.js` de manière unique.
-   **Structure :**
    -   `index.html` : Structure de la page principale et des différentes interfaces.
    -   `style.css` : Styles globaux et spécifiques aux composants.
    -   `script.js` : Logique pour le générateur aléatoire classique.
    -   `internal_tool.js` : Logique pour l'outil interne de génération de tokens.
    -   `icosahedron.js` : Visualiseur Three.js pour l'icosaèdre dynamique.
    -   `pyramids_visualizer.js` : Visualiseur Three.js pour les pyramides dynamiques.
    -   `cubes_visualizer.js` : Visualiseur Three.js pour les cubes dynamiques (en cours de développement).
    -   `navigation.js` : Gère la navigation entre les différentes sections de l'interface.
-   **Tests Frontend :** Playwright (pour les tests d'intégration et end-to-end de l'interface utilisateur).



## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants installés sur votre système :

-   **Python 3.10 ou plus récent :** [Télécharger Python](https://www.python.org/downloads/)
-   **Node.js (LTS recommandé) :** [Télécharger Node.js](https://nodejs.org/en/download/) (inclut npm)
-   **npm :** (Généralement installé avec Node.js)
-   **Git :** [Télécharger Git](https://git-scm.com/downloads)




## 🚀 Installation et Lancement

Suivez ces étapes pour configurer et lancer le projet :

1.  **Cloner le dépôt :**
    ```bash
    git clone [https://github.com/sirciti/oracle-entropie-externe.git](https://github.com/sirciti/oracle-entropie-externe.git)
    ```

2.  **Naviguer dans le répertoire du projet :**
    ```bash
    cd oracle-entropie-externe
    ```

3.  **Configuration du Backend (Python) :**
    -   Créez et activez un environnement virtuel :
        ```bash
        python -m venv venv
        source venv/Scripts/activate  # Sur Linux/macOS
        # Ou pour Windows (Git Bash/CMD) : .\venv\Scripts\activate
        ```
    -   Installez les dépendances Python :
        ```bash
        pip install -r requirements.txt
        ```

4.  **Configuration du Frontend (Node.js/Vite) :**
    -   Naviguez dans le répertoire `frontend` :
        ```bash
        cd frontend/
        ```
    -   Installez les dépendances Node.js :
        ```bash
        npm install
        ```
    -   Installez les navigateurs nécessaires pour Playwright (pour les tests) :
        ```bash
        npx playwright install
        ```
    -   Retournez à la racine du projet :
        ```bash
        cd ..
        ```

5.  **Lancement du Backend (API Flask) :**
    -   Ouvrez un **premier terminal** (Git Bash recommandé).
    -   Naviguez à la racine du projet (`oracle-entropie-externe`).
    -   Activez votre environnement virtuel :
        ```bash
        source venv/Scripts/activate  # Sur Linux/macOS
        # Ou pour Windows : .\venv\Scripts\activate
        ```
    -   Lancez l'application Flask :
        ```bash
        python -m backend.app
        ```
    -   Laissez ce terminal ouvert et observez les logs du backend.

6.  **Lancement du Frontend (Application Web Vite) :**
    -   Ouvrez un **deuxième terminal** (Git Bash recommandé).
    -   Naviguez dans le répertoire `frontend/` :
        ```bash
        cd frontend/
        ```
    -   Lancez le serveur de développement Vite :
        ```bash
        npx vite
        ```
    -   Laissez ce terminal ouvert et observez les logs de Vite.

7.  **Accès à l'Application :**
    -   Ouvrez votre navigateur web et accédez à l'URL : `http://localhost:5173/`




    ## 🧪 Exécution des Tests

Le projet est couvert par des tests unitaires (Pytest pour le backend) et des tests d'intégration/end-to-end (Playwright pour le frontend).

Avant de lancer les tests, assurez-vous que les serveurs Backend (Flask) et Frontend (Vite) sont bien lancés comme décrit dans la section [Lancement](#-installation-et-lancement).

### Tests Backend (Pytest)

-   Ouvrez un nouveau terminal et naviguez à la **racine de votre projet** (`oracle-entropie-externe`).
-   Activez votre environnement virtuel :
    ```bash
    source venv/Scripts/activate  # Sur Linux/macOS
    # Ou pour Windows : .\venv\Scripts\activate
    ```
-   Exécutez les tests pour les différents modules :
    ```bash
    pytest backend/test_backend/test_icosahedron.py
    pytest backend/test_backend/test_pyramids.py
    pytest backend/test_backend/test_cubes.py
    pytest backend/test_backend/test_generate_token.py
    ```
-   Vous devriez voir les résultats indiquant le nombre de tests passés et les éventuels échecs ou avertissements.

### Tests Frontend (Playwright)

-   Ouvrez un nouveau terminal et naviguez dans le répertoire `frontend/` :
    ```bash
    cd frontend/
    ```
-   Exécutez les tests Playwright :
    ```bash
    npx playwright test
    ```
-   Observez la sortie des tests dans le terminal. Playwright ouvrira et fermera des navigateurs pour simuler les interactions utilisateur.




## ⚠️ Problèmes Connus / Travail en Cours

Le projet est en développement actif. Bien que les fonctionnalités principales soient implémentées, certains aspects sont encore en cours d'amélioration ou présentent des instabilités mineures.

-   **Visualisation des Pyramides et Cubes :**
    -   La visualisation 3D des pyramides creuses et des cubes avec billes est en cours de débogage pour un affichage stable et conforme à la vision. Actuellement, ils peuvent ne pas s'afficher correctement ou présenter des anomalies visuelles.
    -   Les billes blanches et le comportement de rebond des cubes ne sont pas encore pleinement implémentés visuellement.

-   **Stabilité et Fluidité de la Navigation 3D :**
    -   Des instabilités ou des délais peuvent survenir lors du basculement rapide entre les différentes visualisations 3D (Icosaèdre, Pyramides, Cubes). Cela peut entraîner des avertissements dans la console du navigateur ou un affichage temporairement incorrect.

-   **Tests Frontend (Playwright) :**
    -   Certains tests Playwright liés à la visualisation 3D peuvent échouer en raison des problèmes d'affichage et de synchronisation des conteneurs 3D.
    -   Il peut y avoir des avertissements liés à l'importation de Three.js ou à l'initialisation du renderer si le contexte n'est pas prêt.

-   **Améliorations futures :**
    -   Intégration d'un bouton Start/Stop fonctionnel pour chaque figure 3D (actuellement en phase de débogage/intégration).
    -   Ajout d'un espace d'affichage et d'un bouton "Copier" pour le générateur aléatoire classique.
    -   Amélioration de la fluidité et des performances des animations 3D.




    ## 👥 Auteur(s)

-   Votre Nom / Pseudo (sirciti)

## 📄 Licence

Ce projet est sous licence MIT. Pour plus d'informations, consultez le fichier `LICENSE` à la racine du dépôt.