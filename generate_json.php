<?php
// Script Generator cards.json Otomatis
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Mulai mengunduh data dari Pokemon TCG API...</h2>";

$setsToFetch = ['base1', 'base2', 'base3', 'base4']; // ID dari Base Set dan Fossil Set
$allFormattedCards = [];

// Menyiapkan header agar API tidak memblokir request kita
$options = [
    "http" => [
        "header" => "User-Agent: PokemonTCGTycoonLocal/1.0\r\n"
    ]
];
$context = stream_context_create($options);

foreach ($setsToFetch as $setId) {
    echo "Mengambil data set: <strong>$setId</strong>...<br>";
    
    // Mengambil maksimal 250 kartu per set (cukup untuk set jadul)
    $url = "https://api.pokemontcg.io/v2/cards?q=set.id:" . $setId . "&pageSize=250";
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "<span style='color:red;'>Gagal mengambil set $setId. Pastikan koneksi internet jalan.</span><br>";
        continue;
    }

    $json = json_decode($response, true);
    
    if (isset($json['data'])) {
        foreach ($json['data'] as $item) {
            $name = $item['name'];
            $image = isset($item['images']['large']) ? $item['images']['large'] : (isset($item['images']['small']) ? $item['images']['small'] : '');
            
            // 1. Ambil nama Rarity asli dari API, jika kosong anggap Common
            $rarity = isset($item['rarity']) ? $item['rarity'] : 'Common';
            
            // 2. Tentukan Harga Dasar (Base Value) berdasarkan kata kunci Rarity asli
            $baseValue = 5; // Default untuk Common
            if (stripos($rarity, 'Holo') !== false || stripos($rarity, 'Secret') !== false) {
                $baseValue = 150;
            } elseif (stripos($rarity, 'Rare') !== false) {
                $baseValue = 50;
            } elseif (stripos($rarity, 'Uncommon') !== false) {
                $baseValue = 15;
            }
            
            if ($name === 'Charizard') $baseValue = 500; // Harga spesial Charizard

            $allFormattedCards[] = [
                'apiId' => $item['id'],
                'name' => $name,
                'rarity' => $rarity, // SEKARANG MENGGUNAKAN NAMA ASLI API
                'baseValue' => $baseValue,
                'imageUrl' => $image,
                'setId' => $setId
            ];
        }
        echo "<span style='color:green;'>Berhasil memproses " . count($json['data']) . " kartu dari $setId!</span><br>";
    }
}

// Menyimpan array ke dalam file cards.json dengan format rapi (PRETTY_PRINT)
$jsonData = json_encode($allFormattedCards, JSON_PRETTY_PRINT);
$saveStatus = file_put_contents(__DIR__ . '/cards.json', $jsonData);

if ($saveStatus !== false) {
    echo "<h3>✅ SUKSES! File <strong style='color:blue;'>cards.json</strong> berhasil dibuat dengan total " . count($allFormattedCards) . " kartu!</h3>";
    echo "<p>Silakan tutup halaman ini dan mainkan gamemu.</p>";
} else {
    echo "<h3 style='color:red;'>❌ GAGAL menyimpan file. Pastikan folder memiliki izin write (permission).</h3>";
}
?>