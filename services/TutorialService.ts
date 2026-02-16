import { supabase } from './supabase';

export interface Tutorial {
    id: string;
    title: string;
    video_url: string; // YouTube URL
    description: string;
    target_role: 'ALL' | 'STUDENT' | 'TUTOR';
    is_active: boolean;
    order: number;
    created_at?: string;
}

export const TutorialService = {
    /**
     * Fetch tutorials relevant for a specific role (or all for admin view if no role filters)
     */
    async getTutorials(role?: 'STUDENT' | 'TUTOR'): Promise<Tutorial[]> {
        let query = supabase
            .from('tutorials')
            .select('*')
            .eq('is_active', true)
            .order('order', { ascending: true });

        if (role) {
            // Logic: Get tutorials where target_role is 'ALL' OR target_role is the specific role
            // Supabase 'or' syntax: .or(`target_role.eq.ALL,target_role.eq.${role}`)
            query = query.or(`target_role.eq.ALL,target_role.eq.${role}`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching tutorials:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Fetch ALL tutorials (active and inactive) for Admin Dashboard
     */
    async getAllTutorialsForAdmin(): Promise<Tutorial[]> {
        const { data, error } = await supabase
            .from('tutorials')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async createTutorial(tutorial: Omit<Tutorial, 'id' | 'created_at'>): Promise<Tutorial> {
        const { data, error } = await supabase
            .from('tutorials')
            .insert(tutorial)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTutorial(id: string, updates: Partial<Tutorial>): Promise<Tutorial> {
        const { data, error } = await supabase
            .from('tutorials')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTutorial(id: string): Promise<void> {
        const { error } = await supabase
            .from('tutorials')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Helper to extract video ID from YouTube URL
    getVideoId(url: string): string | null {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
};
