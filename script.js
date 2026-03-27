let isAnimating = false;
let chatInterval = null;
let currentBinderPage = 0;
let currentOpenApp = null;
let currentKasirCustomer = null;
let currentHaggleCustomer = null;
let currentSearchQuery = '';
let currentSortMethod = 'newest';

// --- NAMA PELANGGAN (Kombinasi Anime, Nama Lokal, dan Karakter Tongkrongan) ---
const NPC_NAMES = [
    "Ash", "Misty", "Brock", "Gary", "Jessie", "James", // Original
    "Budi", "Asep", "Kevin", "Dimas", "Reza", "Andi", "Joko", // Lokal umum
    "Siti", "Rina", "Cika", "Putri", // Karakter wanita
    "Bapak Kos", "Bocil Warnet", "Kang Paket", "Mahasiswa Akhir", // Karakter unik
    "Kolektor Misterius", "Yanto", "Agus", "Michael", "Tukang Parkir"
];

// --- NAMA PENONTON STREAM (Gaya username gamer Indo) ---
const CHAT_NAMES = [
    "Zet_12", "PikaBoy", "GachaAddict", "SultanJakarta", "Mamat_R", // Original
    "CardSniper", "KolektorTua", "Rafi_X", "AnakEmak", "PenontonSetia",
    "SiPalingHoki", "KangSpam", "WibuLokal", "SlebewBoy", "Kobo_Simp",
    "xX_Sniper_Xx", "InfoNgab", "TukangGacha", "RungkadTerus", "CumaNonton",
    "PawangKartu", "Bot_01", "Fajar_Sadboy", "GamerPensiun", "MendangMending"
];

// --- KOMENTAR CHAT STREAM (Reaksi gacha, toxic dikit, hype, dan jokes streamer) ---
const CHAT_NORMAL = [
    "Bismillah dapet bagus", "Skip skip", "Hoki nggak nih", "Buka terus bang", "Lanjut!", "Pasti zonk", "Berdoa dulu", // Original
    "Menyala abangku 🔥", "Rungkad", "Gacor kang", "GG Gaming", "Inget umur bang", 
    "Bagi giveaway dong", "Buset dah", "Pawang gacha nih", "Wih mantap",
    "Mandi kembang dulu bang", "Turu bang turu", "GWS (Gacha Waifu Selalu)", 
    "Info loker bang", "Jual ginjal demi gacha", "Mitos bang mitos",
    "Yaelah ampas lagi", "Kurang sajen itu", "Bentar lagi dapet tuh",
    "Pasti disetting ini mah", "Info modal bang", "Kasian mana masih muda",
    "Ciee deg-degan", "Tarik napas dulu bang", "Mending rakit PC"
];

let AVAILABLE_PACKS = [];
let AVAILABLE_ITEMS = [];

const EVENTS = [
    // --- EVENT SULTAN (type: "sultan_up") - Peluang Sultan Muncul Naik ---
    { msg: "Turnamen TCG Regional Dimulai! Pelanggan Sultan berdatangan hari ini.", type: "sultan_up" },
    { msg: "Tanggal Tua/Muda? Bodo amat! Anak-anak Jaksel lagi hype pamer binder. Sultan is coming!", type: "sultan_up" },
    { msg: "Komunitas 'Kolektor Kartu Elit' sedang gathering di dekat tokomu. Siapkan stok langka!", type: "sultan_up" },
    { msg: "Bonus tahunan cair! Banyak pekerja kantoran tajir yang khilaf borong kartu hari ini.", type: "sultan_up" },

    // --- EVENT BOOM (type: "boom") - Harga Pasar Cenderung Naik ---
    { msg: "Influencer review kartu Jadul! Permintaan pasar naik tiba-tiba.", type: "boom" },
    { msg: "Youtuber Gaming terkenal baru aja dapet kartu Legend pas live stream. Harga set ini meroket!", type: "boom" },
    { msg: "Trend TikTok baru: Pamer koleksi kartu PSA 10! Semua orang mendadak jadi FOMO beli kartu.", type: "boom" },
    { msg: "Pabrik TCG kehabisan bahan baku kertas foil! Kelangkaan ini bikin harga pasar naik drastis.", type: "boom" },
    { msg: "Anime TCG season terbaru rilis! Anak-anak sekolahan pada nyari kartu karakter utamanya.", type: "boom" },

    // --- EVENT CRASH (type: "crash") - Harga Pasar Cenderung Turun ---
    { msg: "Skandal Kartu Palsu Beredar! Kepercayaan pembeli turun drastis, harga pasar anjlok.", type: "crash" },
    { msg: "Pabrik baru aja ngumumin cetak ulang (Reprint) besar-besaran! Harga kartu lama langsung nyungsep.", type: "crash" },
    { msg: "Drama di komunitas! Pro-player ketahuan curang, banyak kolektor kecewa dan pensiun main.", type: "crash" },
    { msg: "Rumor beredar: Beberapa kartu overpowered bakal di-Banned dari turnamen. Kolektor panik jual murah!", type: "crash" },
    { msg: "Hujan badai seharian di kota. Orang-orang malas keluar, pasar lesu dan sepi.", type: "crash" },

    // --- EVENT NORMAL (type: "normal") - Tidak Ada Buff/Nerf ---
    { msg: "Pasar hari ini stabil dan tenang. Tidak ada kejadian khusus.", type: "normal" },
    { msg: "Cuaca cerah, angin sepoi-sepoi. Hari yang biasa dan damai untuk berjualan kartu.", type: "normal" },
    { msg: "Berita hari ini: Kucing nyangkut di pohon. Tidak ada hubungannya dengan TCG.", type: "normal" },
    { msg: "Tukang nasi goreng depan toko lagi rame. Penjualan kartu berjalan seperti biasa.", type: "normal" },
    { msg: "Tidak ada gosip di komunitas hari ini. Lanjutkan rutinitas tokomu dengan santai.", type: "normal" }
];

let state = {
    activeAd: null,
    queuedAd: null,
    time: 480, // 08:00 pagi (menit)
    isOpen: false,
    money: 300,
    nextCardId: 1,
    repPoints: 50,
    dayCount: 1,
    rentCost: 45, // Bayar sewa $45 setiap hari
    loanAmount: 0,
    loanDaysLeft: 0,
    isBankrupt: false,
    hasCashier: false,
    staff: { marketing: 0, scout: 0, negotiator: 0, brewecker: 0 },
    settings: { sfx: true, music: false, autoBreweck: true },
    stream: { isLiveMode: false, subscribers: 0, channelName: 'DBSKRN' },
    apiUrls: { set1: '', set2: '' },
    grading: [],
    analytics: { dailyProfit: {}, cardSalesCount: {} },
    priceHistory: {},
    myInventory: [],
    customers: [],
    cardDatabase: [],
    marketPrices: {},
    marketTrends: {},
    myPacks: {}, 
    myItems: {}, 
    customPrices: {},
    currentEvent: "normal",
    myCollection: [],
    unpaidBills: 0,
    daysUnpaid: 0,
    upgrades: { wallpaper: 0, carpet: 0, spotlight: 0 }
};

let timers = { market: null, rent: null, customer: null, clock: null };

function getGradeMultiplier(grade) {
    if (!grade) return 1;
    if (grade === 10) return 5.0;
    if (grade === 9) return 3.0;
    if (grade === 8) return 2.0;
    if (grade === 7) return 1.5;
    if (grade === 6) return 1.0;
    return 0.5;
}

