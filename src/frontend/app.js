document.addEventListener('DOMContentLoaded', () => {
    // Determine API URL (fallback to relative path or localhost for dev)
    let apiUrl = window.env.API_URL;
    if (apiUrl === '__API_URL__' || !apiUrl) {
        apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:3000/api/data' 
            : '/api/data';
    }

    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    const apiResponse = document.getElementById('api-response');

    async function fetchData() {
        try {
            const response = await fetch(apiUrl);
            
            if (response.ok) {
                const data = await response.json();
                statusIndicator.className = 'status-indicator status-ok';
                statusText.textContent = 'Backend is Online';
                apiResponse.textContent = JSON.stringify(data, null, 2);
                apiResponse.style.color = 'var(--success-color)';
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            statusIndicator.className = 'status-indicator status-error';
            statusText.textContent = 'Backend is Offline';
            apiResponse.textContent = error.message;
            apiResponse.style.color = 'var(--error-color)';
            console.error('Fetch error:', error);
        }
    }

    fetchData();
});
