const navbar = document.getElementById("navbar");
const sticky = navbar.offsetTop;

// Spacer stops the page from jumping when the navbar becomes fixed
const navSpacer = document.createElement("div");
navSpacer.id = "navSpacer";
navbar.parentNode.insertBefore(navSpacer, navbar);

window.addEventListener("scroll", () => {

    if (window.pageYOffset > sticky) {
        if (!navbar.classList.contains("sticky")) {
            navSpacer.style.height = navbar.offsetHeight + "px";
            navSpacer.classList.add("show");
            navbar.classList.add("sticky");
        }
    } else {
        navbar.classList.remove("sticky");
        navSpacer.classList.remove("show");
    }

}, { passive: true });

// Close the mobile menu after tapping a link
document.querySelectorAll("#mobileMenu .nav-link").forEach(link => {
    link.addEventListener("click", () => {
        const el = document.getElementById("mobileMenu");
        const inst = bootstrap.Offcanvas.getInstance(el);
        if (inst) inst.hide();
    });
});



const filterButtons = document.querySelectorAll(".room-filter");
const roomCards = document.querySelectorAll(".room-item");

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Active Button
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filterValue = button.getAttribute("data-filter");

        roomCards.forEach(card => {

            if (filterValue === "all" || card.dataset.filter === filterValue) {

                card.style.display = "block";

                setTimeout(() => {
                    card.style.opacity = "1";
                    card.style.transform = "scale(1)";
                }, 100);

            } else {

                card.style.opacity = "0";
                card.style.transform = "scale(.8)";

                setTimeout(() => {
                    card.style.display = "none";
                }, 300);

            }

        });

    });

});


// Swiper Slider
const swiper = new Swiper(".gallerySwiper", {

    loop: true,

    speed: 800,

    spaceBetween: 30,

    grabCursor: true,

    centeredSlides: false,

    autoplay: {

        delay: 3000,

        disableOnInteraction: false,

    },

    pagination: {

        el: ".swiper-pagination",

        clickable: true,

    },

    navigation: {

        nextEl: ".swiper-button-next",

        prevEl: ".swiper-button-prev",

    },

    breakpoints: {

        0: {

            slidesPerView: 1,

        },

        576: {

            slidesPerView: 1,

        },

        768: {

            slidesPerView: 2,

        },

        992: {

            slidesPerView: 3,

        },

        1200: {

            slidesPerView: 3,

        }

    }

});
// GLightbox

const lightbox = GLightbox({

    selector: ".glightbox",

    touchNavigation: true,

    loop: true,

    zoomable: true,

    autoplayVideos: true,

    openEffect: "zoom",
    closeEffect: "fade"

});


const gallery = document.querySelector(".gallerySwiper");

gallery.addEventListener("mouseenter", () => {
    swiper.autoplay.stop();
});

gallery.addEventListener("mouseleave", () => {
    swiper.autoplay.start();
});



/* =====================================================
   FORMS
   ===================================================== */

// ---- Settings ----------------------------------------------------
// WhatsApp number that receives booking / contact enquiries
const WHATSAPP_NUMBER = "919958087218";

// OPTIONAL: paste a form-backend URL here (Formspree, Getform, your own API...).
// When set, the booking form (including the uploaded documents) is POSTed
// there as multipart/form-data. When empty, the details are sent via WhatsApp
// and documents are requested in the chat (browsers cannot attach files to WhatsApp).
const BOOKING_ENDPOINT = "";

const MAX_FILE_MB = 2;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function showToast(msg) {
    const el = document.getElementById("appToast");
    document.getElementById("appToastBody").textContent = msg;
    bootstrap.Toast.getOrCreateInstance(el, { delay: 5000 }).show();
}

function openWhatsApp(text) {
    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text), "_blank", "noopener");
}

// Digits only for number fields
["bMobile", "bAltMobile", "bEmPhone", "bPin"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => { el.value = el.value.replace(/\D/g, ""); });
});

// ---- Booking form ------------------------------------------------
const bookingModalEl = document.getElementById("booking");
const bookingForm = document.getElementById("bookingForm");

// Pre-select the room type from the card that was clicked, set min dates
bookingModalEl.addEventListener("show.bs.modal", e => {
    const room = e.relatedTarget && e.relatedTarget.getAttribute("data-room");
    if (room) document.getElementById("bRoom").value = room;

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("bMoveIn").min = today;
    document.getElementById("bDob").max = today;
});

// Student vs working professional changes labels
function syncOccupation() {
    const isWorking = document.getElementById("bOccupation").value === "Working Professional";
    document.getElementById("bOrgLabel").innerHTML =
        (isWorking ? "Company Name" : "College / Institute Name") + ' <span class="req">*</span>';
    document.getElementById("bProofLabel").innerHTML =
        (isWorking ? "Offer Letter / Company ID" : "College ID / Admission Proof") + ' <span class="req">*</span>';
}
document.getElementById("bOccupation").addEventListener("change", syncOccupation);

// ID number format per ID type
const ID_RULES = {
    "Aadhaar Card": { re: /^\d{12}$/, msg: "Aadhaar must be 12 digits." },
    "PAN Card": { re: /^[A-Za-z]{5}\d{4}[A-Za-z]$/, msg: "PAN format: ABCDE1234F." },
    "Driving Licence": { re: /^[A-Za-z0-9\-\s]{8,20}$/, msg: "Enter a valid licence number." },
    "Voter ID": { re: /^[A-Za-z0-9]{8,12}$/, msg: "Enter a valid Voter ID number." },
    "Passport": { re: /^[A-Za-z]\d{7}$/, msg: "Passport format: A1234567." }
};