async function getOrFetchCard(cardName) {
    let existing = state.cardDatabase.find(c => c.name === cardName);
    if (existing) return existing;

    try {
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:"${encodeURIComponent(cardName)}"&pageSize=1`);
        const result = await response.json();

        if (result.data && result.data.length > 0) {
            const apiCard = result.data;
            const newCardData = {
                name: apiCard.name,
                imageUrl: apiCard.images.small,
                rarity: apiCard.rarity || 'Common',
                type: (apiCard.types && apiCard.types) ? apiCard.types.toLowerCase() : 'normal',
                hp: apiCard.hp || 100,
                baseAtk: calculateAtkFromRarity(apiCard.rarity)
            };
            state.cardDatabase.push(newCardData);
            return newCardData;
        }
    } catch (error) {
        console.error("Gagal menarik data API:", error);
    }
    return null;
}

function calculateAtkFromRarity(rarity) {
    if (!rarity) return 50;
    if (rarity.includes('Holo')) return 110;
    if (rarity.includes('VMAX') || rarity.includes('TAG TEAM')) return 160;
    if (rarity.includes('Rare')) return 90;
    return 60;
}

function playSound(id) {
    if (!state.settings.sfx) return;
    try {
        const audio = document.getElementById(id);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
        }
    } catch (e) {}
}

function applyMusicSetting() {
    const bgm = document.getElementById('bgm');
    if (!bgm) return;
    bgm.volume = 0.3;
    if (state.settings.music) {
        bgm.play().catch(() => {});
    } else {
        bgm.pause();
    }
}

window.onload = () => {
    const btn = document.getElementById('btn-play');

    btn.addEventListener('click', () => {
        enterFullscreen();
        startGameSequence();
    });
};

function enterFullscreen() {
    const elem = document.documentElement;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE11
        elem.msRequestFullscreen();
    }
}

async function startGameSequence() {
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('loading-screen').style.display = 'flex';
    
    playSound('sfx-coin');
    loadGameState();
    applyMusicSetting();
    
    // --- TAMBAHAN BARU: Tarik data Pack & Item dari Server ---
    setLoadingText("Memuat Data Server...");
    try {
        let res = await fetch('process.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'load_data' })
        });
        let response = await res.json();
        if (response.success) {
            AVAILABLE_PACKS = response.data.packs;
            AVAILABLE_ITEMS = response.data.items;
        }
    } catch(e) {
        console.error("Gagal memuat database server", e);
    }
    // ---------------------------------------------------------

    await fetchCardsFromAPI();
    startTimers();
    updateUI();
    
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 600);
}

function setLoadingText(text) { document.getElementById('loading-text').innerText = text; }
function setLoadingSubtext(text) { document.getElementById('loading-subtext').innerText = text; }
function updateProgress(percent) { 
    document.getElementById('loading-progress').style.width = percent + '%';
    document.getElementById('loading-percent').innerText = percent + '%';
}

async function processAndCacheImages(cards) {
    let totalItems = AVAILABLE_PACKS.length + cards.length; let processed = 0;
    function itemDone() { processed++; updateProgress(10 + Math.floor((processed / totalItems) * 90)); }

    for (let pack of AVAILABLE_PACKS) {
        setLoadingSubtext(`Memeriksa Aset Pack: ${pack.name}...`);
        if (pack.img && pack.img.startsWith('http')) {
            try { let res = await fetch('process.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: pack.img, id: 'pack_' + pack.id }) }); let data = await res.json(); if (data.success) pack.img = data.localUrl; } catch (e) {}
        } itemDone();
    }

    const batchSize = 10;
    for (let i = 0; i < cards.length; i += batchSize) {
        const batch = cards.slice(i, i + batchSize);
        setLoadingSubtext(`Mengunduh Kartu ke Lokal (${i} / ${cards.length})...\nTergantung koneksi internet.`);
        await Promise.all(batch.map(async (card) => {
            if (!card.imageUrl || !card.imageUrl.startsWith('http')) { itemDone(); return; }
            const uniqueId = card.apiId || (card.setId + '_' + card.name).replace(/[^a-zA-Z0-9_-]/g, '');
            try { let res = await fetch('process.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: card.imageUrl, id: 'card_' + uniqueId }) }); let data = await res.json(); if (data.success) card.imageUrl = data.localUrl; } catch (e) {} itemDone();
        }));
    }
    setLoadingText("Selesai!"); setLoadingSubtext("Membuka Toko..."); updateProgress(100);
}

async function fetchCardsFromAPI(forceRefresh = false) {
    const savedCardDB = localStorage.getItem('tcgTycoonCardDB');
    if (savedCardDB && !forceRefresh) {
        try { const parsedDB = JSON.parse(savedCardDB); setLoadingText("Memuat Database Lokal..."); updateProgress(10); await processAndCacheImages(parsedDB); applyFetchedData(parsedDB); return; } catch(e) {}
    }

    setLoadingText("Memulai..."); updateProgress(5); setLoadingSubtext("Menghubungi Pokemon TCG API...");
    try {
        const url1 = state.apiUrls.set1 || 'https://api.pokemontcg.io/v2/cards?q=set.id:base1&pageSize=250';
        const url2 = state.apiUrls.set2 || 'https://api.pokemontcg.io/v2/cards?q=set.id:base2&pageSize=250';
        const url3 = state.apiUrls.set3 || 'https://api.pokemontcg.io/v2/cards?q=set.id:base3&pageSize=250';
        const url4 = state.apiUrls.set4 || 'https://api.pokemontcg.io/v2/cards?q=set.id:base4&pageSize=250';
        const responses = await Promise.all([ fetch(url1), fetch(url2), fetch(url3) ]);

        let fetched = [];
        for (let res of responses) {
            if (res.ok) {
                const json = await res.json();
                json.data.forEach(item => {
                    const apiId = item.id; const name = item.name;
                    const image = (item.images && item.images.large) ? item.images.large : (item.images && item.images.small ? item.images.small : '');
                    const rarity = item.rarity || 'Common'; const setId = item.set.id || 'custom';
                    let baseValue = 1;
                    if (rarity.includes('Holo') || rarity.includes('Secret')) baseValue = 80;
                    else if (rarity.includes('Rare')) baseValue = 25;
                    else if (rarity.includes('Uncommon')) baseValue = 5;
                    if (name === 'Charizard') baseValue = 300;
                    fetched.push({ apiId, name, rarity, baseValue, imageUrl: image, setId });
                });
            }
        }
        if (fetched.length === 0) throw new Error("Empty Data");
        updateProgress(10); setLoadingText("Mengunduh Aset Gambar..."); await processAndCacheImages(fetched);
        localStorage.setItem('tcgTycoonCardDB', JSON.stringify(fetched)); applyFetchedData(fetched);
    } catch (e) {
        setLoadingText("Gagal API Eksternal. Memuat Data Lokal..."); updateProgress(10);
        try {
            const localRes = await fetch('cards.json'); if (!localRes.ok) throw new Error("File cards.json tidak ditemukan!");
            const fallbackData = await localRes.json(); await processAndCacheImages(fallbackData);
            localStorage.setItem('tcgTycoonCardDB', JSON.stringify(fallbackData)); applyFetchedData(fallbackData);
        } catch (localError) { setLoadingText("Error Kritis: Database Lokal Gagal Dimuat!"); }
    }
}

function applyFetchedData(data) {
    state.cardDatabase = data;
    data.forEach(c => {
        if(state.marketPrices[c.name] === undefined) { state.marketPrices[c.name] = c.baseValue; state.marketTrends[c.name] = 0; }
        if (!state.priceHistory[c.name]) state.priceHistory[c.name] = [c.baseValue];
    }); preloadImages(data);
}

function preloadImages(cards) { cards.forEach(c => { if(c.imageUrl && !c.imageUrl.startsWith('http')) { const img = new Image(); img.src = c.imageUrl; } }); }

function saveGameState() {
    const dataToSave = {
        activeAd: state.activeAd,
        queuedAd: state.queuedAd,
        time: state.time,
        isOpen: state.isOpen,
        money: state.money,
        dayCount: state.dayCount,
        repPoints: state.repPoints,
        rentCost: state.rentCost,
        nextCardId: state.nextCardId,
        loanAmount: state.loanAmount,
        loanDaysLeft: state.loanDaysLeft,
        isBankrupt: state.isBankrupt,
        hasCashier: state.hasCashier,
        staff: state.staff,
        settings: state.settings,
        stream: state.stream,
        apiUrls: state.apiUrls,
        grading: state.grading,
        analytics: state.analytics,
        priceHistory: state.priceHistory,
        myPacks: state.myPacks,
        myItems: state.myItems,
        customPrices: state.customPrices,
        myInventory: state.myInventory,
        marketPrices: state.marketPrices,
        marketTrends: state.marketTrends,
        currentEvent: state.currentEvent,
        myCollection: state.myCollection || [],
        unpaidBills: state.unpaidBills,
        daysUnpaid: state.daysUnpaid,
        upgrades: state.upgrades || { wallpaper: 0, carpet: 0, spotlight: 0 },
        lastPlayed: new Date().toISOString()
    };
    
    localStorage.setItem('tcgTycoonSave', JSON.stringify(dataToSave));
}

function loadGameState() {
    const saved = localStorage.getItem('tcgTycoonSave');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        
        // Safe assign with defaults
        Object.keys(state).forEach(key => {
            if (data[key] !== undefined) {
                state[key] = data[key];
            }
        });

        // Pastikan array/object penting tidak null
        state.myCollection = state.myCollection || [];
        state.myInventory = state.myInventory || [];
        state.grading = state.grading || [];
        state.customers = state.customers || [];
        state.upgrades = state.upgrades || { wallpaper: 0, carpet: 0, spotlight: 0 };

        // Offline earnings
        if (data.lastPlayed && !state.isBankrupt) {
            const offlineMinutes = Math.floor((Date.now() - new Date(data.lastPlayed)) / 60000);
            if (offlineMinutes > 0) {
                const multiplier = state.hasCashier ? 5 : 2;
                const maxEarnings = state.hasCashier ? 2500 : 1000;
                const earnings = Math.min(offlineMinutes * multiplier, maxEarnings);
                
                if (earnings > 0) {
                    state.money += earnings;
                    recordSale("Offline Revenue", earnings, true);
                    playSound('sfx-coin');
                    showOfflineEarnings(offlineMinutes, earnings);
                }
            }
        }
    } catch (e) {
        console.error("Gagal load save:", e);
    }
}

function showOfflineEarnings(minutes, earnings) {
    const descEl = document.getElementById('offline-desc');
    const moneyEl = document.getElementById('offline-money');
    const cashierEl = document.getElementById('offline-cashier');
    
    if (descEl) descEl.innerText = `Toko beroperasi otomatis selama ${minutes} menit.`;
    if (moneyEl) moneyEl.innerText = `+$${earnings}`;
    if (cashierEl) cashierEl.style.display = state.hasCashier ? 'block' : 'none';
    
    openModal('modal-offline');
}

function startTimers() {
    if (timers.market) clearInterval(timers.market);
    if (timers.clock) clearInterval(timers.clock);
    
    timers.market = setInterval(updateMarketEconomy, 5000);
    timers.clock = setInterval(tickTime, 1000);
}

function scheduleNextCustomer() {
    if (timers.customer) clearTimeout(timers.customer);
    if (!state.isOpen || state.time >= 1260 || state.isBankrupt) return;

    const collectionBuff = (state.myCollection?.length || 0) * 500;
    let baseInterval = state.currentEvent === "sultan_up" ? 5000 : 8000;
    let adSpeedBuff = state.activeAd === 'brosur' ? 2000 : 0;
    let interval = Math.max(1500, baseInterval - (state.staff.marketing * 1000) - collectionBuff - adSpeedBuff);

    timers.customer = setTimeout(() => {
        spawnCustomer();
        scheduleNextCustomer();
    }, interval);
}

function updateMarketEconomy() {
    if (state.isBankrupt) return;

    state.cardDatabase.forEach(card => {
        let fluctuation = (Math.random() * 0.4) - 0.2;
        if (state.currentEvent === "crash") fluctuation -= 0.15;
        if (state.currentEvent === "boom") fluctuation += 0.2;

        let newPrice = Math.round(state.marketPrices[card.name] * (1 + fluctuation));
        const minPrice = Math.max(1, Math.round(card.baseValue * 0.3));
        const maxPrice = Math.round(card.baseValue * 5);

        newPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

        const oldPrice = state.marketPrices[card.name];
        state.marketTrends[card.name] = newPrice > oldPrice ? 1 : (newPrice < oldPrice ? -1 : 0);
        state.marketPrices[card.name] = newPrice;

        if (!state.priceHistory[card.name]) state.priceHistory[card.name] = [];
        state.priceHistory[card.name].push(newPrice);
        if (state.priceHistory[card.name].length > 20) state.priceHistory[card.name].shift();
    });

    updateUI();
    saveGameState();
}

function generateDailyEvent() {
    let ev = null;
    
    // CEK EFEK INFLUENCER
    if (state.activeAd === 'influencer') {
        const forcedEvents = EVENTS.filter(e => e.type === 'boom' || e.type === 'sultan_up');
        ev = forcedEvents[Math.floor(Math.random() * forcedEvents.length)];
        ev.msg = "📢 HASIL ENDORSE YOUTUBER:\n" + ev.msg; // Tambahkan label
    } 
    // JIKA TIDAK ADA INFLUENCER, NORMAL RANDOM
    else if (Math.random() < 0.3) {
        ev = EVENTS[Math.floor(Math.random() * (EVENTS.length - 1))];
    } else {
        state.currentEvent = "normal";
        return; // Selesai, tidak ada pop-up event
    }

    state.currentEvent = ev.type;
    const eventText = document.getElementById('event-text');
    if (eventText) eventText.innerText = ev.msg;
    openModal('event-screen');
}

function closeEventScreen() { document.getElementById('event-screen').style.display = 'none'; }

async function showDailyRecap() {
    if (state.customers.length > 0) {
        showToast("Masih ada pelanggan di antrean! Selesaikan atau tolak mereka dulu.", "error");
        return;
    }

    if (state.time < 1260) {
        const confirmEarlyClose = await customConfirm(`Waktu baru menunjukkan jam ${formatTime(state.time)}.\n\nYakin ingin mengakhiri hari lebih awal?\n(Gaji staff dan uang sewa tetap harus dibayar penuh!)`, "Tutup Lebih Awal");
        if (!confirmEarlyClose) {
            return; 
        }
    }

    const profitToday = state.analytics.dailyProfit[state.dayCount] || 0;
    
    let staffSalary = (state.staff.marketing * 25) + (state.staff.scout * 30) + (state.staff.negotiator * 35);
    if(state.hasCashier) staffSalary += 40;
    if(state.staff.brewecker > 0) staffSalary += 50;
    
    const dailyExpense = state.rentCost + staffSalary;
    const netProfit = profitToday - dailyExpense;

    // CEK APAKAH HTML-NYA ADA, KALAU NGGAK ADA, LANGSUNG NEXT DAY SAJA (SAFE MODE)
    if (!document.getElementById('recap-day')) {
        alert(`Rekap Hari ${state.dayCount}\nPendapatan: $${profitToday}\nPengeluaran: -$${dailyExpense}`);
        processNextDay();
        return;
    }

    document.getElementById('recap-day').innerText = state.dayCount;
    document.getElementById('recap-income').innerText = `+$${profitToday}`;
    document.getElementById('recap-expense').innerText = `-$${dailyExpense}`;
    
    const netEl = document.getElementById('recap-net');
    netEl.innerText = (netProfit >= 0 ? '+' : '') + `$${netProfit}`;
    netEl.style.color = netProfit >= 0 ? 'var(--green)' : 'var(--red)';

    openModal('modal-recap');
}

function processNextDay() {
    closeModal('modal-recap');
    
    let staffSalary = (state.staff.marketing * 10) + (state.staff.scout * 12) + (state.staff.negotiator * 15);
    if(state.hasCashier) staffSalary += 15;
    if(state.staff.brewecker > 0) staffSalary += 20;
    
    let dailyExpense = state.rentCost + staffSalary; 
    if(dailyExpense > 0) {
        state.unpaidBills += dailyExpense;
        state.daysUnpaid++;
    }

    if (state.daysUnpaid >= 4 || (state.loanAmount > 0 && state.loanDaysLeft <= 0)) { 
        state.isBankrupt = true; 
        state.customers = []; 
        showToast('🚨 BANKRUPT! Toko disita karena telat bayar tagihan/hutang!', 'error'); 
        updateUI();
        return;
    } else if (state.loanAmount > 0) {
        state.loanDaysLeft--;
    }

    if(state.grading.length > 0) {
        let finishedGrading = []; 
        state.grading.forEach(g => { g.daysLeft--; if(g.daysLeft <= 0) finishedGrading.push(g); });
        state.grading = state.grading.filter(g => g.daysLeft > 0);
        finishedGrading.forEach(g => {
            let grade = Math.floor(Math.random() * 10) + 1; const roll = Math.random();
            if(roll < 0.1) grade = 10; else if(roll < 0.35) grade = 9; else if(roll < 0.65) grade = 8; else if(roll < 0.8) grade = 7; else grade = Math.floor(Math.random() * 6) + 1;
            state.myInventory.push({ id: state.nextCardId++, cardName: g.cardName, grade: grade }); 
            showToast(`🔍 ${g.cardName} kembali dari Grading! Dapat PSA ${grade}!`, 'success'); 
            playSound('sfx-tada');
        });
    } 

    state.dayCount++;
    state.time = 480; 
    state.isOpen = false;
    state.activeAd = state.queuedAd;
    state.queuedAd = null;
    
    const btnEndDay = document.getElementById('btn-end-day');
    if (btnEndDay) btnEndDay.style.display = 'none';
    
    const btnToggle = document.getElementById('btn-toggle-shop');
    if (btnToggle) {
        btnToggle.innerText = "Open";
        btnToggle.style.background = "var(--green)";
    }
    
    generateDailyEvent(); 
    saveGameState();
    updateUI();
    
    showToast(`Matahari terbit! Hari ${state.dayCount} dimulai.`, "success");
}

function recordSale(cardName, price, isOffline = false) {
    const day = state.dayCount;
    if (!state.analytics.dailyProfit[day]) state.analytics.dailyProfit[day] = 0;
    state.analytics.dailyProfit[day] += price;

    if (!isOffline) {
        if (!state.analytics.cardSalesCount[cardName]) state.analytics.cardSalesCount[cardName] = 0;
        state.analytics.cardSalesCount[cardName] += 1;
    }
}

function spawnCustomer() {
    if (state.isBankrupt || !state.myInventory.length) return;

    let adCapBuff = state.activeAd === 'brosur' ? 3 : 0;
    const maxCustomers = 3 + state.staff.marketing + (state.myCollection?.length || 0) + adCapBuff;
    if (state.customers.length >= maxCustomers) return;

    let numItems = Math.min(Math.floor(Math.random() * 3) + 1, state.myInventory.length);
    let shuffled = [...state.myInventory].sort(() => 0.5 - Math.random());
    let cart = shuffled.slice(0, numItems);

    let totalMarket = 0;
    let trueMarketSum = 0;
    let hasHolo = false;

    cart = cart.map(item => {
        let mPrice = state.marketPrices[item.cardName] || 0;
        if (item.grade) mPrice = Math.round(mPrice * getGradeMultiplier(item.grade));

        trueMarketSum += mPrice;
        const itemKey = item.cardName + (item.grade ? `_G${item.grade}` : '');
        let cPrice = state.customPrices[itemKey] || mPrice;
        totalMarket += cPrice;

        const cData = state.cardDatabase.find(c => c.name === item.cardName);
        if (cData && (cData.rarity?.includes('Holo') || cData.rarity?.includes('Secret'))) hasHolo = true;

        return {
            ...item,
            price: cPrice,
            displayName: item.grade ? `[PSA ${item.grade}] ${item.cardName}` : item.cardName
        };
    });

    // --- FITUR MIXED CART: TAMBAH ITEM/MERCH KE KERANJANG ---
    // Cek Kaos (Peluang 30% jika ada stok)
    if (state.myItems.kaos > 0 && Math.random() < 0.3) {
        const itemData = AVAILABLE_ITEMS.find(i => i.id === 'kaos');
        cart.push({
            id: 'item_kaos_' + Date.now(),
            itemId: 'kaos',
            cardName: itemData.name,
            displayName: `${itemData.icon} ${itemData.name}`,
            isItem: true,
            price: itemData.sellPrice
        });
        totalMarket += itemData.sellPrice;
        trueMarketSum += itemData.sellPrice;
    }

    // Cek Kopi (Peluang 40% jika ada stok, lumayan buat nambah omset)
    if (state.myItems.kopi > 0 && Math.random() < 0.4) {
        const itemData = AVAILABLE_ITEMS.find(i => i.id === 'kopi');
        cart.push({
            id: 'item_kopi_' + Date.now(),
            itemId: 'kopi',
            cardName: itemData.name,
            displayName: `${itemData.icon} ${itemData.name}`,
            isItem: true,
            price: itemData.sellPrice
        });
        totalMarket += itemData.sellPrice;
        trueMarketSum += itemData.sellPrice;
    }
    // ---------------------------------------------------------

    // Skip jika harga terlalu tinggi
    if (totalMarket > trueMarketSum * 2.5 && Math.random() < 0.9) return;

    let npcName = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];
    let isSultan = false;
    const sultanChance = state.currentEvent === "sultan_up" ? 0.7 : 0.3;

    if (state.repPoints >= 80 && hasHolo && Math.random() < sultanChance) {
        isSultan = true;
        npcName = "Sultan " + npcName;
    }

    // Kaos sultan bonus
    if (isSultan && state.myItems.kaos > 0 && Math.random() < 0.5) {
        state.myItems.kaos--;
        state.money += 35;
        showToast(`Sultan borong Kaos DBSKRN! +$35`, 'success');
    }

    let baseOffer = totalMarket * (1 + ((state.upgrades?.wallpaper || 0) * 0.05));
    if (state.staff.negotiator > 0) baseOffer *= (1 + state.staff.negotiator * 0.1);
    if (state.activeAd === 'spg') baseOffer *= 1.10;

    let offerPrice = Math.max(1, Math.round(baseOffer * (Math.random() * 0.2 + 0.75)));

    const paymentMethod = Math.random() < 0.5 ? 'Cash' : 'Debit';
    let paymentGiven = paymentMethod === 'Cash' 
        ? Math.ceil(offerPrice / 50) * 50 + 50 
        : offerPrice;

    const newCustomer = {
        id: Date.now() + Math.random(),
        name: npcName,
        cart: cart,
        offerPrice: offerPrice,
        isSultan: isSultan,
        paymentMethod: paymentMethod,
        paymentGiven: paymentGiven,
        status: state.hasCashier ? 'auto_processing' : 'waiting',
        processTime: cart.length * 2000
    };

    state.customers.push(newCustomer);
    updateUI();

    if (state.hasCashier) {
        setTimeout(() => processAutoCashier(newCustomer.id), newCustomer.processTime);
    }
}

function processAutoCashier(customerId) {
    const index = state.customers.findIndex(c => c.id === customerId);
    if (index === -1) return;

    const cust = state.customers[index];
    const stillExists = cust.cart.every(ci => {
        if (ci.isItem) return state.myItems[ci.itemId] > 0;
        return state.myInventory.some(inv => inv.id === ci.id);
    });

    if (stillExists) {
        executeSale(cust.cart, cust.name, cust.offerPrice, true);
    } else {
        showToast(`Kasir: Transaksi batal, stok barang habis!`, 'error');
    }

    state.customers.splice(index, 1);
    updateUI();
}

function acceptOffer(customerId) {
    const npcIndex = state.customers.findIndex(c => c.id === customerId); if(npcIndex === -1) return; 
    const npc = state.customers[npcIndex];

    let stillExists = npc.cart.every(ci => {
        if (ci.isItem) return state.myItems[ci.itemId] > 0;
        return state.myInventory.some(inv => inv.id === ci.id);
    });

    if(!stillExists) {
        showToast(`Gagal: Barang di keranjang sudah laku/habis!`, 'error');
        state.customers.splice(npcIndex, 1); updateUI(); return;
    }

    currentKasirCustomer = npc;

    // --- MULAI PERUBAHAN UI STRUK KASIR ---
    
    // 1. Hitung total harga asli dari seluruh barang di keranjang
    let totalAsli = npc.cart.reduce((sum, item) => sum + item.price, 0);

    // 2. Buat daftar list barangnya
    let itemsHtml = npc.cart.map(i => `
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; border-bottom: 1px dashed #555; padding-bottom: 4px;">
            <span style="color: #ccc;">- ${i.displayName}</span>
            <span style="color: #69F0AE; font-weight: bold;">$${i.price}</span>
        </div>
    `).join('');

    // 3. Cek selisih harga (Bundle / Nego)
    if (totalAsli !== npc.offerPrice) {
        let selisih = totalAsli - npc.offerPrice;
        let labelText = selisih > 0 ? "Diskon Bundle" : "Markup Sultan";
        let labelColor = selisih > 0 ? "#FF5252" : "#69F0AE"; // Merah = diskon/rugi, Hijau = untung bayar lebih
        let operatorSign = selisih > 0 ? '-' : '+';
        
        itemsHtml += `
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 8px; color: #888;">
                <span>Subtotal:</span>
                <span>$${totalAsli}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; border-bottom: 1px solid #666; padding-bottom: 4px; color: ${labelColor};">
                <span>${labelText}:</span>
                <span style="font-weight: bold;">${operatorSign}$${Math.abs(selisih)}</span>
            </div>
        `;
    }

    document.getElementById('kasir-items').innerHTML = itemsHtml;
    // --- AKHIR PERUBAHAN UI STRUK KASIR ---

    document.getElementById('kasir-total').innerText = `$${npc.offerPrice}`;
    document.getElementById('kasir-input').value = '';
    
    const infoBox = document.getElementById('kasir-payment-info');
    const itemCount = npc.cart.length;
    
    if (npc.paymentMethod === 'Cash') {
        const expectedChange = npc.paymentGiven - npc.offerPrice;
        infoBox.innerHTML = `
            <div style="text-align: left; font-family: 'Courier New', monospace; font-size: 14px; background: #263238; padding: 10px; border-radius: 6px; border: 1px solid #546E7A;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Total Belanja:</span> <span>$${npc.offerPrice} (${itemCount} Item)</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Tunai:</span> <span style="color: var(--green);">$${npc.paymentGiven}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px dashed #888; padding-top: 4px; margin-top: 4px; font-weight: bold;">
                    <span>Kembalian:</span> <span style="color: var(--amber);">$${expectedChange}</span>
                </div>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #A5D6A7;">Ketik nominal kembalian di atas pada kolom untuk memproses!</div>
        `;
        document.getElementById('kasir-input').placeholder = "Ketik Kembalian...";
    } else {
        infoBox.innerHTML = `💳 Pelanggan menggunakan <b style="color:#90CAF9;">Mesin EDC (Debit)</b><br><span style="color:#90CAF9; font-size:11px;">Ketik ulang TOTAL TAGIHAN ($${npc.offerPrice}) untuk memproses!</span>`;
        document.getElementById('kasir-input').placeholder = "Total Tagihan...";
    }
    openModal('modal-kasir');
}

function processKasir() {
    if(!currentKasirCustomer) return;
    const npc = currentKasirCustomer;
    const inputVal = parseInt(document.getElementById('kasir-input').value);
    
    if (isNaN(inputVal)) { showToast("Masukkan angka yang valid!", "error"); return; }

    if (npc.paymentMethod === 'Cash') {
        const expectedChange = npc.paymentGiven - npc.offerPrice;
        const diff = inputVal - expectedChange;

        if (diff === 0) {
            // Sempurna
        } else if (diff > 0 && diff <= 10) {
            showToast(`⚠️ Kembalian lebih $${diff}. Kamu rugi, tapi pelanggan senang!`, "warning");
            state.money -= diff; 
            state.repPoints = Math.min(100, state.repPoints + 2); 
        } else if (diff < 0 && diff >= -10) {
            showToast(`⚠️ Kembalian kurang $${Math.abs(diff)}. Pelanggan anggap tip, tapi ngedumel!`, "warning");
            state.money += Math.abs(diff); 
            state.repPoints = Math.max(0, state.repPoints - 3); 
        } else {
            showToast(`❌ Kembalian terlalu ngawur! Harusnya $${expectedChange}`, "error");
            return; 
        }
    } else {
        if (inputVal !== npc.offerPrice) { showToast(`❌ Nominal EDC salah! Harus ketik $${npc.offerPrice}`, "error"); return; }
    }

    let stillExists = npc.cart.every(ci => {
        if (ci.isItem) return state.myItems[ci.itemId] > 0;
        return state.myInventory.some(inv => inv.id === ci.id);
    });

    if(!stillExists) { showToast(`Transaksi batal, barang sudah tidak ada/stok habis.`, 'error'); } 
    else {
        executeSale(npc.cart, npc.name, npc.offerPrice, false);
        state.repPoints = Math.min(100, state.repPoints + 5);
    }

    state.customers = state.customers.filter(c => c.id !== npc.id);
    currentKasirCustomer = null;
    closeModal('modal-kasir');
    updateUI();
}

function executeSale(cart, npcName, totalPrice, byCashier = false) {
    state.money += totalPrice;

    // Pisahkan mana kartu dan mana item biasa
    const cardItems = cart.filter(i => !i.isItem);
    const merchItems = cart.filter(i => i.isItem);

    // 1. Kurangi stok KARTU dari myInventory
    const cardIds = cardItems.map(i => i.id);
    state.myInventory = state.myInventory.filter(i => !cardIds.includes(i.id));

    // 2. Kurangi stok MERCH dari myItems
    merchItems.forEach(merch => {
        if (state.myItems[merch.itemId] > 0) {
            state.myItems[merch.itemId]--;
        }
    });

    // 3. Rekap Penjualan & Sleeve Otomatis (Hanya untuk Kartu)
    cart.forEach(item => {
        if (!item.isItem) {
            const cardData = state.cardDatabase.find(c => c.name === item.cardName);
            // Sleeve auto sell untuk kartu Rare/Holo
            if (cardData && (cardData.rarity?.includes('Rare') || cardData.rarity?.includes('Holo')) 
                && state.myItems.sleeve > 0 && Math.random() < 0.5) {
                state.myItems.sleeve--;
                state.money += 2;
                setTimeout(() => showToast(`🛡️ ${npcName} tambah beli Sleeve! +$2`, 'success'), 800);
            }

            const itemKey = item.cardName + (item.grade ? `_G${item.grade}` : '');
            if (!state.myInventory.some(i => (i.cardName + (i.grade ? `_G${i.grade}` : '')) === itemKey)) {
                delete state.customPrices[itemKey];
            }
        }
        
        recordSale(item.cardName, Math.round(totalPrice / cart.length));
    });

    playSound('sfx-coin');
    const summary = cart.length > 1 ? `${cart.length} Item` : cart?.displayName;
    
    showToast(byCashier 
        ? `🧑‍💼 Kasir: ${npcName} beli ${summary} ($${totalPrice})` 
        : `💰 ${npcName} berhasil membayar $${totalPrice}!`, 'success');

    saveGameState();
    updateUI();
}

function rejectOffer(customerId) {
    const npcIndex = state.customers.findIndex(c => c.id === customerId);
    if(npcIndex !== -1) {
        const npc = state.customers[npcIndex];
        if(state.myItems.kopi > 0 && Math.random() < 0.6) { state.myItems.kopi--; state.money += 4; showToast(`🥤 ${npc.name} ditolak tapi beli Kopi Dingin! +$4`, 'success'); playSound('sfx-coin'); } 
        else { state.repPoints = Math.max(0, state.repPoints - 2); }
    } state.customers = state.customers.filter(c => c.id !== customerId); saveGameState(); updateUI();
}

function updateUI() {
    // Clock
    const clockEl = document.getElementById('ui-clock');
    if (clockEl) clockEl.innerText = formatTime(state.time);

    // Basic info
    document.getElementById('ui-day').innerText = `DAY ${state.dayCount}`;
    document.getElementById('ui-money').innerText = `$${state.money}`;

    // Reputation stars
    let starsHtml = '';
    const numStars = Math.max(1, Math.ceil(state.repPoints / 20));
    for (let i = 0; i < 5; i++) {
        starsHtml += i < numStars ? '★' : '<span class="dim">★</span>';
    }
    document.getElementById('ui-stars').innerHTML = starsHtml;

    // Loan
    const loanEl = document.getElementById('ui-loan');
    if (loanEl) {
        loanEl.style.display = state.loanAmount > 0 ? 'block' : 'none';
        if (state.loanAmount > 0) loanEl.innerText = `Hutang: $${state.loanAmount} (${state.loanDaysLeft} hr)`;
    }

    // Bankrupt
    const bankruptEl = document.getElementById('ui-bankrupt');
    const actionContainer = document.getElementById('ui-action-container');
    if (bankruptEl && actionContainer) {
        if (state.isBankrupt) {
            bankruptEl.style.display = 'block';
            actionContainer.style.pointerEvents = 'none';
            actionContainer.style.opacity = '0.5';
        } else {
            bankruptEl.style.display = 'none';
            actionContainer.style.pointerEvents = 'auto';
            actionContainer.style.opacity = '1';
        }
    }

    // Stream
    const btnStream = document.getElementById('btn-toggle-stream');
    if (btnStream) {
        if (state.stream.isLiveMode) {
            btnStream.classList.add('active');
            // Format HTML baru (Live ON)
            btnStream.innerHTML = `
                <div class="icon-box" style="background: linear-gradient(135deg, rgba(233, 30, 99, 0.7), rgba(233, 30, 99, 0.2)); border-color: #E91E63;">🔴</div>
                <div class="icon-text">Live: ON</div>`;
        } else {
            btnStream.classList.remove('active');
            // Format HTML baru (Live OFF)
            btnStream.innerHTML = `
                <div class="icon-box">📡</div>
                <div class="icon-text">Live: OFF</div>`;
        }
    }
    const streamStats = document.getElementById('ui-stream-stats');
    if (streamStats) streamStats.style.display = state.stream.isLiveMode ? 'flex' : 'none';
    const subsCount = document.getElementById('ui-subs-count');
    if (subsCount) subsCount.innerText = state.stream.subscribers;

    // Bills badge
    const badgeBills = document.getElementById('badge-bills');
    if (badgeBills) {
        badgeBills.style.display = state.unpaidBills > 0 ? 'block' : 'none';
        if (state.unpaidBills > 0) badgeBills.innerText = state.daysUnpaid > 0 ? `! (${state.daysUnpaid}H)` : '!';
    }

    // Shop button
    const btnToggle = document.getElementById('btn-toggle-shop');
    if (btnToggle) {
        btnToggle.innerText = state.isOpen ? "Close" : "Open";
        btnToggle.style.background = state.isOpen ? "var(--red)" : "var(--green)";
    }

    const btnEndDay = document.getElementById('btn-end-day');
    if (btnEndDay) btnEndDay.style.display = (!state.isOpen) ? 'block' : 'none';

    renderCustomersList();
    renderCollection();
    renderEtalaseGrid();
    renderRakBarang();
    refreshCurrentApp();
    applyVisualUpgrades();
}

function renderRakBarang() {
    const container = document.getElementById('ui-items');
    if (!container) return; 
    container.innerHTML = '';
    
    AVAILABLE_ITEMS.forEach(itemConfig => {
        const qty = state.myItems[itemConfig.id] || 0;
        if (qty > 0) {
            // --- LOGIKA TAMPILAN GAMBAR VS ICON ---
            let itemGraphic = '';
            if (itemConfig.img && itemConfig.img.trim() !== "") {
                // Pakai Gambar
                itemGraphic = `<img src="${itemConfig.img}" style="width:30px; height:30px; object-fit:contain; margin-bottom:2px;">`;
            } else {
                // Pakai Icon/Emoji
                itemGraphic = `<div class="item-icon" style="font-size:24px; margin-bottom:2px;">${itemConfig.icon}</div>`;
            }
            // ----------------------------------------

            container.innerHTML += `
                <div class="item-card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:5px; width:60px; height:60px;">
                    <div class="item-qty" style="position:absolute; top:2px; right:2px; background:var(--amber); color:black; font-size:10px; padding:1px 4px; border-radius:4px; font-weight:bold;">${qty}</div>
                    ${itemGraphic}
                    <div class="item-name" style="font-size:9px; text-align:center; line-height:1; color:#ccc;">${itemConfig.name}</div>
                </div>`;
        }
    });
    if (container.innerHTML === '') {
        container.innerHTML = `<div class="customer-empty">Rak Barang Kosong</div>`;
    }
}

function renderCustomersList() {
    const container = document.getElementById('ui-customers'); 
    if (!container) return; 
    container.innerHTML = '';
    
    // UI: Tampilan saat tidak ada pelanggan
    if (state.customers.length === 0) { 
        container.innerHTML = `
            <div style="text-align: center; color: #888; font-size: 12px; padding: 25px 10px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px dashed #444;">
                <div style="font-size: 24px; margin-bottom: 8px;">${state.isBankrupt ? '💸' : '💤'}</div>
                <div>${state.isBankrupt ? 'Toko Bangkrut!' : 'Toko sepi... Menunggu pelanggan.'}</div>
            </div>`; 
        return; 
    }
    
    state.customers.forEach(npc => {
        // Fallback untuk format lama ke baru (Cart System)
        if (!npc.cart) {
            let oldName = npc.targetGrade ? `[PSA ${npc.targetGrade}] ${npc.targetCardName}` : npc.targetCardName;
            npc.cart = [{ id: npc.targetCardId, cardName: npc.targetCardName, grade: npc.targetGrade, displayName: oldName }];
            npc.paymentMethod = 'Cash'; npc.paymentGiven = npc.offerPrice; npc.status = state.hasCashier ? 'auto_processing' : 'waiting';
        }

        const el = document.createElement('div'); 
        // Tambahkan inline-style dasar untuk card jika class CSS belum lengkap
        el.className = `customer-card ${npc.isSultan ? 'sultan' : ''}`;
        el.style.cssText = `background: #263238; border-radius: 10px; padding: 12px; margin-bottom: 10px; border: 1px solid ${npc.isSultan ? '#FFD700' : '#455A64'}; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; flex-direction: column;`;

        let summaryStr = npc.cart.length > 1 
            ? `<span style="color:#64B5F6; font-weight:bold;">🛒 ${npc.cart.length} Item</span>` 
            : (npc.cart.displayName || npc.cart.cardName);
        
        // UI: Mode Kasir Otomatis (Memproses)
        if (npc.status === 'auto_processing') {
            el.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 18px;">${npc.isSultan ? '👑' : '👤'}</span>
                    <strong style="color: ${npc.isSultan ? '#FFD700' : '#FFF'}; font-size: 14px;">${npc.name}</strong>
                </div>
                <div style="font-size: 11px; color: #B0BEC5; background: rgba(0,0,0,0.25); padding: 6px; border-radius: 4px; border-left: 3px solid #64B5F6; margin-bottom: 12px;">
                    ${summaryStr}
                </div>
                <div style="margin-top: auto; display: flex; align-items: center; justify-content: center; background: rgba(105, 240, 174, 0.1); padding: 8px; border-radius: 20px; border: 1px dashed #69F0AE;">
                    <span style="font-size: 12px; color: #69F0AE; font-weight: bold;">🧑‍💼 ⏳ Memproses...</span>
                </div>`;
        } 
        // UI: Mode Manual (Tawar Menawar)
        else {
            let trueMarketSum = npc.cart.reduce((sum, item) => sum + (state.marketPrices[item.cardName] || 0), 0);
            const isGoodOffer = npc.offerPrice >= trueMarketSum;
            
            const offerColor = isGoodOffer ? '#69F0AE' : '#FF5252'; 
            const bgOffer = isGoodOffer ? 'rgba(105, 240, 174, 0.15)' : 'rgba(255, 82, 82, 0.15)';

            el.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 18px;">${npc.isSultan ? '👑' : '👤'}</span>
                    <strong style="color: ${npc.isSultan ? '#FFD700' : '#FFF'}; font-size: 14px;">${npc.name}</strong>
                </div>

                <div style="font-size: 11px; color: #B0BEC5; background: rgba(0,0,0,0.25); padding: 6px; border-radius: 4px; border-left: 3px solid #64B5F6; margin-bottom: 10px;">
                    ${summaryStr}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <span style="font-size: 11px; color: #888;">Tawaran:</span>
                    <div style="color: ${offerColor}; background: ${bgOffer}; border: 1px solid ${offerColor}; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 14px; letter-spacing: 0.5px;">
                        $${npc.offerPrice}
                    </div>
                </div>

                <div style="display: flex; gap: 8px; margin-top: auto;">
                    <button style="flex: 1; background: #FF5252; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" onclick="rejectOffer(${npc.id})">✖</button>
                    <button style="flex: 1; background: #FF9800; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" onclick="openHaggleModal(${npc.id})">💬</button>
                    <button style="flex: 1; background: #4CAF50; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);" onclick="acceptOffer(${npc.id})">✔</button>
                </div>`;
        }
        container.appendChild(el);
    });
}

