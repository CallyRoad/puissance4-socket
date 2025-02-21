# Puissance 4 - Docker Development Environment
[English](#english) | [Français](#français)

---
# English

Docker configuration for local development of Connect Four game.

## Prerequisites
- Docker
- Git

# Installation

## Clone this repository :

```bash
git clone https://github.com/CallyRoad/puissance4-docker.git
cd puissance4-docker
```

## Clone the projects :

### Frontend

```bash
cd frontend
git clone https://github.com/CallyRoad/reactjs-puissance4.git
```

### Backend
```bash
cd ../backend
git clone https://github.com/CallyRoad/puissance4-socket.git
```

## Start containers

```bash
docker-compose up
``` 

The application will be available at :

Frontend : http://localhost:3000
Backend : http://localhost:4000

## Useful commands

### Start and stop containers  
- Start containers : ```docker-compose up```
- Stop containers : ```docker-compose down```
- Rebuild and start : ```docker-compose up --build```

### Logs and Debug

- View all logs : ```docker-compose logs```
- Service specific logs (backend or frontend) : 
  - ```docker-compose logs frontend``` 
  - ```docker-compose logs backend```
---
# Français

Configuration Docker pour le développement local du jeu Puissance 4.

## Prérequis
- Docker
- Git

# Installation
## Clonez ce repository :

```bash
git clone https://github.com/CallyRoad/puissance4-docker.git
cd puissance4-docker
```

## Clonez les projets :

### Pour le frontend
```bash
cd frontend
git clone https://github.com/CallyRoad/reactjs-puissance4.git
```

### Pour le backend
```bash
cd ../backend
git clone https://github.com/CallyRoad/puissance4-socket.git
```

## Lancez les conteneurs 

```bash
docker-compose up
``` 
L'application sera disponible sur :

Frontend : http://localhost:3000
Backend : http://localhost:4000

## Commandes utiles

### Démarrer ou arrêter 

- Démarrer les conteneurs : ```docker-compose up```
- Arrêter les conteneurs : ```docker-compose down```
- Reconstruire et démarrer : ```docker-compose up --build```

### Logs et Debug

- Voir tous les logs : ```docker-compose logs```
- Logs pour un service spécifique (backend or frontend) :
    - ```docker-compose logs frontend```
    - ```docker-compose logs backend```
---
