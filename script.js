// Global variables
let currentLanguage = localStorage.getItem('language') || 'ar';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set initial language
    setLanguage(currentLanguage);
    
    // Set initial theme
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Check if user is logged in
    if (currentUser) {
        showUserMenu();
        updateUserBalance();
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize modals
    initializeModals();
    
    // Initialize upload area
    initializeUploadArea();
}

function initializeEventListeners() {
    // Language toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Contact form
    document.getElementById('contactForm').addEventListener('submit', handleContactForm);
    
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Recharge form
    document.getElementById('rechargeForm').addEventListener('submit', handleRecharge);
    
    // Account type change
    document.getElementById('accountType').addEventListener('change', handleAccountTypeChange);
    
    // Recharge amount change
    document.getElementById('rechargeAmount').addEventListener('input', updateRechargeSummary);
    
    // Copy account number
    document.querySelector('.copy-btn').addEventListener('click', copyAccountNumber);
}

function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

function initializeModals() {
    // Close modal when clicking on close button or outside modal
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

function initializeUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('receiptFile');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// Language functions
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update text direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Update all translatable elements
    document.querySelectorAll('[data-ar]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-ar-placeholder]').forEach(element => {
        const placeholder = element.getAttribute(`data-${lang}-placeholder`);
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
}

// Theme functions
function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    
    document.body.classList.toggle('dark-mode');
    
    const themeIcon = document.getElementById('themeToggle').querySelector('i');
    themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
}

// Authentication functions
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function openRegisterModal(type = 'individual') {
    document.getElementById('registerModal').style.display = 'block';
    if (type === 'trader') {
        document.getElementById('accountType').value = 'trader';
        handleAccountTypeChange();
    }
}

function openAccountModal() {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    document.getElementById('accountModal').style.display = 'block';
    updateAccountBalance();
}

function switchToRegister() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('registerModal').style.display = 'block';
}

function switchToLogin() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('loginModal').style.display = 'block';
}

