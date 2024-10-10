build:
	docker build -t chatgpt_telegram .

run:
	docker run -d -p 3000:3000 --name chatgpt_telegram --rm chatgpt_telegram 