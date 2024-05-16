// import { AppDataSource } from "../../data-source";
// import { categoryTable, categoryData } from "./categories.json";
// import { packageTable, packageData } from "./packages.json";

// const fixtures = [
//   { tableName: categoryTable, data: categoryData },
//   { tableName: packageTable, data: packageData },
// ];
// (async function () {
//   try {
//     // Connect to the database
//     fixtures.forEach(async ({ tableName, data }) => {
//       await AppDataSource.initialize();
//       await AppDataSource.getRepository(tableName).save(data);
//       console.log(
//         `Data from categories fixtures loaded into ${tableName} table.`
//       );

//       console.log("All fixtures loaded successfully.");
//     });
//   } catch (error) {
//     console.log("Error loading fixtures:", error);
//   }
// })();


import { AppDataSource } from "../../data-source";
import { categoryTable, categoryData } from "./categories.json";
import { packageTable, packageData } from "./packages.json";

const fixtures = [
  { tableName: categoryTable, data: categoryData },
  { tableName: packageTable, data: packageData },
];

(async function () {
  try {
    // Connect to the database
    await AppDataSource.initialize();

    // Using Promise.all() to await all asynchronous operations
    await Promise.all(fixtures.map(async ({ tableName, data }) => {
      await AppDataSource.getRepository(tableName).save(data);
      console.log(
        `Data from fixtures loaded into ${tableName} table.`
      );
    }));

    console.log("All fixtures loaded successfully.");
  } catch (error) {
    console.log("Error loading fixtures:", error);
  }
})();

