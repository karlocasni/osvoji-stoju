// --- Config / API Keys (Google Sheets) ---
// Postavite ovdje URL vašeg Google Apps Script Webhooka 
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbySEPwdA3j0keeWS6hu7wRhOoME6LqTssVQQsNnYKeeaP9Orntsg0vm9n6WRKGOD-f0MA/exec';

// Dummy podaci (prikazuju se dok se ne poveže Google Sheet)
let fallbackEvents = [
    { id: '1', name: 'Zagreb', location: 'Caffe Bar Krivi Put', date: '2026-05-15', time: '20:00' },
    { id: '2', name: 'Split', location: 'Klub OHara', date: '2026-06-02', time: '21:00' }
];

// --- Initial Setup & GSAP ---
document.addEventListener("DOMContentLoaded", async () => {
    // Basic GSAP Animations
    if(typeof gsap !== 'undefined') {
        gsap.from(".hero h1", { duration: 1, y: 50, opacity: 0, ease: "power3.out" });
        gsap.from(".hero p", { duration: 1, y: 30, opacity: 0, ease: "power3.out", delay: 0.3 });
        
        gsap.utils.toArray('.glass-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                delay: i * 0.1
            });
        });
    }

    await loadEvents();
});

// --- Fetch Events ---
async function loadEvents() {
    let events = fallbackEvents;
    
    if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.startsWith('http')) {
        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getEvents`);
            const data = await response.json();
            if (data && data.length > 0) {
                events = data;
            }
        } catch(e) {
            console.error("Greška pri dohvaćanju događaja:", e);
        }
    }
    
    // Render on Page
    const container = document.getElementById('eventsContainer');
    const select = document.getElementById('eventSelect');
    
    container.innerHTML = '';
    select.innerHTML = '<option value="">Odaberi događaj...</option>';
    
    if(events.length === 0) {
        container.innerHTML = '<p>Trenutno nema nadolazećih događaja.</p>';
        return;
    }
    
    events.forEach(ev => {
        // Render card
        const card = document.createElement('div');
        card.className = 'glass-card event-card';
        card.innerHTML = `
            <div>
                <h3><i class="fas fa-map-marker-alt" style="color:var(--cyan)"></i> ${ev.name}</h3>
                <div class="event-details">
                    <span><i class="fas fa-building"></i> ${ev.location}</span>
                    <span><i class="far fa-calendar-alt"></i> ${formatDate(ev.date)}</span>
                    <span><i class="far fa-clock"></i> ${formatTime(ev.time)}</span>
                </div>
            </div>
            <button class="btn" style="width:100%" onclick="openBookingModal(${ev.id})">Prijavi se za ovu lokaciju</button>
        `;
        container.appendChild(card);
        
        // Populate select
        const option = document.createElement('option');
        option.value = ev.id;
        option.dataset.name = ev.name;
        option.dataset.location = ev.location;
        option.dataset.date = formatDate(ev.date);
        option.textContent = `${ev.name} - ${ev.location} (${formatDate(ev.date)})`;
        select.appendChild(option);
    });
}

function formatDate(dateStr) {
    if(!dateStr) return '';
    if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }
    const parts = dateStr.split('-');
    if(parts.length < 3) return dateStr;
    return `${parts[2]}.${parts[1]}.${parts[0]}.`;
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    if (timeStr.includes('T')) {
        return timeStr.split('T')[1].substring(0, 5);
    }
    return timeStr.substring(0, 5);
}

// --- Multistep Modal Logic ---
let currentStep = 0;
let preSelectedEventId = null;

function openBookingModal(eventId = null) {
    const modal = document.getElementById('bookingModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    preSelectedEventId = eventId;
    
    if (eventId) {
        document.getElementById('eventSelect').value = eventId;
        showStep(1); // Skip step 0 if specific event clicked
    } else {
        showStep(0);
    }
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore scrolling
    resetForm();
}

function showStep(stepIndex) {
    document.querySelectorAll('.modal-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step${stepIndex}`).classList.add('active');
    currentStep = stepIndex;
    
    if(stepIndex === 3) {
        prepareSummary();
    }
}

