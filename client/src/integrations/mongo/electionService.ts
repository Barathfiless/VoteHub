import { API_BASE_URL } from '@/config/apiConfig';

const API_URL = API_BASE_URL;

export const addElectionToMongo = async (election: any) => {
    const response = await fetch(`${API_URL}/elections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(election),
    });
    if (!response.ok) throw new Error('Failed to add election');
    return response.json();
};

export const getAllElectionsFromMongo = async () => {
    const response = await fetch(`${API_URL}/elections`);
    if (!response.ok) throw new Error('Failed to fetch elections');
    return response.json();
};

export const updateElectionInMongo = async (id: string, updates: any) => {
    const response = await fetch(`${API_URL}/elections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update election');
    return response.json();
};

export const deleteElectionFromMongo = async (id: string) => {
    const response = await fetch(`${API_URL}/elections/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete election');
    return response.json();
};
