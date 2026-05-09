.PHONY: help dev lint test check-env

SHELL          := bash
DOCKER_COMPOSE := docker compose -f local-run/docker-compose.yml

.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "Meteion — commandes disponibles"
	@echo "================================"
	@echo "  make dev       Démarre le projet en local (DB + sync + bot en watch)"
	@echo "  make lint      Exécute ESLint avec auto-fix"
	@echo "  make test      Lance la suite de tests Jest"
	@echo ""

dev: check-env
	@bash local-run/start.sh

check-env:
	@if [ ! -f .env ]; then \
		echo "Erreur : fichier .env introuvable."; \
		echo "Copie .env.sample en .env et renseigne TOKEN, CLIENT_ID et GUILD_ID."; \
		exit 1; \
	fi

lint:
	npm run lint

test:
	npm test
