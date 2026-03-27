<?php
    // Script untuk memastikan folder penyimpanan gambar otomatis terbuat
    $targetDir = __DIR__ . '/assets/cards/img';
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }
    ?>
<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pokemon TCG Tycoon (Mobile Edition)</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <audio id="sfx-coin" src="https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3" preload="auto"></audio>
        <audio id="sfx-rip" src="https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3" preload="auto"></audio>
        <audio id="sfx-tada" src="https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3" preload="auto"></audio>
        <audio id="bgm" src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" preload="auto" loop></audio>
        <div id="splash-screen">
            <div class="game-logo"><img src="assets/logo/main_logo.png" width="70%" alt=""></div>
            <button id="btn-play"><span class="play-icon">▶</span> START GAME</button>
            <div style="position: absolute; bottom: 20px; color: #888; font-size: 10px;">Versi 1.1 - WebP Edition</div>
        </div>
        <div id="loading-screen" style="display: none;">
            <div class="game-logo" style="margin-bottom: 20px; font-size: 24px; animation: none;">
                <img src="assets/logo/main_logo.png" width="50%" alt="">
            </div>
            <div id="loading-text" style="color: white; font-weight: bold; margin-bottom: 8px;">Memeriksa Aset...</div>
            <div class="progress-container">
                <div class="progress-bar" id="loading-progress"></div>
            </div>
            <div id="loading-percent">0%</div>
            <div id="loading-subtext" style="color: var(--amber); font-size: 11px; margin-top: 8px; text-align: center; width: 80%; line-height: 1.4;">Menghubungkan ke server...</div>
        </div>
        <div id="event-screen">
            <div class="event-paper">
                <div class="event-title">KORAN HARI INI</div>
                <div id="event-text" style="font-size: 16px; margin-bottom: 20px;">Berita...</div>
                <button class="btn btn-full" style="background: var(--blue);" onclick="closeEventScreen()">Continue</button>
            </div>
        </div>
        <div class="header">
            <div class="header-left">
                <div class="day" id="ui-day">DAY 1</div>
                <div class="stars" id="ui-stars">★★☆☆☆</div>
                <div class="clock-display" style="font-family: 'Courier New', monospace; font-size: 20px; font-weight: bold; color: #64FFDA; margin-top: 4px; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px; display: inline-block;">
                    <span id="ui-clock">08:00</span>
                </div>
                <div class="loan-warning" id="ui-loan" style="display:none;">Hutang: $600 (3 hr)</div>
                <div class="stream-stats" id="ui-stream-stats" style="display:none;">
                    <div class="live-dot"></div>
                    DBSKRN Channel | Subs: <span id="ui-subs-count">0</span>
                </div>
            </div>
            <div class="money-badge" id="ui-money-container">
                <span id="ui-money">$300</span>
            </div>
        </div>
        <div class="bankrupt-banner" id="ui-bankrupt">TOKO DISEGEL! LUNASI HUTANG DI BANK!</div>
        <div class="main-content">
            <div id="ui-action-container" style="margin-bottom: 16px; display: flex; gap: 8px; align-items: stretch;">
                <button class="btn btn-full btn-open-close" id="btn-toggle-shop" style="flex: 1; background: var(--green); margin-bottom: 0;" onclick="toggleShop()">
                Open
                </button>
                <button class="btn btn-full btn-end-day" id="btn-end-day" style="flex: 1; background: var(--red); color: white; margin-bottom: 0; display: none;" onclick="showDailyRecap()">
                End Day
                </button>
                <button class="btn btn-full btn-computer" 
                    style="width: 60px; height: 60px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 0; margin-bottom: 0;" 
                    onclick="openModal('modal-computer')">
                <img src="assets/icons/computer.png" style="width: 35px; height: 35px; object-fit: contain;" alt="Komputer">
                </button>
            </div>
            <div class="section-title">Pelanggan:</div>
            <div class="customers-container" id="ui-customers"></div>
            <div class="section-title">Rak Barang & Merch:</div>
            <div class="item-rack-container" id="ui-items"></div>
            <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid #FFD700; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
                <div style="font-weight: bold; color: #FFD700; margin-bottom: 4px; font-size: 14px;">🏆 Lemari Kaca (Koleksi Pribadi)</div>
                <div style="font-size: 10px; color: #aaa; margin-bottom: 12px;">Kartu di sini tidak bisa dibeli. Setiap kartu memberikan buff +Kecepatan Pengunjung & +Batas Antrean! (Maks 5)</div>
                <div id="ui-collection" style="display: flex; gap: 8px; overflow-x: auto; min-height: 80px;">
                </div>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <input type="text" id="binder-search" placeholder="🔍 Cari nama kartu..." style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #555; background: #222; color: white; font-size: 12px;" onkeyup="updateBinderFilter()">
                <select id="binder-sort" style="padding: 8px; border-radius: 6px; border: 1px solid #555; background: #222; color: white; font-size: 12px;" onchange="updateBinderFilter()">
                    <option value="newest">Bawaan (Terbaru)</option>
                    <option value="price_desc">Harga (Tertinggi)</option>
                    <option value="price_asc">Harga (Terendah)</option>
                    <option value="name_asc">Nama (A-Z)</option>
                </select>
            </div>
            <div class="binder-header">
                <div class="section-title" style="margin: 0;">Binder Etalase:</div>
                <div class="binder-controls">
                    <button id="btn-prev-page" onclick="prevBinderPage()">◀</button>
                    <span id="binder-page-text">Hal 1/1</span>
                    <button id="btn-next-page" onclick="nextBinderPage()">▶</button>
                </div>
            </div>
            <div class="etalase-container" id="ui-etalase"></div>
        </div>
        <div id="toast-container"></div>
        <div class="modal-overlay" id="modal-computer">
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
                <div class="computer-monitor">
                    <div class="monitor-screen">
                        <div class="computer-header">
                            <span id="computer-title">DBS-OS v1.0</span>
                            <button class="close-btn" id="btn-close-computer" onclick="closeComputerModal()" style="color: white; text-shadow: none;">&times;</button>
                            <button class="close-btn" id="btn-back-desktop" onclick="showDesktop()" style="color: white; text-shadow: none; display: none;">🔙</button>
                        </div>
                        <div class="computer-content-area" style="position: relative; flex: 1; overflow: hidden; background: #008080;">
                            <div class="computer-desktop" id="computer-desktop">
                                <div class="desktop-icon btn-grosir" onclick="openAppGrosir()"><span>🛒</span>Grosir</div>
                                <div class="desktop-icon btn-tas" onclick="openAppTas()"><span>🎒</span>Tas Card</div>
                                <div class="desktop-icon btn-trade" onclick="openAppTrade()"><span>♻️</span>Trade-In</div>
                                <div class="desktop-icon btn-grading" onclick="openAppGrading()"><span>🔍</span>Grading</div>
                                <div class="desktop-icon btn-staff" onclick="openAppStaff()"><span>👥</span>Staff</div>
                                <div class="desktop-icon btn-bank" onclick="openAppBank()"><span>🏦</span>Bank</div>
                                <div class="desktop-icon btn-bills" style="position: relative;" onclick="openAppBills()">
                                    <span id="badge-bills" style="position:absolute; top:-5px; right:-5px; background:#F44336; color:white; font-size:9px; padding:2px 6px; border-radius:10px; display:none; font-weight:bold; border: 1px solid white; z-index: 10;">!</span>
                                    <span>📜</span>Tagihan
                                </div>
                                <div class="desktop-icon btn-renov" onclick="openAppRenov()"><span>🏪</span>Renovasi</div>
                                <div class="desktop-icon btn-analytics" onclick="openAppAnalytics()"><span>📊</span>Data</div>
                                <div class="desktop-icon btn-setting" onclick="openAppSettings()"><span>⚙️</span>Setting</div>
                                <div class="desktop-icon btn-stream" id="btn-toggle-stream" onclick="toggleStreamMode()"><span>📡</span>Live: OFF</div>
                            </div>
                            <div class="computer-app" id="computer-app" style="display: none; height: 100%; overflow-y: auto; padding: 12px; background: #263238; color: white;">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="monitor-stand"></div>
                <div class="monitor-base"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-offline">
            <div class="modal" style="text-align: center; max-width: 300px;">
                <div class="modal-header" style="justify-content: center;">🌟 Welcome Back! 🌟</div>
                <div class="modal-body">
                    <p id="offline-desc">Toko beroperasi otomatis selama X menit.</p>
                    <p id="offline-cashier" style="color: #64FFDA; font-size: 12px; font-style: italic; margin-top: 8px; display: none;">Kasirmu bekerja keras selagi kamu pergi!</p>
                    <div style="font-size: 50px; margin: 16px 0;">💰</div>
                    <h1 style="color: #69F0AE; margin-bottom: 16px;" id="offline-money">+$0</h1>
                    <button class="btn btn-full" style="background: var(--amber); color: black;" onclick="closeModal('modal-offline')">Klaim Pendapatan</button>
                </div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-grosir">
            <div class="modal">
                <div class="modal-header"><span>🛒 Pusat Grosir</span><button class="close-btn" onclick="closeModal('modal-grosir')">&times;</button></div>
                <div class="modal-body" id="list-grosir" style="padding-top: 0;"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-tas">
            <div class="modal">
                <div class="modal-header"><span>Tas Pack</span><button class="close-btn" onclick="closeModal('modal-tas')">&times;</button></div>
                <div class="modal-body" id="list-tas"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-staff">
            <div class="modal">
                <div class="modal-header"><span>🏢 Manajemen Staff</span><button class="close-btn" onclick="closeModal('modal-staff')">&times;</button></div>
                <div class="modal-body" style="text-align: center;" id="content-staff"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-bank">
            <div class="modal">
                <div class="modal-header"><span>🏦 Bank Pokemon</span><button class="close-btn" onclick="closeModal('modal-bank')">&times;</button></div>
                <div class="modal-body" style="text-align: center;" id="content-bank"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-analytics">
            <div class="modal">
                <div class="modal-header"><span>📊 Analytics Toko</span><button class="close-btn" onclick="closeModal('modal-analytics')">&times;</button></div>
                <div class="modal-body" id="content-analytics" style="padding-bottom: 24px;"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-settings">
            <div class="modal">
                <div class="modal-header"><span>⚙️ Pengaturan</span><button class="close-btn" onclick="closeModal('modal-settings')">&times;</button></div>
                <div class="modal-body" id="content-settings"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-grading">
            <div class="modal">
                <div class="modal-header"><span>🔍 PSA Grading</span><button class="close-btn" onclick="closeModal('modal-grading')">&times;</button></div>
                <div class="modal-body" id="content-grading"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-trade">
            <div class="modal">
                <div class="modal-header"><span>♻️ Mesin Trade-In</span><button class="close-btn" onclick="closeModal('modal-trade')">&times;</button></div>
                <div class="modal-body" id="content-trade"></div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-card">
            <div class="modal" style="text-align: center;">
                <div class="modal-header" id="card-action-title">
                    <span>Nama Kartu</span>
                    <button class="close-btn" onclick="closeModal('modal-card')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; justify-content: center; margin-bottom: 16px;">
                        <div style="position: relative;">
                            <img id="card-action-image" src="" alt="Card" style="width: 140px; border-radius: 6px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); border: 1px solid #555;">
                            <div id="card-action-grade-badge" class="grade-badge" style="display: none; top: -5px; left: -5px; font-size: 10px; padding: 4px 6px;"></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 12px; color: #ccc;">
                        <div id="card-action-base">Harga Dasar: $0</div>
                        <div id="card-action-market" style="color: #69F0AE; font-weight: bold;">Pasar: $0</div>
                    </div>
                    <label style="font-size: 11px; color: #888; display: block; text-align: left; margin-bottom: 4px;">Set Harga Jual Kustom:</label>
                    <input type="number" id="card-action-input" placeholder="Harga Jual" style="margin-bottom: 16px; text-align: center; font-size: 18px; font-weight: bold;">
                    <button class="btn btn-full" style="background: var(--blue); margin-bottom: 10px !important;" id="btn-set-etalase">Set Price</button>
                    <button class="btn btn-full" style="background: #9C27B0; margin-bottom: 12px; border: 1px solid #E1BEE7;" id="btn-set-collection">Pajang ke Lemari Kaca</button>
                    <div class="divider"></div>
                    <button class="btn btn-full" style="background: var(--amber); color: black; margin-bottom: 10px !important;" id="btn-sell-quick">Sell 1x</button>
                    <button class="btn btn-full" style="background: var(--red);" id="btn-sell-bulk" style="display: none;">Sell All</button>
                </div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-kasir">
            <div class="modal">
                <div class="modal-header" style="background: #004D40; border-bottom: 2px solid #00BFA5;">
                    <span style="color: white;">Cashier</span>
                    <button class="close-btn" onclick="closeModal('modal-kasir')">&times;</button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <div style="font-size: 12px; font-weight: bold; color: #888; text-align: left; margin-bottom: 4px;">Item List :</div>
                    <div id="kasir-items" style="max-height: 100px; overflow-y: auto; background: #111; padding: 8px; border-radius: 6px; margin-bottom: 12px; font-size: 11px; text-align: left; color: #ccc;"></div>
                    <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #555;">
                        <span>Total Tagihan:</span>
                        <span id="kasir-total" style="color: var(--amber);">$0</span>
                    </div>
                    <div id="kasir-payment-info" style="background: #37474F; padding: 10px; border-radius: 6px; margin-bottom: 16px; text-align: center; font-size: 13px;">
                    </div>
                    <input type="number" id="kasir-input" placeholder="..." style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 16px; height: 50px;">
                    <button class="btn btn-full" style="background: var(--green); font-size: 16px; height: 50px; text-shadow: 1px 1px 2px black;" onclick="processKasir()">Proses Pembayaran</button>
                </div>
            </div>
        </div>
        <div class="modal-overlay" id="modal-haggle">
            <div class="modal" style="text-align: center; max-width: 300px;">
                <div class="modal-header" style="background: #E65100; border-bottom: 2px solid #FF9800;">
                    <span style="color: white;">💬 Negosiasi Harga</span>
                    <button class="close-btn" onclick="closeModal('modal-haggle')">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;" id="haggle-name">Nama NPC</div>
                    <div id="haggle-offer" style="color: #ccc; font-size: 12px; margin-bottom: 16px; background: #222; padding: 8px; border-radius: 4px;">Tawaran awal: $0</div>
                    <label style="font-size: 11px; color: #888; display: block; text-align: left; margin-bottom: 4px;">Tawaran Balik Kamu:</label>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px;">
                        <span style="font-size: 20px; color: var(--green); font-weight: bold;">$</span>
                        <input type="number" id="haggle-input" style="font-size: 20px; font-weight: bold; text-align: center; width: 100%;">
                    </div>
                    <button class="btn btn-full" style="background: var(--blue); font-size: 14px;" onclick="processHaggle()">Ajukan Harga Baru!</button>
                    <div style="font-size: 10px; color: #888; margin-top: 8px;">*Awas! Kalau terlalu mahal pelanggan bisa marah dan pergi. Level staff Negotiator menentukan kesuksesan!</div>
                </div>
            </div>
        </div>
        <div class="modal-overlay" id="pack-opening-modal"></div>
        <div class="modal-overlay" id="modal-recap">
            <div class="modal" style="max-width: 320px; text-align: center;">
                <div class="modal-header" style="background: #1976D2; justify-content: center;">
                    <span style="color: white;">📊 Rekap Harian (Hari <span id="recap-day"></span>)</span>
                </div>
                <div class="modal-body" style="font-family: monospace; font-size: 14px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #555; padding-bottom: 8px; margin-bottom: 8px;">
                        <span>Pendapatan Toko:</span>
                        <span style="color: var(--green);" id="recap-income">$0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #555; padding-bottom: 8px; margin-bottom: 8px;">
                        <span>Beban Gaji & Sewa:</span>
                        <span style="color: var(--red);" id="recap-expense">-$0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-top: 16px; margin-bottom: 24px;">
                        <span>Laba Bersih:</span>
                        <span id="recap-net">$0</span>
                    </div>
                    <button class="btn btn-full" style="background: var(--blue);" onclick="processNextDay()">Lanjut Hari Esok ➔</button>
                </div>
            </div>
        </div>
        <div id="modal-custom-confirm" class="modal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100vw; height: 100vh; background-color: #263238; align-items: center; justify-content: center;">
            <div style="width: 100%; height: 100%; padding: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: white; box-sizing: border-box;">
                <h3 id="custom-confirm-title" style="margin-top: 0; margin-bottom: 15px; color: var(--amber); font-size: 24px;">Konfirmasi</h3>
                <p id="custom-confirm-message" style="font-size: 14px; margin-bottom: 30px; color: #ccc; white-space: pre-wrap; line-height: 1.5; max-width: 400px;"></p>
                <div style="display: flex; gap: 15px; width: 100%; max-width: 350px;">
                    <button id="btn-confirm-cancel" class="btn" style="flex: 1; background: #555; padding: 15px; font-size: 16px;">Batal</button>
                    <button id="btn-confirm-ok" class="btn" style="flex: 1; background: var(--red); padding: 15px; font-size: 16px;">Yakin</button>
                </div>
            </div>
        </div>
        <script src="script.js"></script>
    </body>
</html>