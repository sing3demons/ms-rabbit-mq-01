.PHONY: build rabbitmq
rabbitmq:
	docker-compose -f docker-compose-mq.yml up -d

.PHONY: build
build:
	docker-compose up -d

.PHONY: stop
stop:
	docker-compose stop

.PHONY: clean
clean:
	docker-compose down
	
	docker-compose -f docker-compose-mq.yml down