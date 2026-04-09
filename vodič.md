# Google Sheets & Google Apps Script Vodič

Ovaj vodič će ti pokazati kako postaviti potpuno besplatnu i jednostavnu bazu podataka pomoću Google Sheetsa. Web stranica će automatski moći povlačiti događaje iz tablice i slati nove prijave izravno u dokument.

### Korak 1: Kreiraj Google Sheet
1. Otvori [Google Sheets](https://sheets.google.com) i napravi novi prazan dokument.
2. Na dnu ekrana vidjet ćeš tab karticu pod nazivom `Sheet1`. Preimenuj tu karticu u **Reservations**. To je važno jer će skripta tražiti točno to ime!
3. U gornjem izborniku klikni na `Insert > New sheet` (Umetni > Novi list). Preimenuj taj novi list u **Events**.
4. U listu **Events** napravi prvi red (zaglavlje):
   - A1: `id` (npr. 1, 2, 3...)
   - B1: `name` (npr. Zagreb)
   - C1: `location` (npr. Caffe Bar Krivi Put)
   - D1: `date` (npr. 2026-05-15)
   - E1: `time` (npr. 20:00)
5. Unesi nekoliko događaja ispod zaglavlja kako bi imao nešto spremno.

### Korak 2: Dodaj Skriptu
1. S otvorenim Google Sheet dokumentom, klikni na **Extensions > Apps Script** (Proširenja > Apps Script).
2. Otvorit će se novi plavi prozor. Obriši sav kod koji već postoji unutra.
3. Kopiraj i zalijepi sav ovaj kod koji se nalazi u datoteci ispod!

### Korak 3: Objavljivanje i Dobivanje Linka
1. Klikni ikonu diskete 💾 (Save) kako bi spremio taj kod.
2. Na vrhu desno klikni na plavi gumb **Deploy > New deployment** (Nova implementacija).
3. Pod *Select type* (mala opcija izbornika zupčanika s lijeve strane) odaberi **Web app**.
4. Pod upit "Execute as" (Izvrši kao) mora pisati: **Me** (Ja / tvoj email).
5. Pod upit "Who has access" (Tko ima pristup) OBAVEZNO stavi: **Anyone** (Bilo tko).
6. Klikni na **Deploy**! (Google će te zatražiti da "Autoriziraš" skriptu. Nastavi, odaberi svoj račun, klikni "Advanced", "Go to project" i Allow).
7. Na ekranu će ti se ispisati dugačak web link tj. **Web app URL** koji počinje sa `https://script.google.com/...`
8. Kopiraj taj link.

### Korak 4: Omogući Aplikaciju
1. Idi natrag u kod na svom računalu, u datoteku **`script.js`**.
2. Gore na liniji broj 3 (gdje piše `const GOOGLE_SCRIPT_URL = ...`) zamijeni taj tekst za link svoje skripte iz prethodnog koraka!
3. To je to! Osvježi web stranicu i tvoja stranica se u potpunosti napaja podacima direktno iz Google Sheet-a! Zauvijek besplatno.
