import { supabase } from './supabase';
import { Notification } from '../types';

export const notificationService = {
    // Get notifications for a user
    async getNotifications(userId: string): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return data.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.is_read,
            createdAt: n.created_at,
            link: n.link,
            metadata: n.metadata
        }));
    },

    // Create a new notification
    async createNotification(userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR', link?: string, metadata?: any): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                link,
                metadata,
                is_read: false
            });

        if (error) {
            console.error('Error creating notification:', error);
        }
    },

    // Mark all as read
    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId);

        if (error) {
            console.error('Error marking notifications as read:', error);
        }
    },

    // Mark single as read
    async markAsRead(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
        }
    }
};
