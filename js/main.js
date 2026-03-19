// Google Sheets Web App URL - REPLACE WITH YOUR URL AFTER DEPLOYMENT
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwkWgxWibHRL6tC-iIApGPNJiKOWyBynoCogMLpSV6Wq0_ChylfOhYcb4S_oGX03YnZfg/exec';

// Your WhatsApp Number (with country code, no + or spaces)
const WHATSAPP_NUMBER = '917050426046';

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Setup exit popup
    setupExitPopup();

    // Setup contact form handler
    setupContactForm();

    // Smooth scrolling
    setupSmoothScrolling();

    // Initialize all WhatsApp links with proper number
    setupWhatsAppLinks();
});

// Setup all WhatsApp links with correct number and pre-filled message
function setupWhatsAppLinks() {
    const defaultMessage = encodeURIComponent(
        'Hi Vishal, I need help recovering my lost shares. Can you please assist?'
    );
    
    // Update all WhatsApp links
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href.includes('?')) {
            link.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}?text=${defaultMessage}`);
        } else {
            link.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}`);
        }
    });
}

// Exit Intent Popup Logic
function setupExitPopup() {
    const popup = document.getElementById('exitPopup');
    if (!popup) return;

    let popupShown = false;

    // Show on exit intent (mouse leaves the page)
    document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 0 && !popupShown) {
            popup.style.display = 'flex';
            popupShown = true;
        }
    });

    // Show after 20 seconds as fallback
    setTimeout(function() {
        if (!popupShown) {
            popup.style.display = 'flex';
            popupShown = true;
        }
    }, 20000);

    // Show after scrolling 50%
    window.addEventListener('scroll', function() {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > 50 && !popupShown) {
            popup.style.display = 'flex';
            popupShown = true;
        }
    });

    // Close popup when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
}

// Close popup function
function closePopup() {
    const popup = document.getElementById('exitPopup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Handle popup form submission with large message field
async function submitPopupForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // Get form values (including the new textarea)
    const formData = {
        name: form.querySelector('input[type="text"]').value.trim(),
        phone: form.querySelector('input[type="tel"]').value.trim(),
        email: form.querySelector('input[type="email"]').value.trim(),
        queryType: form.querySelector('select').value,
        message: form.querySelector('textarea').value.trim(), // New large message field
        source: 'Exit Popup',
        timestamp: new Date().toISOString()
    };

    // Validate required fields
    if (!formData.name || !formData.phone) {
        alert('Please fill in your name and phone number');
        return;
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
        // Send to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        // Show success message
        alert('Thank you! We will contact you within 24 hours.');
        
        // Create WhatsApp deep link with the query details
        const whatsappMessage = encodeURIComponent(
            `*New Lead Received*\n\n` +
            `*Name:* ${formData.name}\n` +
            `*Phone:* ${formData.phone}\n` +
            `*Email:* ${formData.email || 'Not provided'}\n` +
            `*Query Type:* ${formData.queryType || 'Not specified'}\n` +
            `*Message:* ${formData.message || 'No message provided'}`
        );
        
        // Optional: Open WhatsApp with the lead details (for quick follow-up)
        // window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`, '_blank');
        
        // Close popup and reset form
        closePopup();
        form.reset();
        
    } catch (error) {
        console.error('Error:', error);
        alert('Thank you! We received your request. We will contact you soon.');
        closePopup();
        form.reset();
        
    } finally {
        // Reset button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

// Handle contact page form with large message field
function setupContactForm() {
    const contactForm = document.querySelector('.contact-form-side form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: this.querySelector('input[placeholder*="Name"]')?.value || '',
            phone: this.querySelector('input[type="tel"]')?.value || '',
            email: this.querySelector('input[type="email"]')?.value || '',
            queryType: this.querySelector('select')?.value || 'Contact Form',
            message: this.querySelector('textarea')?.value || '', // Large message field
            source: 'Contact Page',
            timestamp: new Date().toISOString()
        };

        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            alert('Thank you! We will contact you soon.');
            this.reset();
            
        } catch (error) {
            alert('Thank you! Your message was sent.');
            this.reset();
            
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Make functions available globally
window.closePopup = closePopup;
window.submitPopupForm = submitPopupForm;