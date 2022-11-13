const dotenv = require("dotenv");
const path = require("path");

// configure dotenv
export function initializeDotenv() {
    const envPath: string = path.join(__dirname, `../../.env/.env.${process.env.NODE_ENV}`);
    dotenv.config(
        { path: envPath }
    );
}
