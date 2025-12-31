// ============================================
// AUTHENTICATION MODULE
// ============================================

class Auth {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.loadFromStorage();
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (document.getElementById('loginForm')) {
            document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
            document.getElementById('togglePassword').addEventListener('click', (e) => this.togglePasswordVisibility(e));
        }

        if (document.getElementById('logoutBtn')) {
            document.getElementById('logoutBtn').addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        if (document.getElementById('profileBtn')) {
            document.getElementById('profileBtn').addEventListener('click', () => this.toggleDropdown());
        }

        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown && !e.target.closest('.profile-dropdown')) {
                dropdown.classList.remove('active');
            }
        });
    }

    // Demo users database
    users = {
        'admin': {
            username: 'admin',
            password: 'admin123',
            fullName: 'Ahmad Ketua',
            role: 'ketua_media',
            roleName: 'Ketua Media',
            profilePic: 'assets/profile/admin.png'
        },
        'user1': {
            username: 'user1',
            password: 'password123',
            fullName: 'Siti Member',
            role: 'member',
            roleName: 'Member',
            profilePic: 'assets/profile/user1.png'
        },
        'user2': {
            username: 'user2',
            password: 'password123',
            fullName: 'Budi Setiausaha',
            role: 'setiausaha',
            roleName: 'Setiausaha',
            profilePic: 'assets/profile/user2.png'
        },
        'user3': {
            username: 'user3',
            password: 'password123',
            fullName: 'Maya JQC',
            role: 'jqc',
            roleName: 'JQC',
            profilePic: 'assets/profile/user3.png'
        },
        'user4': {
            username: 'user4',
            password: 'password123',
            fullName: 'Rudi Video',
            role: 'ketua_video',
            roleName: 'Ketua Unit Video',
            profilePic: 'assets/profile/user4.png'
        },
        'user5': {
            username: 'user5',
            password: 'password123',
            fullName: 'Linda Poster',
            role: 'ketua_poster',
            roleName: 'Ketua Unit Poster',
            profilePic: 'assets/profile/user5.png'
        }
    };

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMsg');

        if (!username || !password) {
            errorMsg.textContent = 'Please enter username and password';
            return;
        }

        const user = this.users[username];
        if (!user || user.password !== password) {
            errorMsg.textContent = 'Invalid username or password';
            return;
        }

        this.login(user);
    }

    login(user) {
        this.currentUser = {
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            roleName: user.roleName,
            profilePic: user.profilePic
        };
        this.isLoggedIn = true;
        this.saveToStorage();
        window.location.href = 'index.html';
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }

    saveToStorage() {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        localStorage.setItem('isLoggedIn', 'true');
    }

    loadFromStorage() {
        const user = localStorage.getItem('currentUser');
        const loggedIn = localStorage.getItem('isLoggedIn');

        if (user && loggedIn) {
            this.currentUser = JSON.parse(user);
            this.isLoggedIn = true;
            this.updateUI();
        } else if (window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
        }
    }

    updateUI() {
        if (!this.currentUser) return;

        // Update navbar profile
        const profilePic = document.getElementById('profilePic');
        if (profilePic) profilePic.src = this.currentUser.profilePic;

        const dropdownProfilePic = document.getElementById('dropdownProfilePic');
        if (dropdownProfilePic) dropdownProfilePic.src = this.currentUser.profilePic;

        const fullName = document.getElementById('dropdownFullName');
        if (fullName) fullName.textContent = this.currentUser.fullName;

        const roleBadge = document.getElementById('dropdownRole');
        if (roleBadge) roleBadge.textContent = this.currentUser.roleName;

        const welcomeMsg = document.getElementById('welcomeMsg');
        if (welcomeMsg) {
            welcomeMsg.textContent = `Welcome, ${this.currentUser.fullName}!`;
        }
    }

    togglePasswordVisibility(e) {
        e.preventDefault();
        const passwordInput = document.getElementById('password');
        const toggle = e.target;
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggle.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggle.textContent = '👁️';
        }
    }

    toggleDropdown() {
        const menu = document.getElementById('dropdownMenu');
        menu.classList.toggle('active');
    }

    // Permission checking methods
    canViewAllSubmissions() {
        return ['ketua_media', 'setiausaha', 'jqc'].includes(this.currentUser.role);
    }

    canApproveSubmission() {
        return this.currentUser.role === 'ketua_media';
    }

    canSupportApproval() {
        return ['setiausaha', 'jqc', 'ketua_video', 'ketua_poster'].includes(this.currentUser.role);
    }

    canViewVideoSubmissions() {
        return ['ketua_media', 'setiausaha', 'jqc', 'ketua_video'].includes(this.currentUser.role);
    }

    canViewPosterSubmissions() {
        return ['ketua_media', 'setiausaha', 'jqc', 'ketua_poster'].includes(this.currentUser.role);
    }

    canApproveLeave() {
        return this.currentUser.role === 'ketua_media';
    }

    canSupportLeaveApproval() {
        return ['setiausaha', 'jqc', 'ketua_video', 'ketua_poster'].includes(this.currentUser.role);
    }

    hasAdminRole() {
        return ['ketua_media', 'setiausaha', 'jqc'].includes(this.currentUser.role);
    }
}

// Initialize auth
const auth = new Auth();
