
// Fetch user profile data
document.addEventListener('DOMContentLoaded', fetchUserProfile);

async function fetchUserProfile() {
    try {
        const response = await fetch('/userprofile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            const userData = await response.json();
            document.getElementById('username').textContent = userData.username;
            document.getElementById('email').textContent = userData.email;
        } else {
            console.error('Failed to fetch user profile');
        }
    } catch (err) {
        console.error('Error fetching user profile:', err);
    }
}