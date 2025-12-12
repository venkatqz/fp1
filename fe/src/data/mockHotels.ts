export interface Hotel {
    id: string;
    name: string;
    location: string;
    rating: number; // 0 to 5
    pricePerNight: number;
    image: string; // URL to placeholder image
    amenities: string[];
    description: string;
}

export const MOCK_HOTELS: Hotel[] = [
    {
        id: '1',
        name: 'The Grand Royal Hotel',
        location: 'Mumbai, India',
        rating: 4.8,
        pricePerNight: 12000,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1470&auto=format&fit=crop',
        amenities: ['Free Wifi', 'Pool', 'Spa', 'Breakfast Included'],
        description: 'Experience luxury in the heart of Mumbai with stunning sea views.'
    },
    {
        id: '2',
        name: 'Cozy Stay Residency',
        location: 'Bangalore, India',
        rating: 4.2,
        pricePerNight: 4500,
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1470&auto=format&fit=crop',
        amenities: ['Free Wifi', 'Parking', 'AC'],
        description: 'Affordable and comfortable stay for business travelers.'
    },
    {
        id: '3',
        name: 'Blue Horizon Resort',
        location: 'Goa, India',
        rating: 4.5,
        pricePerNight: 8500,
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1325&auto=format&fit=crop',
        amenities: ['Beach Access', 'Pool', 'Bar', 'Free Wifi'],
        description: 'Relax by the beach in our premium cottages.'
    },
    {
        id: '4',
        name: 'Mountain View Inn',
        location: 'Manali, India',
        rating: 4.6,
        pricePerNight: 3200,
        image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb7464?q=80&w=1474&auto=format&fit=crop',
        amenities: ['Mountain View', 'Heater', 'Restaurant'],
        description: 'Wake up to the sight of snow-capped mountains.'
    },
    {
        id: '5',
        name: 'Urban Pods',
        location: 'Tokyo, Japan',
        rating: 4.0,
        pricePerNight: 2000,
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1469&auto=format&fit=crop',
        amenities: ['Compact', 'Free Wifi', 'Central Location'],
        description: 'Modern capsule hotel experience for solo travelers.'
    },
    {
        id: '6',
        name: 'Sunset Villa',
        location: 'Bali, Indonesia',
        rating: 4.9,
        pricePerNight: 15000,
        image: 'https://images.unsplash.com/photo-1571896349842-6e53ce41ad69?q=80&w=1470&auto=format&fit=crop',
        amenities: ['Private Pool', 'Kitchen', 'Wifi', 'Butler Service'],
        description: 'Private villa with breathtaking sunset views.'
    },
    {
        id: '7',
        name: 'Eiffel Tower View',
        location: 'Paris, France',
        rating: 4.7,
        pricePerNight: 25000,
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1473&auto=format&fit=crop',
        amenities: ['City View', 'Breakfast', 'Metro Access', 'Concierge'],
        description: 'Romantic getaway with a direct view of the Iron Lady.'
    },
    {
        id: '8',
        name: 'Times Square Suites',
        location: 'New York, USA',
        rating: 4.3,
        pricePerNight: 18000,
        image: 'https://images.unsplash.com/photo-1496417263034-38ec4f0d665a?q=80&w=1471&auto=format&fit=crop',
        amenities: ['Gym', 'Rooftop Bar', 'Central Location', 'Pet Friendly'],
        description: 'Stay in the center of the action in Manhattan.'
    },
    {
        id: '9',
        name: 'Desert Oasis Resort',
        location: 'Dubai, UAE',
        rating: 5.0,
        pricePerNight: 35000,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1470&auto=format&fit=crop',
        amenities: ['Luxury Spa', 'Infinity Pool', 'Fine Dining', 'Chauffeur'],
        description: 'Ultimate luxury experience in the middle of the dunes.'
    },
    {
        id: '10',
        name: 'London Eye Apartments',
        location: 'London, UK',
        rating: 4.4,
        pricePerNight: 14000,
        image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1470&auto=format&fit=crop',
        amenities: ['River View', 'Kitchenette', 'Wifi', 'Near Transport'],
        description: 'Modern apartments overlooking the Thames.'
    },
    {
        id: '11',
        name: 'Harbour Bridge Stay',
        location: 'Sydney, Australia',
        rating: 4.6,
        pricePerNight: 16000,
        image: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a?q=80&w=1374&auto=format&fit=crop',
        amenities: ['Harbour View', 'Pool', 'BBQ Area', 'Gym'],
        description: 'Stunning views of the Opera House and Harbour Bridge.'
    }
];
