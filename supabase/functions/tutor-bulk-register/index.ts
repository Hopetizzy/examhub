import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SERVICE_ROLE_KEY') ?? ''
        )

        const { tutorId, students } = await req.json()

        if (!tutorId || !students || !Array.isArray(students)) {
            throw new Error('Invalid request body')
        }

        const results = []

        for (const student of students) {
            // 1. Generate Password
            const password = student.surname.toUpperCase().trim();
            const email = student.email.trim();
            const fullName = student.full_name || '';
            const surname = student.surname || '';

            if (!email || !password) {
                results.push({ email, status: 'failed', reason: 'Missing email or surname' });
                continue;
            }

            // Add a small delay to avoid rate limiting (Supabase Auth can be sensitive to bursts)
            await new Promise(resolve => setTimeout(resolve, 500));

            // 2. Create Auth User
            let userId = null;
            let userErrorMsg = null;

            // Allow role override (for sub-admins), default to 'student'
            const role = student.role || 'student';

            const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName,
                    surname: surname,
                    role: role
                }
            })

            if (userError) {
                // Check if user already exists
                if (userError.message.includes("already registered") || userError.status === 422) {
                    // Fetch existing user to get ID
                    const { data: existingUser, error: fetchError } = await supabaseClient
                        .from('profiles')
                        .select('id')
                        .eq('email', email)
                        .single();

                    if (existingUser) {
                        userId = existingUser.id;
                        console.log(`User ${email} already exists (ID: ${userId}), linking to tutor.`);
                    } else {
                        userErrorMsg = "User exists in Auth but not in Profiles. Manual check required.";
                        console.error(userErrorMsg, fetchError);
                    }
                } else {
                    userErrorMsg = userError.message;
                    console.error(`Failed to create user ${email}:`, userError);
                }
            } else {
                userId = userData.user.id;
            }

            if (!userId) {
                results.push({ email, status: 'failed', reason: userErrorMsg || "Unknown error creating user" });
                continue;
            }

            // 3. Update/Create Profile
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .upsert({
                    id: userId,
                    email: email,
                    full_name: fullName,
                    surname: surname,
                    role: role,
                    is_tutor_registered: true,
                    tutor_id: tutorId
                })

            if (profileError) {
                console.error(`Failed to upsert profile for ${email}:`, profileError);
                results.push({ email, status: 'failed (profile)', reason: profileError.message });
            } else {
                results.push({ email, status: 'success', id: userId });
            }
        }

        return new Response(
            JSON.stringify(results),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