function handleAccountTypeChange() {
    const accountType = document.getElementById('accountType').value;
    const traderInfo = document.getElementById('traderInfo');
    
    if (accountType === 'trader') {
        traderInfo.style.display = 'block';
    } else {
        traderInfo.style.display = 'none';
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation (in real app, this would be server-side)
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showUserMenu();
        updateUserBalance();
        document.getElementById('loginModal').style.display = 'none';
        showSuccessMessage(currentLanguage === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Connexion réussie!');
    } else {
        showErrorMessage(currentLanguage === 'ar' ? 'بيانات الدخول غير صحيحة!' : 'Identifiants incorrects!');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const accountType = document.getElementById('accountType').value;
    
    // Validation
    if (password !== confirmPassword) {
        showErrorMessage(currentLanguage === 'ar' ? 'كلمات المرور غير متطابقة!' : 'Les mots de passe ne correspondent pas!');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        showErrorMessage(currentLanguage === 'ar' ? 'البريد الإلكتروني مستخدم بالفعل!' : 'Email déjà utilisé!');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        accountType,
        balance: 0, // No initial bonus - traders get bonus only after depositing 50,000 DZD
        bonusEligible: accountType === 'trader', // Traders are eligible for bonus after first deposit
        bonusReceived: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showUserMenu();
    updateUserBalance();
    document.getElementById('registerModal').style.display = 'none';
    
    // Show success message
    if (accountType === 'trader') {
        showSuccessMessage(currentLanguage === 'ar' ? 
            'تم إنشاء حسابك كتاجر بنجاح! ستحصل على مكافأة 10,000 دج عند شحن حسابك بمبلغ 50,000 دج لأول مرة.' : 
            'Compte marchand créé avec succès! Vous recevrez un bonus de 10,000 DA lors de votre premier dépôt de 50,000 DA.');
    } else {
        showSuccessMessage(currentLanguage === 'ar' ? 'تم إنشاء حسابك بنجاح!' : 'Compte créé avec succès!');
    }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showUserControls();
    showSuccessMessage(currentLanguage === 'ar' ? 'تم تسجيل الخروج بنجاح!' : 'Déconnexion réussie!');
}

function showUserMenu() {
    document.getElementById('userControls').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name;
}

function showUserControls() {
    document.getElementById('userControls').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
}

function updateUserBalance() {
    if (currentUser) {
        document.getElementById('userBalance').textContent = `${currentUser.balance.toLocaleString()} دج`;
    }
}

function updateAccountBalance() {
    if (currentUser) {
        document.getElementById('accountBalance').textContent = currentUser.balance.toLocaleString();
    }
}

// Recharge functions
function openRechargeModal(operator, logoSrc, nameAr, nameFr) {
    if (!currentUser) {
        showErrorMessage(currentLanguage === 'ar' ? 
            'يجب تسجيل الدخول أولاً!' : 
            'Vous devez vous connecter d\'abord!');
        openLoginModal();
        return;
    }
    
    // Check if user has any balance
    if (currentUser.balance <= 0) {
        showErrorMessage(currentLanguage === 'ar' ? 
            'يجب شحن حسابك أولاً عبر التحويل البنكي قبل شراء أي خدمة!' : 
            'Vous devez recharger votre compte par virement bancaire avant d\'acheter un service!');
        showAccountModal();
        return;
    }
    
    document.getElementById('rechargeModal').style.display = 'block';
    
    // Update operator info
    const logo = document.getElementById('selectedOperatorLogo');
    const name = document.getElementById('selectedOperatorName');
    
    if (logoSrc && logoSrc !== 'undefined') {
        logo.src = logoSrc;
        logo.style.display = 'inline-block';
    } else {
        logo.style.display = 'none';
    }
    
    name.textContent = currentLanguage === 'ar' ? nameAr : nameFr;
    
    // Reset form
    document.getElementById('rechargeForm').reset();
    updateRechargeSummary();
}

function updateRechargeSummary() {
    const amount = parseInt(document.getElementById('rechargeAmount').value) || 0;
    const serviceFee = 10; // Fixed 10 DZD fee
    const total = amount + serviceFee;
    
    document.getElementById('summaryAmount').textContent = `${amount} دج`;
    document.getElementById('totalAmount').textContent = `${total} دج`;
}

function handleRecharge(e) {
    e.preventDefault();
    
    const phoneNumber = document.getElementById('phoneNumber').value;
    const amount = parseInt(document.getElementById('rechargeAmount').value);
    const serviceFee = 10;
    const total = amount + serviceFee;
    
    // Check if user has enough balance
    if (currentUser.balance < total) {
        showErrorMessage(currentLanguage === 'ar' ? 
            `رصيدك غير كافي! تحتاج ${total} دج ولديك ${currentUser.balance} دج. يرجى شحن حسابك أولاً.` : 
            `Solde insuffisant! Vous avez besoin de ${total} DA et vous avez ${currentUser.balance} DA. Veuillez recharger votre compte d'abord.`);
        showAccountModal();
        return;
    }
    
    // Deduct amount from user balance
    currentUser.balance -= total;
    
    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    updateUserBalance();
    updateAccountBalance();
    
    document.getElementById('rechargeModal').style.display = 'none';
    showSuccessMessage(currentLanguage === 'ar' ? 
        `تم شحن ${amount} دج للرقم ${phoneNumber} بنجاح!` : 
        `Recharge de ${amount} DA pour le numéro ${phoneNumber} réussie!`);
}

// Payment functions
function showPaymentSection() {
    document.getElementById('paymentSection').style.display = 'block';
}

function copyAccountNumber() {
    const accountNumber = document.getElementById('accountNumber').textContent;
    navigator.clipboard.writeText(accountNumber).then(() => {
        showSuccessMessage(currentLanguage === 'ar' ? 'تم نسخ رقم الحساب!' : 'Numéro de compte copié!');
    });
}

function handleFileUpload(file) {
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        showErrorMessage(currentLanguage === 'ar' ? 
            'نوع الملف غير مدعوم! يرجى اختيار JPG أو PNG أو PDF.' : 
            'Type de fichier non supporté! Veuillez choisir JPG, PNG ou PDF.');
        return;
    }
    
    if (file.size > maxSize) {
        showErrorMessage(currentLanguage === 'ar' ? 
            'حجم الملف كبير جداً! الحد الأقصى 5 ميجابايت.' : 
            'Fichier trop volumineux! Maximum 5 MB.');
        return;
    }
    
    // Simulate file upload and payment processing
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.innerHTML = `
        <i class="fas fa-check-circle" style="color: #10b981; font-size: 2rem;"></i>
        <p>${currentLanguage === 'ar' ? 'تم رفع الملف بنجاح!' : 'Fichier téléchargé avec succès!'}</p>
        <small>${file.name}</small>
    `;
    
    // Simulate payment processing after 2 seconds
    setTimeout(() => {
        processPaymentAndBonus();
    }, 2000);
    
    showSuccessMessage(currentLanguage === 'ar' ? 
        'تم رفع الوصل بنجاح! سيتم مراجعته وتفعيل رصيدك خلال 24 ساعة.' : 
        'Reçu téléchargé avec succès! Il sera examiné et votre solde activé dans les 24 heures.');
}

// Process payment and check for trader bonus eligibility
function processPaymentAndBonus() {
    if (!currentUser) return;
    
    // Simulate payment amount (in real app, this would come from payment verification)
    const paymentAmount = 50000; // Simulating 50,000 DZD payment
    
    // Add payment to user balance
    currentUser.balance += paymentAmount;
    
    // Check if trader is eligible for bonus
    if (currentUser.accountType === 'trader' && 
        currentUser.bonusEligible && 
        !currentUser.bonusReceived && 
        paymentAmount >= 50000) {
        
        // Add bonus
        currentUser.balance += 10000;
        currentUser.bonusReceived = true;
        currentUser.bonusEligible = false;
        
        // Update user in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        updateUserBalance();
        updateAccountBalance();
        
        showSuccessMessage(currentLanguage === 'ar' ? 
            `تم تفعيل رصيدك بمبلغ ${paymentAmount.toLocaleString()} دج + مكافأة 10,000 دج كتاجر جديد!` : 
            `Votre solde a été activé avec ${paymentAmount.toLocaleString()} DA + bonus de 10,000 DA comme nouveau marchand!`);
    } else {
        // Update user in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        updateUserBalance();
        updateAccountBalance();
        
        showSuccessMessage(currentLanguage === 'ar' ? 
            `تم تفعيل رصيدك بمبلغ ${paymentAmount.toLocaleString()} دج بنجاح!` : 
            `Votre solde a été activé avec ${paymentAmount.toLocaleString()} DA avec succès!`);
    }
}

// Contact form
function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Simulate form submission
    showSuccessMessage(currentLanguage === 'ar' ? 
        'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' : 
        'Message envoyé avec succès! Nous vous contacterons bientôt.');
    
    e.target.reset();
}

// Utility functions
function scrollToServices() {
    document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
}

function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.type === 'submit') {
            this.classList.add('loading');
            setTimeout(() => {
                this.classList.remove('loading');
            }, 2000);
        }
    });
});



