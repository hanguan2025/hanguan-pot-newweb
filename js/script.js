/**
 * 韓館韓式鍋物 - 網頁互動邏輯（最終整合版 + 預約送出 + Google 評分同步）
 */

// ★★★ 部署 Google Apps Script 後，把「網頁應用程式網址」貼在這裡 ★★★
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/請貼上你的部署ID/exec';

// 1. 頁面滾動動畫 (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 2. ✅ 手機版選單邏輯
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu-overlay');
    const btn = document.getElementById('menu-btn');
    
    if (!menu || !btn) return;

    // 切換 'open' class 來控制側邊欄滑入/滑出
    menu.classList.toggle('open');
    // 切換漢堡按鈕 X 動畫
    btn.classList.toggle('active');

    // 根據狀態鎖定或釋放頁面滾動，避免手機版後方背景滑動
    if (menu.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// 3. 圖片燈箱 (Lightbox)
function openLightbox(imgElement) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = imgElement.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        // 只有在選單也關閉的情況下才釋放滾動
        const menu = document.getElementById('mobile-menu-overlay');
        if (!menu || !menu.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    }
}

// 4. 深色模式切換
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
    const icon = theme === 'dark' ? '☀️' : '🌙';
    const themeIcon = document.getElementById('theme-icon');
    const themeIconMobile = document.getElementById('theme-icon-mobile');
    if (themeIcon) themeIcon.textContent = icon;
    if (themeIconMobile) themeIconMobile.textContent = icon;
}

// 5. 初始化與事件綁定
document.addEventListener('DOMContentLoaded', () => {
    // A. 滾動動畫初始化
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));

    // B. 選單連結點擊後自動關閉
    const navLinks = document.querySelectorAll('.mobile-nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.getElementById('mobile-menu-overlay');
            if (menu && menu.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // C. 主題初始化
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);

    // D. 全域鍵盤事件 (ESC 鍵關閉所有覆蓋層)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // 關閉燈箱
            closeLightbox();
            // 關閉手機選單
            const menu = document.getElementById('mobile-menu-overlay');
            if (menu && menu.classList.contains('open')) {
                toggleMobileMenu();
            }
        }
    });

    // E. 預約表單
    initReservationForm();

    // F. Google 評分同步
    loadGoogleRating();
});

// 6. 預約表單：送到 Google 試算表 + Email 通知
function initReservationForm() {
    const form = document.getElementById('reservation-form');
    if (!form) return;

    // 日期不可選過去
    const dateInput = form.querySelector('input[name="date"]');
    if (dateInput) {
        const t = new Date();
        const pad = n => String(n).padStart(2, '0');
        dateInput.min = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
    }

    form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const btn = form.querySelector('button[type="submit"]');
    const msg = document.getElementById('reservation-msg');
    let isValid = true;

    form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('border-red-500');
            isValid = false;
        } else {
            input.classList.remove('border-red-500');
        }
    });

    // 台灣手機 / 市話簡易檢查
    const phone = form.querySelector('input[name="phone"]');
    if (phone && !/^[0-9+\-\s()]{8,15}$/.test(phone.value.trim())) {
        phone.classList.add('border-red-500');
        isValid = false;
    }

    if (!isValid) {
        showReservationMsg(msg, '請確認必填欄位與電話格式是否正確', false);
        return false;
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '送出中…';

    try {
        // 用 no-cors 送出（Apps Script 不回 CORS 標頭，無法讀回應，只要沒丟錯就視為已送出）
        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: new URLSearchParams(new FormData(form))
        });
        showReservationMsg(msg, '預約申請已送出，我們將儘速與您聯繫確認！', true);
        form.reset();
    } catch (err) {
        showReservationMsg(msg, '送出失敗，請稍後再試或直接來電 0981-007-776', false);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
    return false;
}

function showReservationMsg(el, text, ok) {
    if (!el) { alert(text); return; }
    el.textContent = text;
    el.className = 'md:col-span-2 text-center text-sm font-bold ' + (ok ? 'text-green-700' : 'text-red-600');
}

// 7. 首頁 Google 星級與評論數（失敗時保留 HTML 內預設值）
async function loadGoogleRating() {
    const scoreEl = document.getElementById('rating-score');
    const countEl = document.getElementById('rating-count');
    if (!scoreEl || !countEl) return;

    // 本機快取 30 分鐘，避免每次進站都打後端
    try {
        const cached = JSON.parse(sessionStorage.getItem('gRating') || 'null');
        if (cached && Date.now() - cached.t < 30 * 60 * 1000) {
            applyRating(cached.rating, cached.count);
            return;
        }
    } catch (e) {}

    try {
        const res = await fetch(APPS_SCRIPT_URL + '?action=rating');
        const data = await res.json();
        if (data.ok && data.rating && data.count) {
            applyRating(data.rating, data.count);
            try {
                sessionStorage.setItem('gRating', JSON.stringify({ rating: data.rating, count: data.count, t: Date.now() }));
            } catch (e) {}
        }
    } catch (err) {
        // 靜默失敗：維持預設 4.8 / 93
    }

    function applyRating(rating, count) {
        scoreEl.textContent = Number(rating).toFixed(1);
        countEl.textContent = `(${count}則評論)`;
    }
}
