'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  GraduationCap,
  Cpu,
  Target,
  Shield,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Personal', icon: User, description: 'Basic info & preferences' },
  { id: 2, label: 'Academic', icon: GraduationCap, description: 'Degree & graduation' },
  { id: 3, label: 'Engineering', icon: Cpu, description: 'Discipline & role type' },
  { id: 4, label: 'Career Goals', icon: Target, description: 'Skills & industries' },
  { id: 5, label: 'Visa Status', icon: Shield, description: 'Work authorization' },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300',
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-glow-sm'
                    : 'glass border border-white/[0.08] text-slate-600',
                )}
              >
                {done ? <CheckCircle2 size={16} /> : <Icon size={15} />}
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium hidden sm:block',
                  active ? 'text-white' : done ? 'text-emerald-400' : 'text-slate-600',
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px mx-2 transition-all duration-500',
                  done ? 'bg-emerald-500/40' : 'bg-white/[0.06]',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Tell us about yourself</h2>
        <p className="text-sm text-slate-500">This helps us personalize your engineering match experience.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Full Name</label>
          <input
            className="input-field"
            placeholder="Priya Sharma"
            value={data.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Email</label>
          <input
            className="input-field"
            type="email"
            placeholder="priya@university.edu"
            value={data.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label-field">Current Location</label>
        <input
          className="input-field"
          placeholder="Champaign, IL"
          value={data.currentLocation || ''}
          onChange={(e) => onChange('currentLocation', e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">Preferred Work Locations</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {[
            'San Francisco, CA',
            'Seattle, WA',
            'New York, NY',
            'Austin, TX',
            'Boston, MA',
            'Chicago, IL',
            'Remote',
          ].map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                const current = data.locations ? data.locations.split(',') : [];
                const idx = current.indexOf(loc);
                if (idx === -1) current.push(loc);
                else current.splice(idx, 1);
                onChange('locations', current.filter(Boolean).join(','));
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-200 border',
                data.locations?.split(',').includes(loc)
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15]',
              )}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-field">Remote Preference</label>
        <select
          className="select-field"
          value={data.remote || ''}
          onChange={(e) => onChange('remote', e.target.value)}
        >
          <option value="">Select preference</option>
          <option value="Remote">Remote only</option>
          <option value="Hybrid">Hybrid preferred</option>
          <option value="On-site">On-site preferred</option>
          <option value="Any">No preference</option>
        </select>
      </div>
    </div>
  );
}

