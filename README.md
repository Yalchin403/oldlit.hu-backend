# oldlit.hu

### This project is intented to be second hand book selling platform, which I chose for my thesis topic. This repository will only hold back-end source code (REST API) for the project, and front-end will be in the separate repository which will consume this API.

Steps to run this project:

1. Run `npm i` command
2. Setup env veriable required for project. Write them out in `.env` file
    - [] It should contain following variables:
    ```
    POSTGRES_PASSWORD=yoursecretpass
    POSTGRES_USER=yourdatabaseusername
    POSTGRES_DB=yourdatabasename
    SUPER_USER_PASSWORD=passwordforadmin
    SUPER_USER_EMAIL=emailforadmin
    ```
3. Run `npm start` command
