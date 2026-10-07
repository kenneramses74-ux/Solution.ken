# Informatique Pro

Plateforme front-end professionnelle pour une communauté étudiante de profils, compétences, services, publications et groupes.

## Technologie
- HTML5, CSS3, JavaScript (aucune dépendance externe)
- localStorage pour la persistance des données
- Aucun PHP, aucune base de données (voir la section « Aller plus loin »)

## Lancer le projet
Ouvrir `index.html` dans un navigateur moderne, idéalement via un petit serveur local (Live Server dans VS Code/Acode, par exemple).

## Espace utilisateur / administrateur
Ouvrir `admin.html`, puis entrer un nom d'utilisateur et le code d'accès.

Code d'accès initial : `INFO-PRO-2026` (modifiable dans l'onglet **Paramètres** du dashboard).

À la première connexion avec un nom inconnu, un profil **entièrement vide** est créé : aucune donnée n'est pré-remplie dans le code. C'est l'utilisateur (ou l'administrateur) qui renseigne ensuite lui-même, depuis le dashboard :
- son profil (nom, rôle, présentation, disponibilité, contact WhatsApp, **photo importée depuis son appareil**),
- ses compétences et leurs pourcentages,
- ses publications (avec image de couverture importée),
- ses services (avec **icône choisie dans une palette**),
- ses groupes (avec icône),
- les paramètres du site (nom du site, texte d'accroche, code d'accès).

### Important — sécurité
Cette authentification est une démonstration front-end uniquement. Un code stocké dans localStorage ne constitue pas une sécurité réelle pour un site public multi-utilisateurs. Pour une mise en production sérieuse, il faudra connecter cette interface à un backend/API avec une vraie base d'utilisateurs (mots de passe hashés, sessions, etc.).

## Fonctionnalités
- Plusieurs profils, entièrement vides par défaut et remplis par leurs propriétaires
- Import d'images réel (photo de profil, image de publication) avec redimensionnement/compression automatique avant stockage
- Sélecteur d'icônes pour les services et les groupes
- Recherche et filtres dynamiques (générés à partir des profils existants, pas de catégories codées en dur)
- Compétences avec pourcentages animés
- Profils détaillés, publications, services, groupes, contact WhatsApp
- Groupes à découvrir aléatoirement, publication aléatoire à la une
- États vides soignés tant qu'aucun contenu n'a été ajouté
- Paramètres du site modifiables (nom, accroche, code d'accès)
- Design sombre, glassmorphism, glow, entièrement responsive

## Aller plus loin
Pour une vraie mise en ligne multi-utilisateurs sécurisée : ajouter un backend (PHP/Node/etc.) avec base de données, comptes utilisateurs avec mots de passe, et stocker les images sur un service de fichiers plutôt qu'en base64 dans localStorage (qui a une capacité limitée, environ 5 Mo selon les navigateurs).
