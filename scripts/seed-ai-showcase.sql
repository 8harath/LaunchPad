-- LaunchPad AI showcase seed for Supabase SQL Editor
-- Run this after:
--   1. scripts/init-db.sql
--   2. scripts/seed-demo.sql
--
-- This script adds:
--   - 10 additional recruiter accounts
--   - 10 AI companies
--   - 40 jobs total
--     10 Full-time
--     10 Internship
--     10 Part-time
--     10 Contract
--
-- Recruiter password for all accounts:
--   Recruiter@12345

CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

DO $$
DECLARE
  recruiter_openai_id UUID := '77777777-7777-7777-7777-777777777771';
  recruiter_anthropic_id UUID := '77777777-7777-7777-7777-777777777772';
  recruiter_cohere_id UUID := '77777777-7777-7777-7777-777777777773';
  recruiter_mistral_id UUID := '77777777-7777-7777-7777-777777777774';
  recruiter_hf_id UUID := '77777777-7777-7777-7777-777777777775';
  recruiter_perplexity_id UUID := '77777777-7777-7777-7777-777777777776';
  recruiter_runway_id UUID := '77777777-7777-7777-7777-777777777777';
  recruiter_scale_id UUID := '77777777-7777-7777-7777-777777777778';
  recruiter_stability_id UUID := '77777777-7777-7777-7777-777777777779';
  recruiter_elevenlabs_id UUID := '77777777-7777-7777-7777-77777777777a';

  openai_company_id UUID := '88888888-8888-8888-8888-888888888881';
  anthropic_company_id UUID := '88888888-8888-8888-8888-888888888882';
  cohere_company_id UUID := '88888888-8888-8888-8888-888888888883';
  mistral_company_id UUID := '88888888-8888-8888-8888-888888888884';
  hf_company_id UUID := '88888888-8888-8888-8888-888888888885';
  perplexity_company_id UUID := '88888888-8888-8888-8888-888888888886';
  runway_company_id UUID := '88888888-8888-8888-8888-888888888887';
  scale_company_id UUID := '88888888-8888-8888-8888-888888888888';
  stability_company_id UUID := '88888888-8888-8888-8888-888888888889';
  elevenlabs_company_id UUID := '88888888-8888-8888-8888-88888888888a';
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
    ('00000000-0000-0000-0000-000000000000', recruiter_openai_id, 'authenticated', 'authenticated', 'recruiter.openai@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aishwarya Narasimhan","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_anthropic_id, 'authenticated', 'authenticated', 'recruiter.anthropic@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Raghavendra Iyer","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_cohere_id, 'authenticated', 'authenticated', 'recruiter.cohere@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Divya Krishnamurthy","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_mistral_id, 'authenticated', 'authenticated', 'recruiter.mistral@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Naveen Subramaniam","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_hf_id, 'authenticated', 'authenticated', 'recruiter.huggingface@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Keerthivasan Raman","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_perplexity_id, 'authenticated', 'authenticated', 'recruiter.perplexity@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Harshita Venkatesh","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_runway_id, 'authenticated', 'authenticated', 'recruiter.runway@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sriram Balachandran","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_scale_id, 'authenticated', 'authenticated', 'recruiter.scaleai@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Madhumitha Rajan","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_stability_id, 'authenticated', 'authenticated', 'recruiter.stability@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Arjun Narayanan","role":"company"}', now(), now(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', recruiter_elevenlabs_id, 'authenticated', 'authenticated', 'recruiter.elevenlabs@carthik.tech', crypt('Recruiter@12345', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sanjana Vaidyanathan","role":"company"}', now(), now(), '', '', '', '')
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
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', recruiter_openai_id, '{"sub":"77777777-7777-7777-7777-777777777771","email":"recruiter.openai@carthik.tech"}', 'email', 'recruiter.openai@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', recruiter_anthropic_id, '{"sub":"77777777-7777-7777-7777-777777777772","email":"recruiter.anthropic@carthik.tech"}', 'email', 'recruiter.anthropic@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', recruiter_cohere_id, '{"sub":"77777777-7777-7777-7777-777777777773","email":"recruiter.cohere@carthik.tech"}', 'email', 'recruiter.cohere@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', recruiter_mistral_id, '{"sub":"77777777-7777-7777-7777-777777777774","email":"recruiter.mistral@carthik.tech"}', 'email', 'recruiter.mistral@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', recruiter_hf_id, '{"sub":"77777777-7777-7777-7777-777777777775","email":"recruiter.huggingface@carthik.tech"}', 'email', 'recruiter.huggingface@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6', recruiter_perplexity_id, '{"sub":"77777777-7777-7777-7777-777777777776","email":"recruiter.perplexity@carthik.tech"}', 'email', 'recruiter.perplexity@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7', recruiter_runway_id, '{"sub":"77777777-7777-7777-7777-777777777777","email":"recruiter.runway@carthik.tech"}', 'email', 'recruiter.runway@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8', recruiter_scale_id, '{"sub":"77777777-7777-7777-7777-777777777778","email":"recruiter.scaleai@carthik.tech"}', 'email', 'recruiter.scaleai@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb9', recruiter_stability_id, '{"sub":"77777777-7777-7777-7777-777777777779","email":"recruiter.stability@carthik.tech"}', 'email', 'recruiter.stability@carthik.tech', now(), now(), now()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba', recruiter_elevenlabs_id, '{"sub":"77777777-7777-7777-7777-77777777777a","email":"recruiter.elevenlabs@carthik.tech"}', 'email', 'recruiter.elevenlabs@carthik.tech', now(), now(), now())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, email, full_name, role, bio)
  VALUES
    (recruiter_openai_id, 'recruiter.openai@carthik.tech', 'Aishwarya Narasimhan', 'company', 'Hiring applied AI, research platform, and ecosystem talent for OpenAI.'),
    (recruiter_anthropic_id, 'recruiter.anthropic@carthik.tech', 'Raghavendra Iyer', 'company', 'Hiring safety-focused engineers and research talent for Anthropic.'),
    (recruiter_cohere_id, 'recruiter.cohere@carthik.tech', 'Divya Krishnamurthy', 'company', 'Hiring enterprise AI engineers and platform builders for Cohere.'),
    (recruiter_mistral_id, 'recruiter.mistral@carthik.tech', 'Naveen Subramaniam', 'company', 'Hiring inference, platform, and open-model ecosystem talent for Mistral AI.'),
    (recruiter_hf_id, 'recruiter.huggingface@carthik.tech', 'Keerthivasan Raman', 'company', 'Hiring open-source ML platform contributors and developer experience talent for Hugging Face.'),
    (recruiter_perplexity_id, 'recruiter.perplexity@carthik.tech', 'Harshita Venkatesh', 'company', 'Hiring search, research workflow, and answer engine builders for Perplexity.'),
    (recruiter_runway_id, 'recruiter.runway@carthik.tech', 'Sriram Balachandran', 'company', 'Hiring video AI, creator tooling, and creative workflow engineers for Runway.'),
    (recruiter_scale_id, 'recruiter.scaleai@carthik.tech', 'Madhumitha Rajan', 'company', 'Hiring data platform, evaluations, and AI operations talent for Scale AI.'),
    (recruiter_stability_id, 'recruiter.stability@carthik.tech', 'Arjun Narayanan', 'company', 'Hiring multimodal creative AI engineers and platform specialists for Stability AI.'),
    (recruiter_elevenlabs_id, 'recruiter.elevenlabs@carthik.tech', 'Sanjana Vaidyanathan', 'company', 'Hiring voice AI, conversational systems, and product engineering talent for ElevenLabs.')
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
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
    (openai_company_id, 'OpenAI', 'OpenAI is hiring across research, product, infrastructure, and developer ecosystem roles for frontier AI systems.', 'https://openai.com', 'San Francisco, USA', 'AI Research and Deployment', 'Global', recruiter_openai_id),
    (anthropic_company_id, 'Anthropic', 'Anthropic is hiring safety-minded researchers, engineers, and operators building reliable AI systems.', 'https://www.anthropic.com', 'San Francisco, USA', 'AI Safety and Research', 'Global', recruiter_anthropic_id),
    (cohere_company_id, 'Cohere', 'Cohere is hiring enterprise AI engineers and applied teams building practical AI systems for businesses.', 'https://cohere.com', 'Toronto, Canada', 'Enterprise AI', 'Growth-stage', recruiter_cohere_id),
    (mistral_company_id, 'Mistral AI', 'Mistral AI is hiring platform, inference, and product engineers building open and enterprise AI systems.', 'https://mistral.ai', 'Paris, France', 'Frontier AI', 'Growth-stage', recruiter_mistral_id),
    (hf_company_id, 'Hugging Face', 'Hugging Face is hiring open-source ML platform and developer ecosystem talent.', 'https://huggingface.co', 'New York, USA', 'Open-source AI Platform', 'Global', recruiter_hf_id),
    (perplexity_company_id, 'Perplexity', 'Perplexity is hiring teams building answer engines, enterprise research workflows, and AI search products.', 'https://www.perplexity.ai', 'San Francisco, USA', 'AI Search', 'Growth-stage', recruiter_perplexity_id),
    (runway_company_id, 'Runway', 'Runway is hiring engineers and creatives building video generation and world model tools.', 'https://runwayml.com', 'New York, USA', 'Creative AI', 'Growth-stage', recruiter_runway_id),
    (scale_company_id, 'Scale AI', 'Scale AI is hiring across data infrastructure, evaluations, AI operations, and enterprise AI deployment.', 'https://scale.com', 'San Francisco, USA', 'AI Data and Infrastructure', 'Scale-up', recruiter_scale_id),
    (stability_company_id, 'Stability AI', 'Stability AI is hiring multimodal creative AI teams spanning image, video, audio, and deployment systems.', 'https://stability.ai', 'London, UK', 'Generative Media AI', 'Global', recruiter_stability_id),
    (elevenlabs_company_id, 'ElevenLabs', 'ElevenLabs is hiring voice AI, audio platform, and conversational product teams.', 'https://elevenlabs.io', 'London, UK', 'Voice AI', 'Growth-stage', recruiter_elevenlabs_id)
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
    ('99999999-9999-9999-9999-999999999901', openai_company_id, 'Applied AI Engineer', 'Build production AI experiences, evaluation pipelines, and developer-facing tooling for advanced model deployments.', ARRAY['Strong Python or TypeScript skills', 'Experience building AI-backed products', 'Comfortable with APIs, experimentation, and debugging'], 1800000, 2800000, 'Full-time', 'San Francisco, USA', 'open', now() + interval '45 days'),
    ('99999999-9999-9999-9999-999999999902', openai_company_id, 'Applied Research Intern', 'Support prototyping, evaluations, and product experiments across practical AI workflows.', ARRAY['Strong CS fundamentals', 'Experience with Python notebooks or ML tooling', 'Clear written communication'], 350000, 550000, 'Internship', 'San Francisco, USA', 'open', now() + interval '35 days'),
    ('99999999-9999-9999-9999-999999999903', openai_company_id, 'Developer Education Associate', 'Create concise technical examples, community content, and onboarding material for developers using AI APIs.', ARRAY['Strong writing skills', 'Hands-on coding experience', 'Able to work independently in flexible hours'], 500000, 800000, 'Part-time', 'Remote', 'open', now() + interval '50 days'),
    ('99999999-9999-9999-9999-999999999904', openai_company_id, 'AI Evaluation Consultant', 'Design short-term evaluation frameworks and prompt-quality reviews for model-driven product launches.', ARRAY['Experience with QA or evaluation design', 'Good analytical judgment', 'Comfortable with contract-based delivery'], 900000, 1500000, 'Contract', 'Remote', 'open', now() + interval '40 days'),
    ('99999999-9999-9999-9999-999999999905', anthropic_company_id, 'Model Behavior Engineer', 'Build tooling and product systems that improve reliability, steerability, and quality of AI assistants.', ARRAY['Strong backend or ML systems experience', 'Comfortable with experimentation', 'Interest in AI safety and evaluation'], 1900000, 3000000, 'Full-time', 'San Francisco, USA', 'open', now() + interval '44 days'),
    ('99999999-9999-9999-9999-999999999906', anthropic_company_id, 'Safety Research Intern', 'Assist with evaluations, data analysis, and internal tools that support safer AI behavior.', ARRAY['Strong analytical reasoning', 'Python proficiency', 'Interest in responsible AI'], 360000, 540000, 'Internship', 'San Francisco, USA', 'open', now() + interval '30 days'),
    ('99999999-9999-9999-9999-999999999907', anthropic_company_id, 'Policy Research Assistant', 'Support part-time policy, documentation, and competitive research on AI safety and deployment topics.', ARRAY['Strong research writing', 'Comfortable with synthesizing technical material', 'Able to work part-time consistently'], 450000, 700000, 'Part-time', 'Remote', 'open', now() + interval '48 days'),
    ('99999999-9999-9999-9999-999999999908', anthropic_company_id, 'Evaluation Systems Consultant', 'Audit model evaluation workflows and recommend operational improvements for internal review pipelines.', ARRAY['Experience with evaluation or testing systems', 'Strong documentation habits', 'Able to deliver on milestones'], 1000000, 1600000, 'Contract', 'Remote', 'open', now() + interval '41 days'),
    ('99999999-9999-9999-9999-999999999909', cohere_company_id, 'Enterprise Solutions Engineer', 'Build production-grade AI integrations for enterprise customers using retrieval, search, and workflow automation.', ARRAY['Strong APIs and cloud fundamentals', 'Customer-facing engineering comfort', 'Good SQL or data skills'], 1700000, 2600000, 'Full-time', 'Toronto, Canada', 'open', now() + interval '46 days'),
    ('99999999-9999-9999-9999-999999999910', cohere_company_id, 'NLP Engineering Intern', 'Support enterprise AI experiments, benchmark model behavior, and help build internal demos.', ARRAY['Interest in NLP products', 'Python and Git basics', 'Ability to learn quickly'], 320000, 500000, 'Internship', 'Toronto, Canada', 'open', now() + interval '32 days'),
    ('99999999-9999-9999-9999-999999999911', cohere_company_id, 'Developer Relations Coordinator', 'Help maintain sample apps, event content, and part-time community support for technical users.', ARRAY['Good technical communication', 'Frontend or demo app experience', 'Reliable part-time availability'], 480000, 760000, 'Part-time', 'Remote', 'open', now() + interval '47 days'),
    ('99999999-9999-9999-9999-999999999912', cohere_company_id, 'Retrieval Quality Consultant', 'Review enterprise search results, test relevance quality, and help tune demo workflows for customer pilots.', ARRAY['Understanding of search relevance', 'Attention to detail', 'Experience documenting findings'], 850000, 1450000, 'Contract', 'Remote', 'open', now() + interval '38 days'),
    ('99999999-9999-9999-9999-999999999913', mistral_company_id, 'Inference Platform Engineer', 'Optimize inference systems, deployment reliability, and enterprise-ready serving workflows for AI products.', ARRAY['Strong systems engineering skills', 'Experience with distributed services', 'Comfortable with performance tuning'], 1800000, 2900000, 'Full-time', 'Paris, France', 'open', now() + interval '45 days'),
    ('99999999-9999-9999-9999-999999999914', mistral_company_id, 'AI Infrastructure Intern', 'Work with platform teams on dashboards, tooling, and lightweight infrastructure automation for model operations.', ARRAY['Solid CS fundamentals', 'Comfortable with scripting', 'Interest in cloud or infra tooling'], 330000, 520000, 'Internship', 'Paris, France', 'open', now() + interval '34 days'),
    ('99999999-9999-9999-9999-999999999915', mistral_company_id, 'Technical Content Editor', 'Create part-time documentation, tutorials, and release-note style content for AI platform users.', ARRAY['Excellent technical writing', 'Can understand API docs and code snippets', 'Available part-time'], 460000, 720000, 'Part-time', 'Remote', 'open', now() + interval '49 days'),
    ('99999999-9999-9999-9999-999999999916', mistral_company_id, 'Open Model Enablement Consultant', 'Support migration guides, customer solution notes, and short-term technical rollout plans.', ARRAY['Enterprise documentation experience', 'Comfort with model deployment concepts', 'Strong stakeholder communication'], 900000, 1500000, 'Contract', 'Remote', 'open', now() + interval '39 days'),
    ('99999999-9999-9999-9999-999999999917', hf_company_id, 'ML Platform Engineer', 'Build open-source friendly tooling and platform workflows that help teams ship models and demos faster.', ARRAY['Experience with developer platforms', 'Strong Python or TypeScript skills', 'Interest in open-source communities'], 1650000, 2500000, 'Full-time', 'New York, USA', 'open', now() + interval '43 days'),
    ('99999999-9999-9999-9999-999999999918', hf_company_id, 'Open Source Community Intern', 'Support community projects, model cards, and learning resources around practical ML workflows.', ARRAY['Open-source interest', 'Strong documentation habits', 'Basic ML familiarity'], 300000, 480000, 'Internship', 'Remote', 'open', now() + interval '33 days'),
    ('99999999-9999-9999-9999-999999999919', hf_company_id, 'Documentation Curator', 'Maintain part-time platform documentation, templates, and onboarding material across developer journeys.', ARRAY['Strong editorial eye', 'Can work asynchronously', 'Comfortable with technical content'], 440000, 700000, 'Part-time', 'Remote', 'open', now() + interval '46 days'),
    ('99999999-9999-9999-9999-999999999920', hf_company_id, 'Model Partnership Consultant', 'Coordinate short-term partner onboarding, launch checklists, and model showcase assets for featured releases.', ARRAY['Program coordination skills', 'Understanding of AI model ecosystems', 'Comfort with launch operations'], 800000, 1350000, 'Contract', 'Remote', 'open', now() + interval '37 days'),
    ('99999999-9999-9999-9999-999999999921', perplexity_company_id, 'Search Relevance Engineer', 'Build ranking, answer quality, and workflow systems that improve grounded AI search results.', ARRAY['Strong backend fundamentals', 'Search or retrieval familiarity', 'Comfortable with experimentation'], 1750000, 2700000, 'Full-time', 'San Francisco, USA', 'open', now() + interval '44 days'),
    ('99999999-9999-9999-9999-999999999922', perplexity_company_id, 'AI Search Intern', 'Support query analysis, result labeling, and demo features for research-oriented answer workflows.', ARRAY['Analytical mindset', 'Python or SQL basics', 'Strong written communication'], 310000, 500000, 'Internship', 'San Francisco, USA', 'open', now() + interval '31 days'),
    ('99999999-9999-9999-9999-999999999923', perplexity_company_id, 'Content Quality Analyst', 'Part-time role focused on reviewing citations, outputs, and summary consistency for search experiences.', ARRAY['Attention to detail', 'Research and writing comfort', 'Part-time availability'], 430000, 690000, 'Part-time', 'Remote', 'open', now() + interval '45 days'),
    ('99999999-9999-9999-9999-999999999924', perplexity_company_id, 'Enterprise Research Workflow Consultant', 'Help prototype enterprise knowledge workflows and recommended prompt patterns for business teams.', ARRAY['Experience with enterprise research tools', 'Strong presentation skills', 'Can deliver structured recommendations'], 850000, 1450000, 'Contract', 'Remote', 'open', now() + interval '36 days'),
    ('99999999-9999-9999-9999-999999999925', runway_company_id, 'Generative Video Engineer', 'Build user-facing video generation tools and creative controls across multimodal workflows.', ARRAY['Frontend or product engineering experience', 'Strong UX instincts', 'Interest in creative tooling'], 1700000, 2650000, 'Full-time', 'New York, USA', 'open', now() + interval '42 days'),
    ('99999999-9999-9999-9999-999999999926', runway_company_id, 'Creative AI Intern', 'Support prototype development, prompt testing, and creator-facing experiments across video features.', ARRAY['Portfolio of creative or technical work', 'Fast learner', 'Comfortable with rapid iteration'], 320000, 510000, 'Internship', 'New York, USA', 'open', now() + interval '29 days'),
    ('99999999-9999-9999-9999-999999999927', runway_company_id, 'Creator Success Specialist', 'Part-time support role helping creators adopt templates, workflows, and best practices in the platform.', ARRAY['Good communication and empathy', 'Interest in creator tools', 'Reliable schedule'], 420000, 680000, 'Part-time', 'Remote', 'open', now() + interval '47 days'),
    ('99999999-9999-9999-9999-999999999928', runway_company_id, 'Workflow Prototyping Consultant', 'Short-term engagement focused on designing reusable demo workflows for creative enterprise customers.', ARRAY['Strong prototyping experience', 'Can translate product needs into demos', 'Comfortable working on fixed scope'], 900000, 1500000, 'Contract', 'Remote', 'open', now() + interval '35 days'),
    ('99999999-9999-9999-9999-999999999929', scale_company_id, 'Data Platform Engineer', 'Work on pipelines, tooling, and internal systems that help build reliable AI data products at scale.', ARRAY['Backend and data systems experience', 'Strong SQL or Python skills', 'Comfortable with operational workflows'], 1750000, 2750000, 'Full-time', 'San Francisco, USA', 'open', now() + interval '43 days'),
    ('99999999-9999-9999-9999-999999999930', scale_company_id, 'ML Ops Intern', 'Assist with internal tooling, experiment tracking, and model operations workflows for AI delivery teams.', ARRAY['Interest in ML Ops', 'Scripting comfort', 'Strong problem-solving'], 320000, 500000, 'Internship', 'San Francisco, USA', 'open', now() + interval '34 days'),
    ('99999999-9999-9999-9999-999999999931', scale_company_id, 'Trust and Safety Operations Analyst', 'Part-time role supporting QA reviews, escalations, and reporting across AI data programs.', ARRAY['Excellent judgment', 'Careful documentation habits', 'Can work part-time on repeatable processes'], 450000, 720000, 'Part-time', 'Remote', 'open', now() + interval '48 days'),
    ('99999999-9999-9999-9999-999999999932', scale_company_id, 'Dataset Quality Consultant', 'Review labeled data quality, build recommendations, and improve delivery checklists for enterprise programs.', ARRAY['Data QA or annotation experience', 'Analytical mindset', 'Consulting-style communication'], 850000, 1400000, 'Contract', 'Remote', 'open', now() + interval '38 days'),
    ('99999999-9999-9999-9999-999999999933', stability_company_id, 'Multimodal Product Engineer', 'Build production-ready image, video, audio, and media workflow features for creative AI users.', ARRAY['Product engineering experience', 'Comfortable with multimodal tools', 'Good collaboration with design or creative teams'], 1650000, 2550000, 'Full-time', 'London, UK', 'open', now() + interval '42 days'),
    ('99999999-9999-9999-9999-999999999934', stability_company_id, 'Media Generation Intern', 'Support content testing, prompt evaluation, and product QA across multimodal creative tools.', ARRAY['Strong curiosity', 'Good eye for output quality', 'Basic technical comfort'], 300000, 470000, 'Internship', 'London, UK', 'open', now() + interval '30 days'),
    ('99999999-9999-9999-9999-999999999935', stability_company_id, 'Community Program Specialist', 'Part-time support for creator communities, event coordination, and launch feedback loops.', ARRAY['Event or community interest', 'Strong written communication', 'Consistent part-time availability'], 430000, 700000, 'Part-time', 'Remote', 'open', now() + interval '46 days'),
    ('99999999-9999-9999-9999-999999999936', stability_company_id, 'Creative Workflow Consultant', 'Help enterprise users adapt image and video generation workflows to internal creative teams.', ARRAY['Creative operations understanding', 'Strong stakeholder communication', 'Comfort with contract delivery'], 850000, 1450000, 'Contract', 'Remote', 'open', now() + interval '37 days'),
    ('99999999-9999-9999-9999-999999999937', elevenlabs_company_id, 'Speech AI Engineer', 'Build product experiences, developer tooling, and evaluation loops for AI audio and conversational systems.', ARRAY['Strong backend or product engineering', 'Interest in speech or voice systems', 'Good debugging habits'], 1700000, 2600000, 'Full-time', 'London, UK', 'open', now() + interval '44 days'),
    ('99999999-9999-9999-9999-999999999938', elevenlabs_company_id, 'Voice Product Intern', 'Support internal demos, audio QA, and early feature experiments across voice applications.', ARRAY['Comfort with product experimentation', 'Attention to detail', 'Interest in voice AI'], 310000, 490000, 'Internship', 'London, UK', 'open', now() + interval '31 days'),
    ('99999999-9999-9999-9999-999999999939', elevenlabs_company_id, 'Audio QA Reviewer', 'Part-time role reviewing generated audio quality, voice consistency, and creator-facing test cases.', ARRAY['Strong listening and QA judgment', 'Clear reporting skills', 'Part-time availability'], 420000, 680000, 'Part-time', 'Remote', 'open', now() + interval '45 days'),
    ('99999999-9999-9999-9999-999999999940', elevenlabs_company_id, 'Conversational Design Consultant', 'Design sample voice agent flows, prompts, and testing scripts for short-term customer pilots.', ARRAY['Conversation design experience', 'Comfort with AI tools', 'Able to deliver structured contract milestones'], 900000, 1500000, 'Contract', 'Remote', 'open', now() + interval '39 days')
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
END $$;