// Admin Panel Functions
const ADMIN_EMAIL = 'admin@agence-elamir.dz'; // يمكن تغييرها حسب الحاجة

function openAdminPanel() {
    // التحقق من صلاحيات المدير
    if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        showErrorMessage(currentLanguage === 'ar' ? 
            'ليس لديك صلاحية للوصول إلى لوحة التحكم!' : 
            'Vous n\'avez pas l\'autorisation d\'accéder au panneau d\'administration!');
        return;
    }
    
    document.getElementById('adminModal').style.display = 'block';
    loadAdminData();
}

function closeAdminPanel() {
    document.getElementById('adminModal').style.display = 'none';
}

function showAdminTab(tabName) {
    // إخفاء جميع التبويبات
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // إخفاء جميع أزرار التبويبات
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // إظهار التبويب المحدد
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    // تحميل البيانات حسب التبويب
    switch(tabName) {
        case 'receipts':
            loadPendingReceipts();
            break;
        case 'users':
            loadUsers();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'support':
            loadSupportMessages();
            break;
        case 'stats':
            loadStatistics();
            break;
    }
}

function loadAdminData() {
    loadPendingReceipts();
    loadStatistics();
}

function loadPendingReceipts() {
    const receipts = JSON.parse(localStorage.getItem('pendingReceipts')) || [];
    const receiptsList = document.getElementById('receiptsList');
    const pendingCount = document.getElementById('pendingReceiptsCount');
    
    pendingCount.textContent = receipts.length;
    
    if (receipts.length === 0) {
        receiptsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>${currentLanguage === 'ar' ? 'لا توجد وصولات معلقة' : 'Aucun reçu en attente'}</p>
            </div>
        `;
        return;
    }
    
    receiptsList.innerHTML = receipts.map(receipt => `
        <div class="receipt-item">
            <div class="receipt-info">
                <div class="user-details">
                    <h4>${receipt.userName}</h4>
                    <p>${receipt.userEmail}</p>
                    <p>${receipt.userPhone}</p>
                </div>
                <div class="amount-details">
                    <span class="amount">${receipt.amount.toLocaleString()} دج</span>
                    <span class="date">${new Date(receipt.date).toLocaleDateString('ar-DZ')}</span>
                </div>
            </div>
            <div class="receipt-actions">
                <button class="btn btn-success" onclick="approveReceipt('${receipt.id}')">
                    <i class="fas fa-check"></i>
                    ${currentLanguage === 'ar' ? 'موافقة' : 'Approuver'}
                </button>
                <button class="btn btn-danger" onclick="rejectReceipt('${receipt.id}')">
                    <i class="fas fa-times"></i>
                    ${currentLanguage === 'ar' ? 'رفض' : 'Rejeter'}
                </button>
                <button class="btn btn-secondary" onclick="viewReceipt('${receipt.id}')">
                    <i class="fas fa-eye"></i>
                    ${currentLanguage === 'ar' ? 'عرض' : 'Voir'}
                </button>
            </div>
        </div>
    `).join('');
}

function approveReceipt(receiptId) {
    const receipts = JSON.parse(localStorage.getItem('pendingReceipts')) || [];
    const receiptIndex = receipts.findIndex(r => r.id === receiptId);
    
    if (receiptIndex === -1) return;
    
    const receipt = receipts[receiptIndex];
    
    // إضافة الرصيد للمستخدم
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === receipt.userEmail);
    
    if (userIndex !== -1) {
        users[userIndex].balance += receipt.amount;
        
        // إضافة مكافأة التاجر إذا كان مؤهلاً
        if (users[userIndex].type === 'trader' && !users[userIndex].bonusReceived && receipt.amount >= 50000) {
            users[userIndex].balance += 10000;
            users[userIndex].bonusReceived = true;
            
            // إضافة إشعار للمستخدم
            addNotification(users[userIndex].id, 
                currentLanguage === 'ar' ? 
                'تهانينا! تم إضافة مكافأة 10,000 دج لحسابك كتاجر جديد!' : 
                'Félicitations! Un bonus de 10 000 DA a été ajouté à votre compte en tant que nouveau commerçant!'
            );
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        
        // تحديث المستخدم الحالي إذا كان هو نفسه
        if (currentUser && currentUser.email === receipt.userEmail) {
            currentUser = users[userIndex];
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserBalance();
            updateAccountBalance();
        }
    }
    
    // إزالة الوصل من القائمة المعلقة
    receipts.splice(receiptIndex, 1);
    localStorage.setItem('pendingReceipts', JSON.stringify(receipts));
    
    // إضافة إلى سجل الوصولات المعتمدة
    const approvedReceipts = JSON.parse(localStorage.getItem('approvedReceipts')) || [];
    approvedReceipts.push({
        ...receipt,
        approvedDate: new Date().toISOString(),
        status: 'approved'
    });
    localStorage.setItem('approvedReceipts', JSON.stringify(approvedReceipts));
    
    showSuccessMessage(currentLanguage === 'ar' ? 
        'تم اعتماد الوصل وإضافة الرصيد بنجاح!' : 
        'Reçu approuvé et solde ajouté avec succès!');
    
    loadPendingReceipts();
    loadStatistics();
}

function rejectReceipt(receiptId) {
    const receipts = JSON.parse(localStorage.getItem('pendingReceipts')) || [];
    const receiptIndex = receipts.findIndex(r => r.id === receiptId);
    
    if (receiptIndex === -1) return;
    
    const receipt = receipts[receiptIndex];
    
    // إزالة الوصل من القائمة المعلقة
    receipts.splice(receiptIndex, 1);
    localStorage.setItem('pendingReceipts', JSON.stringify(receipts));
    
    // إضافة إلى سجل الوصولات المرفوضة
    const rejectedReceipts = JSON.parse(localStorage.getItem('rejectedReceipts')) || [];
    rejectedReceipts.push({
        ...receipt,
        rejectedDate: new Date().toISOString(),
        status: 'rejected'
    });
    localStorage.setItem('rejectedReceipts', JSON.stringify(rejectedReceipts));
    
    // إضافة إشعار للمستخدم
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === receipt.userEmail);
    if (user) {
        addNotification(user.id, 
            currentLanguage === 'ar' ? 
            'تم رفض وصل الدفع الخاص بك. يرجى التواصل مع الدعم.' : 
            'Votre reçu de paiement a été rejeté. Veuillez contacter le support.'
        );
    }
    
    showSuccessMessage(currentLanguage === 'ar' ? 
        'تم رفض الوصل!' : 
        'Reçu rejeté!');
    
    loadPendingReceipts();
}

function viewReceipt(receiptId) {
    const receipts = JSON.parse(localStorage.getItem('pendingReceipts')) || [];
    const receipt = receipts.find(r => r.id === receiptId);
    
    if (!receipt) return;
    
    // فتح نافذة جديدة لعرض الوصل
    if (receipt.fileData) {
        const newWindow = window.open();
        newWindow.document.write(`
            <html>
                <head><title>وصل الدفع - ${receipt.userName}</title></head>
                <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0;">
                    <img src="${receipt.fileData}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </body>
            </html>
        `);
    }
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usersList = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>${currentLanguage === 'ar' ? 'لا يوجد مستخدمين مسجلين' : 'Aucun utilisateur enregistré'}</p>
            </div>
        `;
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="user-item">
            <div class="user-info">
                <div class="user-details">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                    <p>${user.phone}</p>
                    <span class="user-type ${user.type}">${user.type === 'trader' ? 'تاجر' : 'فرد'}</span>
                </div>
                <div class="user-balance">
                    <span class="balance">${user.balance.toLocaleString()} دج</span>
                    <span class="join-date">${new Date(user.joinDate).toLocaleDateString('ar-DZ')}</span>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-primary" onclick="editUserBalance('${user.id}')">
                    <i class="fas fa-edit"></i>
                    ${currentLanguage === 'ar' ? 'تعديل الرصيد' : 'Modifier solde'}
                </button>
                <button class="btn btn-secondary" onclick="viewUserHistory('${user.id}')">
                    <i class="fas fa-history"></i>
                    ${currentLanguage === 'ar' ? 'السجل' : 'Historique'}
                </button>
            </div>
        </div>
    `).join('');
}

function editUserBalance(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    const newBalance = prompt(
        currentLanguage === 'ar' ? 
        `الرصيد الحالي: ${user.balance.toLocaleString()} دج\nأدخل الرصيد الجديد:` : 
        `Solde actuel: ${user.balance.toLocaleString()} DA\nEntrez le nouveau solde:`,
        user.balance
    );
    
    if (newBalance !== null && !isNaN(newBalance) && newBalance >= 0) {
        const userIndex = users.findIndex(u => u.id === userId);
        users[userIndex].balance = parseInt(newBalance);
        localStorage.setItem('users', JSON.stringify(users));
        
        // تحديث المستخدم الحالي إذا كان هو نفسه
        if (currentUser && currentUser.id === userId) {
            currentUser.balance = parseInt(newBalance);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserBalance();
            updateAccountBalance();
        }
        
        showSuccessMessage(currentLanguage === 'ar' ? 
            'تم تحديث الرصيد بنجاح!' : 
            'Solde mis à jour avec succès!');
        
        loadUsers();
    }
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>${currentLanguage === 'ar' ? 'لا توجد طلبات' : 'Aucune commande'}</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-info">
                <div class="order-details">
                    <h4>${order.operator} - ${order.phoneNumber}</h4>
                    <p>${order.userName} (${order.userEmail})</p>
                    <span class="order-date">${new Date(order.date).toLocaleDateString('ar-DZ')} ${new Date(order.date).toLocaleTimeString('ar-DZ')}</span>
                </div>
                <div class="order-amount">
                    <span class="amount">${order.amount.toLocaleString()} دج</span>
                    <span class="fee">عمولة: ${order.fee} دج</span>
                    <span class="total">المجموع: ${order.total.toLocaleString()} دج</span>
                </div>
            </div>
            <div class="order-status">
                <span class="status ${order.status}">${order.status === 'completed' ? 'مكتمل' : 'معلق'}</span>
            </div>
        </div>
    `).join('');
}

