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
  founderSuzanne: "/suzanne.jpeg",
  founderThabo: "/thabo.jpeg",
};

export const services = [
  { slug: "career-readiness-academy", title: "Career Readiness Academy", short: "Six months of training, mentorship, coaching and competency assessment.", text: "A blended programme combining online learning, workshops, peer support, career coaching and mentoring — finishing with a STEP Skills Passport.", image: images.service1 },
  { slug: "talent-experience-pathway", title: "Talent Experience Pathway", short: "Structured, supervised work experience with employer exposure.", text: "Time-bound, supervised placements with host organisations that turn readiness into real workplace experience.", image: images.service2 },
  { slug: "schools-discovery-bootcamps", title: "Schools Career Discovery Bootcamps", short: "Fee-based career guidance and foundational digital and creative skills.", text: "Annual, age-appropriate bootcamps for secondary-school learners exploring subject and career choices.", image: images.service3 },
  { slug: "creative-economy-lab", title: "Entrepreneurship & Creative Economy Lab", short: "Enterprise development, creator skills, showcases and market links.", text: "Incubation and exposure for entrepreneurs, artists and creators — from business fundamentals to paid commissions.", image: images.project1 },
];

export const differentiators = [
  { title: "Continuous pathway", text: "Four connected programmes that move talent from school and ambition to skills, experience and livelihoods." },
  { title: "Verified capabilities", text: "Assessed learning, mentor records and a STEP Skills Passport prove what participants can do." },
  { title: "Inclusive access", text: "Representation across Lesotho's ten districts, with reasonable accommodations and alternative registration channels." },
  { title: "Accountable partnerships", text: "Written scopes, agreed outcomes, safeguarding and measured first-cycle targets." },
];

export const articles = [
  { slug: "position-your-experience", date: "12", month: "SEP", title: "How to Position Your Experience for Your Next Role", text: "A strong career story makes it easier for employers to understand the value behind your experience.", image: images.article1 },
  { slug: "stronger-job-search", date: "08", month: "SEP", title: "Five Practical Steps for a Stronger Job Search", text: "Build a focused search around the roles, industries and strengths that actually fit your direction.", image: images.article2 },
  { slug: "interview-preparation", date: "02", month: "SEP", title: "The Right Way to Prepare for an Interview", text: "Preparation is more than rehearsing answers. Learn how to communicate your experience with clarity.", image: images.article3 },
];

export const portfolio = [
  { slug: "career-readiness-academy", title: "Career Readiness Academy", status: "Pillar 01", image: images.project1, text: "Six months of blended training, mentorship, coaching and competency assessment." },
  { slug: "talent-experience-pathway", title: "Talent Experience Pathway", status: "Pillar 02", image: images.project2, text: "Time-bound, supervised work experience with employer exposure." },
  { slug: "schools-bootcamps", title: "Schools Career Discovery Bootcamps", status: "Pillar 03", image: images.project3, text: "Fee-based career guidance and foundational digital and creative skills." },
  { slug: "creative-economy-lab", title: "Entrepreneurship & Creative Economy Lab", status: "Pillar 04", image: images.project4, text: "Enterprise development, creator skills, showcases and market links." },
];
