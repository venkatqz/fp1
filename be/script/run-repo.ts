
import { HotelRepository } from '../src/repositories/hotel.repo';

async function main() {
    console.log('Running HotelRepository.findAvailableHotels()...');

    try {
        const results = await HotelRepository.findAvailableHotels(
            'Urban',
            '2024-12-01',
            '2024-12-05',
            12,
            0
        );

        console.log('Query executed successfully!');
        console.log(JSON.stringify(results, null, 2));

    } catch (error) {
        console.error('Error executing query:', error);
    }
}

main();
