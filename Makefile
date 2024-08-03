all: build up

build:
	mkdir -p ./data/database
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

re: down all