function openHaggleModal(id) {
    const npc = state.customers.find(c => c.id === id);
    if(!npc) return;
    currentHaggleCustomer = npc;
    document.getElementById('haggle-name').innerText = npc.name;
    document.getElementById('haggle-offer').innerText = `Tawaran awal: $${npc.offerPrice}`;
    document.getElementById('haggle-input').value = npc.offerPrice;
    openModal('modal-haggle');
}

function processHaggle() {
    if(!currentHaggleCustomer) return;
    let cpLevel = state.upgrades ? state.upgrades.carpet || 0 : 0;
    const npc = currentHaggleCustomer;
    const newPrice = parseInt(document.getElementById('haggle-input').value);
    
    if(isNaN(newPrice)) return showToast("Masukkan angka valid!", "error");

    let trueMarketSum = npc.cart.reduce((sum, item) => sum + (state.marketPrices[item.cardName] || 0), 0);
    let margin = 1.05 + (state.staff.negotiator * 0.08) + (cpLevel * 0.05);
    let maxAcceptable = trueMarketSum * margin;

    if (newPrice <= npc.offerPrice) {
        showToast(`🤝 ${npc.name} girang banget dapet diskon!`, "success");
        npc.offerPrice = newPrice;
        if(npc.paymentMethod === 'Cash') npc.paymentGiven = Math.ceil(newPrice / 50) * 50;
        closeModal('modal-haggle');
        acceptOffer(npc.id); 
    } 
    else if (newPrice <= maxAcceptable && Math.random() < 0.75) {
        showToast(`🤝 ${npc.name} setuju dengan harga $${newPrice}!`, "success");
        npc.offerPrice = newPrice;
        if(npc.paymentMethod === 'Cash') npc.paymentGiven = Math.ceil(newPrice / 50) * 50;
        closeModal('modal-haggle');
        updateUI(); 
    } 
    else {
        showToast(`😠 ${npc.name} merasa diperas dan langsung pergi!`, "error");
        if(state.myItems.kopi > 0) { 
            state.myItems.kopi--; 
            state.money += 4; 
            setTimeout(() => showToast(`🥤 Untung ada Kopi Dingin meredakan amarahnya! (Reputasi Aman)`, 'success'), 1500); 
        } else {
            state.repPoints = Math.max(0, state.repPoints - 4); 
        }
        state.customers = state.customers.filter(c => c.id !== npc.id);
        closeModal('modal-haggle');
        updateUI();
    }
}

