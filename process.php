<?php
// Set response type ke JSON
header('Content-Type: application/json');

// Menerima data payload dari Javascript (fetch)
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$db_file = 'database.json';

// Cek apakah ada request action dari JavaScript
if (isset($input['action'])) {
    $db_data = json_decode(file_get_contents($db_file), true);

    // 1. Memuat Data Saat Game Dimulai
    if ($input['action'] == 'load_data') {
        echo json_encode(['success' => true, 'data' => $db_data]);
        exit;
    }
    
    // 2. Simpan/Update Pack
    if ($input['action'] == 'save_pack') {
        $newData = $input['data'];
        $found = false;
        foreach ($db_data['packs'] as $key => $pack) {
            if ($pack['id'] == $newData['id']) {
                $db_data['packs'][$key] = $newData;
                $found = true; break;
            }
        }
        if (!$found) $db_data['packs'][] = $newData;
        file_put_contents($db_file, json_encode($db_data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]); exit;
    }
    
    // 3. Hapus Pack
    if ($input['action'] == 'delete_pack') {
        $id_to_delete = $input['id'];
        $db_data['packs'] = array_values(array_filter($db_data['packs'], function($p) use ($id_to_delete) { return $p['id'] !== $id_to_delete; }));
        file_put_contents($db_file, json_encode($db_data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]); exit;
    }

    // 4. Simpan/Update Item
    if ($input['action'] == 'save_item') {
        $newData = $input['data'];
        $found = false;
        foreach ($db_data['items'] as $key => $item) {
            if ($item['id'] == $newData['id']) {
                $db_data['items'][$key] = $newData;
                $found = true; break;
            }
        }
        if (!$found) $db_data['items'][] = $newData;
        file_put_contents($db_file, json_encode($db_data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]); exit;
    }
    
    // 5. Hapus Item
    if ($input['action'] == 'delete_item') {
        $id_to_delete = $input['id'];
        $db_data['items'] = array_values(array_filter($db_data['items'], function($i) use ($id_to_delete) { return $i['id'] !== $id_to_delete; }));
        file_put_contents($db_file, json_encode($db_data, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true]); exit;
    }
}

if (!isset($input['url']) || !isset($input['id'])) {
    echo json_encode(['error' => 'Parameter tidak valid. Butuh URL dan ID.']);
    exit;
}

$sourceUrl = $input['url'];
// Membersihkan ID agar aman digunakan sebagai nama file lokal
$safeId = preg_replace('/[^A-Za-z0-9_\-]/', '', $input['id']); 

$targetDir = __DIR__ . '/assets/cards/img/';
$savePath = $targetDir . $safeId . '.webp';
$publicUrl = 'assets/cards/img/' . $safeId . '.webp';

// Jika file sudah pernah didownload dan diconvert, langsung return path-nya (Sangat Cepat)
if (file_exists($savePath)) {
    echo json_encode(['success' => true, 'localUrl' => $publicUrl]);
    exit;
}

// Proses Mendownload Gambar Eksternal
// Supress error menggunakan @ agar tidak merusak format JSON jika gagal
$imageData = @file_get_contents($sourceUrl);

if ($imageData === false) {
    echo json_encode(['error' => 'Gagal mendownload gambar asli dari server.']);
    exit;
}

// Membaca gambar ke dalam memori
$image = @imagecreatefromstring($imageData);
if ($image === false) {
    echo json_encode(['error' => 'Format gambar tidak didukung atau corrupt.']);
    exit;
}

// Mengaktifkan fitur TrueColor dan mematikan Alpha Blending 
// Ini SANGAT PENTING agar transparansi kartu (PNG) tetap ada saat diubah ke WebP
imagepalettetotruecolor($image);
imagealphablending($image, false);
imagesavealpha($image, true);

// Menyimpan ke format WebP (Kualitas 80 sudah sangat baik & ukuran kecil)
$success = imagewebp($image, $savePath, 80);

// Menghapus memori gambar
imagedestroy($image);

if ($success) {
    echo json_encode(['success' => true, 'localUrl' => $publicUrl]);
} else {
    echo json_encode(['error' => 'Gagal mengonversi gambar ke WebP.']);
}
?>