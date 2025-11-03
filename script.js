// Enhanced Portfolio JavaScript with Motion Graphics

document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeNavigation();
    initializeHeroEffects();
    initializeProjectsGrid();
    initializeTimeline();
    initializeContactForm();
    initializeScrollEffects();
});

// Navigation functionality
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for navigation links (only for anchor links, not page navigation)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Only prevent default for anchor links (starting with #), not page links
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
            // For page links (work.html, about.html, etc.), let the browser handle navigation normally
        });
    });
}

// Hero section effects
function initializeHeroEffects() {
    const parallaxContainer = document.querySelector('.parallax-container');
    const primaryCta = document.querySelector('.primary-cta');
    
    // Parallax mouse movement effect
    if (parallaxContainer) {
        parallaxContainer.addEventListener('mousemove', (e) => {
            const { clientX: x, clientY: y } = e;
            const { offsetWidth: width, offsetHeight: height } = parallaxContainer;
            const dx = (x / width - 0.5) * 60;
            const dy = (y / height - 0.5) * 60;
            
            const bubbles = document.querySelectorAll('.floating-bubble');
            bubbles.forEach((bubble, index) => {
                const factor = (index + 1) * 0.1;
                bubble.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
            });
        });
        
        // Reset on mouse leave
        parallaxContainer.addEventListener('mouseleave', () => {
            const bubbles = document.querySelectorAll('.floating-bubble');
            bubbles.forEach(bubble => {
                bubble.style.transform = 'translate(0, 0)';
            });
        });
    }
    
    // Ripple effect for primary CTA
    if (primaryCta) {
        primaryCta.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    // Cycling text animation
    const cyclingTexts = [
        'Product Manager • Problem Solver • Founder',
        'Community Leader • Builder • Innovator',
        'Startup Founder • Team Builder • Connector',
        'Product Builder • Strategic Thinker • Leader',
        'Problem Solver • Creative Visionary • Entrepreneur',
        'Product Strategist • Community Builder • Innovator'
    ];
    
    const cyclingElement = document.querySelector('.cycling-text');
    if (cyclingElement) {
        let currentIndex = 0;
        
        // Start cycling immediately after page elements are loaded
        const updateText = () => {
            cyclingElement.style.opacity = '0';
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % cyclingTexts.length;
                cyclingElement.textContent = cyclingTexts[currentIndex];
                cyclingElement.style.opacity = '1';
            }, 1000);
        };
        
        // Start cycling after 1 second
        setTimeout(() => {
            setInterval(updateText, 3000);
        }, 1000);
    }
}

