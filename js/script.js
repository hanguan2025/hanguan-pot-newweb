/**
 * 韓館韓式鍋物 - 網頁互動邏輯（最終整合版）
 */

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
});

// 6. 表單提交處理
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    let isValid = true;

    const requiredInputs = form.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('border-red-500'); // 使用 Tailwind 或自訂 CSS
            isValid = false;
        } else {
            input.classList.remove('border-red-500');
        }
    });

    if (isValid) {
        alert('預約申請已送出，我們將儘速與您聯繫！');
        form.reset();
    }
    return false;
}
