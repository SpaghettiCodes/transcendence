all: build up

build:
	mkdir -p ./data/database
	mkdir -p ./data/media/player-pfp
	mkdir -p ./data/static
	mkdir -p ./sslcert
	./genssl_cert.bash
	docker compose -f docker_compose.yml build

up:
	docker compose -f docker_compose.yml up

down:
	docker compose -f docker_compose.yml down

clean: down
	@echo "Cleaning all images and container"
	@docker system prune -af
	@echo "Cleaned!"

fclean: clean
	sudo rm -rf ./data/database
	rm -rf ./sslcert
	sudo rm -rf ./data/media/player-pfp
	sudo rm -rf ./data/static

re: down all