// Register API Request
document.getElementById('registerForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = this.name.value.trim();
    const phone = this.phone.value.trim();
    const password = this.password.value.trim();

    if (!validatePassword(password)) {
        alert('Password must be at least 4 characters long, contain 1 uppercase letter, and 1 lowercase letter.');
        return;
    }

    fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, password })
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'User registered successfully') {
            alert('Registration successful! Redirecting to login...');
            window.location.href = 'login.html';
        } else {
            alert('User already exists!');
        }
    })
    .catch(error => {
        alert('An error occurred during registration.');
        console.error(error);
    });
});

// Login API Request
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const phone = this.phone.value.trim();
    const password = this.password.value.trim();

    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'Login successful') {
            alert('Login successful! Redirecting to bookings...');
            
            fetch(`http://localhost:3000/getUserId/${phone}`)
                .then(response => response.json())
                .then(userData => {
                    localStorage.setItem('loggedInUser', JSON.stringify({ 
                        phone: phone,
                        userId: userData.userId 
                    }));
                    window.location.href = 'bookings.html';
                })
                .catch(error => {
                    console.error('Error getting user ID:', error);
                    
                    localStorage.setItem('loggedInUser', JSON.stringify({ phone }));
                    window.location.href = 'bookings.html';
                });
        } else {
            alert('Invalid credentials!');
        }
    })
    .catch(error => {
        alert('An error occurred during login.');
        console.error(error);
    });
});


document.addEventListener('DOMContentLoaded', function() {
    
    if (document.getElementById('bookingForm')) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) {
            alert('Please log in to make a booking.');
            window.location.href = 'login.html';
            return;
        }
        
        // Load regions
        loadRegions();
        
        // Display existing bookings
        displayBookings();
    }
});

// Load regions from the database
function loadRegions() {
    fetch('http://localhost:3000/regions')
        .then(response => response.json())
        .then(data => {
            const regionSelect = document.getElementById('region');
            regionSelect.innerHTML = '<option value="">Select Region</option>';
            
            // Remove duplicate regions
            const uniqueRegions = [...new Set(data.map(item => item.region))];
            
            uniqueRegions.forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching regions:', error);
        });
}

// Load subdivisions based on selected region
document.getElementById('region')?.addEventListener('change', function() {
    const region = this.value;
    
    if (region) {
        fetch(`http://localhost:3000/subdivisions/${region}`)
            .then(response => response.json())
            .then(data => {
                const subdivisionSelect = document.getElementById('subdivision');
                subdivisionSelect.innerHTML = '<option value="">Select Subdivision</option>';
                
                // Remove duplicate subdivisions
                const uniqueSubdivisions = [...new Set(data.map(item => item.subdivision))];
                
                uniqueSubdivisions.forEach(subdivision => {
                    const option = document.createElement('option');
                    option.value = subdivision;
                    option.textContent = subdivision;
                    subdivisionSelect.appendChild(option);
                });
                
                // Reset location dropdown
                document.getElementById('location').innerHTML = '<option value="">Select Location</option>';
            })
            .catch(error => {
                console.error('Error fetching subdivisions:', error);
            });
    }
});

// Load locations based on region and subdivision
document.getElementById('subdivision')?.addEventListener('change', function() {
    const region = document.getElementById('region').value;
    const subdivision = this.value;
    
    if (region && subdivision) {
        fetch(`http://localhost:3000/locations/${region}/${subdivision}`)
            .then(response => response.json())
            .then(data => {
                const locationSelect = document.getElementById('location');
                locationSelect.innerHTML = '<option value="">Select Location</option>';

                data.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.location_name;
                    option.setAttribute('data-price-2wheeler', location.price_2wheeler);
                    option.setAttribute('data-price-4wheeler', location.price_4wheeler);
                    option.textContent = location.location_name;
                    locationSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
            });
    }
});

// Update price when vehicle type or location changes
function updatePrice() {
    const vehicleType = document.getElementById('vehicleType').value;
    const locationSelect = document.getElementById('location');
    const selectedOption = locationSelect.options[locationSelect.selectedIndex];
    
    if (vehicleType && selectedOption.value) {
        let price = 0;
        if (vehicleType === '2-wheeler') {
            price = parseFloat(selectedOption.getAttribute('data-price-2wheeler'));
        } else if (vehicleType === '4-wheeler') {
            price = parseFloat(selectedOption.getAttribute('data-price-4wheeler'));
        }
        
        // Display the price somewhere if you want
        const priceDisplay = document.getElementById('priceDisplay');
        if (priceDisplay) {
            priceDisplay.textContent = `Price: ₹${price.toFixed(2)}`;
        }
        
        return price;
    }
    return 0;
}

// Add event listeners for price updates
document.getElementById('vehicleType')?.addEventListener('change', updatePrice);
document.getElementById('location')?.addEventListener('change', updatePrice);

// Booking API Request
document.getElementById('bookingForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const region = document.getElementById('region').value;
    const subdivision = document.getElementById('subdivision').value;
    const location = document.getElementById('location').value;
    const vehicleType = document.getElementById('vehicleType').value;
    const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
    const parkingDate = document.getElementById('parkingDate').value;

    if (!validateVehicleNumber(vehicleNumber)) {
        alert('Vehicle number must be at least 4 characters long.');
        return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.userId) {
        alert('Please log in to make a booking.');
        window.location.href = 'login.html';
        return;
    }

    // Get the price based on location and vehicle type
    const locationSelect = document.getElementById('location');
    const selectedOption = locationSelect.options[locationSelect.selectedIndex];
    let price = 0;
    
    if (vehicleType === '2-wheeler') {
        price = parseFloat(selectedOption.getAttribute('data-price-2wheeler'));
    } else if (vehicleType === '4-wheeler') {
        price = parseFloat(selectedOption.getAttribute('data-price-4wheeler'));
    }

    const bookingData = {
        userId: loggedInUser.userId,
        location: `${region}, ${subdivision}, ${location}`,
        vehicleType,
        vehicleNumber,
        date: parkingDate,
        price
    };

    fetch('http://localhost:3000/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    })
    .then(response => response.text())
    .then(data => {
        if (data === 'Booking successful') {
            alert('Booking successful!');
            this.reset();
            displayBookings();
        } else {
            alert('Error in booking: ' + data);
        }
    })
    .catch(error => {
        alert('An error occurred during booking.');
        console.error(error);
    });
});

// Fetch and display bookings
function displayBookings() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || !loggedInUser.userId) {
        return;
    }

    fetch(`http://localhost:3000/bookings/${loggedInUser.userId}`)
        .then(response => response.json())
        .then(data => {
            const bookingList = document.getElementById('bookingList');
            if (!bookingList) return;
            
            if (data.length > 0) {
                bookingList.innerHTML = '<h3>Your Bookings</h3>';
                bookingList.innerHTML += data.map(b => `
                    <div class="booking-item">
                        <p><strong>Location:</strong> ${b.location}</p>
                        <p><strong>Vehicle:</strong> ${b.vehicle_type}</p>
                        <p><strong>Number:</strong> ${b.vehicle_number}</p>
                        <p><strong>Date:</strong> ${new Date(b.booking_date).toLocaleString()}</p>
                        <p><strong>Price:</strong> ₹${b.price}</p>
                    </div>
                `).join('');
            } else {
                bookingList.innerHTML = '<h3>Your Bookings</h3><p>No bookings found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching bookings:', error);
        });
}

// Helper functions
function validatePassword(password) {
    const minLength = 4;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase;
}

function validateVehicleNumber(vehicleNumber) {
    return vehicleNumber.length >= 4;
}