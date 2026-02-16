import { supabase } from './supabase';

export const paymentService = {
    // Check if user is eligible to take exam without payment
    async checkEligibility(userId: string): Promise<{ eligible: boolean; reason?: 'TUTOR_REGISTERED' | 'ACTIVE_SUBSCRIPTION' | 'NOT_ELIGIBLE' | 'FREE_PASS' }> {
        // 1. Check Profile for is_tutor_registered
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_tutor_registered, has_free_access')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Error fetching profile eligibility', profileError);
            return { eligible: false };
        }

        if (profile?.is_tutor_registered || profile?.has_free_access) {
            return { eligible: true, reason: profile?.has_free_access ? 'FREE_PASS' : 'TUTOR_REGISTERED' };
        }

        // 2. Check for successfull payments (Simulated Subscription logic)
        // For now, individuals pay per exam session or have a subscription? 
        // Requirement: "anytime they want to take a smart or a direct exam, the system will not ask them for payment. But those individuals, the system will always ask those individuals for payment."
        // This implies individuals pay PER EXAM or need to pay to unlock. 
        // Let's assume for now they must pay.

        return { eligible: false, reason: 'NOT_ELIGIBLE' };
    },

    // Get current pricing from system settings
    async getPricing(): Promise<{ PRACTICE: number; TIMED: number }> {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'exam_pricing')
            .single();

        if (error || !data) {
            console.warn("Failed to fetch pricing, using defaults", error);
            return { PRACTICE: 500, TIMED: 1000 };
        }

        return data.value; // Expecting JSON { "PRACTICE": number, "TIMED": number }
    },

    // Record a successful payment
    async recordPayment(userId: string, reference: string, amount: number) {
        const { error } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                reference,
                amount,
                status: 'success'
            });

        if (error) throw error;
    }
};
