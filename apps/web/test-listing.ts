async function main() {
    const payload = {
        title: "Beautiful Apartment",
        description: "A very nice place to live with lots of space.",
        address: "123 Main St",
        rent_xlm: 1000,
        bedrooms: 2,
        bathrooms: 2,
        furnished: true,
        pet_friendly: true,
        amenities: ["Pool", "Gym", "WiFi"]
    };

    const response = await fetch('http://localhost:3000/api/listings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // We will need a valid token to test the real endpoint or mock it.
            'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
}

main();
