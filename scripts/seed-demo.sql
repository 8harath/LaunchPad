-- LaunchPad demo seed for Supabase SQL Editor
-- Run this after scripts/init-db.sql
-- Login credentials created by this script:
--   Admin:    admin@carthik.tech / Admin@12345
--   Recruiter: recruiter.razorpay@carthik.tech / Recruiter@12345
--   Recruiter: recruiter.freshworks@carthik.tech / Recruiter@12345
--   Recruiter: recruiter.chargebee@carthik.tech / Recruiter@12345
--   Student:  ananya.krishnan@carthik.tech / Student@12345
--   Student:  pranav.iyer@carthik.tech / Student@12345
--   Student:  keerthana.nair@carthik.tech / Student@12345

CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

DO $$
DECLARE
  admin_id UUID := '11111111-1111-1111-1111-111111111111';
  recruiter_1_id UUID := '22222222-2222-2222-2222-222222222221';
  recruiter_2_id UUID := '22222222-2222-2222-2222-222222222222';
  recruiter_3_id UUID := '22222222-2222-2222-2222-222222222223';
  student_1_id UUID := '33333333-3333-3333-3333-333333333331';
  student_2_id UUID := '33333333-3333-3333-3333-333333333332';
  student_3_id UUID := '33333333-3333-3333-3333-333333333333';
  razorpay_company_id UUID := '44444444-4444-4444-4444-444444444441';
  freshworks_company_id UUID := '44444444-4444-4444-4444-444444444442';
  chargebee_company_id UUID := '44444444-4444-4444-4444-444444444443';
  job_1_id UUID := '55555555-5555-5555-5555-555555555551';
  job_2_id UUID := '55555555-5555-5555-5555-555555555552';
  job_3_id UUID := '55555555-5555-5555-5555-555555555553';
  job_4_id UUID := '55555555-5555-5555-5555-555555555554';