window.updateBinderFilter = function() {
    currentSearchQuery = document.getElementById('binder-search').value.toLowerCase();
    currentSortMethod = document.getElementById('binder-sort').value;
    currentBinderPage = 0; 
    renderEtalaseGrid();
};

function renderEtalaseGrid() {
    const container = document.getElementById('ui-etalase'); container.innerHTML = ''; 
    const grouped = {}; 
    state.myInventory.forEach(item => { 
        const key = item.cardName + (item.grade ? `_G${item.grade}` : ''); 
        if(!grouped[key]) grouped[key] = []; 
        grouped[key].push(item); 
    });
    
    let uniqueKeys = Object.keys(grouped);

    if(currentSearchQuery) {
        uniqueKeys = uniqueKeys.filter(key => key.toLowerCase().includes(currentSearchQuery));
    }

    uniqueKeys.sort((a, b) => {
        const itemA = grouped[a][0];
        const itemB = grouped[b][0];
        const priceA = state.customPrices[a] || Math.round((state.marketPrices[itemA.cardName]||0) * getGradeMultiplier(itemA.grade));
        const priceB = state.customPrices[b] || Math.round((state.marketPrices[itemB.cardName]||0) * getGradeMultiplier(itemB.grade));
        
        if (currentSortMethod === 'price_desc') return priceB - priceA;
        if (currentSortMethod === 'price_asc') return priceA - priceB;
        if (currentSortMethod === 'name_asc') return a.localeCompare(b);
        return 0; 
    });

    const totalPages = Math.max(1, Math.ceil(uniqueKeys.length / 20));
    if (currentBinderPage >= totalPages) currentBinderPage = totalPages - 1; if (currentBinderPage < 0) currentBinderPage = 0;
    
    document.getElementById('binder-page-text').innerText = `Hal ${currentBinderPage + 1} / ${totalPages}`; 
    document.getElementById('btn-prev-page').disabled = currentBinderPage === 0; 
    document.getElementById('btn-next-page').disabled = currentBinderPage >= totalPages - 1;
    
    const startIndex = currentBinderPage * 20; const pageCards = uniqueKeys.slice(startIndex, startIndex + 20);
    
    for (let i = 0; i < 20; i++) {
        const el = document.createElement('div');
        if (i < pageCards.length) {
            const key = pageCards[i]; const groupItems = grouped[key]; const qty = groupItems.length; 
            const sampleItem = groupItems[0];
            const cardName = sampleItem.cardName; 
            const grade = sampleItem.grade; 
            const cardData = state.cardDatabase.find(c => c.name === cardName);
            
            if(cardData) {
                let marketPrice = state.marketPrices[cardName]; if(grade) marketPrice = Math.round(marketPrice * getGradeMultiplier(grade));
                const hasCustom = state.customPrices.hasOwnProperty(key); const priceText = hasCustom ? `$${state.customPrices[key]}` : `$${marketPrice}`; const priceColor = hasCustom ? '#69F0AE' : 'white';
                const trend = state.marketTrends[cardName] || 0; let trendIcon = trend > 0 ? '▲' : (trend < 0 ? '▼' : '▬'); let trendColor = trend > 0 ? '#4CAF50' : (trend < 0 ? '#F44336' : '#9E9E9E'); let gradeBadge = grade ? `<div class="grade-badge">PSA ${grade}</div>` : '';
                el.className = 'etalase-item filled'; el.onclick = () => renderCardActionModal(cardName, grade, qty, key);
                el.innerHTML = `${gradeBadge}<img src="${cardData.imageUrl}" onerror="this.src=''; this.style.background='#333';"><div class="etalase-qty">x${qty}</div><div class="etalase-info"><span style="color:${trendColor}; font-size:8px;">${trendIcon}</span><span style="color:${priceColor}">${priceText}</span></div>`;
            } else {
                // RENDER JIKA KARTU CORRUPT / MISSING
                el.className = 'etalase-item filled'; 
                el.innerHTML = `<div style="color:#F44336; font-size:10px; font-weight:bold; text-align:center; padding:5px;">ERROR<br><span style="color:#aaa; font-size:8px;">${cardName || 'Unknown'}</span></div><div class="etalase-qty" style="background:#555;">x${qty}</div>`;
                el.onclick = async () => {
                    if (await customConfirm("Kartu ini corrupt (Data API tidak ditemukan). Hapus dari inventaris?", "Kartu Corrupt")) {
                        state.myInventory = state.myInventory.filter(item => item.cardName !== cardName);
                        delete state.customPrices[key];
                        saveGameState();
                        updateUI();
                    }
                };
            }
        } else { el.className = 'etalase-item'; el.innerHTML = `<span style="color: #90A4AE; font-size: 10px; opacity: 0.5;">Kosong</span>`; }
        container.appendChild(el);
    }
}

function renderCollection() {
    // Pastikan koleksi selalu ada
    if (!state.myCollection) state.myCollection = [];

    const container = document.getElementById('ui-collection');
    if (!container) {
        console.error("ERROR: Elemen #ui-collection tidak ditemukan di HTML!");
        return;
    }

    // Kosongkan dulu
    container.innerHTML = '';

    // Render 5 slot permanen (lemari kaca)
    for (let i = 0; i < 5; i++) {
        const el = document.createElement('div');
        el.className = 'etalase-item private-slot';

        if (i < state.myCollection.length) {
            const item = Array.isArray(state.myCollection[i]) 
                ? state.myCollection[i][0] 
                : state.myCollection[i];
            const cardName = (item.cardName || '').trim();
            const grade = item.grade;

            // Cari kartu di database (matching lebih longgar)
            const cardData = state.cardDatabase.find(c => 
                c && c.name && c.name.trim().toLowerCase() === cardName.toLowerCase()
            );

            console.log(item.id)

            if (cardData && cardData.imageUrl) {
                // === KARTU NORMAL & VALID ===
                const gradeBadge = grade 
                    ? `<div class="grade-badge grade-collection">PSA ${grade}</div>` 
                    : '';

                el.classList.add('filled');
                el.style.border = '3px solid #FFD700';
                el.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.6)';
                el.style.cursor = 'pointer';

                el.innerHTML = `
                    ${gradeBadge}
                    <img src="${cardData.imageUrl}" 
                         alt="${cardName}"
                         onerror="this.src=''; this.style.background='#1e1e1e'; this.style.minHeight='140px';">
                `;

                el.onclick = () => takeFromCollection(i);

            } else {
                // === KARTU MISSING / CORRUPT ===
                el.classList.add('filled', 'corrupt-item');
                el.style.border = '3px solid #F44336';
                el.style.background = 'rgba(244, 67, 54, 0.1)';
                el.style.cursor = 'pointer';

                el.innerHTML = `
                    <div class="missing-card">
                        <div style="font-size: 28px; margin-bottom: 8px;">⚠️</div>
                        <div style="font-weight: bold; color: #FF5252; font-size: 13px; line-height: 1.3;">
                            MISSING DATA
                        </div>
                        <div style="font-size: 11px; color: #aaa; margin-top: 4px; word-break: break-all;">
                            ${cardName || 'Unknown Card'}
                            ${grade ? `<br>PSA ${grade}` : ''}
                        </div>
                        <button class="small-btn delete-btn" 
                                onclick="event.stopImmediatePropagation(); removeCorruptCard(${i});">
                            Hapus
                        </button>
                    </div>
                `;

                // Tetap bisa tarik kartu (meski corrupt)
                el.onclick = (e) => {
                    if (!e.target.classList.contains('delete-btn')) {
                        takeFromCollection(i);
                    }
                };
            }
        } else {
            // === SLOT KOSONG ===
            el.innerHTML = `
                <span style="color: rgba(255, 215, 0, 0.35); 
                             font-size: 11px; 
                             font-weight: bold;
                             letter-spacing: 1px;">
                    SLOT ${i + 1}
                </span>
            `;
            el.style.border = '2px dashed rgba(255, 215, 0, 0.25)';
            el.style.background = 'rgba(0, 0, 0, 0.15)';
            el.style.cursor = 'default';
        }

        container.appendChild(el);
    }
}

