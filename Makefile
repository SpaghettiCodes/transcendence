all: build up

build:
	mkdir -p ./data/database
	mkdir -p ./sslcert
	docker compose -f docker_compose.yml build

up:
	docker compose -f docker_compose.yml up

down:
	docker compose -f docker_compose.yml down

clean: down
	@echo "Cleaning all images and container"
	@docker system prune -af
	@echo "Cleaned!"

re: down all