function Step2({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Academic background</h2>
        <p className="text-sm text-slate-500">
          Your degree timeline directly impacts your visa windows.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">University / School</label>
          <input
            className="input-field"
            placeholder="University of Illinois Urbana-Champaign"
            value={data.school || ''}
            onChange={(e) => onChange('school', e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">Degree Level</label>
          <select
            className="select-field"
            value={data.degree || ''}
            onChange={(e) => onChange('degree', e.target.value)}
          >
            <option value="">Select level</option>
            <option value="Bachelor">Bachelor&apos;s</option>
            <option value="Master">Master&apos;s</option>
            <option value="PhD">PhD</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label-field">Major / Field of Study</label>
        <input
          className="input-field"
          placeholder="Computer Science"
          value={data.major || ''}
          onChange={(e) => onChange('major', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Expected Graduation Date</label>
          <input
            className="input-field"
            type="month"
            value={data.graduation || ''}
            onChange={(e) => onChange('graduation', e.target.value)}
          />
        </div>
        <div>
          <label className="label-field">GPA (optional)</label>
          <input
            className="input-field"
            type="number"
            step="0.1"
            min="0"
            max="4.0"
            placeholder="3.8"
            value={data.gpa || ''}
            onChange={(e) => onChange('gpa', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label-field">Is your degree in a STEM field?</label>
        <div className="flex gap-3 mt-2">
          {['Yes — STEM eligible', 'No'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange('stem', opt)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border',
                data.stem === opt
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const disciplines = [
    { value: 'Software/CS', label: 'Software / Computer Engineering' },
    { value: 'Data/AI/ML', label: 'Data / AI / ML' },
    { value: 'Electrical/Hardware', label: 'Electrical / Computer Hardware' },
    { value: 'Mechanical/Manufacturing', label: 'Mechanical / Manufacturing' },
    { value: 'Civil/Environmental', label: 'Civil / Environmental' },
    { value: 'Industrial/Systems', label: 'Industrial / Systems' },
    { value: 'Research/Lab', label: 'Research / Lab Roles' },
    { value: 'Other', label: 'Other / Interdisciplinary' },
  ];

  const roleFamilies = [
    { value: 'internship', label: 'Internship' },
    { value: 'co-op', label: 'Co-op' },
    { value: 'research', label: 'Research Role' },
    { value: 'campus job', label: 'Campus / Part-time Job' },
    { value: 'entry-level', label: 'Entry-Level (New Grad)' },
    { value: 'full-time', label: 'Full-Time (Experienced)' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Engineering profile</h2>
        <p className="text-sm text-slate-500">
          Helps us match you to discipline-specific opportunities and role types.
        </p>
      </div>
      <div>
        <label className="label-field">Engineering Discipline</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {disciplines.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onChange('engineeringDiscipline', d.value)}
              className={cn(
                'px-3 py-2.5 rounded-lg text-xs font-medium text-left transition-all duration-200 border',
                data.engineeringDiscipline === d.value
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15]',
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-field">Role Type Preferences (select all that apply)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {roleFamilies.map((rf) => (
            <button
              key={rf.value}
              type="button"
              onClick={() => {
                const current = data.roleFamilyPreferences
                  ? data.roleFamilyPreferences.split(',')
                  : [];
                const idx = current.indexOf(rf.value);
                if (idx === -1) current.push(rf.value);
                else current.splice(idx, 1);
                onChange('roleFamilyPreferences', current.filter(Boolean).join(','));
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-200 border',
                data.roleFamilyPreferences?.split(',').includes(rf.value)
                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15]',
              )}
            >
              {rf.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-field">Tools / Software (comma-separated)</label>
        <input
          className="input-field"
          placeholder="GitHub, Jira, Figma, MATLAB, SolidWorks..."
          value={data.tools || ''}
          onChange={(e) => onChange('tools', e.target.value)}
        />
      </div>
      <div>
        <label className="label-field">Notable Project Experience (optional)</label>
        <input
          className="input-field"
          placeholder="e.g., Built an ML model for medical imaging; Led a robotics capstone..."
          value={data.projectExperience || ''}
          onChange={(e) => onChange('projectExperience', e.target.value)}
        />
      </div>
    </div>
  );
}

function Step4({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  const roleOptions = [
    'Software Engineer',
    'ML Engineer',
    'Data Scientist',
    'Data Engineer',
    'Research Engineer',
    'Electrical Engineer',
    'Mechanical Engineer',
    'DevOps / SRE',
    'Systems Engineer',
    'Product Engineer',
  ];
  const industryOptions = [
    'Technology',
    'FinTech',
    'AI / ML',
    'Aerospace / Defense',
    'Healthcare Tech',
    'Semiconductor',
    'Automotive / Robotics',
    'Energy / Clean Tech',
    'Government / National Labs',
    'EdTech',
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Career goals</h2>
        <p className="text-sm text-slate-500">
          Help us understand what roles and sectors you are targeting.
        </p>
      </div>
      <div>
        <label className="label-field">Target Roles (select all that apply)</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {roleOptions.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                const current = data.roles ? data.roles.split(',') : [];
                const idx = current.indexOf(role);
                if (idx === -1) current.push(role);
                else current.splice(idx, 1);
                onChange('roles', current.filter(Boolean).join(','));
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-200 border',
                data.roles?.split(',').includes(role)
                  ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15]',
              )}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label-field">Target Industries</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {industryOptions.map((ind) => (
            <button
              key={ind}
              type="button"
              onClick={() => {
                const current = data.industries ? data.industries.split(',') : [];
                const idx = current.indexOf(ind);
                if (idx === -1) current.push(ind);
                else current.splice(idx, 1);
                onChange('industries', current.filter(Boolean).join(','));
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium text-left transition-all duration-200 border',
                data.industries?.split(',').includes(ind)
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white',
              )}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Experience Level</label>
          <select
            className="select-field"
            value={data.experience || ''}
            onChange={(e) => onChange('experience', e.target.value)}
          >
            <option value="">Select level</option>
            <option value="Internship">Internship / Co-op</option>
            <option value="Entry Level">Entry Level (0-2 yrs)</option>
            <option value="Mid Level">Mid Level (2-5 yrs)</option>
            <option value="Senior">Senior (5+ yrs)</option>
          </select>
        </div>
        <div>
          <label className="label-field">Years of Professional Experience</label>
          <input
            className="input-field"
            type="number"
            min="0"
            max="20"
            placeholder="1"
            value={data.years || ''}
            onChange={(e) => onChange('years', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label-field">Technical Skills (comma-separated)</label>
        <input
          className="input-field"
          placeholder="Python, TypeScript, React, PyTorch, AWS, MATLAB..."
          value={data.skills || ''}
          onChange={(e) => onChange('skills', e.target.value)}
        />
      </div>
    </div>
  );
}

function Step5({
  data,
  onChange,
}: {
  data: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Work authorization</h2>
        <p className="text-sm text-slate-500">
          This is the most critical input for accurate visa-aware matching.
        </p>
      </div>
      <div>
        <label className="label-field">Current Visa / Work Authorization Status</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {[
            { value: 'F-1 (CPT)', desc: 'Curricular Practical Training' },
            { value: 'F-1 (OPT)', desc: 'Optional Practical Training' },
            { value: 'F-1 (STEM OPT)', desc: 'STEM OPT Extension' },
            { value: 'J-1', desc: 'Exchange Visitor' },
            { value: 'H-1B', desc: 'Specialty Occupation' },
            { value: 'Green Card', desc: 'Permanent Resident' },
            { value: 'US Citizen', desc: 'No sponsorship needed' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('visa', opt.value)}
              className={cn(
                'flex flex-col items-start px-4 py-3 rounded-xl text-left transition-all duration-200 border',
                data.visa === opt.value
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white hover:border-white/[0.15]',
              )}
            >
              <span className="text-sm font-semibold">{opt.value}</span>
              <span className="text-xs opacity-70 mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
      {(data.visa === 'F-1 (OPT)' ||
        data.visa === 'F-1 (STEM OPT)' ||
        data.visa === 'F-1 (CPT)') && (
        <div>
          <label className="label-field">Authorization Start / End Dates</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Start Date</label>
              <input
                className="input-field"
                type="date"
                value={data.authStart || ''}
                onChange={(e) => onChange('authStart', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">End Date</label>
              <input
                className="input-field"
                type="date"
                value={data.authEnd || ''}
                onChange={(e) => onChange('authEnd', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      <div>
        <label className="label-field">
          Do you need H-1B sponsorship to work long-term in the US?
        </label>
        <div className="flex gap-3 mt-2">
          {[
            { value: 'yes', label: 'Yes — I need sponsorship' },
            { value: 'maybe', label: 'Uncertain' },
            { value: 'no', label: "No — I don't need it" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange('needsSponsorship', opt.value)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 border',
                data.needsSponsorship === opt.value
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'glass border-white/[0.08] text-slate-400 hover:text-white',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl bg-amber-500/[0.07] border border-amber-500/[0.15]">
        <p className="text-xs text-amber-400 leading-relaxed">
          <strong>Note:</strong> Your visa data is used solely to improve match accuracy and
          strategic recommendations. Always consult a licensed immigration attorney for legal
          advice on your work authorization.
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = async () => {
    if (step < STEPS.length) {
      setStep((s) => s + 1);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (!res.ok && !json.demo) {
        throw new Error(json.error ?? 'Failed to save profile');
      }
      router.push('/dashboard');
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1 data={formData} onChange={handleChange} />,
    2: <Step2 data={formData} onChange={handleChange} />,
    3: <Step3 data={formData} onChange={handleChange} />,
    4: <Step4 data={formData} onChange={handleChange} />,
    5: <Step5 data={formData} onChange={handleChange} />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-900">
      <Navbar />

      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] glow-orb-purple opacity-10 pointer-events-none" />

      <main className="flex-1 flex items-center justify-center py-28 px-4 relative z-10">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Compass size={15} className="text-white" />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white">Build Your Engineering Profile</h1>
            <p className="text-sm text-slate-500 mt-1">
              Step {step} of {STEPS.length} — {STEPS[step - 1].description}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-7">
            <StepIndicator current={step} />

            <div className="animate-fade-in">{stepComponents[step]}</div>

            {saveError && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15]">
                <span className="text-xs text-red-400">{saveError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/[0.06]">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  disabled={saving}
                  className="btn-ghost flex items-center gap-2 px-5 py-2.5 disabled:opacity-50"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={saving}
                className="btn-primary flex-1 justify-center py-3 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving…' : step === STEPS.length ? 'Get My Matches' : 'Continue'}
                {!saving && <ArrowRight size={15} />}
              </button>
            </div>
          </div>

          <p className="text-center mt-4 text-xs text-slate-600">
            Want to explore first?{' '}
            <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 transition-colors">
              View demo dashboard →
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