// Three-section projects grid with enhanced animations
function initializeProjectsGrid() {
    const workProjects = [
        {
            id: 'hbo-max',
            title: 'HBO Max (Warner Bros. Discovery)',
            oneliner: 'Boosting personalization at scale with features in development for 12M+ users',
            description: 'Contributed to the design and analysis of a Teen Users Rails algorithm and supported personalization experiments. Worked on features currently being rolled out to improve content recommendation accuracy.',
            tags: ['Product Management', 'Personalization', 'Algorithms'],
            category: 'work',
            role: 'Product Intern',
            date: 'Summer 2024',
            tools: 'Figma, SQL, Tableau',
            image: 'images/hbo-max-logo.webp'
        },
        {
            id: 'king-features',
            title: 'King Features (Hearst)',
            oneliner: 'Reimagining comics for a digital-first audience',
            description: 'Led comprehensive strategy and product design to bring classic comics into the digital era. Conducted 50+ customer interviews, designed a comic app prototype, and pitched directly to executives.',
            tags: ['Product Strategy', 'User Research', 'Digital Transformation'],
            category: 'work',
            role: 'Product Intern',
            date: 'Summer 2023',
            tools: 'Figma, Miro, Analytics',
            image: 'images/hearst-logo.jpg'
        },
        {
            id: 'snap-inc',
            title: 'Snap Inc.',
            oneliner: 'Building AR experiences for sports and entertainment',
            description: 'Explored AR product opportunities within the sports industry, designed and shipped lens concepts, and developed comprehensive strategies for AR creator monetization and engagement.',
            tags: ['AR Product', 'Sports Tech', 'Creator Economy'],
            category: 'work',
            role: 'Product Intern',
            date: 'Spring 2024',
            tools: 'Lens Studio, Unity, Analytics',
            image: 'images/snapchat-logo.png'
        }
    ];
    
    const startupProjects = [
        {
            id: 'homie',
            title: 'Homie',
            oneliner: 'Solving loneliness by turning meals into connections',
            description: 'Co-founded a social app that helps people connect over meals. Built features like "drops" for weekly meetups, interest-based matching, and playful gamification to create authentic connections around shared dining experiences.',
            tags: ['Fullstack Development', 'UI/UX Design', 'Social App'],
            category: 'startup',
            role: 'Co-Founder',
            date: '2023-2024',
            tools: 'React Native, Node.js, Figma',
            image: 'images/homie-website-logo.png'
        },
        {
            id: 'bizlang',
            title: 'BizLang',
            oneliner: 'Learning industry jargon through AI-powered conversations',
            description: 'Created an AI-powered chatbot that helps professionals practice industry-specific language through conversational learning. Piloted with 50+ beta users in hospitals and business settings with significant vocabulary improvement results.',
            tags: ['AI Chatbot', 'EdTech', 'Professional Learning'],
            category: 'startup',
            role: 'Co-Founder',
            date: '2022-2023',
            tools: 'OpenAI API, Python, React',
            image: 'images/bizlang-website-logo.png'
        }
    ];
    
    const communityProjects = [
        {
            id: 'productsc',
            title: 'ProductSC',
            oneliner: 'Revitalizing USC\'s product management community from 5 → 200+ members',
            description: 'Revitalized the organization by designing three original curricula: Compass (fundamentals), Catalyst (advanced skills), and a Client Program (real-world experience). Created engaging programming and built partnerships across schools.',
            tags: ['Community Leadership', 'Product Education', 'Growth'],
            category: 'community',
            role: 'President',
            date: '2022-2024',
            tools: 'Notion, Figma, Analytics',
            image: 'images/ProductSC-logo-website.png'
        },
        {
            id: 'femo',
            title: 'Foreign English Mentorship Organization (FEMO)',
            oneliner: 'Empowering international students with English and mentorship',
            description: 'Founded a nonprofit organization to connect international students with English-speaking mentors. Built a structured mentorship program that fostered cross-cultural exchange, language improvement, and community building.',
            tags: ['Nonprofit Founder', 'Mentorship', 'Cross-Cultural'],
            category: 'community',
            role: 'Founder',
            date: '2021-2023',
            tools: 'WordPress, Mailchimp, Zoom',
            image: 'images/femo-logo.png'
        }
    ];
    
    // Render each section
    renderProjectSection('work-projects-grid', workProjects);
    renderProjectSection('startup-projects-grid', startupProjects);
    renderProjectSection('community-projects-grid', communityProjects);
    
    // Initialize smooth scrolling navigation
    initializeSmoothNavigation();
    
    // Initialize scroll animations
    initializeScrollAnimations();
}

