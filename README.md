# Online book selling website (advertisement)

  

![tech-stack](https://skillicons.dev/icons?i=typescript,express,postgres,redis,bash,docker,github,vscode)

  

## Description

  

This project is intented to be second hand book selling platform, which I chose for my thesis topic. This repository will only hold back-end source code (REST API) for the project, and front-end will be in the separate repository which will consume this API. Main features will include followings:

  

- User registration with email verification (Mailgun used as email service)

- User management

- Book listing (randomly listing the books)

- Separating ordinary and premium books

- Creating/Updating/Deleting the books (Only authenticated users)

- Adding contact info for the book

- CRUD of book reviews

  
  

Steps to run this project:

  

1. Setup env veriable required for project. Write them out in `.env` file

- It should contain following variables:

```

POSTGRES_PASSWORD="admin"

POSTGRES_USER="root"

POSTGRES_DB="root"

POSTGRES_PORT="5432"

POSTGRES_HOST="db"

SUPER_USER="Yalchin403"

SUPER_USER_PASSWORD="Yalcin-1"

SUPER_USER_EMAIL="yalchinmammadli@outlook.com"

APP_PORT="3000"

PORT="7000"

REDIS_URI="redis"

REDIS_PORT="6379"

DOMAIN="http://127.0.0.1:3000/api"

SECRET_KEY_JWT="sQ0JiUtMceo8gZIndiaMLDUjPeBfOJdIPD3bJFWL7ED51vikZwgJTu"

REFRESH_SECRET_KEY_JWT="uQ0JiUtMceo8gZIndiaMLDUjPeBfOJdIPD3bJFWL7ED51vikZwgJTs"

ENVIRONMENT="docker"

ITEMS_PER_PAGE="8"

MAILGUN_API_KEY=""

MAILGUN_DOMAIN=""

DEFAULT_FROM_EMAIL=""

NODE_ENV="production"

STRIPE_SECRET_KEY=""

STRIPE_WEBHOOK_SECRET=""

PLATFORM_CURRENCY="huf"

PAYMENT_SUCCESS_URL="https://example.com"

PAYMENT_CANCEL_URL="https://example.com"

BOOK_POST_TIME_LIMIT="10"

BOOK_POST_MONTHLY_LIMIT="3"

```

  

Note that these values can be changed, and values of these variables above is the default values.

  

2. To run the project, you will need [Docker](https://www.docker.com/get-started/) to be installed. Also make commands are available for easy usage, please download it using [this](https://community.chocolatey.org/packages/make) link if you are using windows.

3. Then run the project using:

  
  

```shell

make  run-local

```

  

4. To create a super user, run `./deploy.sh` and execute:

  

```sh

npm  create:superuser

```

5. Running the tests:

```shell
npm test
```

To explore API, please use our postman API collection:

[POSTMAN API REFERENCE](https://drive.google.com/file/d/1p2IdEypA7RYVPbzzthWuNTWNPj0h1RR7/view?usp=sharing)