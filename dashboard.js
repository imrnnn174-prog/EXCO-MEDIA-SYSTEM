// ============================================
// DASHBOARD MODULE
// ============================================

class Dashboard {
    constructor() {
        this.setupEventListeners();
        this.initializeData();
        this.renderDashboard();
        this.setupServiceWorker();
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }

    setupEventListeners() {
        // Section navigation
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // New submission button
        const newSubmissionBtn = document.getElementById('newSubmissionBtn');
        if (newSubmissionBtn) {
            newSubmissionBtn.addEventListener('click', () => this.openSubmissionModal());
        }

        // Modal close buttons
        document.querySelectorAll('.close-btn, .close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = btn.closest('.modal');
                modal.classList.remove('active');
            });
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterSubmissions(btn.dataset.filter);
            });
        });

        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
            });
        });

        // Submission form
        const submissionForm = document.getElementById('submissionForm');
        if (submissionForm) {
            submissionForm.addEventListener('change', (e) => {
                if (e.target.name === 'uploadMethod') {
                    const fileGroup = document.getElementById('fileInput').parentElement;
                    const linkGroup = document.getElementById('linkGroup');
                    if (e.target.value === 'link') {
                        fileGroup.style.display = 'none';
                        linkGroup.style.display = 'block';
                    } else {
                        fileGroup.style.display = 'block';
                        linkGroup.style.display = 'none';
                    }
                }
            });

            submissionForm.addEventListener('submit', (e) => this.handleSubmissionSubmit(e));
        }

        // Leave form
        const leaveForm = document.getElementById('leaveForm');
        if (leaveForm) {
            leaveForm.addEventListener('submit', (e) => this.handleLeaveSubmit(e));
        }

        // Apply leave button
        const applyLeaveBtn = document.getElementById('applyLeaveBtn');
        if (applyLeaveBtn) {
            applyLeaveBtn.addEventListener('click', () => this.openLeaveModal());
        }

        // Calendar navigation
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        if (prevMonth) prevMonth.addEventListener('click', () => this.previousMonth());
        if (nextMonth) nextMonth.addEventListener('click', () => this.nextMonth());
    }

    initializeData() {
        this.submissions = this.loadFromStorage('submissions') || [];
        this.leaves = this.loadFromStorage('leaves') || [];
        this.approvals = this.loadFromStorage('approvals') || [];
        this.currentMonth = new Date();

        // Initialize with sample data if empty
        if (this.submissions.length === 0) {
            this.submissions = this.generateSampleSubmissions();
            this.saveToStorage('submissions', this.submissions);
        }

        if (this.approvals.length === 0) {
            this.approvals = this.generateSampleApprovals();
            this.saveToStorage('approvals', this.approvals);
        }

        if (this.leaves.length === 0) {
            this.leaves = this.generateSampleLeaves();
            this.saveToStorage('leaves', this.leaves);
        }
    }

    generateSampleSubmissions() {
        const types = ['poster', 'video'];
        const statuses = ['pending', 'approved', 'rejected'];
        const submissions = [];

        for (let i = 1; i <= 5; i++) {
            submissions.push({
                id: `sub_${i}`,
                type: types[i % 2],
                title: `${types[i % 2] === 'poster' ? 'Campaign Poster' : 'Promotional Video'} ${i}`,
                description: `This is a sample submission description for item ${i}`,
                submittedBy: auth.currentUser.username,
                submitterName: auth.currentUser.fullName,
                submitterRole: auth.currentUser.roleName,
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                supportApprovals: [],
                finalApproval: null,
                media: {
                    type: types[i % 2] === 'poster' ? 'file' : 'link',
                    url: types[i % 2] === 'poster' ? `document${i}.pdf` : `https://youtu.be/example${i}`
                }
            });
        }

        return submissions;
    }

    generateSampleApprovals() {
        const pending = this.submissions.filter(s => s.status === 'pending');
        return pending.map(sub => ({
            id: `apr_${sub.id}`,
            submissionId: sub.id,
            status: 'pending',
            supporters: [],
            finalApprover: 'ketua_media'
        }));
    }

    generateSampleLeaves() {
        const types = ['sick', 'annual', 'emergency', 'personal'];
        const leaves = [];

        for (let i = 1; i <= 3; i++) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + Math.random() * 30);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);

            leaves.push({
                id: `leave_${i}`,
                userId: auth.currentUser.username,
                userName: auth.currentUser.fullName,
                userRole: auth.currentUser.roleName,
                type: types[i % 4],
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                reason: `Leave reason ${i}`,
                status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
                supportApprovals: [],
                timestamp: new Date().toISOString()
            });
        }

        return leaves;
    }

    renderDashboard() {
        this.updateStats();
        this.renderActivity();
        this.renderSubmissions();
        this.renderApprovals();
        this.renderCalendar();
        this.renderLeaves();
    }

    updateStats() {
        const totalSubmissions = this.submissions.length;
        const pending = this.submissions.filter(s => s.status === 'pending').length;
        const approved = this.submissions.filter(s => s.status === 'approved').length;
        const rejected = this.submissions.filter(s => s.status === 'rejected').length;

        document.getElementById('totalSubmissions').textContent = totalSubmissions;
        document.getElementById('pendingApprovals').textContent = pending;
        document.getElementById('approvedCount').textContent = approved;
        document.getElementById('rejectedCount').textContent = rejected;

        // Update notification badges
        const approvalsBadge = document.getElementById('approvalsBadge');
        if (approvalsBadge) approvalsBadge.textContent = pending;

        const notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge) notificationBadge.textContent = pending;
    }

    renderActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const recentActivity = [
            ...this.submissions.slice(0, 3),
            ...this.leaves.slice(0, 2)
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

        if (recentActivity.length === 0) {
            activityList.innerHTML = '<p class="empty-state">No recent activity</p>';
            return;
        }

        activityList.innerHTML = recentActivity.map(item => {
            const isSubmission = item.submittedBy !== undefined;
            const icon = isSubmission ? (item.type === 'poster' ? '📰' : '🎬') : '🏖️';
            const title = isSubmission ? `Submission: ${item.title}` : `Leave Request: ${item.type}`;
            const time = this.formatTime(new Date(item.timestamp));

            return `
                <div class="activity-item">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-content">
                        <div class="activity-title">${title}</div>
                        <div class="activity-time">${time}</div>
                    </div>
                    <div class="status-badge status-${item.status}">${item.status}</div>
                </div>
            `;
        }).join('');
    }

    renderSubmissions() {
        const submissionsList = document.getElementById('submissionsList');
        if (!submissionsList) return;

        let submissions = this.submissions;

        // Filter based on user role
        if (!auth.canViewAllSubmissions()) {
            if (auth.currentUser.role === 'ketua_video') {
                submissions = submissions.filter(s => s.type === 'video');
            } else if (auth.currentUser.role === 'ketua_poster') {
                submissions = submissions.filter(s => s.type === 'poster');
            } else {
                submissions = submissions.filter(s => s.submittedBy === auth.currentUser.username);
            }
        }

        if (submissions.length === 0) {
            submissionsList.innerHTML = '<p class="empty-state">No submissions</p>';
            return;
        }

        submissionsList.innerHTML = submissions.map(sub => `
            <div class="submission-card">
                <div class="card-header">
                    <h3 class="card-title">${sub.title}</h3>
                    <div class="status-badge status-${sub.status}">${sub.status}</div>
                </div>
                <div class="card-meta">
                    <span>${sub.type === 'poster' ? '📰' : '🎬'} ${sub.type}</span>
                    <span>${sub.submitterName}</span>
                    <span>${this.formatTime(new Date(sub.timestamp))}</span>
                </div>
                <p>${sub.description}</p>
                <div class="approval-chain">
                    <strong>Approval Chain:</strong>
                    <div style="margin-top: 8px;">
                        ${sub.supportApprovals.map(approval => `<span class="approval-step">✔ ${approval.approverName}</span>`).join('')}
                        ${sub.status === 'approved' ? '<span class="approval-step approval-icon-success">✅ Approved by Ketua Media</span>' : ''}
                    </div>
                </div>
                <div class="card-footer">
                    ${auth.canApproveSubmission() && sub.status === 'pending' ? `
                        <button class="card-btn card-btn-primary" onclick="dashboard.approveSubmission('${sub.id}')">Approve</button>
                    ` : ''}
                    ${auth.canSupportApproval() && sub.status === 'pending' ? `
                        <button class="card-btn card-btn-secondary" onclick="dashboard.supportApproveSubmission('${sub.id}')">Support Approval</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderApprovals() {
        const approvalsList = document.getElementById('approvalsList');
        if (!approvalsList) return;

        let pendingApprovals = this.submissions.filter(s => s.status === 'pending');

        if (!auth.canApproveSubmission() && !auth.canSupportApproval()) {
            approvalsList.innerHTML = '<p class="empty-state">No approvals required</p>';
            return;
        }

        if (pendingApprovals.length === 0) {
            approvalsList.innerHTML = '<p class="empty-state">No pending approvals</p>';
            return;
        }

        approvalsList.innerHTML = pendingApprovals.map(sub => `
            <div class="approval-card">
                <div class="approval-header">
                    <div>
                        <h3 class="card-title">${sub.title}</h3>
                        <div class="card-meta">
                            <span>${sub.submitterName}</span>
                            <span>${this.formatTime(new Date(sub.timestamp))}</span>
                        </div>
                    </div>
                    <span class="role-badge">${sub.type}</span>
                </div>
                <p>${sub.description}</p>
                <div class="approval-chain">
                    <strong>Supporters:</strong>
                    <div style="margin-top: 8px;">
                        ${sub.supportApprovals.length > 0 
                            ? sub.supportApprovals.map(a => `<span class="approval-step">✔ ${a.approverName}</span>`).join('')
                            : '<span style="color: var(--text-secondary);">Awaiting support...</span>'
                        }
                    </div>
                </div>
                <div class="card-footer">
                    ${auth.canApproveSubmission() ? `
                        <button class="card-btn card-btn-primary" onclick="dashboard.approveSubmission('${sub.id}')">Final Approve</button>
                    ` : ''}
                    ${auth.canSupportApproval() && !sub.supportApprovals.some(a => a.approver === auth.currentUser.username) ? `
                        <button class="card-btn card-btn-secondary" onclick="dashboard.supportApproveSubmission('${sub.id}')">Support Approve</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    renderCalendar() {
        this.updateCalendarHeader();
        this.renderCalendarDays();
    }

    updateCalendarHeader() {
        const currentMonth = document.getElementById('currentMonth');
        if (currentMonth) {
            currentMonth.textContent = this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        }
    }

    renderCalendarDays() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let html = '<div style="grid-column: 1/-1; display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">';

        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });

        // Empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += '<div class="calendar-day other-month"></div>';
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const hasEvent = this.leaves.some(leave => {
                const leaveStart = new Date(leave.startDate);
                const leaveEnd = new Date(leave.endDate);
                return currentDate >= leaveStart && currentDate <= leaveEnd && leave.status === 'approved';
            });

            html += `<div class="calendar-day ${hasEvent ? 'has-event' : ''}">${day}</div>`;
        }

        // Empty cells for days after month ends
        const totalCells = (startingDayOfWeek + daysInMonth);
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remainingCells; i++) {
            html += '<div class="calendar-day other-month"></div>';
        }

        html += '</div>';
        calendarGrid.innerHTML = html;

        // Add event listeners to days
        calendarGrid.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => this.showCalendarEvents(e));
        });
    }

    showCalendarEvents(e) {
        const dayText = e.target.textContent;
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const selectedDate = new Date(year, month, parseInt(dayText));

        const calendarEvents = document.getElementById('calendarEvents');
        const approvedLeaves = this.leaves.filter(leave => {
            const leaveStart = new Date(leave.startDate);
            const leaveEnd = new Date(leave.endDate);
            return selectedDate >= leaveStart && selectedDate <= leaveEnd && leave.status === 'approved';
        });

        if (approvedLeaves.length === 0) {
            calendarEvents.innerHTML = '<p class="empty-state">No events for this day</p>';
            return;
        }

        calendarEvents.innerHTML = approvedLeaves.map(leave => `
            <div class="event-item">
                <div class="event-item-name">${leave.userName}</div>
                <div class="event-item-role">${leave.userRole}</div>
                <div class="event-item-duration">${leave.startDate} to ${leave.endDate}</div>
            </div>
        `).join('');
    }

    previousMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.renderCalendar();
    }

    renderLeaves() {
        const myLeavesList = document.getElementById('myLeavesList');
        const pendingLeavesList = document.getElementById('pendingLeavesList');

        if (myLeavesList) {
            const myLeaves = this.leaves.filter(l => l.userId === auth.currentUser.username);
            if (myLeaves.length === 0) {
                myLeavesList.innerHTML = '<p class="empty-state">No leave records</p>';
            } else {
                myLeavesList.innerHTML = myLeaves.map(leave => this.renderLeaveCard(leave)).join('');
            }
        }

        if (pendingLeavesList) {
            const pendingLeaves = this.leaves.filter(l => l.status === 'pending' && (auth.canApproveLeave() || auth.canSupportLeaveApproval()));
            if (pendingLeaves.length === 0) {
                pendingLeavesList.innerHTML = '<p class="empty-state">No pending approvals</p>';
            } else {
                pendingLeavesList.innerHTML = pendingLeaves.map(leave => this.renderLeaveCard(leave, true)).join('');
            }
        }
    }

    renderLeaveCard(leave, isApproval = false) {
        const duration = this.getDaysDifference(leave.startDate, leave.endDate);
        return `
            <div class="leave-card">
                <div class="card-header">
                    <h3 class="card-title">${leave.userName} - ${leave.type}</h3>
                    <div class="status-badge status-${leave.status}">${leave.status}</div>
                </div>
                <div class="card-meta">
                    <span>📅 ${duration} days</span>
                    <span>${leave.startDate} to ${leave.endDate}</span>
                </div>
                <p><strong>Reason:</strong> ${leave.reason}</p>
                <div class="leave-status">
                    <strong>Supporters:</strong>
                    <div style="margin-top: 8px;">
                        ${leave.supportApprovals.length > 0 
                            ? leave.supportApprovals.map(a => `<span class="leave-status-step">✔ ${a.approverName}</span>`).join('')
                            : '<span style="color: var(--text-secondary); font-size: 13px;">Awaiting support...</span>'
                        }
                    </div>
                </div>
                ${isApproval ? `
                    <div class="card-footer">
                        ${auth.canApproveLeave() && leave.status === 'pending' ? `
                            <button class="card-btn card-btn-primary" onclick="dashboard.approveLeave('${leave.id}')">Approve Leave</button>
                        ` : ''}
                        ${auth.canSupportLeaveApproval() && leave.status === 'pending' && !leave.supportApprovals.some(a => a.approver === auth.currentUser.username) ? `
                            <button class="card-btn card-btn-secondary" onclick="dashboard.supportLeaveApproval('${leave.id}')">Support Approval</button>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    switchSection(sectionName) {
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    }

    openSubmissionModal() {
        document.getElementById('submissionForm').reset();
        document.getElementById('submissionModal').classList.add('active');
    }

    openLeaveModal() {
        document.getElementById('leaveForm').reset();
        document.getElementById('leaveModal').classList.add('active');
    }

    handleSubmissionSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const submission = {
            id: `sub_${Date.now()}`,
            type: formData.get('type'),
            title: formData.get('title'),
            description: formData.get('description'),
            submittedBy: auth.currentUser.username,
            submitterName: auth.currentUser.fullName,
            submitterRole: auth.currentUser.roleName,
            timestamp: new Date().toISOString(),
            status: 'pending',
            supportApprovals: [],
            finalApproval: null,
            media: {
                type: formData.get('uploadMethod'),
                url: formData.get('uploadMethod') === 'link' ? formData.get('link') : formData.get('file')
            }
        };

        this.submissions.push(submission);
        this.saveToStorage('submissions', this.submissions);
        document.getElementById('submissionModal').classList.remove('active');
        this.showToast(`✅ Submission created successfully!`, 'success');
        this.renderDashboard();
    }

    handleLeaveSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const leave = {
            id: `leave_${Date.now()}`,
            userId: auth.currentUser.username,
            userName: auth.currentUser.fullName,
            userRole: auth.currentUser.roleName,
            type: formData.get('leaveType'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
            reason: formData.get('reason'),
            status: 'pending',
            supportApprovals: [],
            timestamp: new Date().toISOString()
        };

        this.leaves.push(leave);
        this.saveToStorage('leaves', this.leaves);
        document.getElementById('leaveModal').classList.remove('active');
        this.showToast(`✅ Leave application submitted!`, 'success');
        this.renderDashboard();
    }

    approveSubmission(submissionId) {
        const submission = this.submissions.find(s => s.id === submissionId);
        if (!submission) return;

        submission.status = 'approved';
        submission.finalApproval = {
            approver: auth.currentUser.username,
            approverName: auth.currentUser.fullName,
            timestamp: new Date().toISOString()
        };

        this.saveToStorage('submissions', this.submissions);
        this.showCompletionAnimation();
        this.showToast(`✅ Submission approved by ${auth.currentUser.fullName}!`, 'success');
        this.renderDashboard();
    }

    supportApproveSubmission(submissionId) {
        const submission = this.submissions.find(s => s.id === submissionId);
        if (!submission) return;

        const supportApproval = {
            approver: auth.currentUser.username,
            approverName: auth.currentUser.fullName,
            role: auth.currentUser.roleName,
            timestamp: new Date().toISOString()
        };

        if (!submission.supportApprovals.some(a => a.approver === auth.currentUser.username)) {
            submission.supportApprovals.push(supportApproval);
        }

        this.saveToStorage('submissions', this.submissions);
        this.showCompletionAnimation();
        this.showToast(`✔ Support approval added by ${auth.currentUser.fullName}!`, 'success');
        this.renderDashboard();
    }

    approveLeave(leaveId) {
        const leave = this.leaves.find(l => l.id === leaveId);
        if (!leave) return;

        leave.status = 'approved';
        this.saveToStorage('leaves', this.leaves);
        this.showCompletionAnimation();
        this.showToast(`✅ Leave approved!`, 'success');
        this.renderDashboard();
    }

    supportLeaveApproval(leaveId) {
        const leave = this.leaves.find(l => l.id === leaveId);
        if (!leave) return;

        const supportApproval = {
            approver: auth.currentUser.username,
            approverName: auth.currentUser.fullName,
            role: auth.currentUser.roleName,
            timestamp: new Date().toISOString()
        };

        if (!leave.supportApprovals.some(a => a.approver === auth.currentUser.username)) {
            leave.supportApprovals.push(supportApproval);
        }

        this.saveToStorage('leaves', this.leaves);
        this.showCompletionAnimation();
        this.showToast(`✔ Support approval added!`, 'success');
        this.renderDashboard();
    }

    filterSubmissions(filter) {
        let submissions = this.submissions;

        if (!auth.canViewAllSubmissions()) {
            if (auth.currentUser.role === 'ketua_video') {
                submissions = submissions.filter(s => s.type === 'video');
            } else if (auth.currentUser.role === 'ketua_poster') {
                submissions = submissions.filter(s => s.type === 'poster');
            }
        }

        if (filter !== 'all') {
            submissions = submissions.filter(s => s.type === filter || s.status === filter);
        }

        const submissionsList = document.getElementById('submissionsList');
        if (submissions.length === 0) {
            submissionsList.innerHTML = '<p class="empty-state">No submissions found</p>';
            return;
        }

        submissionsList.innerHTML = submissions.map(sub => `
            <div class="submission-card">
                <div class="card-header">
                    <h3 class="card-title">${sub.title}</h3>
                    <div class="status-badge status-${sub.status}">${sub.status}</div>
                </div>
                <div class="card-meta">
                    <span>${sub.type === 'poster' ? '📰' : '🎬'} ${sub.type}</span>
                    <span>${sub.submitterName}</span>
                    <span>${this.formatTime(new Date(sub.timestamp))}</span>
                </div>
                <p>${sub.description}</p>
                <div class="approval-chain">
                    <strong>Approval Chain:</strong>
                    <div style="margin-top: 8px;">
                        ${sub.supportApprovals.map(approval => `<span class="approval-step">✔ ${approval.approverName}</span>`).join('')}
                        ${sub.status === 'approved' ? '<span class="approval-step approval-icon-success">✅ Approved</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    showCompletionAnimation() {
        const svg = document.createElement('div');
        svg.className = 'completion-circle';
        svg.innerHTML = '✅';
        svg.style.position = 'fixed';
        svg.style.top = '50%';
        svg.style.left = '50%';
        svg.style.transform = 'translate(-50%, -50%)';
        svg.style.zIndex = '9999';
        document.body.appendChild(svg);

        setTimeout(() => svg.remove(), 1000);
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    getDaysDifference(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diff = end - start;
        return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }
}

// Initialize dashboard
const dashboard = new Dashboard();

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
