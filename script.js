document.addEventListener('DOMContentLoaded', () => {
    // Copy Email to Clipboard
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
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

    // Lightbox Logic with Conditional Gallery Navigation
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".lightbox-close");
    const galleryImages = Array.from(document.querySelectorAll(".gallery-img"));
    const isArticle = document.querySelector('.project-header') !== null;
    let currentImageIndex = 0;

    if (lightbox && lightboxImg && galleryImages.length > 0) {
        if (isArticle) {
            // Create navigation arrows dynamically
            let prevBtn = document.createElement('div');
            prevBtn.className = 'lightbox-nav lightbox-prev';
            prevBtn.innerHTML = '&#10094;';
            lightbox.appendChild(prevBtn);

            let nextBtn = document.createElement('div');
            nextBtn.className = 'lightbox-nav lightbox-next';
            nextBtn.innerHTML = '&#10095;';
            lightbox.appendChild(nextBtn);

            function showImage(index) {
                if (index < 0) index = galleryImages.length - 1;
                if (index >= galleryImages.length) index = 0;
                currentImageIndex = index;
                lightboxImg.src = galleryImages[currentImageIndex].src;
            }

            galleryImages.forEach((img, index) => {
                img.style.cursor = "zoom-in";
                img.addEventListener("click", function() {
                    lightbox.style.display = "flex";
                    showImage(index);
                });
            });

            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(currentImageIndex - 1);
            });

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(currentImageIndex + 1);
            });

            document.addEventListener("keydown", function(e) {
                if (lightbox.style.display === "flex") {
                    if (e.key === "Escape") lightbox.style.display = "none";
                    if (e.key === "ArrowLeft") showImage(currentImageIndex - 1);
                    if (e.key === "ArrowRight") showImage(currentImageIndex + 1);
                }
            });
        } else {
            // Standard Lightbox without Gallery Navigation
            galleryImages.forEach(img => {
                img.style.cursor = "zoom-in";
                img.addEventListener("click", function() {
                    lightbox.style.display = "flex";
                    lightboxImg.src = this.src;
                });
            });

            document.addEventListener("keydown", function(e) {
                if (lightbox.style.display === "flex" && e.key === "Escape") {
                    lightbox.style.display = "none";
                }
            });
        }

        // Shared Close Logic
        closeBtn.addEventListener("click", function() {
            lightbox.style.display = "none";
        });

        lightbox.addEventListener("click", function(e) {
            if (e.target === lightbox || e.target === lightboxImg) {
                lightbox.style.display = "none";
            }
        });
    }

    // Animated Dead Space Poster Logic
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deadSpaceImage = document.getElementById("dead-space-animated-poster");
    const deadSpaceCard = document.getElementById("dead-space-card");

    if (deadSpaceImage && deadSpaceCard) {
        const frames = {
            idle: "posters/animated/DS/1.png",
            hover: "posters/animated/DS/2.png",
            dim: "posters/animated/DS/3.png",
            dark: "posters/animated/DS/4.png"
        };

        let isHover = false;
        let timeoutId = null;

        function setFrame(frame, opacity = 1, smooth = false) {
            deadSpaceImage.style.transition = smooth ? "opacity 90ms ease-out, filter 0.3s ease" : "opacity 20ms linear, filter 0.3s ease";
            deadSpaceImage.src = frames[frame];
            deadSpaceImage.style.opacity = opacity;
        }

        function random(min, max) {
            return Math.random() * (max - min) + min;
        }

        function scheduleNextFlicker() {
            if (isHover || prefersReducedMotion) return;
            const delay = random(1200, 2500);
            timeoutId = setTimeout(() => {
                if (!isHover) playRandomFlicker();
            }, delay);
        }

        function playSequence(sequence, index = 0) {
            if (isHover) return;

            if (index >= sequence.length) {
                setFrame("idle", 1, true); // smooth return to normal
                scheduleNextFlicker();
                return;
            }

            const step = sequence[index];
            setFrame(step.frame, step.opacity !== undefined ? step.opacity : 1, step.smooth);

            timeoutId = setTimeout(() => {
                playSequence(sequence, index + 1);
            }, step.duration);
        }

        function pickWeightedPattern(patterns) {
            const totalWeight = patterns.reduce((sum, p) => sum + p.weight, 0);
            let randomValue = Math.random() * totalWeight;
            for (const p of patterns) {
                if (randomValue < p.weight) return p;
                randomValue -= p.weight;
            }
            return patterns[0];
        }

        function playRandomFlicker() {
            const isSoftBlackout = Math.random() > 0.5;
            const darkOpacity = isSoftBlackout ? random(0.5, 0.85) : 1; 

            const patterns = [
                {
                    weight: 70,
                    sequence: [
                        { frame: "dim", duration: random(60, 120), smooth: false },
                        { frame: "idle", duration: random(100, 180), smooth: true },
                        { frame: "dim", duration: random(40, 80), smooth: false }
                    ]
                },
                {
                    weight: 10,
                    sequence: [
                        { frame: "dark", duration: random(70, 120), opacity: darkOpacity, smooth: isSoftBlackout }
                    ]
                },
                {
                    weight: 15,
                    sequence: [
                        { frame: "dark", duration: random(90, 140), opacity: darkOpacity, smooth: isSoftBlackout },
                        { frame: "idle", duration: random(80, 130), smooth: true },
                        { frame: "dark", duration: random(40, 80), opacity: darkOpacity, smooth: isSoftBlackout }
                    ]
                },
                {
                    weight: 5,
                    sequence: [
                        { frame: "dark", duration: random(180, 260), opacity: darkOpacity, smooth: true },
                        { frame: "idle", duration: 100, smooth: true },
                        { frame: "dark", duration: random(50, 90), opacity: darkOpacity, smooth: false }
                    ]
                },
                {
                    weight: 5,
                    sequence: [
                        { frame: "dark", duration: random(1000, 2000), opacity: darkOpacity, smooth: isSoftBlackout },
                        { frame: "idle", duration: random(50, 100), smooth: true }
                    ]
                }
            ];

            const pattern = pickWeightedPattern(patterns);
            playSequence(pattern.sequence);
        }

        deadSpaceCard.addEventListener("mouseenter", () => {
            isHover = true;
            clearTimeout(timeoutId);
            setFrame("hover", 1, true);
        });

        deadSpaceCard.addEventListener("mouseleave", () => {
            isHover = false;
            setFrame("idle", 1, true);

            if (!prefersReducedMotion) {
                timeoutId = setTimeout(() => {
                    scheduleNextFlicker();
                }, random(500, 1000));
            }
        });

        if (!prefersReducedMotion) {
            setFrame("idle", 1, false);
            scheduleNextFlicker();
        } else {
            setFrame("idle", 1, false);
        }
    }
});
