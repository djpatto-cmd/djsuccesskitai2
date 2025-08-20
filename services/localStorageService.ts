import { ClientProfile } from '../types';

const PROFILES_STORAGE_KEY = 'djSuccessKit_profiles';

export function loadProfiles(): ClientProfile[] {
    try {
        const profilesJson = localStorage.getItem(PROFILES_STORAGE_KEY);
        if (profilesJson) {
            return JSON.parse(profilesJson);
        }
    } catch (error) {
        console.error("Failed to load client profiles from localStorage:", error);
    }
    return [];
}

export function saveProfiles(profiles: ClientProfile[]): void {
    try {
        const profilesJson = JSON.stringify(profiles);
        localStorage.setItem(PROFILES_STORAGE_KEY, profilesJson);
    } catch (error) {
        console.error("Failed to save client profiles to localStorage:", error);
    }
}
