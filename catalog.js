/* Takuto+ content: titles, profiles, Race Day, sample reviews */
(() => {
    "use strict";

    const TakutoCatalog = {
        titles: {
            hbo: {
                name: "HBO Max",
                org: "Warner Bros. Discovery",
                role: "Product Manager",
                dates: "Aug 2025 – Present",
                logo: "images/hbo-max-logo.webp",
                accent: "#8b7cf7",
                pitch: "Helping kids and teens find what to watch next on HBO Max.",
                desc: "I lead discovery and age-appropriate experiences for kids and teens on HBO Max. That means turning viewing data into product bets, partnering with legal on age rules around the world, and running experiments with 12M+ users.",
                tags: ["Personalization", "Kids & Family", "Streaming"],
                episodes: [
                    { title: "Search-to-discovery for kids", metric: "+5.4% minutes watched, +12% novel plays" },
                    { title: "Opening 4,000+ unrated titles to teens", metric: "Rules + LLM classifier with human review: +3% hours watched" },
                    { title: "A 4-tier age model for the world", metric: "186 genre tags mapped to COPPA, BBFC, ClassInd, ACB, and GCC" },
                    { title: "The teen rail", metric: "Co-led launch: +17% projected lift" },
                    { title: "Experiments at scale", metric: "5 A/B tests across 12M+ users" },
                    { title: "Going global", metric: "Kids & Family UAT across 11 new international markets" },
                ],
                horse: { name: "Max Discovery", form: "12M+ users · 5 A/B tests · 11 markets" },
            },
            kroot: {
                name: "Kroot",
                org: "krootme.com",
                role: "Founder",
                dates: "Feb 2026 – Present",
                logo: "images/kroot-logo.png",
                accent: "#7bc47f",
                pitch: "A student recruiting OS: a free job board plus a CRM that tracks applications from Gmail.",
                desc: "Kroot helps students run their job search like a pipeline. A free job board brings them in, and a CRM reads their Gmail to move each application to the right stage automatically. Next up: selling to schools to activate whole campuses.",
                tags: ["Founder", "AI", "0 → 1"],
                episodes: [
                    { title: "A recruiting OS for students", metric: "Free job board + CRM that auto-tracks applications via Gmail" },
                    { title: "Teaching email to read itself", metric: "Email-to-stage ML model trained on 3,000+ recruiting signals" },
                    { title: "Trust from day one", metric: "SOC 2 Type I; 300+ visitors in 20 days" },
                    { title: "Whole campuses", metric: "B2B model selling to schools, with employer integrations next" },
                ],
                horse: { name: "Kroot Force", form: "3,000+ signals · SOC 2 · 20 days" },
            },
            productsc: {
                name: "ProductSC",
                org: "USC",
                role: "President",
                dates: "Sep 2023 – Dec 2025",
                logo: "images/ProductSC-logo-website.png",
                accent: "#ff9e64",
                pitch: "Grew USC's product club from 5 to 200+ members.",
                desc: "I rebuilt ProductSC around three PM curricula, each for a different stage: Compass, Catalyst, and Client. That gave students a path from first curiosity to real client work, and gave partners a reason to show up.",
                tags: ["Community", "Curriculum", "Leadership"],
                episodes: [
                    { title: "From 5 to 200+", metric: "Grew membership 40×" },
                    { title: "Compass, Catalyst, Client", metric: "Three PM curricula for three stages of a PM career" },
                    { title: "Partners who showed up", metric: "MRSO certified (1 of 16 clubs); Amazon, Disney, Riot Games in half a year" },
                ],
                horse: { name: "Fight On Product", form: "5 → 200+ members · 3 curricula · 1 of 16" },
            },
            hearst: {
                name: "Hearst",
                org: "HomeCare HomeBase",
                role: "Associate Product Manager",
                dates: "Jun – Sep 2024",
                logo: "images/hearst-logo.jpg",
                accent: "#f7768e",
                pitch: "Pricing, AI scheduling, and a comic fan app pitch across two Hearst businesses.",
                desc: "At HomeCare HomeBase I turned client usage data into a pricing and ROI model, and turned hospice agencies' scheduling pain into requirements for an AI feature. On the side, I pitched a comic fan app to bring readers back.",
                tags: ["B2B SaaS", "Pricing", "Media"],
                episodes: [
                    { title: "Pricing that closed a deal", metric: "Tableau pricing + ROI model supporting a $9M deal" },
                    { title: "Scheduling, rethought with AI", metric: "Requirements from the top 10 hospice agency clients" },
                    { title: "Bringing comic readers back", metric: "Pitched a comic fan app; owned the concept and business case" },
                ],
                horse: { name: "Front Page Fury", form: "$9M deal · Top 10 clients · 1 pitch" },
            },
            femo: {
                name: "FEMO",
                org: "Foreign English Mentorship Organization",
                role: "Founder & Program Manager",
                dates: "Aug 2020 – May 2024",
                logo: "images/femo-logo.png",
                accent: "#5eead4",
                pitch: "English mentorship for students heading abroad, across 20 universities.",
                desc: "I founded FEMO to pair students preparing to study abroad with English-speaking mentors. It grew into a program across 4 countries, run by 400+ volunteers and 24 staff.",
                tags: ["Nonprofit", "Mentorship", "Cross-cultural"],
                episodes: [
                    { title: "Across borders", metric: "20 universities in 4 countries" },
                    { title: "Run by volunteers", metric: "400+ volunteers and 24 staff" },
                    { title: "Tobitate! scholars", metric: "Supported 200+ scholars from Japan's Ministry of Foreign Affairs" },
                ],
                horse: { name: "Mentor Express", form: "20 universities · 4 countries · 400+ volunteers" },
            },
            bizlang: {
                name: "Bizlang",
                org: "Buildspace S5",
                role: "Co-founder",
                dates: "Aug 2023 – Aug 2024",
                logo: "images/bizlang-website-logo.png",
                accent: "#e0af68",
                pitch: "An AI tool that teaches workplace jargon to non-native English speakers.",
                desc: "Bizlang helps non-native speakers decode the jargon that fills meetings and Slack threads. I led 3 engineers from idea to launch through Buildspace S5.",
                tags: ["AI", "Language", "Buildspace"],
                episodes: [
                    { title: "Decoding workplace jargon", metric: "AI tool for non-native English speakers" },
                    { title: "Idea to launch", metric: "Led 3 engineers; 150+ users" },
                ],
                horse: { name: "Jargon Buster", form: "150+ users · 3 engineers · S5" },
            },
        },

        profiles: {
            recruiter: {
                label: "Recruiter",
                blurb: "Impact first",
                icon: "💼",
                accent: "#8b7cf7",
                featured: "hbo",
                rows: [
                    { title: "Top picks for Recruiters", items: ["hbo", "kroot", "hearst"] },
                    { title: "By the numbers", items: ["productsc", "femo", "bizlang"] },
                ],
                match: { hbo: 98, kroot: 95, hearst: 92, productsc: 90, femo: 86, bizlang: 84 },
            },
            founder: {
                label: "Founder",
                blurb: "0 → 1 work",
                icon: "🚀",
                accent: "#7bc47f",
                featured: "kroot",
                rows: [
                    { title: "0 → 1 Originals", items: ["kroot", "bizlang", "femo"] },
                    { title: "Built at scale", items: ["hbo", "hearst", "productsc"] },
                ],
                match: { kroot: 99, bizlang: 94, femo: 90, hbo: 88, hearst: 85, productsc: 83 },
            },
            community: {
                label: "Community",
                blurb: "People and programs",
                icon: "🤝",
                accent: "#ff9e64",
                featured: "productsc",
                rows: [
                    { title: "Community Favorites", items: ["productsc", "femo", "kroot"] },
                    { title: "Where it led", items: ["hbo", "hearst", "bizlang"] },
                ],
                match: { productsc: 99, femo: 97, kroot: 92, bizlang: 88, hbo: 85, hearst: 82 },
            },
            curious: {
                label: "Just curious",
                blurb: "The fun side",
                icon: "✨",
                accent: "#5eead4",
                featured: "race",
                rows: [
                    { title: "Start here", items: ["femo", "kroot", "hbo"] },
                    { title: "More from Takuto", items: ["productsc", "bizlang", "hearst"] },
                ],
                match: { femo: 96, kroot: 94, hbo: 93, productsc: 91, bizlang: 89, hearst: 87 },
            },
        },

        race: {
            accent: "#ff9e64",
            pitch: "Six projects. One track. Pick the one you'd back and watch it run.",
            intro: "I once built a horse-racing AR lens at Snap. Now my projects race too: pick the one you'd back, and the winner gets the spotlight.",
        },

        sampleReviews: [
            { name: "Takuto", location: "Los Angeles", note: "Be the first to leave a review. I read every one." },
            { name: "Takuto", location: "Tokyo → LA", note: "Tell me where you're from. I collect places." },
            { name: "Takuto", location: "Santa Anita Park", note: "Which horse did you pick? Let me know below." },
        ],
    };

    if (typeof window !== "undefined") window.TakutoCatalog = TakutoCatalog;
    else module.exports = TakutoCatalog;
})();