BEGIN
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES
    ('00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated', 'admin@carthik.tech', crypt('Admin@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sanjana Raman","role":"admin"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_1_id, 'authenticated', 'authenticated', 'recruiter.razorpay@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Karthik Narayanan","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_2_id, 'authenticated', 'authenticated', 'recruiter.freshworks@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Harini Subramanian","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_3_id, 'authenticated', 'authenticated', 'recruiter.chargebee@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vignesh Raghavan","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', student_1_id, 'authenticated', 'authenticated', 'ananya.krishnan@carthik.tech', crypt('Student@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ananya Krishnan","role":"student"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', student_2_id, 'authenticated', 'authenticated', 'pranav.iyer@carthik.tech', crypt('Student@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Pranav Iyer","role":"student"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', student_3_id, 'authenticated', 'authenticated', 'keerthana.nair@carthik.tech', crypt('Student@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Keerthana Nair","role":"student"}', now(), now(), '', '', '', '')
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    updated_at = now();

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', admin_id, '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@carthik.tech"}', 'email', 'admin@carthik.tech', now(), now(), now()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', recruiter_1_id, '{"sub":"22222222-2222-2222-2222-222222222221","email":"recruiter.razorpay@carthik.tech"}', 'email', 'recruiter.razorpay@carthik.tech', now(), now(), now()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', recruiter_2_id, '{"sub":"22222222-2222-2222-2222-222222222222","email":"recruiter.freshworks@carthik.tech"}', 'email', 'recruiter.freshworks@carthik.tech', now(), now(), now()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', recruiter_3_id, '{"sub":"22222222-2222-2222-2222-222222222223","email":"recruiter.chargebee@carthik.tech"}', 'email', 'recruiter.chargebee@carthik.tech', now(), now(), now()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', student_1_id, '{"sub":"33333333-3333-3333-3333-333333333331","email":"ananya.krishnan@carthik.tech"}', 'email', 'ananya.krishnan@carthik.tech', now(), now(), now()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', student_2_id, '{"sub":"33333333-3333-3333-3333-333333333332","email":"pranav.iyer@carthik.tech"}', 'email', 'pranav.iyer@carthik.tech', now(), now(), now()),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', student_3_id, '{"sub":"33333333-3333-3333-3333-333333333333","email":"keerthana.nair@carthik.tech"}', 'email', 'keerthana.nair@carthik.tech', now(), now(), now())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, email, full_name, role, bio)
  VALUES
    (admin_id, 'admin@carthik.tech', 'Sanjana Raman', 'admin', 'Platform administrator for LaunchPad.'),
    (recruiter_1_id, 'recruiter.razorpay@carthik.tech', 'Karthik Narayanan', 'company', 'Hiring for product engineering roles at Razorpay.'),
    (recruiter_2_id, 'recruiter.freshworks@carthik.tech', 'Harini Subramanian', 'company', 'Hiring early career engineers at Freshworks.'),
    (recruiter_3_id, 'recruiter.chargebee@carthik.tech', 'Vignesh Raghavan', 'company', 'Hiring SaaS engineers and interns at Chargebee.'),
    (student_1_id, 'ananya.krishnan@carthik.tech', 'Ananya Krishnan', 'student', 'Final-year CS student focused on frontend engineering.'),
    (student_2_id, 'pranav.iyer@carthik.tech', 'Pranav Iyer', 'student', 'Backend-focused engineering student interested in distributed systems.'),
    (student_3_id, 'keerthana.nair@carthik.tech', 'Keerthana Nair', 'student', 'Product-minded full-stack developer and hackathon finalist.')
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    updated_at = now();

  INSERT INTO public.student_profiles (
    id,
    university,
    major,
    graduation_year,
    skills,
    github_url,
    linkedin_url,
    portfolio_url
  )
  VALUES
    (student_1_id, 'College of Engineering, Guindy', 'Computer Science and Engineering', 2026, ARRAY['React', 'Next.js', 'TypeScript', 'Figma'], 'https://github.com/ananyakk', 'https://www.linkedin.com/in/ananyakk', 'https://ananyakk.dev'),
    (student_2_id, 'NIT Tiruchirappalli', 'Computer Science and Engineering', 2026, ARRAY['Node.js', 'PostgreSQL', 'Supabase', 'Docker'], 'https://github.com/pranaviyer', 'https://www.linkedin.com/in/pranaviyer', 'https://pranaviyer.dev'),
    (student_3_id, 'Amrita Vishwa Vidyapeetham', 'Information Technology', 2026, ARRAY['Python', 'React', 'Product Design', 'Firebase'], 'https://github.com/keerthananair', 'https://www.linkedin.com/in/keerthananair', 'https://keerthananair.dev')
  ON CONFLICT (id) DO UPDATE
  SET
    university = EXCLUDED.university,
    major = EXCLUDED.major,
    graduation_year = EXCLUDED.graduation_year,
    skills = EXCLUDED.skills,
    github_url = EXCLUDED.github_url,
    linkedin_url = EXCLUDED.linkedin_url,
    portfolio_url = EXCLUDED.portfolio_url,
    updated_at = now();

  INSERT INTO public.companies (
    id,
    name,
    description,
    website,
    location,
    industry,
    size,
    admin_id
  )
  VALUES
    (razorpay_company_id, 'Razorpay', 'Razorpay is hiring engineers to build reliable payments and banking products for Indian businesses.', 'https://razorpay.com', 'Bengaluru, India', 'Fintech', '1000+', recruiter_1_id),
    (freshworks_company_id, 'Freshworks', 'Freshworks is hiring full-stack and product engineers for customer engagement platforms.', 'https://www.freshworks.com', 'Chennai, India', 'SaaS', '5000+', recruiter_2_id),
    (chargebee_company_id, 'Chargebee', 'Chargebee is hiring backend and frontend engineers for subscription billing infrastructure.', 'https://www.chargebee.com', 'Chennai, India', 'SaaS', '1000+', recruiter_3_id)
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    website = EXCLUDED.website,
    location = EXCLUDED.location,
    industry = EXCLUDED.industry,
    size = EXCLUDED.size,
    admin_id = EXCLUDED.admin_id,
    updated_at = now();

  INSERT INTO public.jobs (
    id,
    company_id,
    title,
    description,
    requirements,
    salary_min,
    salary_max,
    job_type,
    location,
    status,
    deadline
  )
  VALUES
    (job_1_id, razorpay_company_id, 'Software Development Engineer I', 'Build internal and merchant-facing payment experiences with React, TypeScript, and scalable APIs.', ARRAY['Strong JavaScript or TypeScript fundamentals', 'Good understanding of APIs and SQL', 'Comfortable shipping production code'], 1200000, 1800000, 'Full-time', 'Bengaluru, India', 'open', now() + interval '30 days'),
    (job_2_id, freshworks_company_id, 'Frontend Engineering Intern', 'Work with product and design teams to build polished, accessible dashboard experiences.', ARRAY['React basics', 'CSS and responsive UI skills', 'Strong communication and ownership'], 300000, 450000, 'Internship', 'Chennai, India', 'open', now() + interval '45 days'),
    (job_3_id, chargebee_company_id, 'Backend Engineer', 'Build billing and subscription systems using PostgreSQL, Node.js, and cloud infrastructure.', ARRAY['Strong SQL skills', 'Experience with Node.js or similar backend stacks', 'Understanding of distributed systems basics'], 1400000, 2200000, 'Full-time', 'Remote', 'open', now() + interval '40 days'),
    (job_4_id, razorpay_company_id, 'Product Analyst Intern', 'Support product and growth teams with SQL analysis, dashboards, and experiment reporting.', ARRAY['SQL proficiency', 'Spreadsheet and dashboarding skills', 'Analytical thinking'], 250000, 400000, 'Internship', 'Bengaluru, India', 'open', now() + interval '35 days')
  ON CONFLICT (id) DO UPDATE
  SET
    company_id = EXCLUDED.company_id,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    requirements = EXCLUDED.requirements,
    salary_min = EXCLUDED.salary_min,
    salary_max = EXCLUDED.salary_max,
    job_type = EXCLUDED.job_type,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    deadline = EXCLUDED.deadline,
    updated_at = now();

  INSERT INTO public.applications (
    job_id,
    student_id,
    status,
    cover_letter,
    custom_response
  )
  VALUES
    (job_1_id, student_1_id, 'reviewing', 'I would love to contribute to merchant-facing UI systems and bring strong React and TypeScript skills to Razorpay.', 'Available to join after graduation in June 2026.'),
    (job_2_id, student_3_id, 'pending', 'Freshworks is exactly the kind of product-led company where I want to grow as a frontend engineer.', 'Happy to relocate to Chennai.'),
    (job_3_id, student_2_id, 'accepted', 'I enjoy backend systems work and have built PostgreSQL-backed services in hackathons and coursework.', 'Interested in backend platform engineering and reliability.'),
    (job_4_id, student_1_id, 'pending', 'I enjoy translating data into clear product decisions and would love to learn from Razorpay''s growth teams.', 'Can work full-time during the internship period.')
  ON CONFLICT (job_id, student_id) DO UPDATE
  SET
    status = EXCLUDED.status,
    cover_letter = EXCLUDED.cover_letter,
    custom_response = EXCLUDED.custom_response,
    updated_at = now();

  INSERT INTO public.notifications (user_id, title, message, type, read)
  VALUES
    (recruiter_1_id, 'New application received', 'Ananya Krishnan applied to Software Development Engineer I.', 'new_application', false),
    (recruiter_2_id, 'New application received', 'Keerthana Nair applied to Frontend Engineering Intern.', 'new_application', false),
    (student_2_id, 'Application accepted', 'Chargebee accepted your Backend Engineer application.', 'application_update', false)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.admin_settings (key, value)
  VALUES
    ('platform_name', '"LaunchPad"'::jsonb),
    ('support_email', '"support@carthik.tech"'::jsonb),
    ('default_job_visibility', '{"status":"open"}'::jsonb)
  ON CONFLICT (key) DO UPDATE
  SET
    value = EXCLUDED.value,
    updated_at = now();
END $$;
