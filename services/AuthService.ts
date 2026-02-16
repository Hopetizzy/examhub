import { supabase } from './supabase';
import { User, UserRole } from '../types';

export const AuthService = {

    // Sign Up with Email, Password, and extended data
    async signUp(email: string, password: string, fullName: string, surname: string, role: UserRole) {
        // 1. Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    surname: surname,
                    role: role.toLowerCase() // 'student' | 'tutor' | 'individual'
                },
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;

        // Note: The Trigger in SQL handles profile creation. 
        // If testing without triggers, we would manually insert into 'profiles' here.

        return data;
    },

    // Sign In
    async signIn(email: string, password: string): Promise<User> {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("No user returned");

        // Fetch Profile details
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            console.warn("Profile fetch error, using defaults", profileError);
        }

        // PRIORITY: Check app_metadata for 'ADMIN' role validation (synced via SQL)
        // Then user_metadata, then profile, then default.
        const appMetaRole = authData.user.app_metadata?.role;
        const userMetaRole = authData.user.user_metadata?.role;
        const profileRole = profile?.role;

        const role = (appMetaRole || profileRole || userMetaRole || 'STUDENT').toUpperCase() as UserRole;

        return {
            id: authData.user.id,
            email: authData.user.email || '',
            name: profile?.full_name || authData.user.user_metadata?.full_name || 'User',
            role: role,
            balance: 0,
            subscription: {
                planId: profile?.subscription_plan_id || 'plan_basic',
                maxStudents: profile?.max_students || 5,
                expiryDate: profile?.subscription_expiry
            },
            tutorId: profile?.tutor_id
        };
    },

    // Sign Out
    async signOut() {
        return await supabase.auth.signOut();
    },

    // Restore Session
    async getCurrentUser(): Promise<User | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        const appMetaRole = session.user.app_metadata?.role;
        const userMetaRole = session.user.user_metadata?.role;
        const profileRole = profile?.role;

        const role = (appMetaRole || profileRole || userMetaRole || 'STUDENT').toUpperCase() as UserRole;

        return {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.full_name || session.user.user_metadata?.full_name || 'User',
            role: role,
            balance: 0,
            subscription: {
                planId: profile?.subscription_plan_id || 'plan_basic',
                maxStudents: profile?.max_students || 5,
                expiryDate: profile?.subscription_expiry
            },
            tutorId: profile?.tutor_id
        };
    }
};
