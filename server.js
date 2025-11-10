// server.js

const express = require('express');
const { generateUserSig } = require('tencentcloud-im-sdk-nodejs-platform');
const app = express();

// Konfigurasi Port
// Jika di deploy (misalnya di Vercel/Render), port akan diset otomatis.
// Jika di lokal, gunakan port 3000.
const PORT = process.env.PORT || 3000;

// --- KONFIGURASI KUNCI RAHASIA ---
// Kunci diambil dari Environment Variables (Wajib untuk keamanan di Production)
const SDKAPPID = process.env.20030220;
const SECRETKEY = process.env.7b491865319b8c2941970eff1b6291688d042bc31bb444c724eb62053bd04d31;
// ---------------------------------

// Middleware CORS: Mengizinkan frontend (Web) Anda mengakses API ini
app.use((req, res, next) => {
    // Ganti '*' dengan domain frontend Anda yang sebenarnya jika sudah production
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Middleware untuk memproses body JSON
app.use(express.json());

/**
 * Endpoint Utama: Menghasilkan UserSig
 * Method: POST
 * Body: { "userId": "user_anchor_1" }
 */
app.post('/generateUserSig', (req, res) => {
    const { userId } = req.body;
    
    // Validasi Konfigurasi
    if (!SDKAPPID || !SECRETKEY) {
        console.error('Error: TRTC_SDK_APP_ID atau TRTC_SECRET_KEY tidak diset!');
        return res.status(500).json({ error: 'Server key not configured.' });
    }
    
    // Validasi Input
    if (!userId) {
        return res.status(400).json({ error: 'Parameter userId is required.' });
    }

    try {
        // Masa berlaku UserSig: 7 hari (dapat disesuaikan)
        const EXPIRATION_TIME = 86400 * 7; 
        
        // Panggil library enkripsi Tencent
        const userSig = generateUserSig(parseInt(SDKAPPID), SECRETKEY, userId, EXPIRATION_TIME);
        
        console.log(`[AUTH] UserSig generated for: ${userId}`);
        
        // Kirim UserSig kembali ke frontend
        res.json({
            code: 0,
            message: 'Success',
            userSig: userSig
        });

    } catch (error) {
        console.error('[ERROR] Failed to generate UserSig:', error.message);
        res.status(500).json({ error: 'Internal server error during UserSig generation.' });
    }
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`TRTC Auth Server running on port ${PORT}`);
    if (!process.env.NODE_ENV) {
        console.log('--- Development Mode: Check Environment Variables ---');
    }
});
