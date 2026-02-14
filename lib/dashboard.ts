// Type-safe data fetching with proper type annotations
// Import Customer and Visit types for type safety

import type { Customer } from '@/lib/api/customers'
import type { Visit } from '@/lib/api/visits'

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

// Example function demonstrating type-safe data fetching (exported for use in other modules)
export async function getUserData(userId: number): Promise<User> {
    const data = await fetchData<User>(`https://api.example.com/users/${userId}`);
    return data;
}

// Export types for use in other modules
export type { Customer, Visit }