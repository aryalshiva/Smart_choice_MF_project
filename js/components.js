document.addEventListener('DOMContentLoaded', function() {
    const components = [
        { id: 'navbar-component', file: 'navbar.html' },
        { id: 'home-component', file: 'home.html' },
        { id: 'information-component', file: 'information.html' },
        { id: 'about-component', file: 'about.html' },
        { id: 'services-component', file: 'services.html' },
        { id: 'plans-component', file: 'plans.html' },
        { id: 'work-component', file: 'work.html' },
        // { id: 'testimonials-component', file: 'testimonials.html' },
        { id: 'newsletter-component', file: 'newsletter.html' },
        { id: 'contact-component', file: 'contact.html' },
        { id: 'location-component', file: 'location.html' },
        { id: 'footer-component', file: 'footer.html' },
        { id: 'bottom-component', file: 'bottom.html' },
        { id: 'nav_logo-component', file: 'logo_navbar.html' },

        { id: 'page-navbar-component', file: 'page_navbar.html' },
        { id: 'page-footer-component', file: 'page_footer.html' },

        { id: 'banking_partners-component', file: 'banking_partners.html' },

        { id: 'useful-tools-component', file: 'useful_tools.html' },

        { id: 'question-answer-component', file: 'question_answer.html' },

        { id: 'card-component', file: 'card_design.html' },

        { id: 'pop-component', file: 'popup.html' },

        { id: 'review-buttons-component', file: 'review_buttons.html' },
    ];

    components.forEach(component => {
        fetch(`./components/${component.file}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                document.getElementById(component.id).innerHTML = html;
            })
            .catch(error => {
                console.error(`Error loading ${component.file}:`, error);
                document.getElementById(component.id).innerHTML = `<p>Error loading component: ${component.file}</p>`;
            });
    });
});
