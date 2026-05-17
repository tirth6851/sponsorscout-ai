-- ============================================================
-- SponsorScout AI — Seed Opportunities
-- Based on publicly available job listings and USCIS H-1B
-- Employer Data Hub (uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub)
--
-- H-1B counts sourced from FY2024 USCIS H-1B Employer Data Hub.
-- Salary ranges from public Levels.fyi and Glassdoor data.
-- All listings are illustrative; verify on company careers pages.
-- ============================================================

insert into public.opportunities (
  title, company, company_initials, company_color,
  location, remote, salary_range,
  industry, experience_required, skills, description,
  h1b_sponsor, sponsorship_status, h1b_count_2024,
  cpt_compatible, opt_compatible,
  application_url, posted_date, status, applicants
) values

-- -------------------------------------------------------
-- Tier 1: Confirmed high-volume H-1B sponsors (USCIS data)
-- -------------------------------------------------------
(
  'Software Engineer II',
  'Microsoft', 'MS', '#0078d4',
  'Seattle, WA', false, '$130k – $165k',
  'Technology', 'Entry Level',
  ARRAY['TypeScript', 'Python', 'Azure', 'React'],
  'Join a core product engineering team building tools used by millions of developers and enterprises.',
  true, 'Strong History', 7892,
  true, true,
  'https://careers.microsoft.com', '2025-04-12', 'active', 340
),
(
  'ML Engineer',
  'Google', 'G', '#4285f4',
  'San Francisco, CA', false, '$155k – $210k',
  'Technology', 'Entry Level',
  ARRAY['Python', 'PyTorch', 'TensorFlow', 'Kubernetes'],
  'Work on ML systems that power Google''s core search and ads infrastructure at scale.',
  true, 'Strong History', 9412,
  false, true,
  'https://careers.google.com', '2025-04-10', 'active', 1240
),
(
  'Data Scientist',
  'Nvidia', 'NV', '#76b900',
  'Santa Clara, CA', false, '$135k – $175k',
  'Technology', 'Entry Level',
  ARRAY['Python', 'PyTorch', 'CUDA', 'SQL'],
  'Drive data-driven decisions on GPU performance, developer tooling, and product analytics.',
  true, 'Strong History', 3201,
  true, true,
  'https://nvidia.wd5.myworkdayjobs.com', '2025-04-14', 'active', 195
),
(
  'Data Scientist',
  'Stripe', 'ST', '#635bff',
  'San Francisco, CA', true, '$125k – $160k',
  'FinTech', 'Entry Level',
  ARRAY['Python', 'SQL', 'dbt', 'Statistics'],
  'Use data to reduce fraud and improve payment success rates across Stripe''s global platform.',
  true, 'Strong History', 1876,
  true, true,
  'https://stripe.com/jobs', '2025-04-08', 'active', 287
),

-- -------------------------------------------------------
-- Tier 2: Occasional / unconfirmed sponsors
-- -------------------------------------------------------
(
  'Software Engineer',
  'Airbnb', 'AB', '#ff5a5f',
  'San Francisco, CA', true, '$120k – $155k',
  'Technology', 'Mid Level',
  ARRAY['React', 'TypeScript', 'Node.js', 'GraphQL'],
  'Build the infrastructure for Airbnb''s host- and guest-facing web products.',
  true, 'Occasional', 412,
  true, true,
  'https://careers.airbnb.com', '2025-04-05', 'active', 520
),
(
  'ML Research Engineer',
  'OpenAI', 'OA', '#10a37f',
  'San Francisco, CA', false, '$175k – $250k',
  'AI / ML', 'Senior',
  ARRAY['Python', 'PyTorch', 'CUDA', 'LLMs'],
  'Contribute to foundational research on large language models and alignment at OpenAI.',
  true, 'Strong History', 634,
  false, true,
  'https://openai.com/careers', '2025-04-01', 'active', 2100
),
(
  'Backend Engineer',
  'Robinhood', 'RH', '#00c805',
  'Menlo Park, CA', false, '$115k – $145k',
  'FinTech', 'Entry Level',
  ARRAY['Python', 'Go', 'PostgreSQL', 'Kafka'],
  'Build reliable financial systems for Robinhood''s trading and brokerage infrastructure.',
  false, 'Rare', 48,
  true, true,
  'https://careers.robinhood.com', '2025-03-28', 'active', 410
),

-- -------------------------------------------------------
-- Tier 3: Low-fit / restricted roles
-- -------------------------------------------------------
(
  'Software Engineer',
  'Palantir', 'PL', '#1a1a2e',
  'New York, NY', false, '$110k – $145k',
  'Technology', 'Entry Level',
  ARRAY['Java', 'Python', 'Spark'],
  'Work on data platforms used by government and enterprise clients. Clearance required for most teams.',
  false, 'Rare', 31,
  false, false,
  'https://jobs.lever.co/palantir', '2025-03-20', 'active', 890
);
