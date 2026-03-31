const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const path = require('path');

/**
 * AcademyService
 * Responsible for scraping student's academic history (professors) from pesuacademy.com
 */

const ACADEMY_BASE_URL = "https://www.pesuacademy.com";
const LOG_FILE = path.join(__dirname, '../scraper.log');

function log(msg) {
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] ${msg}\n`;
    console.log(msg);
    fs.appendFileSync(LOG_FILE, formatted);
}

async function getAllowedProfessors(username, password) {
    log(`🔍 Starting fetch for ${username}...`);
    
    try {
        // 1. Initial GET to establish session
        log("🌐 Step 1: Initial GET to establish session...");
        let response = await axios.get(`${ACADEMY_BASE_URL}/Academy/`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        let cookies = response.headers['set-cookie'] || [];
        let cookieString = cookies.map(c => c.split(';')[0]).join('; ');
        log(`🍪 Received ${cookies.length} initial cookies.`);

        // 2. Perform Login
        log("🔑 Step 2: Performing Login POST...");
        const loginPayload = new URLSearchParams();
        loginPayload.set("j_username", username);
        loginPayload.set("j_password", password);

        const loginRes = await axios.post(`${ACADEMY_BASE_URL}/Academy/j_spring_security_check`, loginPayload.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookieString,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': `${ACADEMY_BASE_URL}/Academy/`
            },
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400
        });

        log(`📥 Login Status: ${loginRes.status}`);

        // Update cookies from login response
        if (loginRes.headers['set-cookie']) {
            cookieString = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            log("🍪 Cookies updated after login.");
        }

        // 3. Fetch "Attendance Summary" (Current Semester)
        log("📄 Step 3: Fetching Attendance Summary...");
        const attendanceRes = await axios.get(`${ACADEMY_BASE_URL}/Academy/attendance/studentAttendanceSummary`, {
            headers: {
                'Cookie': cookieString,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        log(`📥 Attendance Fetch Status: ${attendanceRes.status}`);

        // 4. Fetch "Academic Record" (Historical Semesters)
        log("📄 Step 4: Fetching Academic Record...");
        let recordsData = "";
        try {
            const recordsRes = await axios.get(`${ACADEMY_BASE_URL}/Academy/student/record`, {
                headers: {
                    'Cookie': cookieString,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            recordsData = recordsRes.data;
            log(`📥 Records Fetch Status: ${recordsRes.status}`);
        } catch (e) {
            log(`⚠️ Records Fetch Failed: ${e.message}`);
        }

        const fullHtml = attendanceRes.data + recordsData;
        
        // DEBUG: Save HTML to a file
        fs.writeFileSync(path.join(__dirname, '../academy_debug.html'), fullHtml);
        log("💾 HTML Snapshot saved to academy_debug.html.");

        const $ = cheerio.load(fullHtml);
        const professorNames = new Set();

        $('table tr').each((_, row) => {
            $(row).find('td').each((_, cell) => {
                const text = $(cell).text().trim()
                    .replace(/\s+/g, ' ')
                    .replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.|Prof\.)\s*/i, "");
                
                if (text.length > 5 && text.split(' ').length >= 2) {
                    if (!/^\d/.test(text) && 
                        !text.includes('%') && 
                        !text.includes('Total') && 
                        !text.includes('Academic') && 
                        !text.includes('Course') &&
                        !text.includes('Semester') &&
                        text.length < 50) {
                        professorNames.add(text);
                    }
                }
            });
        });

        log(`✅ Successfully extracted ${professorNames.size} unique professors.`);
        return Array.from(professorNames);

    } catch (err) {
        log(`❌ FATAL ERROR: ${err.message}`);
        if (err.response) log(`🔥 Error Data: ${err.response.status} - ${err.response.statusText}`);
        return null; 
    }
}

module.exports = { getAllowedProfessors };