// Fungsi baru untuk menghapus kartu corrupt
window.removeCorruptCard = async function(index) {
    if (await customConfirm(`Hapus kartu corrupt di slot ${index + 1} dari koleksi?`, "Hapus Koleksi")) {
        if (state.myCollection[index]) {
            const cardName = state.myCollection[index].cardName;
            state.myCollection.splice(index, 1);
            showToast(`Kartu "${cardName || 'Corrupt'}" dihapus dari koleksi.`, 'warning');
            saveGameState();
            renderCollection();
        }
    }
};

async function takeFromCollection(index) {
    if (await customConfirm("Tarik kartu ini dari Lemari Kaca kembali ke Etalase Binder?", "Tarik Koleksi")) {
        let item = state.myCollection.splice(index, 1);
        if (Array.isArray(item)) item = item;
        
        state.myInventory.push(item);
        playSound('sfx-coin');
        saveGameState();
        updateUI();
    }
}

function prevBinderPage() { if (currentBinderPage > 0) { currentBinderPage--; renderEtalaseGrid(); } }
function nextBinderPage() { const grouped = {}; state.myInventory.forEach(item => { const key = item.cardName + (item.grade ? `_G${item.grade}` : ''); grouped[key] = true; }); const totalPages = Math.ceil(Object.keys(grouped).length / 20); if (currentBinderPage < totalPages - 1) { currentBinderPage++; renderEtalaseGrid(); } }

function renderCardActionModal(cardName, grade, qty, itemKey) {
    const baseMarket = state.marketPrices[cardName] || 0; 
    const cardData = state.cardDatabase.find(c => c.name === cardName);
    const multiplier = getGradeMultiplier(grade); 
    const marketPrice = Math.round(baseMarket * multiplier); 
    const baseVal = Math.round((cardData ? cardData.baseValue : 0) * multiplier);
    const currentSetPrice = state.customPrices[itemKey] || marketPrice; 
    const displayName = grade ? `[PSA ${grade}] ${cardName}` : cardName;

    document.getElementById('card-action-title').innerHTML = `<span style="font-size: 14px;">${displayName}</span><button class="close-btn" onclick="closeModal('modal-card')">&times;</button>`;
    document.getElementById('card-action-image').src = cardData ? cardData.imageUrl : '';
    const badgeEl = document.getElementById('card-action-grade-badge');
    if (grade) { badgeEl.style.display = 'block'; badgeEl.innerText = `PSA ${grade}`; } else { badgeEl.style.display = 'none'; }

    document.getElementById('card-action-base').innerText = `Harga Dasar: $${baseVal}`; 
    document.getElementById('card-action-market').innerText = `Pasar: $${marketPrice}`; 
    document.getElementById('card-action-input').value = currentSetPrice;

    document.getElementById('btn-set-etalase').onclick = () => { 
        const inputVal = parseInt(document.getElementById('card-action-input').value); 
        state.customPrices[itemKey] = isNaN(inputVal) ? marketPrice : inputVal; 
        saveGameState(); closeModal('modal-card'); updateUI(); 
    };

    const quickPrice = Math.round(marketPrice * 0.8); 
    const btnQuick = document.getElementById('btn-sell-quick'); btnQuick.innerText = `Sell 1x → $${quickPrice}`;
    btnQuick.onclick = () => {
        state.money += quickPrice; const index = state.myInventory.findIndex(i => (i.cardName + (i.grade ? '_G'+i.grade : '')) === itemKey);
        if (index !== -1) { 
            const soldId = state.myInventory[index].id; state.myInventory.splice(index, 1); state.customers = state.customers.filter(c => c.targetCardId !== soldId); 
            if (!state.myInventory.some(i => (i.cardName + (i.grade ? '_G'+i.grade : '')) === itemKey)) delete state.customPrices[itemKey]; 
            playSound('sfx-coin'); recordSale(cardName, quickPrice); saveGameState(); 
        } 
        closeModal('modal-card');
    };

    const btnBulk = document.getElementById('btn-sell-bulk');
    if (qty > 1) {
        const bulkPrice = Math.round(marketPrice * qty * 0.9); btnBulk.style.display = 'block'; btnBulk.innerText = `Sell All x${qty} → $${bulkPrice}`;
        btnBulk.onclick = () => {
            state.money += bulkPrice; state.myInventory = state.myInventory.filter(i => (i.cardName + (i.grade ? '_G'+i.grade : '')) !== itemKey); 
            delete state.customPrices[itemKey]; state.customers = state.customers.filter(c => (c.targetCardName + (c.targetGrade ? '_G'+c.targetGrade : '')) !== itemKey); 
            playSound('sfx-coin'); recordSale(cardName, bulkPrice); state.analytics.cardSalesCount[cardName] += (qty - 1); saveGameState(); closeModal('modal-card');
        };
    } else { btnBulk.style.display = 'none'; } 
    
    const btnCollection = document.getElementById('btn-set-collection');
    if(!state.myCollection) state.myCollection = [];
    if (state.myCollection.length >= 5) {
        btnCollection.style.background = '#555';
        btnCollection.innerText = 'Lemari Kaca Penuh (Maks 5)';
        btnCollection.onclick = null;
    } else {
        btnCollection.style.background = '#9C27B0';
        btnCollection.innerText = 'Pajang ke Lemari Kaca';
        btnCollection.onclick = () => {
            const index = state.myInventory.findIndex(i => (i.cardName + (i.grade ? '_G'+i.grade : '')) === itemKey);
            if(index !== -1) {
                const item = state.myInventory.splice(index, 1);
                state.myCollection.push(item);
                playSound('sfx-tada');
                showToast(`🏆 ${item.cardName} dipajang di Lemari Kaca!`, 'success');
                
                state.customers = state.customers.filter(c => !c.cart.some(ci => ci.id === item.id));
                
                saveGameState();
                closeModal('modal-card');
                updateUI();
            }
        };
    }

    openModal('modal-card');
}

function closeComputerModal() { closeModal('modal-computer'); showDesktop(); }
function showDesktop() {
    currentOpenApp = null;
    document.getElementById('computer-desktop').style.display = 'grid'; document.getElementById('computer-app').style.display = 'none'; document.getElementById('computer-app').innerHTML = '';
    document.getElementById('computer-title').innerText = 'DBS-OS v1.0'; document.getElementById('btn-close-computer').style.display = 'block'; document.getElementById('btn-back-desktop').style.display = 'none';
}
function openComputerView(title, html) {
    document.getElementById('computer-desktop').style.display = 'none'; const appContainer = document.getElementById('computer-app'); appContainer.style.display = 'block'; appContainer.innerHTML = html;
    document.getElementById('computer-title').innerText = title; document.getElementById('btn-close-computer').style.display = 'none'; document.getElementById('btn-back-desktop').style.display = 'block';
}

function openAppGrosir() {
    currentOpenApp = 'grosir'; let html = `<div style="font-weight: bold; margin: 0 0 8px 0; color: var(--amber);">📦 Paket Kartu</div>`;
    AVAILABLE_PACKS.forEach(pack => {
        const canBuy = state.money >= pack.price; const packIcon = pack.img ? `<img src="${pack.img}" style="width:100%; height:100%; object-fit:cover;">` : `🛍️`;
        html += `<div class="list-item"><div class="list-icon">${packIcon}</div><div class="list-text"><div class="list-title">${pack.name}</div><div class="list-subtitle">Harga: $${pack.price}</div></div><button class="btn" style="background:${pack.color}" ${!canBuy ? 'disabled' : ''} onclick="buyPack('${pack.id}', ${pack.price})">Beli</button></div>`;
    });
    html += `<div style="font-weight: bold; margin: 16px 0 8px 0; color: var(--green);">🛒 Suplai Barang</div>`;
    AVAILABLE_ITEMS.forEach(item => {
        const canBuy = state.money >= item.buyPrice;
        
        // --- LOGIKA TAMPILAN GAMBAR VS ICON DI GROSIR ---
        let itemGraphic = '';
        if (item.img && item.img.trim() !== "") {
            itemGraphic = `<img src="${item.img}" style="width:100%; height:100%; object-fit:contain;">`;
        } else {
            itemGraphic = item.icon; // Kalau pakai emoji, masukkan langsung
        }
        // ------------------------------------------------

        html += `<div class="list-item">
            <div class="list-icon" style="background:#333; display:flex; align-items:center; justify-content:center; padding:2px;">${itemGraphic}</div>
            <div class="list-text"><div class="list-title">${item.name}</div><div class="list-subtitle">$${item.buyPrice} (Isi ${item.buyQty} pcs)</div></div>
            <button class="btn" style="background:var(--blue)" ${!canBuy ? 'disabled' : ''} onclick="buyItem('${item.id}', ${item.buyPrice}, ${item.buyQty})">Beli</button>
        </div>`;
    });
    openComputerView('Marketplace', html);
}

function openAppTas() {
    currentOpenApp = 'tas'; let html = '';
    AVAILABLE_PACKS.forEach(pack => {
        const qty = state.myPacks[pack.id] || 0; const packIcon = pack.img ? `<img src="${pack.img}" style="width:100%; height:100%; object-fit:cover;">` : `📦`;
        html += `<div class="list-item"><div class="list-icon">${packIcon}</div><div class="list-text"><div class="list-title">${pack.name}</div><div class="list-subtitle">Dimiliki: ${qty}</div></div><button class="btn" style="background:var(--green)" ${qty <= 0 ? 'disabled' : ''} onclick="openPackAction('${pack.id}')">Buka</button></div>`;
    }); openComputerView('🎒 Tas Card', html);
}

function openAppTrade() {
    currentOpenApp = 'trade';
    const ampas = state.myInventory.filter(i => { const c = state.cardDatabase.find(x => x.name === i.cardName); const isAmpas = !c || c.baseValue <= 15; return isAmpas && !i.grade; });
    const canTrade = ampas.length >= 10;
    let html = `<div style="margin-bottom: 16px; padding: 12px; background: #37474F; border-radius: 8px; text-align: left;"><p style="font-size: 11px; color: #ccc; margin-bottom: 8px;">Tumbalkan 10 kartu Common/Uncommon acak untuk dilebur menjadi 1 Kartu Rare/Holo Acak!</p></div><div style="text-align:center; padding: 20px; border: 2px dashed #888; border-radius: 8px; margin-bottom: 16px;"><div style="font-size: 30px; margin-bottom: 8px;">🔥 ${ampas.length} / 10</div><div style="font-size: 12px; color: #888;">Kartu Ampas Tersedia</div></div><button class="btn btn-full" style="background: ${canTrade ? 'var(--purple)' : '#555'};" ${!canTrade ? 'disabled' : ''} onclick="executeTradeIn()">LEBUR 10 KARTU!</button>`;
    openComputerView('♻️ Mesin Trade-In', html);
}

function openAppGrading() {
    currentOpenApp = 'grading';
    let html = `<div style="margin-bottom: 16px; padding: 12px; background: #37474F; border-radius: 8px; text-align: left;"><p style="font-size: 11px; color: #ccc; margin-bottom: 8px;">Kirim kartu Rare/Holo ke PSA. Biaya $100. Proses: 2 Hari.<br>Grade 10 (Gem Mint) melipatgandakan harga 5x lipat!</p></div>`;
    if(state.grading.length > 0) {
        html += `<div style="font-weight: bold; margin-bottom: 8px; color: var(--amber);">Dalam Proses:</div>`;
        state.grading.forEach(g => { html += `<div class="list-item" style="background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; margin-bottom: 4px;"><div class="list-text"><div class="list-title" style="font-size: 12px;">${g.cardName}</div><div class="list-subtitle" style="color: #FFB300;">⏳ ${g.daysLeft} Hari Lagi</div></div></div>`; }); html += `<div class="divider"></div>`;
    }
    html += `<div style="font-weight: bold; margin-bottom: 8px;">Kartu Tersedia:</div>`;
    const gradeable = state.myInventory.filter(i => !i.grade && state.cardDatabase.some(c => c.name === i.cardName && (c.rarity.includes('Rare') || c.rarity.includes('Holo'))));
    if(gradeable.length === 0) { html += `<div style="text-align: center; color: #888; font-style: italic; padding: 20px;">Tidak ada kartu Rare/Holo yang belum di-grade.</div>`; } else {
        const grouped = {}; gradeable.forEach(item => { if(!grouped[item.cardName]) grouped[item.cardName] = []; grouped[item.cardName].push(item); });
        Object.keys(grouped).forEach(cardName => {
            const qty = grouped[cardName].length; const canAfford = state.money >= 100;
            html += `<div class="list-item" style="border-bottom: 1px solid #333;"><div class="list-text"><div class="list-title" style="font-size: 12px;">${cardName} (Tersedia: ${qty})</div></div><button class="btn" style="background:${canAfford ? 'var(--blue)' : '#555'}; font-size: 10px;" ${!canAfford ? 'disabled' : ''} onclick="sendToGrading('${cardName}')">Kirim ($100)</button></div>`;
        });
    } openComputerView('🔍 PSA Grading', html);
}

