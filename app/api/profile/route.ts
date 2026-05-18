import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured', demo: true }, { status: 503 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data ?? null });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ profile: null, demo: true }, { status: 200 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const row = {
    user_id: user.id,
    full_name: body.name ?? '',
    current_location: body.currentLocation ?? null,
    preferred_locations: body.locations
      ? body.locations.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    remote_preference: body.remote ?? 'Any',
    school: body.school ?? null,
    degree_level: body.degree ?? null,
    major: body.major ?? null,
    graduation_date: body.graduation ? `${body.graduation}-01` : null,
    gpa: body.gpa ? parseFloat(body.gpa) : null,
    stem_eligible: body.stem === 'Yes — STEM eligible',
    // Engineering-specific
    engineering_discipline: body.engineeringDiscipline ?? null,
    role_family_preferences: body.roleFamilyPreferences
      ? body.roleFamilyPreferences.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    tools: body.tools
      ? body.tools.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    project_experience: body.projectExperience ?? null,
    lab_research_experience: body.labResearchExperience ?? null,
    // Career goals
    target_roles: body.roles
      ? body.roles.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    target_industries: body.industries
      ? body.industries.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    experience_level: body.experience ?? null,
    years_of_experience: body.years ? parseInt(body.years, 10) : 0,
    skills: body.skills
      ? body.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    // Visa
    current_visa: body.visa ?? null,
    auth_start_date: body.authStart ?? null,
    auth_end_date: body.authEnd ?? null,
    needs_sponsorship: body.needsSponsorship ?? 'yes',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('student_profiles')
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data }, { status: 201 });
}
