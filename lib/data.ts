export const images = {
  hero: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85",
  service1: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",
  service2: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
  service3: "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=85",
  consultant: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=900&q=85",
  story: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=85",
  article1: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=85",
  article2: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85",
  article3: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85",
  project1: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=700&q=85",
  project2: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=700&q=85",
  project3: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=700&q=85",
  project4: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=700&q=85",
  client: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=85",
};

export const services = [
  { slug: "learning-and-coaching", title: "Learning & Coaching", short: "Structured coursework, coaching and mentoring across your industry cohort.", text: "Six months of guided learning, coaching and mentoring that build the skills and confidence behind verified readiness.", image: images.service1 },
  { slug: "practical-application", title: "Practical Application", short: "Turn learning into demonstrated skill through assessed practice.", text: "Assessed projects and real-world practice that prove what you can do — not just what you know.", image: images.service2 },
  { slug: "verified-opportunity", title: "Verified Opportunity", short: "Finish with a Skills Passport and introductions to opportunity providers.", text: "A verified STEP Skills Passport and consented, curated introductions connect you to employers and providers.", image: images.service3 },
];

export const differentiators = [
  { title: "Six-month structure", text: "A focused six months with clear phases, deadlines and a defined endpoint — from baseline to verified passport." },
  { title: "Verified readiness", text: "Every level is earned through assessed evidence and audited progression, never time served." },
  { title: "Industry cohorts", text: "Learning, mentoring and practice are organised around eight real industry pathways into work." },
  { title: "Skills Passport", text: "Participants finish with a verified STEP Skills Passport that employers and providers can trust." },
];

export const articles = [
  { slug: "position-your-experience", date: "12", month: "SEP", title: "How to Position Your Experience for Your Next Role", text: "A strong career story makes it easier for employers to understand the value behind your experience.", image: images.article1 },
  { slug: "stronger-job-search", date: "08", month: "SEP", title: "Five Practical Steps for a Stronger Job Search", text: "Build a focused search around the roles, industries and strengths that actually fit your direction.", image: images.article2 },
  { slug: "interview-preparation", date: "02", month: "SEP", title: "The Right Way to Prepare for an Interview", text: "Preparation is more than rehearsing answers. Learn how to communicate your experience with clarity.", image: images.article3 },
];

export const portfolio = [
  { slug: "business-finance", title: "Business & Finance", status: "Cohort 01", image: images.project1, text: "Accounting, banking, insurance, consulting, audit, procurement and administration." },
  { slug: "technology-data", title: "Technology & Data", status: "Cohort 02", image: images.project2, text: "Information technology, cloud, AI, cybersecurity, data, product and digital operations." },
  { slug: "media-creative", title: "Media & Creative", status: "Cohort 03", image: images.project3, text: "Content creation, film, music, design, journalism, marketing and communications." },
  { slug: "entrepreneurship", title: "Entrepreneurship", status: "Cohort 04", image: images.project4, text: "Start-ups, micro and small enterprises, freelancers, consultants and innovation-led businesses." },
];