function openAppStaff() {
    currentOpenApp = 'staff';
    let html = `<div style="margin-bottom: 16px; padding: 12px; background: #37474F; border-radius: 8px; text-align: left;"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;"><strong style="color: var(--amber); font-size: 16px;">🧑‍💼 Kasir</strong></div><p style="font-size: 11px; color: #ccc; margin-bottom: 8px;">Otomatis melayani pembeli. Antrean tidak akan pernah penuh!</p>`;
    if(state.hasCashier) { html += `<div style="padding: 8px; background: rgba(0, 150, 136, 0.2); border: 1px solid #009688; border-radius: 4px; color: #64FFDA; font-weight: bold; text-align: center;">✅ Aktif (Gaji: $15/hari)</div>`; } else { const canBuy = state.money >= 500; html += `<button class="btn btn-full" style="background: ${canBuy ? '#009688' : '#555'}; padding: 8px;" ${!canBuy?'disabled':''} onclick="hireStaff()">Rekrut ($500)</button>`; }
    html += `</div>`;
    const staffTypes = [ { id: 'brewecker', name: '✂️ Tukang Breweck', desc: 'Auto-masuk etalase (Skip Animasi).', max: 1 }, { id: 'marketing', name: '📈 Marketing', desc: 'Meningkatkan antrean & kedatangan pembeli.', max: 3 }, { id: 'scout', name: '🕵️ Scout', desc: 'Peluang menemukan kartu Legend di Pack.', max: 3 }, { id: 'negotiator', name: '💬 Negotiator', desc: 'Pembeli berani bayar mahal (+10%/LVL).', max: 3 } ];
    staffTypes.forEach(st => {
        const lvl = state.staff[st.id]; let cost = 200 * (lvl + 1); if (st.id === 'brewecker') cost = 300; const isMax = lvl >= st.max; const canBuy = state.money >= cost && !isMax;
        html += `<div style="margin-bottom: 12px; padding: 12px; background: #2C3E50; border-radius: 8px; text-align: left; border-left: 4px solid var(--blue);"><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;"><strong style="color: white; font-size: 14px;">${st.name}</strong><span style="font-size: 11px; font-weight: bold; background: #111; padding: 2px 6px; border-radius: 4px; color: ${isMax ? 'var(--green)' : 'var(--amber)'};">LVL ${lvl}/${st.max}</span></div><p style="font-size: 11px; color: #aaa; margin-bottom: 8px;">${st.desc}</p>${isMax ? `<button class="btn btn-full" style="background: var(--green); padding: 8px;" disabled>⭐ MAX LEVEL</button>` : `<button class="btn btn-full" style="background: ${canBuy ? 'var(--blue)' : '#555'}; padding: 8px;" ${!canBuy?'disabled':''} onclick="upgradeStaff('${st.id}')">${st.id==='brewecker' ? 'Rekrut' : 'Tingkatkan'} ($${cost})</button>`}</div>`;
    }); openComputerView('🏢 Manajemen Staff', html);
}

function openAppBank() {
    currentOpenApp = 'bank'; let html = '';
    if(state.loanAmount === 0) { html += `<p style="color: #ccc; margin-bottom: 16px;">Butuh modal cepat?</p><button class="btn btn-full" style="background: #4CAF50;" onclick="takeLoan()">Pinjam $500 (bunga $100)</button>`; } 
    else { const canPay = state.money >= state.loanAmount; html += `<h2 style="color: #FF5252; margin-bottom: 4px;">Hutang: $${state.loanAmount}</h2><p style="color: #ccc; margin-bottom: 16px;">Jatuh Tempo: ${state.loanDaysLeft} hari</p><button class="btn btn-full" style="background: ${canPay ? '#2196F3' : '#555'};" ${!canPay?'disabled':''} onclick="payLoan()">Bayar Lunas</button>`; }
    openComputerView('🏦 Bank Pokemon', html);
}

function openAppBills() {
    currentOpenApp = 'bills';
    let html = `<div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 40px; margin-bottom: 10px;">📜</div>
        <h2 style="color: ${state.unpaidBills > 0 ? '#F44336' : '#4CAF50'}; margin: 0;">Total Tagihan: $${state.unpaidBills}</h2>
        <p style="color: #aaa; font-size: 12px; margin-top: 5px;">Menunggak: ${state.daysUnpaid} Hari (Awas bangkrut di hari ke-4!)</p>
    </div>`;
    
    const canPay = state.money >= state.unpaidBills && state.unpaidBills > 0;
    
    html += `<div style="background: #263238; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 12px; text-align: left;">
        <strong style="color:var(--amber);">Rincian Gaji Harian Aktif:</strong><br><br>
        - Kasir Otomatis: $${state.hasCashier ? 15 : 0}<br>
        - Tukang Breweck: $${state.staff.brewecker > 0 ? 20 : 0}<br>
        - Marketing (Lv.${state.staff.marketing}): $${state.staff.marketing * 10}<br>
        - Scout (Lv.${state.staff.scout}): $${state.staff.scout * 12}<br>
        - Negotiator (Lv.${state.staff.negotiator}): $${state.staff.negotiator * 15}
    </div>`;
    
    html += `<button class="btn btn-full" style="background: ${canPay ? 'var(--green)' : '#555'}; height: 50px; font-size: 16px;" ${!canPay ? 'disabled' : ''} onclick="payBills()">Bayar Lunas ($${state.unpaidBills})</button>`;
    
    openComputerView('📜 Tagihan & Pajak', html);
}

function payBills() {
    if(state.money >= state.unpaidBills) {
        state.money -= state.unpaidBills;
        state.unpaidBills = 0;
        state.daysUnpaid = 0;
        playSound('sfx-coin');
        showToast('Semua tagihan lunas! Toko aman.', 'success');
        saveGameState();
        openAppBills();
    }
}

const UPGRADE_DATA = {
    wallpaper: { name: "Wallpaper Mewah", desc: "+5% Harga Tawaran Pelanggan", costs: [1000, 2500, 5000], max: 3, icon: "🎨" },
    carpet: { name: "Karpet Empuk", desc: "+10% Batas Wajar saat Tawar-Menawar", costs: [800, 1500, 3000], max: 3, icon: "🧶" },
    spotlight: { name: "Lampu Sorot Kaca", desc: "+1 Kapasitas Maksimal Lemari Koleksi", costs: [2000, 4000, 8000], max: 3, icon: "💡" }
};

function openAppRenov() {
    currentOpenApp = 'renov';
    let html = `<div style="margin-bottom: 16px; padding: 12px; background: #37474F; border-radius: 8px; text-align: left;"><p style="font-size: 11px; color: #ccc; margin-bottom: 0;">Bakar uangmu di sini untuk mempercantik toko dan mendapatkan buff pasif permanen yang gila!</p></div>`;
    
    ['wallpaper', 'carpet', 'spotlight'].forEach(id => {
        const data = UPGRADE_DATA[id];
        const lvl = state.upgrades ? state.upgrades[id] || 0 : 0;
        const isMax = lvl >= data.max;
        const cost = isMax ? 0 : data.costs[lvl];
        const canBuy = state.money >= cost && !isMax;
        
        html += `<div style="margin-bottom: 12px; padding: 12px; background: #2C3E50; border-radius: 8px; border-left: 4px solid var(--amber); text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: white; font-size: 14px;">${data.icon} ${data.name}</strong>
                <span style="font-size: 11px; font-weight: bold; background: #111; padding: 2px 6px; border-radius: 4px; color: ${isMax ? 'var(--green)' : 'var(--amber)'};">LVL ${lvl}/${data.max}</span>
            </div>
            <p style="font-size: 11px; color: #aaa; margin-bottom: 8px;">${data.desc}</p>
            ${isMax ? `<button class="btn btn-full" style="background: var(--green); padding: 8px;" disabled>⭐ MAX LEVEL</button>` : `<button class="btn btn-full" style="background: ${canBuy ? 'var(--blue)' : '#555'}; padding: 8px;" ${!canBuy?'disabled':''} onclick="buyUpgrade('${id}')">Upgrade ($${cost})</button>`}
        </div>`;
    });
    openComputerView('🏪 Renovasi Toko', html);
}

function buyUpgrade(id) {
    if(!state.upgrades) state.upgrades = { wallpaper: 0, carpet: 0, spotlight: 0 };
    const data = UPGRADE_DATA[id]; const lvl = state.upgrades[id] || 0;
    if (lvl >= data.max) return;
    const cost = data.costs[lvl];
    
    if(state.money >= cost) {
        state.money -= cost;
        state.upgrades[id] = lvl + 1;
        playSound('sfx-coin');
        showToast(`Upgrade ${data.name} sukses!`, 'success');
        applyVisualUpgrades();
        saveGameState();
        openAppRenov();
    }
}

function applyVisualUpgrades() {
    if(!state.upgrades) return;
    const bgColors = ['#121212', '#1a237e', '#311b92', '#004d40']; 
    document.body.style.backgroundColor = bgColors[state.upgrades.wallpaper] || '#121212';
}

function openAppAnalytics() {
    currentOpenApp = 'analytics'; const today = state.dayCount; const yesterday = Math.max(1, today - 1);
    const profitToday = state.analytics.dailyProfit[today] || 0; const profitYesterday = state.analytics.dailyProfit[yesterday] || 0;
    const topCards = Object.entries(state.analytics.cardSalesCount).sort((a, b) => b - a).slice(0, 5);
    let topCardsHtml = '';
    if (topCards.length === 0) topCardsHtml = '<div style="color:#888; font-size:12px; text-align:center; padding: 10px;">Belum ada data penjualan</div>'; else topCards.forEach((c, i) => topCardsHtml += `<div class="top-card-item" style="display:flex; justify-content:space-between; margin-bottom:4px;"><span style="color:var(--text-light)">#${i+1} ${c}</span><strong style="color:var(--green)">${c} terjual</strong></div>`);
    let chartCardName = topCards.length > 0 ? topCards : (state.cardDatabase.length > 0 ? state.cardDatabase.name : ''); let chartHtml = '';
    if (chartCardName && state.priceHistory[chartCardName]) {
        const history = state.priceHistory[chartCardName]; const maxPrice = Math.max(...history, 1); let barsHtml = '';
        history.forEach(price => { const heightPct = Math.max(5, Math.round((price / maxPrice) * 100)); let color = 'var(--amber)'; if (heightPct > 80) color = 'var(--green)'; if (heightPct < 40) color = 'var(--red)'; barsHtml += `<div class="chart-bar-container" style="display:flex; flex-direction:column; justify-content:flex-end; align-items:center; flex:1;"><div class="chart-val" style="font-size:8px; color:#888;">$${price}</div><div class="chart-bar" style="width:100%; height: ${heightPct}%; background-color: ${color}; border-radius: 2px;"></div></div>`; });
        chartHtml = `<div style="font-size:12px; font-weight:bold; margin-top:16px; margin-bottom: 4px; color:var(--blue);">📈 Tren Harga Dasar: ${chartCardName}</div><div class="chart-wrapper" style="display:flex; gap:4px; height:80px; align-items:flex-end; margin-top:8px;">${barsHtml}</div>`;
    }
    let html = `<div style="display:flex; gap:8px; margin-bottom:16px;"><div class="stat-box" style="flex:1; background:#222; padding:10px; border-radius:6px; text-align:center;"><div class="stat-label" style="font-size:10px; color:#888;">Profit Hari Ini</div><div class="stat-value" style="font-size:18px; color:var(--green); font-weight:bold;">$${profitToday}</div></div><div class="stat-box" style="flex:1; background:#222; padding:10px; border-radius:6px; text-align:center;"><div class="stat-label" style="font-size:10px; color:#888;">Profit Kemarin</div><div class="stat-value" style="color:var(--text-dim); font-size:18px; font-weight:bold;">$${profitYesterday}</div></div></div><div style="background:#1A1A1A; padding:12px; border-radius:8px; border:1px solid #333;"><div style="font-size:12px; font-weight:bold; margin-bottom:8px; color:var(--amber);">🏆 Top 5 Kartu Terlaris</div>${topCardsHtml}</div>${chartHtml}`;
    openComputerView('📊 Analytics Toko', html);
}

function openAppSettings() {
    currentOpenApp = 'settings'; let breweckToggle = '';
    if (state.staff.brewecker > 0) { breweckToggle = `<div class="setting-row"><label>✂️ Auto-Breweck</label><input type="checkbox" ${state.settings.autoBreweck ? 'checked' : ''} onchange="toggleSetting('autoBreweck', this.checked)"></div>`; }
    let html = `<div style="margin-bottom: 24px;"><div class="setting-row"><label>🔊 Efek Suara (SFX)</label><input type="checkbox" ${state.settings.sfx ? 'checked' : ''} onchange="toggleSetting('sfx', this.checked)"></div><div class="setting-row"><label>🎵 Musik Latar (BGM)</label><input type="checkbox" ${state.settings.music ? 'checked' : ''} onchange="toggleSetting('music', this.checked)"></div>${breweckToggle}</div><div style="margin-bottom: 24px; background: #1A1A1A; padding: 12px; border-radius: 8px; border: 1px solid #333;"><div style="font-weight: bold; margin-bottom: 8px;">🌐 Custom API URL</div><div style="font-size: 11px; color: #888; margin-bottom: 8px;">Gunakan hanya untuk force-refresh jika gambar gagal diload di lokal.</div><input type="text" id="api-set1" placeholder="API Set 1 (Contoh: https://...)" value="${state.apiUrls.set1}"><input type="text" id="api-set2" placeholder="API Set 2 (Contoh: https://...)" value="${state.apiUrls.set2}"><button class="btn btn-full" style="background: var(--blue); margin-top: 12px;" onclick="applyCustomAPI()">Paksa Refresh & Unduh Ulang Gambar</button></div><div class="divider"></div><button class="btn btn-full" style="background: var(--red);" onclick="resetGame()">Hapus & Reset Semua Data</button>`;
    html += `</div><div class="divider"></div>
    <button class="btn btn-full" style="background: #FF9800; margin-bottom: 12px; color: black;" onclick="showAdminPinScreen()">🛠️ Admin Panel Server</button>`;
        
    openComputerView('⚙️ Pengaturan', html);
}

function refreshCurrentApp() {
    if(currentOpenApp === 'grosir') openAppGrosir(); if(currentOpenApp === 'tas') openAppTas();
    if(currentOpenApp === 'trade') openAppTrade(); if(currentOpenApp === 'grading') openAppGrading();
    if(currentOpenApp === 'staff') openAppStaff(); if(currentOpenApp === 'bank') openAppBank();
    if(currentOpenApp === 'analytics') openAppAnalytics(); if(currentOpenApp === 'settings') openAppSettings();
    if(currentOpenApp === 'admin_pin') showAdminPinScreen();
    if(currentOpenApp === 'admin') openAppAdminPanel();
    if(currentOpenApp === 'marketing') openAppMarketing();
}