function validateIdNumber() {
    const type = document.getElementById("bIdType").value;
    const input = document.getElementById("bIdNo");
    const fb = document.getElementById("bIdNoFb");
    const rule = ID_RULES[type];
    const val = input.value.replace(/\s+/g, type === "Aadhaar Card" ? "" : " ").trim();
    if (!rule || !input.value) { input.setCustomValidity(input.value ? "" : ""); return; }
    if (rule.re.test(val)) {
        input.setCustomValidity("");
    } else {
        input.setCustomValidity(rule.msg);
        fb.textContent = rule.msg;
    }
}
document.getElementById("bIdType").addEventListener("change", validateIdNumber);
document.getElementById("bIdNo").addEventListener("input", validateIdNumber);

// File validation (type + size)
function validateFile(input) {
    const f = input.files[0];
    if (!f) { input.setCustomValidity(input.required ? "Required" : ""); return; }
    const okType = ALLOWED_TYPES.includes(f.type);
    const okSize = f.size <= MAX_FILE_MB * 1024 * 1024;
    input.setCustomValidity(okType && okSize ? "" : "Invalid file");
}
bookingForm.querySelectorAll('input[type="file"]').forEach(inp => {
    inp.addEventListener("change", () => {
        validateFile(inp);
        const fb = inp.parentElement.querySelector(".invalid-feedback");
        const f = inp.files[0];
        if (f && fb) {
            fb.textContent = !ALLOWED_TYPES.includes(f.type)
                ? "Only JPG, PNG, WEBP or PDF files are allowed."
                : "File is larger than " + MAX_FILE_MB + " MB.";
        }
    });
});

bookingForm.addEventListener("submit", async e => {
    e.preventDefault();
    syncOccupation();
    validateIdNumber();
    bookingForm.querySelectorAll('input[type="file"]').forEach(validateFile);

    if (!bookingForm.checkValidity()) {
        bookingForm.classList.add("was-validated");
        const firstBad = bookingForm.querySelector(":invalid");
        if (firstBad) firstBad.focus({ preventScroll: false });
        return;
    }

    const fd = new FormData(bookingForm);
    const v = n => (fd.get(n) || "").toString().trim() || "-";
    const btn = bookingForm.querySelector('button[type="submit"]');

    // --- Option A: send to a backend
    if (BOOKING_ENDPOINT) {
        btn.disabled = true;
        const old = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending...';
        try {
            const res = await fetch(BOOKING_ENDPOINT, { method: "POST", body: fd, headers: { Accept: "application/json" } });
            if (!res.ok) throw new Error("Request failed");
            showToast("Booking request submitted! We will contact you shortly.");
            bootstrap.Modal.getInstance(bookingModalEl).hide();
            bookingForm.reset();
            bookingForm.classList.remove("was-validated");
        } catch (err) {
            showToast("Could not submit right now. Please try again or call us.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = old;
        }
        return;
    }

    // --- Option B: WhatsApp summary
    const docs = ["id_front", "id_back", "photo", "org_proof"]
        .map(n => fd.get(n))
        .filter(f => f && f.name)
        .length;

    const msg =
`*New Room Booking Request*

*Personal*
Name: ${v("full_name")}
Father/Guardian: ${v("guardian_name")}
Mobile: ${v("mobile")}
Alt Mobile: ${v("alt_mobile")}
Email: ${v("email")}
DOB: ${v("dob")}  |  Gender: ${v("gender")}
${v("occupation")}: ${v("organisation")}

*Room*
Type: ${v("room_type")}
Floor: ${v("floor")}  |  Room/House No. pref: ${v("preferred_room_no")}
Move-in: ${v("move_in")}  |  Duration: ${v("duration")}
Food: ${v("food")}

*Permanent Address*
House No. ${v("house_no")}, ${v("street")}, ${v("city")}, ${v("state")} - ${v("pincode")}

*Emergency Contact*
${v("emergency_name")} (${v("emergency_relation")}) - ${v("emergency_phone")}

*ID Proof*
${v("id_type")}: ${v("id_number")}
Documents selected: ${docs} (will share photos/PDFs in this chat)

Message: ${v("message")}`;

    openWhatsApp(msg);
    showToast("Opening WhatsApp. Please send the message and attach your documents there.");
    bootstrap.Modal.getInstance(bookingModalEl).hide();
    bookingForm.reset();
    bookingForm.classList.remove("was-validated");
});

bookingModalEl.addEventListener("hidden.bs.modal", () => {
    bookingForm.classList.remove("was-validated");
});

// ---- Contact form ------------------------------------------------
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", e => {
        e.preventDefault();
        if (!contactForm.checkValidity()) {
            contactForm.classList.add("was-validated");
            return;
        }
        const g = id => document.getElementById(id).value.trim();
        openWhatsApp(
`*New Enquiry*
Name: ${g("name")}
Phone: ${g("phone")}
Email: ${g("email")}

${g("message")}`);
        showToast("Opening WhatsApp to send your message.");
        contactForm.reset();
        contactForm.classList.remove("was-validated");
    });
}
