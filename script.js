document.addEventListener('DOMContentLoaded', () => {
    // Copy Email to Clipboard
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = 'alexandr.pi.art@gmail.com'; 
            navigator.clipboard.writeText(email).then(() => {
                const originalText = contactBtn.innerText;
                contactBtn.innerText = 'Email Copied!';
                setTimeout(() => {
                    contactBtn.innerText = originalText;
                }, 2000);
            });
        });
    }

    // Lightbox Logic
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".lightbox-close");
    const galleryImages = document.querySelectorAll(".gallery-img");

    galleryImages.forEach(img => {
        img.addEventListener("click", function() {
            lightbox.style.display = "flex";
            lightboxImg.src = this.src;
        });
    });

    closeBtn.addEventListener("click", function() {
        lightbox.style.display = "none";
    });

    lightbox.addEventListener("click", function(e) {
        if (e.target === lightbox || e.target === lightboxImg) {
            lightbox.style.display = "none";
        }
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && lightbox.style.display === "flex") {
            lightbox.style.display = "none";
        }
    });
});
