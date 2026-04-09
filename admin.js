// --- Config (Same as script.js) ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

let supabase;
if (SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Simple placeholder Auth
function login() {
    const pass = document.getElementById('adminPassword').value;
    if(pass === 'admin123') { // Very basic client-side protection for demo
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        loadDashboardData();
    } else {
        alert('Netočna lozinka');
    }
}

async function loadDashboardData() {
    await loadAdminEvents();
    await loadReservations();
}

async function addEvent() {
    const name = document.getElementById('newEventName').value;
    const location = document.getElementById('newEventLocation').value;
    const date = document.getElementById('newEventDate').value;
    const time = document.getElementById('newEventTime').value;
    const msgDiv = document.getElementById('eventMessage');
    
    if(!name || !location || !date || !time) {
        msgDiv.innerHTML = '<span style="color:var(--magenta)">Sva polja su obavezna.</span>';
        return;
    }
    
    if(supabase) {
        msgDiv.innerHTML = '<span style="color:var(--cyan)">Spremanje...</span>';
        const { error } = await supabase.from('events').insert([{
            name, location, date, time
        }]);
        
        if(error) {
            msgDiv.innerHTML = '<span style="color:var(--magenta)">Greška pri spremanju.</span>';
            console.error(error);
        } else {
            msgDiv.innerHTML = '<span style="color:#00E87F">Događaj uspješno dodan.</span>';
            document.getElementById('newEventName').value = '';
            document.getElementById('newEventLocation').value = '';
            document.getElementById('newEventDate').value = '';
            document.getElementById('newEventTime').value = '';
        }
    } else {
        // Fallback LocalStorage
        let events = JSON.parse(localStorage.getItem('baci_events') || '[]');
        events.push({ id: Date.now(), name, location, date, time });
        localStorage.setItem('baci_events', JSON.stringify(events));
        
        msgDiv.innerHTML = '<span style="color:#00E87F">Događaj uspješno dodan (Lokalno spremanje).</span>';
        document.getElementById('newEventName').value = '';
        document.getElementById('newEventLocation').value = '';
        document.getElementById('newEventDate').value = '';
        document.getElementById('newEventTime').value = '';
    }
}

async function loadAdminEvents() {
    // In a full implementation, you might list editable events here
}

async function loadReservations() {
    const tbody = document.getElementById('reservationsTable');
    tbody.innerHTML = '<tr><td colspan="5">Učitavanje...</td></tr>';
    
    if(!supabase) {
        // LocalStorage Render
        const resData = JSON.parse(localStorage.getItem('baci_regs') || '[]');
        const evData = JSON.parse(localStorage.getItem('baci_events') || '[]');
        
        if(resData.length > 0) {
            tbody.innerHTML = '';
            resData.forEach(r => {
                const event = evData.find(e => e.id == r.event_id) || { name: 'Nepoznato', location: 'Nepoznato' };
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.first_name} ${r.last_name}</td>
                    <td>${r.email}</td>
                    <td>${r.phone}</td>
                    <td>${event.name} (${event.location})</td>
                    <td>${new Date(r.created_at).toLocaleString('hr-HR')}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5">Nema prijava (Lokalno).</td></tr>';
        }
        return;
    }
    
    // Assuming 'events' is joined if we set up foreign keys, but let's fetch both and map for simplicity
    try {
        const { data: resData, error: resErr } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
        const { data: evData, error: evErr } = await supabase.from('events').select('*');
        
        if (resErr) throw resErr;
        
        if(resData && resData.length > 0) {
            tbody.innerHTML = '';
            resData.forEach(r => {
                const event = evData.find(e => e.id == r.event_id) || { name: 'Nepoznato', location: 'Nepoznato' };
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.first_name} ${r.last_name}</td>
                    <td>${r.email}</td>
                    <td>${r.phone}</td>
                    <td>${event.name} (${event.location})</td>
                    <td>${new Date(r.created_at).toLocaleString('hr-HR')}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
             tbody.innerHTML = '<tr><td colspan="5">Nema prijava.</td></tr>';
        }
    } catch(err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" style="color:var(--magenta)">Greška pri dohvaćanju podataka.</td></tr>';
    }
}
