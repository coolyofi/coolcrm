// Optimized code with improved type annotations

// Example of improved type annotations
function fetchData<T>(url: string): Promise<T> {
    return fetch(url)  
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        });
}

// Use proper types throughout the module
interface User {
    id: number;
    name: string;
    email: string;
}

async function getUserData(userId: number): Promise<User> {
    const data = await fetchData<User>(`https://api.example.com/users/${userId}`);
    return data;
}