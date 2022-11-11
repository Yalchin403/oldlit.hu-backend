import supertest from 'supertest';
import app from "..//../server";


const allUsers = [
    {
        "dateJoined": "2022-11-09T21:56:36.748Z",
        "id": 1,
        "firstName": "Yalchin403",
        "lastName": "Mammadli",
        "email": "ddos.hacker@example.com"
    }
];
describe("Users", () => {
    describe("Get all users route", () => {
        describe("Given any condition", () => {
            it("Should return array of users", async () => {
                await supertest(app).get('/api/users/').expect(200);
            });
        });
    });
});