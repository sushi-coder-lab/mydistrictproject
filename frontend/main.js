const API_URL = 'http://localhost:5000/api';

// State
let currentLanguage = 'en';
let currentFilters = {
    type: '',
    stream: '',
    location: '',
    search: ''
};

// Pagination State
let allInstitutions = [];
let visibleCount = 6;
const PAGE_SIZE = 6;

const translations = {
    en: {
        nav_subtitle: "District Education Directory",
        nav_institutions: "Institutions",
        nav_updates: "Updates",
        nav_about: "About",
        nav_contact: "Contact",
        nav_signin: "Sign In",
        nav_getstarted: "Sign Up",
        hero_title: "Find Your Future in Dantewada",
        hero_subtitle: "Your comprehensive guide to every school, college, and ITI in the district.",
        search_placeholder: "Search by name, subject, or course...",
        search_btn: "Find Institutions",
        ads_title: "Featured Opportunities",
        ads_subtitle: "Scholarships, Coaching & Educational Ads",
        nav_ads: "Opportunities",
        updates_title: "Latest News & Updates",
        institutions_title: "Explore Institutions",
        filter_all: "All",
        filter_schools: "Schools",
        filter_colleges: "Colleges",
        select_stream: "All Streams",
        stream_science: "Science",
        stream_commerce: "Commerce",
        stream_arts: "Arts",
        stream_iti: "ITI",
        select_location: "All Locations",
        loc_dantewada: "Dantewada",
        loc_geedam: "Geedam",
        loc_katekalyan: "Katekalyan",
        loc_kuakonda: "Kuakonda",
        loc_kirandul: "Kirandul",
        loc_bacheli: "Bacheli",
        loc_barsoor: "Barsoor",
        stream_engineering: "Engineering",
        stream_medical: "Medical",
        stream_general: "General Education",
        clear_filters: "Clear All",
        footer_title: "Dantewada Edu",
        footer_about: "Empowering students and parents with transparent information about educational opportunities in the district.",
        footer_contact: "Contact Us",
        footer_email: "Email",
        footer_phone: "Phone",
        footer_rights: "© 2026 District Education Directory, Dantewada. All rights reserved.",
        loading: "Loading institutions...",
        error: "Failed to load institutions. Please try again later.",
        no_results: "No institutions found matching your criteria.",
        view_on_map: "View on Map",
        loc_label: "Location",
        streams_label: "Streams Available",
        subjects_label: "Key Subjects",
        facilities_label: "Facilities",
        contact_label: "Contact Details",
        admission_label: "Admission Process",
        signup_title: "Create Your Account",
        signup_subtitle: "Connect with Dantewada's educational resources",
        label_name: "Full Name",
        label_username: "Username",
        label_email: "Email Address",
        label_password: "Password",
        btn_signup: "Sign Up Now",
        auth_redirect_login: "Already have an account? Login here",
        login_title: "Welcome Back",
        login_subtitle: "Log in to your account",
        btn_login: "Log In",
        auth_redirect_signup: "Don't have an account? Sign up here",
        nav_logout: "Logout",
        welcome_user: "Welcome, "
    },
    hi: {
        nav_subtitle: "जिला शिक्षा निर्देशिका",
        nav_institutions: "संस्थान",
        nav_updates: "अपडेट",
        nav_about: "हमारे बारे में",
        nav_contact: "संपर्क",
        nav_signin: "साइन इन",
        nav_getstarted: "साइन अप",
        hero_title: "दंतेवाड़ा में अपना भविष्य खोजें",
        hero_subtitle: "जिले के हर स्कूल, कॉलेज और आईटीआई के लिए आपकी व्यापक मार्गदर्शिका।",
        search_placeholder: "नाम, विषय या पाठ्यक्रम द्वारा खोजें...",
        search_btn: "संस्थान खोजें",
        ads_title: "प्रस्तुत अवसर",
        ads_subtitle: "छात्रवृत्ति, कोचिंग और शैक्षिक विज्ञापन",
        nav_ads: "अवसर",
        updates_title: "नवीनतम समाचार और अपडेट",
        institutions_title: "संस्थानों का अन्वेषण करें",
        filter_all: "सभी",
        filter_schools: "स्कूल",
        filter_colleges: "कॉलेज",
        select_stream: "सभी संकाय",
        stream_science: "विज्ञान",
        stream_commerce: "वाणिज्य",
        stream_arts: "कला",
        stream_iti: "आईटीआई",
        select_location: "सभी स्थान",
        loc_dantewada: "दंतेवाड़ा",
        loc_geedam: "गीदम",
        loc_katekalyan: "कटेकल्याण",
        loc_kuakonda: "कुआकोंडा",
        loc_kirandul: "किरंदुल",
        loc_bacheli: "बचेली",
        loc_barsoor: "बारसूर",
        stream_engineering: "इंजीनियरिंग",
        stream_medical: "मेडिकल",
        stream_general: "सामान्य शिक्षा",
        clear_filters: "सब साफ़ करें",
        footer_title: "दंतेवाड़ा एडु",
        footer_about: "जिले में शैक्षिक अवसरों के बारे में पारदर्शी जानकारी के साथ छात्रों और अभिभावकों को सशक्त बनाना।",
        footer_contact: "संपर्क करें",
        footer_email: "ईमेल",
        footer_phone: "फोन",
        footer_rights: "© 2026 जिला शिक्षा निर्देशिका, दंतेवाड़ा। सर्वाधिकार सुरक्षित।",
        loading: "संस्थान लोड हो रहे हैं...",
        error: "संस्थान लोड करने में विफल। कृपया बाद में पुनः प्रयास करें।",
        no_results: "आपकी कसौटी से मेल खाने वाला कोई संस्थान नहीं मिला।",
        view_on_map: "मानचित्र पर देखें",
        loc_label: "स्थान",
        streams_label: "उपलब्ध संकाय",
        subjects_label: "मुख्य विषय",
        facilities_label: "सुविधाएं",
        contact_label: "संपर्क विवरण",
        admission_label: "प्रवेश प्रक्रिया",
        signup_title: "अपना खाता बनाएं",
        signup_subtitle: "दंतेवाड़ा के शैक्षणिक संसाधनों से जुड़ें",
        label_name: "पूरा नाम",
        label_username: "उपयोगकर्ता नाम",
        label_email: "ईमेल पता",
        label_password: "पासवर्ड",
        btn_signup: "अभी साइन अप करें",
        auth_redirect_login: "पहले से ही एक खाता है? यहां लॉग इन करें",
        login_title: "स्वागत है",
        login_subtitle: "अपने खाते में लॉग इन करें",
        btn_login: "लॉग इन करें",
        auth_redirect_signup: "खाता नहीं है? यहां साइन अप करें",
        nav_logout: "लॉगआउट",
        welcome_user: "स्वागत है, "
    }
};

