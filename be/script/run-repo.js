"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hotel_repo_1 = require("../src/repositories/hotel.repo");
async function main() {
    console.log('Running HotelRepository.findAvailableHotels()...');
    try {
        const results = await hotel_repo_1.HotelRepository.findAvailableHotels('Urban', '2024-12-01', '2024-12-05', 12, 0);
        console.log('Query executed successfully!');
        console.log(JSON.stringify(results, null, 2));
    }
    catch (error) {
        console.error('Error executing query:', error);
    }
}
main();
//# sourceMappingURL=run-repo.js.map