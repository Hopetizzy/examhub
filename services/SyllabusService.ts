
import { supabase } from './supabase';
import { Subject } from '../types';

export interface SyllabusTopic {
    id: string;
    subject: Subject;
    topic: string;
    sub_topic?: string;
    objectives: string[];
}

export const SyllabusService = {
    async getAllTopics(subject?: string) {
        let query = supabase.from('syllabus_topics').select('*').order('subject').order('topic');

        if (subject) {
            query = query.eq('subject', subject);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as SyllabusTopic[];
    },

    async createTopic(topic: Omit<SyllabusTopic, 'id'>) {
        const { data, error } = await supabase
            .from('syllabus_topics')
            .insert(topic)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTopic(id: string, updates: Partial<SyllabusTopic>) {
        const { data, error } = await supabase
            .from('syllabus_topics')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTopic(id: string) {
        const { error } = await supabase
            .from('syllabus_topics')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
