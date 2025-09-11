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

// Projects grid with enhanced animations
function initializeProjectsGrid() {
    const allProjectsData = [
        // Work Experience
        {
            id: 'hbo-max',
            title: 'HBO Max (Warner Bros. Discovery)',
            description: 'Worked on features currently in development to improve personalization and discovery. Contributed to the design and analysis of a Teen Users Rails algorithm and supported personalization experiments that shaped ongoing product direction.',
            tags: ['Product Management', 'Personalization', 'Algorithms'],
            category: 'Work Experience',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYd2FA71Is5W08sE1roBr5ky1ZACz_HA7Tsb7gDa3KCf5DgqJ9f7fClEq8K2vEknQdGkgJqGAr--92Oh0bS1jYr8J9uVEn7mTxOrR4hJxWJEOaf1JiS94jBMW9Ui-eGTdol8qQyKWa6zV_5SfOP6WJx6jaEWzyNdWIyOQ6EV5Y0l0hiEXimTOeY38JR-5r5NkTZbui-X1GwsweJAWmzKck0ybt6oHw7IpGZxARmPWIF66tn3Ui-mqM6Wcto7JYQ-E_ovo3St6nj1sA'
        },
        {
            id: 'king-features',
            title: 'King Features (Hearst)',
            description: 'Led a strategy and product design project to bring classic comics into the digital era. Conducted 50+ customer interviews, designed a comic app prototype, and pitched directly to executives.',
            tags: ['Product Strategy', 'User Research', 'Digital Transformation'],
            category: 'Work Experience',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByB7daz99fOT-pg6984Bz5EH3NJYOWCiLxKyaVTHmzGFm_1KmK9GwQZ-juSS9uWFRb_TWhAYxbHSwMsdeRzyftO2RIIvpEzwqQUAeJxlp-uWeufUxUo8_oOEJVHIoN48p-LRvzBX2u8GraFb24TNMrSTQ5cMRP76s6lSFbnEZ0srJWZ7ceXKKTsfGSjPNZBaktc14DAeMTodnRObiiVjP34rIvDUdGZptExKBuIw7oB7N7vKBaRM1ywQA7MSNDdTUKdPfRaGZv7tTm'
        },
        {
            id: 'snap-inc',
            title: 'Snap Inc.',
            description: 'Explored AR product opportunities within the sports industry. Designed and shipped lens concepts while developing strategies for AR creator monetization and engagement.',
            tags: ['AR Product', 'Sports Tech', 'Creator Economy'],
            category: 'Work Experience',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYd2FA71Is5W08sE1roBr5ky1ZACz_HA7Tsb7gDa3KCf5DgqJ9f7fClEq8K2vEknQdGkgJqGAr--92Oh0bS1jYr8J9uVEn7mTxOrR4hJxWJEOaf1JiS94jBMW9Ui-eGTdol8qQyKWa6zV_5SfOP6WJx6jaEWzyNdWIyOQ6EV5Y0l0hiEXimTOeY38JR-5r5NkTZbui-X1GwsweJAWmzKck0ybt6oHw7IpGZxARmPWIF66tn3Ui-mqM6Wcto7JYQ-E_ovo3St6nj1sA'
        },
        // Startup Projects
        {
            id: 'homie',
            title: 'Homie',
            description: 'Co-founded a social app tackling loneliness by helping people connect over meals. Built features like "drops" for weekly meetups, interest-based matching, and playful gamification to create authentic connections.',
            tags: ['Co-Founder', 'Social App', 'Community'],
            category: 'Startup Projects',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByB7daz99fOT-pg6984Bz5EH3NJYOWCiLxKyaVTHmzGFm_1KmK9GwQZ-juSS9uWFRb_TWhAYxbHSwMsdeRzyftO2RIIvpEzwqQUAeJxlp-uWeufUxUo8_oOEJVHIoN48p-LRvzBX2u8GraFb24TNMrSTQ5cMRP76s6lSFbnEZ0srJWZ7ceXKKTsfGSjPNZBaktc14DAeMTodnRObiiVjP34rIvDUdGZptExKBuIw7oB7N7vKBaRM1ywQA7MSNDdTUKdPfRaGZv7tTm'
        },
        {
            id: 'bizlang',
            title: 'BizLang',
            description: 'Created a jargon-learning chatbot that helps professionals practice industry-specific language. Piloted with 50+ beta users in hospitals and business settings, blending AI with practical, real-world learning.',
            tags: ['AI Chatbot', 'EdTech', 'Professional Learning'],
            category: 'Startup Projects',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYd2FA71Is5W08sE1roBr5ky1ZACz_HA7Tsb7gDa3KCf5DgqJ9f7fClEq8K2vEknQdGkgJqGAr--92Oh0bS1jYr8J9uVEn7mTxOrR4hJxWJEOaf1JiS94jBMW9Ui-eGTdol8qQyKWa6zV_5SfOP6WJx6jaEWzyNdWIyOQ6EV5Y0l0hiEXimTOeY38JR-5r5NkTZbui-X1GwsweJAWmzKck0ybt6oHw7IpGZxARmPWIF66tn3Ui-mqM6Wcto7JYQ-E_ovo3St6nj1sA'
        },
        // Community Building
        {
            id: 'productsc',
            title: 'ProductSC',
            description: 'Revitalized USC\'s product management club, growing membership from 5 to 200+. Designed three original curricula (Compass, Catalyst, and a Client Program) and created a thriving cross-school community for future product leaders.',
            tags: ['Community Leadership', 'Product Education', 'Growth'],
            category: 'Community Building',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYd2FA71Is5W08sE1roBr5ky1ZACz_HA7Tsb7gDa3KCf5DgqJ9f7fClEq8K2vEknQdGkgJqGAr--92Oh0bS1jYr8J9uVEn7mTxOrR4hJxWJEOaf1JiS94jBMW9Ui-eGTdol8qQyKWa6zV_5SfOP6WJx6jaEWzyNdWIyOQ6EV5Y0l0hiEXimTOeY38JR-5r5NkTZbui-X1GwsweJAWmzKck0ybt6oHw7IpGZxARmPWIF66tn3Ui-mqM6Wcto7JYQ-E_ovo3St6nj1sA'
        },
        {
            id: 'femo',
            title: 'Foreign English Mentorship Organization (FEMO)',
            description: 'Founded a nonprofit to connect international students with English-speaking mentors. Built a mentorship network that fostered cross-cultural exchange, confidence, and belonging.',
            tags: ['Nonprofit Founder', 'Mentorship', 'Cross-Cultural'],
            category: 'Community Building',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByB7daz99fOT-pg6984Bz5EH3NJYOWCiLxKyaVTHmzGFm_1KmK9GwQZ-juSS9uWFRb_TWhAYxbHSwMsdeRzyftO2RIIvpEzwqQUAeJxlp-uWeufUxUo8_oOEJVHIoN48p-LRvzBX2u8GraFb24TNMrSTQ5cMRP76s6lSFbnEZ0srJWZ7ceXKKTsfGSjPNZBaktc14DAeMTodnRObiiVjP34rIvDUdGZptExKBuIw7oB7N7vKBaRM1ywQA7MSNDdTUKdPfRaGZv7tTm'
        }
    ];
    
    const projectsGrid = document.getElementById('projects-grid');
    if (projectsGrid) {
        let currentCategory = '';
        let htmlContent = '';
        
        allProjectsData.forEach(project => {
            if (project.category !== currentCategory) {
                if (currentCategory !== '') {
                    htmlContent += '</div>';
                }
                currentCategory = project.category;
                htmlContent += `
                    <div class="category-section">
                        <h2 class="category-title text-2xl font-bold text-white mb-8 mt-12 first:mt-0">${currentCategory}</h2>
                        <div class="category-grid space-y-8">
                `;
            }
            
            htmlContent += `
                <div class="project-card-horizontal" data-project="${project.id}">
                    <div class="project-image-container">
                        <img src="${project.image}" alt="${project.title}" class="project-image-horizontal">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title-horizontal">${project.title}</h3>
                        <p class="project-description-horizontal">${project.description}</p>
                        <div class="project-tags-horizontal">
                            ${project.tags.map(tag => `<span class="project-tag-horizontal">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="project-particles"></div>
                </div>
            `;
        });
        
        if (currentCategory !== '') {
            htmlContent += '</div></div>';
        }
        
        projectsGrid.innerHTML = htmlContent;
        
        // Add hover effects with particles
        const projectCards = document.querySelectorAll('.project-card-horizontal');
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                createParticles(card);
            });
            
            card.addEventListener('click', () => {
                const projectId = card.dataset.project;
                showProjectModal(projectId);
            });
        });
    }
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
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Create confetti effect
            createConfetti(submitButton);
            
            // Simulate form submission
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                submitButton.textContent = 'Message Sent!';
                setTimeout(() => {
                    submitButton.textContent = 'Send a Message';
                    submitButton.disabled = false;
                    contactForm.reset();
                }, 2000);
            }, 1500);
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

// Add CSS keyframes for particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
        }
        100% {
            transform: translateY(-20px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
