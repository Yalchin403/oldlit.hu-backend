import { AppDataSource } from "./data-source"
import { User } from "./entity/User"

AppDataSource.initialize().then(async () => {
    console.log("Loading users from the database...")
    let users = await AppDataSource.manager.find(User)
    // users.forEach(async function(user){
    //     await AppDataSource
    //     .createQueryBuilder()
    //     .delete()
    //     .from(User)
    //     .where("id = :id", { id: user.id })
    //     .execute()


    // })

    console.log("Loaded users: ", users)

    console.log("Here you can setup and run express / fastify / any other framework.")

}).catch(error => console.log(error))