// DOM Elements
const institutionsGrid = document.getElementById('institutions-grid');
const updatesContainer = document.getElementById('updates-container');
const searchInput = document.getElementById('main-search');
const searchBtn = document.getElementById('search-btn');
const typeButtons = document.querySelectorAll('.filter-btn[data-type]');
const streamFilter = document.getElementById('stream-filter');
const locationFilter = document.getElementById('location-filter');
const modal = document.getElementById('detail-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const languageSelect = document.getElementById('language-select');
const adsContainer = document.getElementById('ads-container');

// Background Slider
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length === 0) return;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// Language Switching
function setLanguage(lang) {
    currentLanguage = lang;
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            // Keep HTML structure for logo title
            if (key === 'nav_title_main') {
                el.innerHTML = translations[lang][key];
            } else {
                el.textContent = translations[lang][key];
            }
        }
    });

    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });

    // Handle branding specifically if needed (e.g. logo title DantewadaEdu)
    const logoTitle = document.querySelector('.logo-title');
    if (logoTitle) {
        logoTitle.innerHTML = lang === 'hi' ? 'दंतेवाड़ा<span>एडु</span>' : 'Dantewada<span>Edu</span>';
    }

    // Re-fetch or re-render if needed (though data is static Hindi for now)
    fetchInstitutions();
    fetchUpdates();
    fetchAds();
    updateAuthUI(); // Update auth UI after language change
}