function buyItem(id, price, qty) { if(state.money >= price) { state.money -= price; state.myItems[id] = (state.myItems[id] || 0) + qty; playSound('sfx-coin'); showToast(`📦 Berhasil kulakan barang!`, 'success'); saveGameState(); } }
function buyPack(id, price) {
    if(state.money >= price) {
        state.money -= price; 
        if (state.staff.brewecker > 0 && state.settings.autoBreweck && !state.stream.isLiveMode) {
            const packConf = AVAILABLE_PACKS.find(p => p.id === id); let pulled = [];
            for (let i = 0; i < 9; i++) pulled.push(gachaSingleCard(packConf.apiSetId)); pulled.push(gachaSingleCard(packConf.apiSetId, true));
            pulled.forEach(card => { state.myInventory.push({ id: state.nextCardId++, cardName: card.name }); }); playSound('sfx-tada'); showToast(`✂️ Breweck: 10 Kartu ${packConf.name} langsung masuk Etalase!`, 'success');
        } else { state.myPacks[id] = (state.myPacks[id] || 0) + 1; showToast(`Paket masuk ke Tas.`, 'success'); } saveGameState(); 
    }
}
function executeTradeIn() {
    let ampasIds = []; for(let i=0; i<state.myInventory.length; i++) { const item = state.myInventory[i]; const c = state.cardDatabase.find(x => x.name === item.cardName); const isAmpas = !c || c.baseValue <= 15; if(isAmpas && !item.grade) { ampasIds.push(item.id); if(ampasIds.length === 10) break; } }
    if(ampasIds.length === 10) {
        state.myInventory = state.myInventory.filter(i => !ampasIds.includes(i.id));
        const goodCards = state.cardDatabase.filter(c => c.baseValue >= 50); const reward = goodCards[Math.floor(Math.random() * goodCards.length)] || state.cardDatabase;
        state.myInventory.push({ id: state.nextCardId++, cardName: reward.name }); playSound('sfx-tada'); showToast(`🔥 Trade-in sukses! Mendapatkan ${reward.name}!`, 'success'); saveGameState();
    }
}
function sendToGrading(cardName) {
    if(state.money >= 100) { const index = state.myInventory.findIndex(i => i.cardName === cardName && !i.grade); if(index !== -1) { state.money -= 50; state.myInventory.splice(index, 1); state.grading.push({ id: Date.now(), cardName: cardName, daysLeft: 2 }); playSound('sfx-coin'); showToast(`Kartu dikirim ke lembaga Grading!`, 'success'); saveGameState(); } }
}
function hireStaff() { if(state.money >= 500) { state.money -= 500; state.hasCashier = true; saveGameState(); showToast('🧑‍💼 Kasir berhasil direkrut!', 'success'); } }
function upgradeStaff(type) {
    const lvl = state.staff[type]; let max = 3; if(type === 'brewecker') max = 1; if (lvl >= max) return; let cost = 200 * (lvl + 1); if (type === 'brewecker') cost = 300;
    if(state.money >= cost) { state.money -= cost; state.staff[type]++; if (type === 'brewecker') state.settings.autoBreweck = true; saveGameState(); let typeName = type.charAt(0).toUpperCase() + type.slice(1); if (type === 'brewecker') typeName = 'Tukang Breweck'; showToast(`🎉 ${typeName} berhasil di-upgrade!`, 'success'); }
}
function applyCustomAPI() { state.apiUrls.set1 = document.getElementById('api-set1').value.trim(); state.apiUrls.set2 = document.getElementById('api-set2').value.trim(); saveGameState(); closeComputerModal(); document.getElementById('loading-screen').style.display = 'flex'; fetchCardsFromAPI(true).then(() => { document.getElementById('loading-screen').style.display = 'none'; showToast("Database & Gambar berhasil diperbarui!", "success"); updateUI(); }); }
function toggleSetting(key, val) { if(key === 'autoBreweck' && val && state.stream.isLiveMode) { state.stream.isLiveMode = false; showToast("Auto-Breweck menyala, Live Stream mati.", "error"); updateUI(); } state.settings[key] = val; saveGameState(); if (key === 'music') applyMusicSetting(); }

async function resetGame() {
    if (await customConfirm("⚠ PERINGATAN KERAS!\n\nYakin ingin menghapus SEMUA uang, kartu, dan staf? Data tidak bisa dikembalikan!", "Reset Total")) {
        localStorage.removeItem('tcgTycoonSave');
        localStorage.removeItem('tcgTycoonCardDB');
        location.reload();
    }
}

function takeLoan() { state.loanAmount = 600; state.loanDaysLeft = 3; state.money += 500; state.isBankrupt = false; saveGameState(); showToast('+$500. Kembalikan $600 dalam 3 hari!', 'success'); showDesktop(); }
function payLoan() { if(state.money >= state.loanAmount) { state.money -= state.loanAmount; state.loanAmount = 0; state.loanDaysLeft = 0; saveGameState(); showToast('Hutang lunas! Toko aman kembali.', 'success'); showDesktop(); } }

function toggleStreamMode() {
    if (state.staff.brewecker > 0 && state.settings.autoBreweck) { showToast("Matikan Auto-Breweck di Setting untuk bisa Live Stream!", "error"); return; }
    state.stream.isLiveMode = !state.stream.isLiveMode; saveGameState();
    showToast(state.stream.isLiveMode ? "📡 Mode Live Stream AKTIF" : "📡 Mode Live Stream MATI", "success");
}
function addChatMessage(container, user, text, isSuperChat = false, amount = 0) { const msgEl = document.createElement('div'); if(isSuperChat) { msgEl.className = 'super-chat'; msgEl.innerHTML = `<div class="chat-user">${user}</div><div class="super-chat-amount">💵 Donasi $${amount}</div><div style="font-size:12px;">${text}</div>`; state.money += amount; playSound('sfx-coin'); document.getElementById('ui-money').innerText = `$${state.money}`; } else { msgEl.className = 'chat-message'; msgEl.innerHTML = `<span class="chat-user">${user}:</span> ${text}`; } container.appendChild(msgEl); container.scrollTop = container.scrollHeight; }
function startSimulatedChat(container) { if(chatInterval) clearInterval(chatInterval); chatInterval = setInterval(() => { const user = CHAT_NAMES[Math.floor(Math.random() * CHAT_NAMES.length)]; const text = CHAT_NORMAL[Math.floor(Math.random() * CHAT_NORMAL.length)]; addChatMessage(container, user, text); }, 1200); }

function gachaSingleCard(setId, guaranteedRare = false) {
    let setCards = state.cardDatabase.filter(c => c.setId === setId);
    
    // Fallback kalau API/Database lokal bermasalah
    if (!setCards || setCards.length === 0) {
        setCards = state.cardDatabase;
    }
    
    if (!setCards || setCards.length === 0) return { name: "Error Card", rarity: "Common", baseValue: 5, imageUrl: "" }; 

    const basics = setCards.filter(c => c.rarity === 'Common' || !c.rarity); 
    const rares = setCards.filter(c => c.rarity === 'Uncommon');
    const superRares = setCards.filter(c => c.rarity.includes('Rare') && !c.rarity.includes('Holo') && !c.rarity.includes('Secret')); 
    const legends = setCards.filter(c => c.rarity.includes('Holo') || c.rarity.includes('Secret') || c.rarity.includes('VMAX'));

    let rand = Math.random() * 100; if(state.staff.scout > 0) rand = Math.min(99.9, rand + (state.staff.scout * 4));
    const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    let result = null;
    if (guaranteedRare) {
        if (rand < 40 && rares.length > 0) result = pickRandom(rares); 
        else if (rand < 80 && superRares.length > 0) result = pickRandom(superRares); 
        else if (legends.length > 0) result = pickRandom(legends); 
    } else {
        if (rand < 65 && basics.length > 0) result = pickRandom(basics); 
        else if (rand < 85 && rares.length > 0) result = pickRandom(rares);
        else if (rand < 96 && superRares.length > 0) result = pickRandom(superRares); 
        else if (legends.length > 0) result = pickRandom(legends); 
    }
    
    return result || pickRandom(setCards) || setCards;
}

window.openPackAction = function(packId) {
    if (isAnimating) return; 
    if (state.stream.isLiveMode && state.staff.brewecker > 0 && state.settings.autoBreweck) { showToast("Matikan Auto-Breweck untuk melihat animasi Live Stream!", "error"); return; }
    openSpecificPack(packId);
}

function openSpecificPack(packId) {
    const packConf = AVAILABLE_PACKS.find(p => p.id === packId); if (!packConf || state.myPacks[packId] <= 0) return; state.myPacks[packId]--;
    let pulled = []; for (let i = 0; i < 9; i++) pulled.push(gachaSingleCard(packConf.apiSetId)); pulled.push(gachaSingleCard(packConf.apiSetId, true));
    if (state.staff.brewecker > 0 && state.settings.autoBreweck) { pulled.forEach(card => { state.myInventory.push({ id: state.nextCardId++, cardName: card.name }); }); playSound('sfx-tada'); showToast(`✂️ Breweck: 10 Kartu ${packConf.name} masuk Etalase!`, 'success'); saveGameState(); } 
    else { 
        isAnimating = true; saveGameState(); 
        closeComputerModal(); 
        renderPackOpening(packConf, pulled); 
    }
}

function renderPackOpening(packConf, pulledCards) {
    const modal = document.getElementById('pack-opening-modal'); modal.style.display = 'flex';
    let streamOverlayHtml = ''; let currentViewers = 0;
    if(state.stream.isLiveMode) { currentViewers = Math.floor(Math.random() * 15) + Math.floor(state.stream.subscribers * 0.1) + 5; streamOverlayHtml = `<div class="stream-overlay" id="stream-overlay" style="display: flex;"><div class="stream-header"><span style="color:white; font-weight:bold; font-size: 14px;">📺 ${state.stream.channelName}</span><div class="stream-viewers"><div class="live-dot"></div> <span>${currentViewers}</span></div></div><div class="stream-chat-container" id="stream-chat"></div></div>`; }
    let packContent = packConf.img ? `<img src="${packConf.img}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;">` : `<span style="z-index: 1;">${packConf.name.toUpperCase()}<br>BOOSTER</span>`;
    modal.innerHTML = `${streamOverlayHtml}<div class="pack-shake-old" id="pack-graphic">${packContent}</div><div style="position: absolute; bottom: 20px; color: white; font-weight: bold;">(1 Pack = 10 Kartu)</div>`;
    if(state.stream.isLiveMode) startSimulatedChat(document.getElementById('stream-chat'));
    setTimeout(() => {
        playSound('sfx-rip'); const packGraphic = document.getElementById('pack-graphic'); packGraphic.outerHTML = `<div class="pack-wrapper"><div class="pack-top-crimp"></div><div class="pack-body">${packContent}</div><div class="pack-rip-piece rp1"></div><div class="pack-rip-piece rp2"></div></div><div class="pack-flash" id="pack-flash"></div><div class="pack-result" id="pack-result"></div>`;
        const wrapperEl = modal.querySelector('.pack-wrapper'); const topCrimpEl = modal.querySelector('.pack-top-crimp'); const ripPieceEls = modal.querySelectorAll('.pack-rip-piece');
        wrapperEl.style.animation = 'ripPackSequence 2s forwards, shake 0.1s infinite alternate'; topCrimpEl.style.animation = 'ripTopPart 2s forwards'; wrapperEl.style.animation = 'ripPackSequence 2s forwards, ripBodyShape 2s forwards, shake 0.1s infinite alternate'; ripPieceEls.forEach(piece => { piece.style.display = 'block'; piece.style.animation = `ripPieceFall 1.5s forwards ${Math.random() * 0.3 + 0.5}s`; });
        setTimeout(() => {
            wrapperEl.style.display = 'none'; const flashEl = document.getElementById('pack-flash'); flashEl.style.display = 'block'; 
            setTimeout(() => {
                flashEl.style.display = 'none'; playSound('sfx-tada'); 
                let cardsHtml = ''; let rareCount = 0; let legendCount = 0;
                pulledCards.forEach((card, i) => { const isLast = i === pulledCards.length - 1; cardsHtml += `<div class="pack-card-item ${isLast ? 'rare-pull' : ''}"><img src="${card.imageUrl}" onerror="this.src=''; this.style.background='#333';"></div>`; if(card.rarity.includes('Holo') || card.rarity.includes('Secret')) legendCount++; else if(card.rarity.includes('Rare')) rareCount++; });
                let newSubs = 0; if(state.stream.isLiveMode) { const chatContainer = document.getElementById('stream-chat'); let totalDonation = 0; if (legendCount > 0) { const donation = (Math.floor(Math.random() * 50) + 20) * legendCount; totalDonation += donation; newSubs += Math.floor(Math.random() * 20) + 10; setTimeout(() => addChatMessage(chatContainer, CHAT_NAMES[Math.floor(Math.random() * CHAT_NAMES.length)], "Bikin jadi video short bang!! 🔥🔥", true, donation), 500); } else if (rareCount > 0) { const donation = (Math.floor(Math.random() * 10) + 5) * rareCount; totalDonation += donation; newSubs += Math.floor(Math.random() * 5) + 2; setTimeout(() => addChatMessage(chatContainer, CHAT_NAMES[Math.floor(Math.random() * CHAT_NAMES.length)], "Mantap dapet Rare!", true, donation), 800); } else { setTimeout(() => addChatMessage(chatContainer, "PikaBoy", "Yahh zonk wkwk"), 500); } }
                const resultEl = document.getElementById('pack-result'); resultEl.style.display = 'flex';
                resultEl.innerHTML = `<h3 style="color: yellow; text-align: center; margin-top: 8px;">✨ KARTU DIDAPATKAN! ✨</h3>${state.stream.isLiveMode && newSubs > 0 ? `<div style="text-align:center; color:#69F0AE; font-size:12px; margin-bottom:4px;">Stream Sukses! +${newSubs} Subscribers</div>` : ''}<div class="pack-grid">${cardsHtml}</div><button class="btn btn-full" style="background: var(--green);" id="btn-collect-pack">Masukkan ke Etalase</button>`;
                document.getElementById('btn-collect-pack').onclick = () => { if(chatInterval) clearInterval(chatInterval); if(state.stream.isLiveMode) state.stream.subscribers += newSubs; pulledCards.forEach(card => state.myInventory.push({ id: state.nextCardId++, cardName: card.name })); saveGameState(); modal.style.display = 'none'; isAnimating = false; };
            }, 500); 
        }, 2000); 
    }, 1000); 
}

function formatTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
}

function tickTime() {
    if (state.isBankrupt || !state.isOpen) return;
    
    state.time += 10;
    if (state.time >= 1260) {
        state.time = 1260;
        if (state.isOpen) {
            toggleShop();
            showToast("Sudah jam 21:00! Toko otomatis tutup.", "warning");
        }
    }
    
    const clockEl = document.getElementById('ui-clock');
    if (clockEl) clockEl.innerText = formatTime(state.time);
}

function toggleShop() {
    if (state.time >= 1260 && !state.isOpen) {
        showToast("Sudah malam, tidak bisa buka toko lagi!", "error");
        return;
    }
    
    state.isOpen = !state.isOpen;
    const btn = document.getElementById('btn-toggle-shop');
    
    if (state.isOpen) {
        if (btn) {
            btn.innerText = "Close";
            btn.style.background = "var(--red)";
        }
        scheduleNextCustomer(); 
        showToast("Toko Buka! Menunggu pelanggan...", "success");
    } else {
        if (btn) {
            btn.innerText = "Open";
            btn.style.background = "var(--green)";
        }
        if(timers.customer) clearTimeout(timers.customer); 
        
        if (state.time < 1260) {
            showToast("Toko Tutup sementara.", "warning");
        }
    }
    
    const btnEnd = document.getElementById('btn-end-day');
    if (btnEnd) btnEnd.style.display = (!state.isOpen) ? 'block' : 'none';
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2800);
}

