/**
 * 韓館韓式鍋物 - 網頁互動邏輯
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
            // 一旦顯示後就停止觀察
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 初始化觀察所有 .fade-in 元素
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
});

// 2. 手機版選單切換
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const hamburger = document.querySelector('.hamburger');
    menu.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    // 防止背景捲動
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

// 3. 問與答 (FAQ) 折疊功能
function toggleAccordion(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('svg');
    
    // 切換內容顯示
    content.classList.toggle('active');
    
    // 切換箭頭旋轉
    if (content.classList.contains('active')) {
        icon.style.transform = 'rotate(180deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
}

// 4. 圖片燈箱效果 (Lightbox)
function openLightbox(imgElement) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = imgElement.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 5. 表單驗證與提交處理
function handleFormSubmit(event) {
    event.preventDefault();
    let isValid = true;
    const form = event.target;
    
    // 簡單的欄位檢查
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('input-error');
            isValid = false;
        } else {
            input.classList.remove('input-error');
        }
    });

    if (isValid) {
        // 這裡可以加入實際的發送邏輯
        alert('感謝您的訊息！我們將儘快與您聯繫。');
        form.reset();
    }

    return false;
}

// 6. 深色/淺色模式切換
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    
    // 更新圖示
    const icon = newTheme === 'dark' ? '☀️' : '🌙';
    const themeIcon = document.getElementById('theme-icon');
    const themeIconMobile = document.getElementById('theme-icon-mobile');
    
    if (themeIcon) themeIcon.textContent = icon;
    if (themeIconMobile) themeIconMobile.textContent = icon;
    
    // 儲存偏好
    localStorage.setItem('theme', newTheme);
}

// 7. 初始化設定 (當頁面載入時)
(function init() {
    // 讀取儲存的佈景主題
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const icon = savedTheme === 'dark' ? '☀️' : '🌙';
    
    // 確保 DOM 載入後更新圖示
    window.addEventListener('load', () => {
        const themeIcon = document.getElementById('theme-icon');
        const themeIconMobile = document.getElementById('theme-icon-mobile');
        if (themeIcon) themeIcon.textContent = icon;
        if (themeIconMobile) themeIconMobile.textContent = icon;
    });

    // 鍵盤監聽 (Esc 鍵關閉燈箱或選單)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            const menu = document.querySelector('.mobile-menu');
            if (menu && menu.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
})();