// Update UI based on auth state
function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authGroup = document.querySelector('.auth-group');

    if (authGroup) {
        if (user) {
            authGroup.innerHTML = `
                <span class="welcome-text">${translations[currentLanguage].welcome_user}${user.name}</span>
                <button id="logout-btn" class="signin-link" style="border:none; cursor:pointer;">${translations[currentLanguage].nav_logout}</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('user');
                window.location.reload();
            });
        } else {
            authGroup.innerHTML = `
                <a href="login.html" class="signin-link" data-i18n="nav_signin">${translations[currentLanguage].nav_signin}</a>
                <a href="signup.html" class="btn btn-primary" data-i18n="nav_getstarted">${translations[currentLanguage].nav_getstarted}</a>
            `;
        }
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLanguage); // Initialize language based on currentLanguage state
    fetchInstitutions();
    fetchUpdates();
    fetchAds();
    initSlider();
    initMobileMenu();
    updateAuthUI(); // Call this on initial load

    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
});

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-links');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }
}

// Fetching Data
async function fetchInstitutions() {
    if (!institutionsGrid) return;
    institutionsGrid.innerHTML = `<div class="loading">${translations[currentLanguage].loading}</div>`;

    const params = new URLSearchParams(currentFilters);
    try {
        const response = await fetch(`${API_URL}/institutions?${params}`);
        const data = await response.json();
        renderInstitutions(data);

        // Scroll to results if searching
        if (currentFilters.search) {
            const instSection = document.getElementById('institutions');
            if (instSection) instSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error fetching institutions:', error);
        institutionsGrid.innerHTML = `<div class="error">${translations[currentLanguage].error}</div>`;
    }
}

async function fetchUpdates() {
    if (!updatesContainer) return;
    try {
        const response = await fetch(`${API_URL}/updates`);
        const data = await response.json();
        renderUpdates(data);
    } catch (error) {
        console.error('Error fetching updates:', error);
    }
}

async function fetchAds() {
    if (!adsContainer) return;
    try {
        const response = await fetch(`${API_URL}/ads`);
        const data = await response.json();
        renderAds(data);
    } catch (error) {
        console.error('Error fetching ads:', error);
    }
}

// Rendering
function renderAds(ads) {
    if (!adsContainer) return;
    if (ads.length === 0) {
        adsContainer.style.display = 'none';
        return;
    }
    adsContainer.style.display = 'grid';
    adsContainer.innerHTML = ads.map(ad => {
        const title = currentLanguage === 'en' ? ad.title_en : ad.title;
        const content = currentLanguage === 'en' ? ad.content_en : ad.content;
        return `
            <div class="ad-card">
                <div class="ad-image" style="background-image: url('${ad.image_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'}')"></div>
                <div class="ad-content">
                    <h3 class="ad-title">${title}</h3>
                    <p class="ad-text">${content}</p>
                    <a href="${ad.link || '#'}" target="_blank" class="ad-link">Learn More</a>
                </div>
            </div>
        `;
    }).join('');
}
function renderInstitutions(institutions) {
    if (!institutionsGrid) return;

    // Store all institutions & reset visible count on new fetch
    allInstitutions = institutions;
    visibleCount = PAGE_SIZE;

    renderVisibleCards();
}

function buildCard(inst) {
    const name = currentLanguage === 'en' ? inst.name_en : inst.name;
    const type = currentLanguage === 'en' ? inst.type_en : inst.type;
    const location = currentLanguage === 'en' ? inst.location_en : inst.location;
    const streams = currentLanguage === 'en' ? inst.streams_en : inst.streams;
    return `
        <div class="card" onclick="showDetails(${inst.id})">
            <div class="card-image" style="background-image: url('${inst.image_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800'}')"></div>
            <div class="card-content">
                <span class="card-tag">${type}</span>
                <h3 class="card-title">${name}</h3>
                <div class="card-info">📍 ${location}</div>
                <div class="card-info">📖 ${streams || 'Various Streams'}</div>
            </div>
        </div>
    `;
}

function renderVisibleCards() {
    if (!institutionsGrid) return;

    if (allInstitutions.length === 0) {
        institutionsGrid.innerHTML = `<div class="no-results">${translations[currentLanguage].no_results}</div>`;
        // Remove load more if exists
        const old = document.getElementById('load-more-wrapper');
        if (old) old.remove();
        return;
    }

    const toShow = allInstitutions.slice(0, visibleCount);
    institutionsGrid.innerHTML = toShow.map(buildCard).join('');

    // Remove old load-more wrapper
    const old = document.getElementById('load-more-wrapper');
    if (old) old.remove();

    // Add Load More button if more institutions remain
    if (visibleCount < allInstitutions.length) {
        const remaining = allInstitutions.length - visibleCount;
        const wrapper = document.createElement('div');
        wrapper.id = 'load-more-wrapper';
        wrapper.style.cssText = 'grid-column: 1/-1; display:flex; flex-direction:column; align-items:center; gap:0.75rem; padding: 1.5rem 0 0.5rem;';
        wrapper.innerHTML = `
            <p style="font-size:0.9rem; color:#64748b; font-weight:500;">
                Showing <strong style="color:#2563eb">${toShow.length}</strong> of <strong>${allInstitutions.length}</strong> institutions
            </p>
            <button id="load-more-btn" onclick="loadMore()" style="
                background: linear-gradient(135deg, #2563eb, #4f46e5);
                color: white;
                border: none;
                border-radius: 50px;
                padding: 0.8rem 2.5rem;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.6rem;
                box-shadow: 0 6px 20px rgba(37,99,235,0.3);
                transition: all 0.3s ease;
                font-family: inherit;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 28px rgba(37,99,235,0.4)'"
               onmouseout="this.style.transform='none'; this.style.boxShadow='0 6px 20px rgba(37,99,235,0.3)'">
                ➕ Load More (${remaining} baki hain)
            </button>
        `;
        institutionsGrid.appendChild(wrapper);
    } else if (allInstitutions.length > PAGE_SIZE) {
        // All shown — show a completed message
        const wrapper = document.createElement('div');
        wrapper.id = 'load-more-wrapper';
        wrapper.style.cssText = 'grid-column: 1/-1; text-align:center; padding: 1rem 0; color:#22c55e; font-weight:600; font-size:0.95rem;';
        wrapper.textContent = `✅ Saare ${allInstitutions.length} institutions dikh rahe hain!`;
        institutionsGrid.appendChild(wrapper);
    }
}

function loadMore() {
    visibleCount += PAGE_SIZE;
    renderVisibleCards();
    // Smooth scroll to newly appeared cards
    const btn = document.getElementById('load-more-wrapper');
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderUpdates(updates) {
    if (!updatesContainer) return;
    updatesContainer.innerHTML = updates.map(update => {
        const title = currentLanguage === 'en' ? update.title_en : update.title;
        const content = currentLanguage === 'en' ? update.content_en : update.content;

        let label = 'NEW UPDATE';
        if (title.toUpperCase().includes('ADMISSION') || title.includes('प्रवेश')) label = 'ADMISSION ALERT';
        if (title.toUpperCase().includes('NAVGURUKUL') || title.includes('नवगुरुकुल')) label = 'NAVGURUKUL ALERT';
        if (title.toUpperCase().includes('MEDICAL') || title.includes('मेडिकल')) label = 'MEDICAL NEWS';

        return `
            <div class="card" style="padding: 1.5rem; border-left: 4px solid var(--primary);">
                <div class="card-tag" style="background: #eff6ff;">${label}</div>
                <h3 style="margin: 0.5rem 0; font-size: 1.25rem;">${title}</h3>
                <p style="font-size: 0.95rem; color: var(--text-dark); opacity: 0.8;">${content}</p>
                <div style="font-size: 0.8rem; margin-top: 1rem; color: var(--primary); font-weight: 600;">
                    ${new Date(update.date).toLocaleDateString()}
                </div>
            </div>
        `;
    }).join('');
}

async function showDetails(id) {
    try {
        const response = await fetch(`${API_URL}/institutions/${id}`);
        const inst = await response.json();
        const t = translations[currentLanguage];

        const name = currentLanguage === 'en' ? inst.name_en : inst.name;
        const type = currentLanguage === 'en' ? inst.type_en : inst.type;
        const location = currentLanguage === 'en' ? inst.location_en : inst.location;
        const streams = currentLanguage === 'en' ? inst.streams_en : inst.streams;
        const subjects = currentLanguage === 'en' ? inst.subjects_en : inst.subjects;
        const facilities = currentLanguage === 'en' ? inst.facilities_en : inst.facilities;
        const contact = currentLanguage === 'en' ? inst.contact_details_en : inst.contact_details;
        const admission = currentLanguage === 'en' ? inst.admission_process_en : inst.admission_process;

        modalBody.innerHTML = `
            <div style="background-image: url('${inst.image_url}'); height: 300px; background-size: cover; background-position: center; border-radius: 1rem; margin-bottom: 2rem;"></div>
            <span class="card-tag">${type}</span>
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${name}</h1>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <h3>📍 ${t.loc_label}</h3>
                    <p>${location}</p>
                    <h3 style="margin-top: 1rem;">🎓 ${t.streams_label}</h3>
                    <p>${streams}</p>
                    <h3 style="margin-top: 1rem;">📚 ${t.subjects_label}</h3>
                    <ul class="subjects-list">
                        ${subjects.split(/[।,]\s+/).filter(s => s.trim()).map(s => `<li>${s.trim()}</li>`).join('')}
                    </ul>
                </div>
                <div>
                    <h3>🏢 ${t.facilities_label}</h3>
                    <p>${facilities}</p>
                    <h3 style="margin-top: 1rem;">📞 ${t.contact_label}</h3>
                    <p>${contact}</p>
                </div>
            </div>
            <h3>📝 ${t.admission_label}</h3>
            <p style="margin-bottom: 2rem;">${admission}</p>
            <a href="${inst.map_location}" target="_blank" class="filter-btn active" style="text-decoration: none; display: inline-block;">${t.view_on_map}</a>
        `;
        if (modal) modal.style.display = 'flex';
    } catch (error) {
        console.error('Error fetching details:', error);
    }
}

// Event Listeners
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        currentFilters.search = searchInput.value;
        fetchInstitutions();
    });
}

if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentFilters.search = searchInput.value;
            fetchInstitutions();
        }
    });
}

typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilters.type = btn.dataset.type;
        fetchInstitutions();
    });
});

if (streamFilter) {
    streamFilter.addEventListener('change', () => {
        currentFilters.stream = streamFilter.value;
        fetchInstitutions();
    });
}

if (locationFilter) {
    locationFilter.addEventListener('change', () => {
        currentFilters.location = locationFilter.value;
        fetchInstitutions();
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });
}

const clearFiltersBtn = document.getElementById('clear-filters');
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        currentFilters = {
            type: '',
            stream: '',
            location: '',
            search: ''
        };

        // Update UI
        if (searchInput) searchInput.value = '';
        if (streamFilter) streamFilter.value = '';
        if (locationFilter) locationFilter.value = '';
        typeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === '') btn.classList.add('active');
        });

        fetchInstitutions();
    });
}