function openAppAdminPanel() {
    currentOpenApp = 'admin';
    let html = `<div style="display:flex; gap:10px; margin-bottom:16px;">
        <button class="btn" style="flex:1; background:var(--blue);" onclick="editPackData('new')">+ Buat Pack</button>
        <button class="btn" style="flex:1; background:var(--green);" onclick="editItemData('new')">+ Buat Item</button>
    </div>`;

    html += `<div style="font-weight: bold; margin-bottom: 8px; color: var(--amber);">📦 Database Pack:</div>`;
    AVAILABLE_PACKS.forEach(p => {
        html += `<div class="list-item" style="border-bottom:1px solid #333;">
            <div class="list-text"><div class="list-title">${p.name} ($${p.price})</div><div class="list-subtitle">API: ${p.apiSetId}</div></div>
            <button class="btn" style="background:#555; padding:5px 10px; font-size:10px; margin-right:4px;" onclick="editPackData('${p.id}')">Edit</button>
            <button class="btn" style="background:var(--red); padding:5px 10px; font-size:10px;" onclick="deletePackData('${p.id}')">Del</button>
        </div>`;
    });

    html += `<div style="font-weight: bold; margin: 16px 0 8px 0; color: var(--green);">🛒 Suplai Barang</div>`;
    AVAILABLE_ITEMS.forEach(item => {
        const canBuy = state.money >= item.buyPrice;
        
        // --- LOGIKA TAMPILAN GAMBAR VS ICON DI GROSIR ---
        let itemGraphic = '';
        if (item.img && item.img.trim() !== "") {
            itemGraphic = `<img src="${item.img}" style="width:100%; height:100%; object-fit:contain;">`;
        } else {
            itemGraphic = item.icon; // Kalau pakai emoji, masukkan langsung
        }
        // ------------------------------------------------

        html += `<div class="list-item">
            <div class="list-icon" style="background:#333; display:flex; align-items:center; justify-content:center; padding:2px;">${itemGraphic}</div>
            <div class="list-text"><div class="list-title">${item.name}</div><div class="list-subtitle">$${item.buyPrice} (Isi ${item.buyQty} pcs)</div></div>
            <button class="btn" style="background:var(--blue)" ${!canBuy ? 'disabled' : ''} onclick="buyItem('${item.id}', ${item.buyPrice}, ${item.buyQty})">Beli</button>
        </div>`;
    });

    openComputerView('🛠️ Admin Panel', html);
}

// --- FUNGSI CRUD PACK ---
function editPackData(id) {
    currentOpenApp = 'admin_edit'; // <--- TAMBAHKAN BARIS INI
    let p = AVAILABLE_PACKS.find(x => x.id === id) || { id: 'pack_' + Date.now(), name: 'Pack Baru', price: 10, apiSetId: 'base1', color: '#1E88E5', img: '' };

    let html = `<div style="background:#263238; padding:15px; border-radius:8px; text-align:left;">
        <input type="hidden" id="adm_p_id" value="${p.id}">
        <label>Nama Pack:</label><br><input type="text" id="adm_p_name" value="${p.name}" style="width:100%; margin-bottom:10px;"><br>
        <label>Harga Beli ($):</label><br><input type="number" id="adm_p_price" value="${p.price}" style="width:100%; margin-bottom:10px;"><br>
        <label>Base API (contoh: base1):</label><br><input type="text" id="adm_p_api" value="${p.apiSetId}" style="width:100%; margin-bottom:10px;"><br>
        <label>Warna (Hex):</label><br><input type="text" id="adm_p_color" value="${p.color}" style="width:100%; margin-bottom:10px;"><br>
        <label>Link URL Gambar:</label><br><input type="text" id="adm_p_img" value="${p.img}" style="width:100%; margin-bottom:10px;"><br>
        <button class="btn btn-full" style="background:var(--green); margin-bottom:8px;" onclick="savePackData()">💾 Simpan ke Server</button>
        <button class="btn btn-full" style="background:#555;" onclick="openAppAdminPanel()">Batal</button>
    </div>`;
    openComputerView(id === 'new' ? '✨ Buat Pack' : '📝 Edit Pack', html);
}

async function savePackData() {
    let id = document.getElementById('adm_p_id').value;
    let newData = {
        id: id,
        name: document.getElementById('adm_p_name').value,
        price: parseInt(document.getElementById('adm_p_price').value) || 10,
        apiSetId: document.getElementById('adm_p_api').value,
        color: document.getElementById('adm_p_color').value,
        img: document.getElementById('adm_p_img').value
    };
    
    try {
        let res = await fetch('process.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_pack', data: newData })
        });
        let response = await res.json();
        if (response.success) {
            let index = AVAILABLE_PACKS.findIndex(x => x.id === id);
            if(index !== -1) AVAILABLE_PACKS[index] = newData; else AVAILABLE_PACKS.push(newData);
            showToast("Tersimpan di Server!", "success"); openAppAdminPanel();
        }
    } catch(e) { showToast("Gagal terhubung ke server!", "error"); }
}

async function deletePackData(id) {
    if (await customConfirm("Hapus Pack ini dari database server secara permanen?", "Hapus Pack")) {
        try {
            let res = await fetch('process.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_pack', id: id })
            });
            let response = await res.json();
            if (response.success) {
                AVAILABLE_PACKS = AVAILABLE_PACKS.filter(x => x.id !== id);
                showToast("Pack dihapus dari server.", "success"); openAppAdminPanel();
            }
        } catch(e) { showToast("Gagal menghapus!", "error"); }
    }
}

// --- FUNGSI CRUD ITEM ---
function editItemData(id) {
    currentOpenApp = 'admin_edit'; // <--- TAMBAHKAN BARIS INI
    let i = AVAILABLE_ITEMS.find(x => x.id === id) || { 
        id: 'item_' + Date.now(), 
        name: 'Item Baru', 
        buyPrice: 10, 
        buyQty: 5, 
        sellPrice: 2, 
        icon: '📦', 
        img: '', // <--- Inisialisasi gambar kosong
        desc: '' 
    };
    
    let html = `<div style="background:#263238; padding:15px; border-radius:8px; text-align:left; font-size:12px;">
        <input type="hidden" id="adm_i_id" value="${i.id}">
        
        <div style="display:flex; gap:10px; margin-bottom:10px;">
            <div style="flex:1;">
                <label style="color:var(--amber);">Icon (Emoji/Prioritas 2):</label><br>
                <input type="text" id="adm_i_icon" value="${i.icon}" style="width:100%;">
            </div>
            <div style="flex:2;">
                <label style="color:var(--green);">URL Gambar (Prioritas 1):</label><br>
                <input type="text" id="adm_i_img" value="${i.img}" style="width:100%;" placeholder="https://... (Kosongkan jika pakai Icon)">
            </div>
        </div>

        <label>Nama Item:</label><br><input type="text" id="adm_i_name" value="${i.name}" style="width:100%; margin-bottom:10px;"><br>
        <label>Harga Kulakan ($):</label><br><input type="number" id="adm_i_price" value="${i.buyPrice}" style="width:100%; margin-bottom:10px;"><br>
        <label>Isi Berapa Pcs per beli?:</label><br><input type="number" id="adm_i_qty" value="${i.buyQty}" style="width:100%; margin-bottom:10px;"><br>
        <label>Deskripsi/Efek:</label><br><input type="text" id="adm_i_desc" value="${i.desc}" style="width:100%; margin-bottom:10px;"><br>
        
        <button class="btn btn-full" style="background:var(--green); margin-bottom:8px;" onclick="saveItemData()">💾 Simpan ke Server Server</button>
        <button class="btn btn-full" style="background:#555;" onclick="openAppAdminPanel()">Batal</button>
    </div>`;
    openComputerView(id === 'new' ? 'Item Baru' : 'Edit Item', html);
}

async function saveItemData() {
    let id = document.getElementById('adm_i_id').value;
    let newData = {
        id: id,
        name: document.getElementById('adm_i_name').value,
        buyPrice: parseInt(document.getElementById('adm_i_price').value) || 10,
        buyQty: parseInt(document.getElementById('adm_i_qty').value) || 1,
        sellPrice: 5,
        icon: document.getElementById('adm_i_icon').value,
        img: document.getElementById('adm_i_img').value, // <--- MENANGKAP NILAI GAMBAR BARU
        desc: document.getElementById('adm_i_desc').value
    };
    
    try {
        let res = await fetch('process.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'save_item', data: newData })
        });
        let response = await res.json();
        
        if (response.success) {
            let index = AVAILABLE_ITEMS.findIndex(x => x.id === id);
            if(index !== -1) AVAILABLE_ITEMS[index] = newData; else AVAILABLE_ITEMS.push(newData);
            showToast("Sukses! Data Item tersimpan di Database JSON.", "success");
            openAppAdminPanel(); // Ini akan mengembalikan currentOpenApp jadi 'admin'
        }
    } catch(e) { showToast("Koneksi ke server gagal!", "error"); }
}

async function deleteItemData(id) {
    if (await customConfirm("Hapus Item ini dari database server secara permanen?", "Hapus Item")) {
        try {
            let res = await fetch('process.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_item', id: id })
            });
            let response = await res.json();
            if (response.success) {
                AVAILABLE_ITEMS = AVAILABLE_ITEMS.filter(x => x.id !== id);
                showToast("Item dihapus dari server.", "success"); openAppAdminPanel();
            }
        } catch(e) { showToast("Gagal menghapus!", "error"); }
    }
}

function showAdminPinScreen() {
    currentOpenApp = 'admin_pin';
    let html = `<div style="text-align:center; padding:30px 20px;">
        <div style="font-size: 40px; margin-bottom: 10px;">🔒</div>
        <h3 style="color:var(--amber); margin-bottom: 20px;">Otorisasi Diperlukan</h3>
        <p style="font-size: 11px; color: #aaa; margin-bottom: 15px;">Masukkan PIN Admin</p>
        <input type="password" id="admin_pin_input" style="font-size:24px; text-align:center; letter-spacing:8px; width:180px; padding: 10px; margin-bottom: 20px; background: #111; border: 2px solid #555; color: white; border-radius: 8px;" maxlength="6" placeholder="******">
        <br>
        <button class="btn" style="background:var(--green); width:180px; font-size: 16px; padding: 12px;" onclick="verifyAdminPin()">MASUK</button>
    </div>`;
    openComputerView('🔒 Keamanan Server', html);
}

function verifyAdminPin() {
    const pin = document.getElementById('admin_pin_input').value;
    if (pin === '080801') {
        playSound('sfx-coin');
        openAppAdminPanel();
    } else {
        showToast("Akses Ditolak: PIN Salah!", "error");
    }
}

function customConfirm(message, title = "Konfirmasi") {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal-custom-confirm');
        document.getElementById('custom-confirm-title').innerText = title;
        document.getElementById('custom-confirm-message').innerText = message;
        
        modal.style.display = 'flex';

        // Jika klik Yakin
        document.getElementById('btn-confirm-ok').onclick = () => {
            modal.style.display = 'none';
            resolve(true);
        };

        // Jika klik Batal
        document.getElementById('btn-confirm-cancel').onclick = () => {
            modal.style.display = 'none';
            resolve(false);
        };
    });
}

const MARKETING_ADS = [
    { id: 'brosur', name: 'Sebar Brosur di Warnet', cost: 150, desc: 'Besok toko auto-rame! Maksimal antrean pelanggan +3 dan datang lebih cepat.', icon: '📄' },
    { id: 'spg', name: 'Sewa SPG Cantik', cost: 500, desc: 'Besok pelanggan rela bayar lebih mahal! Tawaran awal naik otomatis +10%.', icon: '💃' },
    { id: 'influencer', name: 'Endorse YouTuber Gaming', cost: 1500, desc: 'Besok PASTI terjadi event Boom (Harga Naik) atau Sultan Datang!', icon: '📱' }
];

function openAppMarketing() {
    currentOpenApp = 'marketing';
    let html = `<div style="margin-bottom: 16px; padding: 12px; background: #37474F; border-radius: 8px; text-align: left;"><p style="font-size: 11px; color: #ccc; margin-bottom: 0;">Beli paket kampanye hari ini, efeknya akan aktif <b>BESOK</b> (selama 1 hari penuh). Hanya bisa antre 1 iklan per hari!</p></div>`;

    if (state.activeAd) {
        const active = MARKETING_ADS.find(a => a.id === state.activeAd);
        if (active) {
            html += `<div style="background: rgba(105, 240, 174, 0.2); border: 1px solid #69F0AE; padding: 10px; border-radius: 8px; margin-bottom: 16px; text-align: center;">
                <div style="color: #69F0AE; font-weight: bold; font-size: 12px; margin-bottom: 4px;">🟢 Kampanye Berjalan Hari Ini:</div>
                <div style="font-size: 14px; color: white;">${active.icon} ${active.name}</div>
            </div>`;
        }
    }

    MARKETING_ADS.forEach(ad => {
        const isQueued = state.queuedAd === ad.id;
        const canBuy = state.money >= ad.cost && !state.queuedAd;
        
        let btnHtml = '';
        if (isQueued) {
            btnHtml = `<button class="btn btn-full" style="background: var(--green); padding: 8px;" disabled>✅ Terjadwal untuk Besok</button>`;
        } else if (state.queuedAd) {
            btnHtml = `<button class="btn btn-full" style="background: #555; padding: 8px;" disabled>Menunggu Antrean</button>`;
        } else {
            btnHtml = `<button class="btn btn-full" style="background: ${canBuy ? 'var(--purple)' : '#555'}; padding: 8px;" ${!canBuy?'disabled':''} onclick="buyMarketing('${ad.id}', ${ad.cost})">Beli Kampanye ($${ad.cost})</button>`;
        }

        html += `
        <div style="margin-bottom: 12px; padding: 12px; background: #2C3E50; border-radius: 8px; border-left: 4px solid var(--purple); text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: white; font-size: 14px;">${ad.icon} ${ad.name}</strong>
            </div>
            <p style="font-size: 11px; color: #aaa; margin-bottom: 8px;">${ad.desc}</p>
            ${btnHtml}
        </div>`;
    });

    openComputerView('📢 Marketing & Ads', html);
}

function buyMarketing(id, cost) {
    if (state.money >= cost) {
        state.money -= cost;
        state.queuedAd = id;
        playSound('sfx-coin');
        showToast("Kampanye dibeli! Efek akan aktif besok pagi.", "success");
        saveGameState();
        openAppMarketing();
    }
}