function loadSupportMessages() {
    const messages = JSON.parse(localStorage.getItem('supportMessages')) || [];
    const supportMessages = document.getElementById('supportMessages');
    const unreadCount = document.getElementById('unreadMessagesCount');
    
    const unreadMessages = messages.filter(msg => !msg.read);
    unreadCount.textContent = unreadMessages.length;
    
    if (messages.length === 0) {
        supportMessages.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <p>${currentLanguage === 'ar' ? 'لا توجد رسائل دعم' : 'Aucun message de support'}</p>
            </div>
        `;
        return;
    }
    
    supportMessages.innerHTML = messages.map(message => `
        <div class="support-message ${!message.read ? 'unread' : ''}">
            <div class="message-header">
                <div class="sender-info">
                    <h4>${message.name}</h4>
                    <p>${message.email}</p>
                    <p>${message.phone}</p>
                </div>
                <div class="message-date">
                    <span>${new Date(message.date).toLocaleDateString('ar-DZ')}</span>
                    <span>${new Date(message.date).toLocaleTimeString('ar-DZ')}</span>
                </div>
            </div>
            <div class="message-content">
                <p>${message.message}</p>
            </div>
            <div class="message-actions">
                <button class="btn btn-primary" onclick="replyToMessage('${message.id}')">
                    <i class="fas fa-reply"></i>
                    ${currentLanguage === 'ar' ? 'رد' : 'Répondre'}
                </button>
                <button class="btn btn-secondary" onclick="markAsRead('${message.id}')">
                    <i class="fas fa-check"></i>
                    ${currentLanguage === 'ar' ? 'تم القراءة' : 'Marquer comme lu'}
                </button>
            </div>
        </div>
    `).join('');
}

function replyToMessage(messageId) {
    const messages = JSON.parse(localStorage.getItem('supportMessages')) || [];
    const message = messages.find(msg => msg.id === messageId);
    
    if (!message) return;
    
    // فتح تطبيق الواتساب للرد
    const whatsappNumber = '+213562359997';
    const replyText = `مرحباً ${message.name}، شكراً لتواصلك معنا بخصوص: "${message.message.substring(0, 50)}..."`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(replyText)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // تحديث حالة الرسالة كمقروءة
    markAsRead(messageId);
}

function markAsRead(messageId) {
    const messages = JSON.parse(localStorage.getItem('supportMessages')) || [];
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
        messages[messageIndex].read = true;
        localStorage.setItem('supportMessages', JSON.stringify(messages));
        loadSupportMessages();
    }
}

function loadStatistics() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const today = new Date().toDateString();
    
    // إحصائيات عامة
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalOrders').textContent = orders.length;
    
    // إجمالي الإيرادات (العمولات فقط)
    const totalRevenue = orders.reduce((sum, order) => sum + order.fee, 0);
    document.getElementById('totalRevenue').textContent = totalRevenue.toLocaleString() + ' دج';
    
    // طلبات اليوم
    const todayOrders = orders.filter(order => new Date(order.date).toDateString() === today);
    document.getElementById('todayOrders').textContent = todayOrders.length;
}

function addNotification(userId, message) {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.push({
        id: Date.now().toString(),
        userId: userId,
        message: message,
        date: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// إظهار رابط لوحة التحكم للمدير فقط
function checkAdminAccess() {
    const adminLink = document.getElementById('adminLink');
    if (currentUser && currentUser.email === ADMIN_EMAIL) {
        adminLink.style.display = 'block';
    } else {
        adminLink.style.display = 'none';
    }
}

// تحديث التحقق من صلاحيات المدير عند تسجيل الدخول
const originalLogin = handleLogin;
function handleLogin(e) {
    originalLogin(e);
    setTimeout(checkAdminAccess, 100);
}

// إضافة مستمع للنقر خارج النافذة لإغلاقها
window.onclick = function(event) {
    const adminModal = document.getElementById('adminModal');
    if (event.target === adminModal) {
        closeAdminPanel();
    }
}