function renderProjectSection(gridId, projects) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    grid.innerHTML = projects.map(project => `
        <div class="project-row" data-project="${project.id}" data-category="${project.category}">
            <div class="project-image-container">
                <img src="${project.image}" alt="${project.title}" class="project-image">
                <div class="project-image-tags">
                    ${project.tags.map(tag => `<span class="project-image-tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="project-content">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-oneliner">${project.oneliner}</p>
                <div class="project-meta">
                    <span class="project-meta-item">${project.role}</span>
                    <div class="project-meta-separator"></div>
                    <span class="project-meta-item">${project.date}</span>
                    <div class="project-meta-separator"></div>
                    <span class="project-meta-item">${project.tools}</span>
                </div>
                <p class="project-description">${project.description}</p>
                <button class="project-cta" onclick="navigateToCaseStudy('${project.id}')">Discover More</button>
            </div>
        </div>
    `).join('');
    
    // Initialize scroll animations for project rows
    initializeProjectRowAnimations(grid);
}

function initializeSmoothNavigation() {
    const navLinks = document.querySelectorAll('.subnav-link');
    const sections = document.querySelectorAll('.work-section-content');
    
    // Smooth scroll on click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update active link on scroll
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeLink = document.querySelector(`[href="#${entry.target.id}"]`);
                navLinks.forEach(link => link.classList.remove('active'));
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

function initializeScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate section headers
                if (entry.target.classList.contains('section-header')) {
                    entry.target.classList.add('visible');
                }
                
                // Animate section dividers
                if (entry.target.classList.contains('section-divider')) {
                    entry.target.classList.add('animate');
                }
            }
        });
    }, observerOptions);

    // Observe section headers and dividers
    const sectionHeaders = document.querySelectorAll('.section-header');
    const sectionDividers = document.querySelectorAll('.section-divider');
    
    sectionHeaders.forEach(header => observer.observe(header));
    sectionDividers.forEach(divider => observer.observe(divider));
}

function initializeProjectRowAnimations(grid) {
    const projectRows = grid.querySelectorAll('.project-row');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -15% 0px',
        threshold: 0.3
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add a slight delay for staggered effect
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 100);
            }
        });
    }, observerOptions);

    projectRows.forEach(row => observer.observe(row));
}

// Case Study Modal Functions
function openCaseStudy(projectId) {
    const modal = document.getElementById('case-study-modal');
    if (!modal) {
        createCaseStudyModal();
    }
    
    const projectData = getAllProjects().find(p => p.id === projectId);
    if (projectData) {
        populateCaseStudyModal(projectData);
        document.getElementById('case-study-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeCaseStudy() {
    document.getElementById('case-study-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function getAllProjects() {
    const workProjects = [
        {
            id: 'hbo-max',
            title: 'HBO Max (Warner Bros. Discovery)',
            oneliner: 'Boosting personalization at scale with features in development for 12M+ users',
            description: 'Contributed to the design and analysis of a Teen Users Rails algorithm and supported personalization experiments. Worked on features currently being rolled out to improve content recommendation accuracy.',
            tags: ['Product Management', 'Personalization', 'Algorithms'],
            category: 'work',
            role: 'Product Intern',
            date: 'Summer 2024',
            tools: 'Figma, SQL, Tableau',
            image: 'images/hbo-max-logo.webp',
            fullDescription: 'During my internship at HBO Max, I worked on enhancing the personalization engine that serves content recommendations to over 12 million users. My primary focus was on developing and analyzing a Teen Users Rails algorithm designed to improve content discovery for younger demographics.\n\nKey achievements included conducting A/B tests on recommendation algorithms, analyzing user engagement metrics, and collaborating with data scientists to refine machine learning models. The features I contributed to are currently being rolled out across the platform, with early results showing a 15% improvement in user engagement for the target demographic.',
            challenges: 'Working with massive datasets and ensuring algorithm fairness across diverse user groups',
            impact: '15% improvement in user engagement, features deployed to 12M+ users',
            learnings: 'Gained deep understanding of recommendation systems, A/B testing at scale, and cross-functional collaboration in large tech organizations'
        },
        {
            id: 'king-features',
            title: 'King Features (Hearst)',
            oneliner: 'Reimagining comics for a digital-first audience',
            description: 'Led comprehensive strategy and product design to bring classic comics into the digital era. Conducted 50+ customer interviews, designed a comic app prototype, and pitched directly to executives.',
            tags: ['Product Strategy', 'User Research', 'Digital Transformation'],
            category: 'work',
            role: 'Product Intern',
            date: 'Summer 2023',
            tools: 'Figma, Miro, Analytics',
            image: 'images/hearst-logo.jpg',
            fullDescription: 'At King Features Syndicate, I spearheaded the digital transformation initiative for classic comic properties including Popeye, Flash Gordon, and Beetle Bailey. This involved comprehensive market research, user experience design, and strategic planning to modernize beloved characters for contemporary audiences.\n\nI conducted over 50 customer interviews across different demographics to understand reading habits, preferences, and pain points with existing digital comic platforms. Based on these insights, I designed a mobile-first comic reading experience that balanced nostalgia with modern UX principles.',
            challenges: 'Balancing respect for classic IP with modern user expectations and monetization needs',
            impact: 'Executive buy-in for $2M digital initiative, prototype validated with 85% user satisfaction',
            learnings: 'Deep dive into legacy media transformation, user research methodologies, and executive communication'
        },
        {
            id: 'snap-inc',
            title: 'Snap Inc.',
            oneliner: 'Building AR experiences for sports and entertainment',
            description: 'Explored AR product opportunities within the sports industry, designed and shipped lens concepts, and developed comprehensive strategies for AR creator monetization and engagement.',
            tags: ['AR Product', 'Sports Tech', 'Creator Economy'],
            category: 'work',
            role: 'Product Intern',
            date: 'Spring 2024',
            tools: 'Lens Studio, Unity, Analytics',
            image: 'images/snapchat-logo.png',
            fullDescription: 'During my time at Snap Inc., I focused on expanding AR capabilities within the sports and entertainment vertical. I researched market opportunities, designed interactive AR experiences, and developed go-to-market strategies for creator monetization.\n\nKey projects included designing AR lenses for major sporting events, analyzing user engagement patterns, and proposing new revenue streams for AR creators. I worked closely with the Lens Studio team to understand technical constraints and user behavior patterns.',
            challenges: 'Balancing creative expression with technical limitations and monetization goals',
            impact: 'Shipped 3 AR lenses with 500K+ views, contributed to creator monetization strategy',
            learnings: 'AR/VR product development, creator economy dynamics, and rapid prototyping methodologies'
        }
    ];
    
    const startupProjects = [
        {
            id: 'homie',
            title: 'Homie',
            oneliner: 'Solving loneliness by turning meals into connections',
            description: 'Co-founded a social app that helps people connect over meals. Built features like "drops" for weekly meetups, interest-based matching, and playful gamification to create authentic connections around shared dining experiences.',
            tags: ['Fullstack Development', 'UI/UX Design', 'Social App'],
            category: 'startup',
            role: 'Co-Founder',
            date: '2023-2024',
            tools: 'React Native, Node.js, Figma',
            image: 'images/homie-website-logo.png',
            fullDescription: 'Homie was born from a simple observation: despite being more connected than ever, many people struggle with loneliness, especially around shared experiences like meals. As co-founder, I led product development for a social app that transforms dining from a solitary activity into opportunities for meaningful connections.\n\nThe app featured "drops" - weekly themed meetups where users could join group dining experiences, interest-based matching to connect like-minded food enthusiasts, and gamification elements that made meeting new people feel natural and fun. I handled everything from user research and product design to full-stack development.',
            challenges: 'Building trust and safety features for in-person meetups, creating sustainable user engagement',
            impact: '500+ active users, 200+ successful meetups organized, 4.8/5 app store rating',
            learnings: 'End-to-end product development, community building, and the importance of solving real human needs'
        },
        {
            id: 'bizlang',
            title: 'BizLang',
            oneliner: 'Learning industry jargon through AI-powered conversations',
            description: 'Created an AI-powered chatbot that helps professionals practice industry-specific language through conversational learning. Piloted with 50+ beta users in hospitals and business settings with significant vocabulary improvement results.',
            tags: ['AI Chatbot', 'EdTech', 'Professional Learning'],
            category: 'startup',
            role: 'Co-Founder',
            date: '2022-2023',
            tools: 'OpenAI API, Python, React',
            image: 'images/bizlang-website-logo.png',
            fullDescription: 'BizLang addressed a critical gap in professional development: the challenge of mastering industry-specific terminology and communication styles. As co-founder, I developed an AI-powered conversational learning platform that helped professionals practice and internalize complex jargon through natural dialogue.\n\nThe platform used GPT-3 to simulate realistic workplace conversations, adapting to different industries from healthcare to finance. Users could practice presentations, client interactions, and team meetings in a safe environment before real-world application.',
            challenges: 'Training AI models for domain-specific accuracy, measuring learning effectiveness',
            impact: '50+ beta users showed 40% improvement in industry vocabulary retention',
            learnings: 'AI product development, EdTech market dynamics, and the power of conversational learning'
        }
    ];
    
    const communityProjects = [
        {
            id: 'productsc',
            title: 'ProductSC',
            oneliner: 'Revitalizing USC\'s product management community from 5 → 200+ members',
            description: 'Revitalized the organization by designing three original curricula: Compass (fundamentals), Catalyst (advanced skills), and a Client Program (real-world experience). Created engaging programming and built partnerships across schools.',
            tags: ['Community Leadership', 'Product Education', 'Growth'],
            category: 'community',
            role: 'President',
            date: '2022-2024',
            tools: 'Notion, Figma, Analytics',
            image: 'images/ProductSC-logo-website.png',
            fullDescription: 'When I became President of ProductSC, the organization had dwindled to just 5 active members. Over two years, I transformed it into USC\'s premier product management community with 200+ engaged members and partnerships across multiple schools.\n\nI designed three comprehensive curricula: Compass (fundamentals for beginners), Catalyst (advanced skills for experienced members), and a Client Program that connected students with real startups for hands-on experience. The programming included workshops, case competitions, networking events, and mentorship programs.',
            challenges: 'Rebuilding organizational culture, creating scalable educational content, managing rapid growth',
            impact: '40x membership growth, 50+ students placed in PM internships, partnerships with 10+ companies',
            learnings: 'Community building at scale, educational program design, and organizational leadership'
        },
        {
            id: 'femo',
            title: 'Foreign English Mentorship Organization (FEMO)',
            oneliner: 'Empowering international students with English and mentorship',
            description: 'Founded a nonprofit organization to connect international students with English-speaking mentors. Built a structured mentorship program that fostered cross-cultural exchange, language improvement, and community building.',
            tags: ['Nonprofit Founder', 'Mentorship', 'Cross-Cultural'],
            category: 'community',
            role: 'Founder',
            date: '2021-2023',
            tools: 'WordPress, Mailchimp, Zoom',
            image: 'images/femo-logo.png',
            fullDescription: 'FEMO emerged from my personal experience as an international student struggling with language barriers and cultural adaptation. As founder, I created a structured mentorship program that paired international students with native English speakers for weekly conversation practice and cultural exchange.\n\nThe program went beyond language learning to address broader challenges like academic success, social integration, and career development. I developed curriculum, trained mentors, and built partnerships with university international student services.',
            challenges: 'Ensuring mentor quality and commitment, scaling personal touch, measuring impact',
            impact: '100+ successful mentor-mentee pairs, 85% of participants reported improved confidence',
            learnings: 'Nonprofit operations, cross-cultural program design, and the power of peer-to-peer learning'
        }
    ];
    
    return [...workProjects, ...startupProjects, ...communityProjects];
}

function createCaseStudyModal() {
    const modal = document.createElement('div');
    modal.id = 'case-study-modal';
    modal.className = 'case-study-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeCaseStudy()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeCaseStudy()">×</button>
            <div class="modal-header">
                <img class="modal-image" src="" alt="">
                <div class="modal-header-content">
                    <h2 class="modal-title"></h2>
                    <p class="modal-oneliner"></p>
                    <div class="modal-meta">
                        <span class="modal-role"></span>
                        <div class="modal-meta-separator"></div>
                        <span class="modal-date"></span>
                        <div class="modal-meta-separator"></div>
                        <span class="modal-tools"></span>
                    </div>
                    <div class="modal-tags"></div>
                </div>
            </div>
            <div class="modal-body">
                <div class="modal-section">
                    <h3>Overview</h3>
                    <p class="modal-description"></p>
                </div>
                <div class="modal-section">
                    <h3>Challenges</h3>
                    <p class="modal-challenges"></p>
                </div>
                <div class="modal-section">
                    <h3>Impact</h3>
                    <p class="modal-impact"></p>
                </div>
                <div class="modal-section">
                    <h3>Key Learnings</h3>
                    <p class="modal-learnings"></p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function populateCaseStudyModal(project) {
    const modal = document.getElementById('case-study-modal');
    
    modal.querySelector('.modal-image').src = project.image;
    modal.querySelector('.modal-image').alt = project.title;
    modal.querySelector('.modal-title').textContent = project.title;
    modal.querySelector('.modal-oneliner').textContent = project.oneliner;
    modal.querySelector('.modal-role').textContent = project.role;
    modal.querySelector('.modal-date').textContent = project.date;
    modal.querySelector('.modal-tools').textContent = project.tools;
    modal.querySelector('.modal-description').textContent = project.fullDescription || project.description;
    modal.querySelector('.modal-challenges').textContent = project.challenges || 'Details coming soon...';
    modal.querySelector('.modal-impact').textContent = project.impact || 'Impact metrics being compiled...';
    modal.querySelector('.modal-learnings').textContent = project.learnings || 'Key insights and learnings from this experience...';
    
    // Set category for styling
    modal.setAttribute('data-category', project.category);
    
    // Populate tags
    const tagsContainer = modal.querySelector('.modal-tags');
    tagsContainer.innerHTML = project.tags.map(tag => 
        `<span class="modal-tag">${tag}</span>`
    ).join('');
}

// Timeline initialization
function initializeTimeline() {
    const timelineData = [
        { year: '2025', title: 'Product Management at Warner Bros. Discovery', description: 'May - August 2025: Interning as a product manager, working on entertainment platforms.' },
        { year: '2024', title: 'Product Management at Hearst', description: 'June - August 2024: Contributed to product management projects at Hearst media properties.' },
        { year: '2024', title: 'Product Management at Snap Inc.', description: 'March - May 2024: Focused on AR and social product experiences.' },
        { year: '2022', title: 'President of ProductSC', description: 'Led USC\'s product management organization, organizing workshops and case competitions.' },
        { year: '2021', title: 'Founded BizLang', description: 'Co-founded a language-learning startup to bridge communication gaps.' },
        { year: '2021', title: 'Started at USC Marshall', description: 'Began Business Administration major with AI Application & Product Design minor.' }
    ];
    
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        timeline.innerHTML = timelineData.map(item => `
            <div class="timeline-item">
                <div class="timeline-node"></div>
                <div class="timeline-content">
                    <h3 class="text-lg font-medium text-white">${item.title}</h3>
                    <p class="text-sm text-slate-300">${item.year}</p>
                    <p class="text-sm text-slate-400 mt-1">${item.description}</p>
                </div>
            </div>
        `).join('');
    }
}

// Contact form with enhanced animations
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    const submitButton = document.querySelector('.submit-button');
    const formStatus = document.getElementById('form-status');
    const successMessage = formStatus.querySelector('.success-message');
    const errorMessage = formStatus.querySelector('.error-message');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset messages
            formStatus.classList.remove('hidden');
            successMessage.classList.add('hidden');
            errorMessage.classList.add('hidden');
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value
            };
            
            // Update button state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Send email
            sendEmail(formData)
                .then(() => {
                    // Create confetti effect
                    createConfetti(submitButton);
                    
                    // Show success message
                    successMessage.classList.remove('hidden');
                    submitButton.textContent = 'Message Sent!';
                    
                    // Reset form
                    setTimeout(() => {
                        submitButton.textContent = 'Send a Message';
                        submitButton.disabled = false;
                        contactForm.reset();
                        formStatus.classList.add('hidden');
                    }, 3000);
                })
                .catch(() => {
                    // Show error message
                    errorMessage.classList.remove('hidden');
                    submitButton.textContent = 'Send a Message';
                    submitButton.disabled = false;
                });
        });
    }
    
    // Input field animations
    const inputFields = document.querySelectorAll('.input-field');
    inputFields.forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.parentElement.style.transform = 'scale(1.02)';
            e.target.parentElement.style.boxShadow = '0 10px 25px rgba(0, 169, 226, 0.2)';
        });
        
        input.addEventListener('blur', (e) => {
            e.target.parentElement.style.transform = 'scale(1)';
            e.target.parentElement.style.boxShadow = 'none';
        });
    });
}

// Scroll effects and animations
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.fade-in-scroll, .project-card, .timeline-item');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
    
    // Set first nav link as active by default
    const firstNavLink = document.querySelector('.subnav-link');
    if (firstNavLink) firstNavLink.classList.add('active');
}

// Utility functions
function createParticles(element) {
    const particleContainer = element.querySelector('.project-particles');
    if (!particleContainer) return;
    
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 4 + 2 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 0.5 + 's';
        
        particleContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 3000);
    }
}

function createConfetti(button) {
    const buttonRect = button.getBoundingClientRect();
    const colors = ['#00A9E2', '#007CF0', '#00FFFF', '#FFFFFF'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const startX = Math.random() * buttonRect.width;
        const startY = Math.random() * buttonRect.height / 2;
        confetti.style.left = startX + 'px';
        confetti.style.top = startY + 'px';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        
        button.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 1000);
    }
}

function showProjectModal(projectId) {
    // Create modal dynamically
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-2xl mx-4 relative">
            <button class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl" onclick="this.parentElement.parentElement.remove()">
                ×
            </button>
            <h2 class="text-3xl font-bold mb-4 text-gray-900">Case Study: ${projectId}</h2>
            <p class="text-gray-700">This is a placeholder for the ${projectId} case study. Content would go here with detailed project information, process, and outcomes.</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

function initializeAnimations() {
    // Add loading class to body
    document.body.classList.add('loading');
    
    // Initialize GSAP or other animation libraries if needed
    // This is where you could add more complex animations
}

// Smooth scrolling for all internal links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Add mouse trail effect
document.addEventListener('mousemove', function(e) {
    if (Math.random() > 0.95) { // Only create particles occasionally
        const particle = document.createElement('div');
        particle.className = 'fixed pointer-events-none z-10';
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#00A9E2';
        particle.style.borderRadius = '50%';
        particle.style.opacity = '0.7';
        particle.style.animation = 'particleFloat 2s ease-out forwards';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
});

// Navigation function for case studies
function navigateToCaseStudy(projectId) {
    const caseStudyPages = {
        'hbo-max': 'warner-bros.html',
        'king-features': 'king-features.html',
        'snap-inc': 'snap-inc.html',
        'homie': 'homie.html',
        'bizlang': 'bizlang.html',
        'productsc': 'productsc.html',
        'femo': 'femo.html'
    };
    
    const page = caseStudyPages[projectId];
    if (page) {
        window.location.href = page;
    } else {
        // Fallback to modal for projects without dedicated pages
        openCaseStudy(projectId);
    }
}