function nextStep(current) {
    if(current === 0) {
        if(!document.getElementById('eventSelect').value) {
            alert("Molimo odaberite događaj.");
            return;
        }
    }
    if(current === 1) {
        if(!document.getElementById('ageCheck').checked || !document.getElementById('termsCheck').checked) {
            alert("Morate prihvatiti uvjete i potvrditi dob za nastavak.");
            return;
        }
    }
    if(current === 2) {
        const required = ['firstName', 'lastName', 'age', 'sex', 'address', 'phone', 'email'];
        let valid = true;
        for(let id of required) {
            let el = document.getElementById(id);
            if(!el.value) {
                el.style.borderColor = 'var(--magenta)';
                valid = false;
            } else {
                el.style.borderColor = 'var(--glass-border)';
                // Basic email validation
                if(id === 'email' && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(el.value)) {
                    el.style.borderColor = 'var(--magenta)';
                    valid = false;
                }
            }
        }
        if(!valid) {
            alert("Molimo ispravno popunite sva obavezna polja.");
            return;
        }
    }
    showStep(current + 1);
}

function prevStep(current) {
    if(current === 1 && preSelectedEventId) {
        closeBookingModal(); // Prevent going back to step 0 if event was pre-selected
        return;
    }
    showStep(current - 1);
}

function prepareSummary() {
    const select = document.getElementById('eventSelect');
    const selectedOption = select.options[select.selectedIndex];
    
    document.getElementById('sumEvent').textContent = selectedOption.textContent;
    document.getElementById('sumName').textContent = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
    document.getElementById('sumContact').textContent = `${document.getElementById('email').value} | ${document.getElementById('phone').value}`;
}

async function submitRegistration() {
    const btnNav = document.getElementById('submitNav');
    const loader = document.getElementById('submitLoader');
    const errorDiv = document.getElementById('submitError');
    
    btnNav.style.display = 'none';
    loader.style.display = 'block';
    errorDiv.style.display = 'none';
    
    const formData = {
        event_id: document.getElementById('eventSelect').value,
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        age: document.getElementById('age').value,
        sex: document.getElementById('sex').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        guest_idea: document.getElementById('guestIdea').value,
    };
    
    try {
        // 1. Pošalji podatke u Google Sheets
        if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL.startsWith('http')) {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    action: 'addReservation',
                    ...formData
                })
            });
            const result = await response.json();
            if(result.status !== 'success') {
                throw new Error("Šalje nazad grešku s Google Sheeta.");
            }
        } else {
            // Ako URL nije postavljen, napravi lažni delay za demo
            await new Promise(r => setTimeout(r, 800));
            console.log("Demo Prijava:", formData);
        }
        
        // Success
        document.getElementById('step3').classList.remove('active');
        document.getElementById('stepSuccess').classList.add('active');
        
    } catch(err) {
        console.error("Submission Error:", err);
        errorDiv.textContent = "Došlo je do pogreške prilikom prijave. Molimo pokušajte ponovno.";
        errorDiv.style.display = 'block';
        btnNav.style.display = 'flex';
    } finally {
        loader.style.display = 'none';
    }
}

function resetForm() {
    document.querySelectorAll('.form-control').forEach(el => {
        if(el.tagName === 'SELECT') el.selectedIndex = 0;
        else el.value = '';
        el.style.borderColor = 'var(--glass-border)';
    });
    document.getElementById('ageCheck').checked = false;
    document.getElementById('termsCheck').checked = false;
    
    document.getElementById('submitNav').style.display = 'flex';
    document.getElementById('submitLoader').style.display = 'none';
    document.getElementById('submitError').style.display = 'none';
    
    document.querySelectorAll('.modal-step').forEach(step => step.classList.remove('active'));
    document.getElementById('stepSuccess').classList.remove('active');
}
