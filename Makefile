run-local:
	docker compose -f docker-compose-local.yml up --build

run-dev:
	docker compose -f docker-compose-dev.yml up --build -d
	