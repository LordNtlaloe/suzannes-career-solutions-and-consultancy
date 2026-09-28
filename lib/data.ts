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
  { slug: "career-strategy", title: "Career Strategy", short: "Define where you are going and build a practical plan to get there.", text: "We help professionals define a clear direction, identify their strongest positioning and turn experience into a practical career plan.", image: images.service1 },
  { slug: "talent-matching", title: "Talent Matching", short: "Connect your experience with opportunities that genuinely fit.", text: "We connect capable people with opportunities that fit their experience, goals and the kind of work they want to build next.", image: images.service2 },
  { slug: "professional-growth", title: "Professional Growth", short: "Strengthen the skills, profile and confidence needed for your next move.", text: "From CV positioning to interview preparation, we build the confidence and tools needed to move forward with intention.", image: images.service3 },
];

export const differentiators = [
  { title: "Experienced", text: "Practical career guidance built around real hiring environments, professional positioning and measurable progress." },
  { title: "Fair Approach", text: "Our advice is designed around your goals and strengths rather than forcing every candidate into the same career path." },
  { title: "On Time", text: "We keep the process focused and structured so applications, preparation and opportunities keep moving." },
  { title: "Trusted Guidance", text: "Confidential conversations, clear recommendations and practical support from the first consultation to the next opportunity." },
];

export const articles = [
  { slug: "position-your-experience", date: "12", month: "SEP", title: "How to Position Your Experience for Your Next Role", text: "A strong career story makes it easier for employers to understand the value behind your experience.", image: images.article1 },
  { slug: "stronger-job-search", date: "08", month: "SEP", title: "Five Practical Steps for a Stronger Job Search", text: "Build a focused search around the roles, industries and strengths that actually fit your direction.", image: images.article2 },
  { slug: "interview-preparation", date: "02", month: "SEP", title: "The Right Way to Prepare for an Interview", text: "Preparation is more than rehearsing answers. Learn how to communicate your experience with clarity.", image: images.article3 },
];

export const portfolio = [
  { slug: "executive-transition", title: "Executive Transition", status: "Career Strategy", image: images.project1, text: "A structured transition plan for an experienced professional moving into a new leadership chapter." },
  { slug: "graduate-launch", title: "Graduate Launch", status: "Talent Matching", image: images.project2, text: "A focused early-career programme combining positioning, applications and interview preparation." },
  { slug: "leadership-path", title: "Leadership Path", status: "Professional Growth", image: images.project3, text: "A development roadmap built around leadership positioning, communication and professional growth." },
  { slug: "career-repositioning", title: "Career Repositioning", status: "Executive Advisory", image: images.project4, text: "A repositioning project helping a professional translate transferable experience into a new industry." },
];
