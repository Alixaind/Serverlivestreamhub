// server.js

const express = require('express');
const TLSSigAPIv2 = require('tls-sig-api-v2'); // Menggunakan paket yang benar
const app = express();

// Konfigurasi Port
const PORT = process.env.PORT || 3000;

// --- KONFIGURASI KUNCI RAHASIA (DIAMBIL DARI ENVIRONMENT VARIABLES) ---
// HARAP PERHATIKAN NAMA VARIABEL INI HARUS SAMA DENGAN YANG DISET DI VERCEL
const SDKAPPID = process.env.TRTC_SDK_APP_ID; 
const SECRETKEY = process.env.TRTC_SECRET_KEY;
// ---------------------------------------------------------------------

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Middleware untuk memproses body JSON
app.use(express.json());

/**
 * Endpoint Utama: Menghasilkan UserSig
 */
app.post('/generateUserSig', (req, res) => {
    const { userId } = req.body;
    
    // Validasi Konfigurasi: Pastikan Env Var sudah diset di Vercel
    if (!SDKAPPID || !SECRETKEY) {
        console.error('Error: TRTC_SDK_APP_ID atau TRTC_SECRET_KEY belum diset di Vercel.');
        return res.status(500).json({ error: 'Server key not configured. Check Environment Variables.' });
    }
    
    // Validasi Input
    if (!userId) {
        return res.status(400).json({ error: 'Parameter userId is required.' });
    }

    try {
        const EXPIRATION_TIME = 86400 * 7; // Masa berlaku 7 hari
        
        // 1. Inisialisasi API
        const api = new TLSSigAPIv2.Api(parseInt(SDKAPPID), SECRETKEY);
        
        // 2. Panggil fungsi untuk menghasilkan UserSig
        const userSig = api.genSig(userId, EXPIRATION_TIME);
        
        console.log(`[AUTH] UserSig generated for: ${userId}`);
        
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
