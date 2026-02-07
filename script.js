// script.js - Complete updated version
document.addEventListener('DOMContentLoaded', function() {
    // Supabase configuration
    const SUPABASE_URL = 'https://uuykpbtkthrwqneedfvp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1eWtwYnRrdGhyd3FuZWVkZnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzk4NjQsImV4cCI6MjA4NDYxNTg2NH0.p_DByi60qrG-naoAVKg3Ym8z7Hz8u2uORzZPNrcA968';
    
    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        },
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    });
    
    // Table names
    const TABLES = {
        PROFILES: 'profiles',
        DOCTOR_SCHEDULE: 'doctor_schedule',
        APPOINTMENTS: 'appointments',
        REVIEWS: 'reviews'
    };
    
    // Global state
    let currentUser = null;
    let isDoctor = false;
    let doctorSchedule = [];
    let allDoctors = [];
    
    // DOM Elements
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const themeToggle = document.getElementById('themeToggle');
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    const patientInfoBanner = document.getElementById('patientInfoBanner');
    const doctorDashboardLink = document.getElementById('doctorDashboardLink');
    const authModal = document.getElementById('authModal');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerRole = document.getElementById('registerRole');
    const doctorRegistrationFields = document.getElementById('doctorRegistrationFields');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    const authNavItem = document.getElementById('authNavItem');
    const bookNowBtn = document.getElementById('bookNowBtn');
    const loginHomeBtn = document.getElementById('loginHomeBtn');
    const homeAuthButtons = document.getElementById('homeAuthButtons');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeConfirmationModal = document.getElementById('closeConfirmationModal');
    const goToDashboardBtn = document.getElementById('goToDashboardBtn');
    const bookAnotherBtn = document.getElementById('bookAnotherBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeEditProfileModal = document.getElementById('closeEditProfileModal');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileForm = document.getElementById('editProfileForm');
    const doctorSelect = document.getElementById('doctorSelect');
    const appointmentDate = document.getElementById('appointmentDate');
    const timeSlots = document.getElementById('timeSlots');
    const bookingForm = document.getElementById('bookingForm');
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');
    const doctorsList = document.getElementById('doctorsList');
    const doctorSearch = document.getElementById('doctorSearch');
    const specialtyFilter = document.getElementById('specialtyFilter');
    const availabilityFilter = document.getElementById('availabilityFilter');
    
    // Doctor Dashboard Elements
    const doctorFullName = document.getElementById('doctorFullName');
    const doctorSpecializationSimple = document.getElementById('doctorSpecializationSimple');
    const workStartTime = document.getElementById('workStartTime');
    const workEndTime = document.getElementById('workEndTime');
    const mondayCheck = document.getElementById('mondayCheck');
    const tuesdayCheck = document.getElementById('tuesdayCheck');
    const wednesdayCheck = document.getElementById('wednesdayCheck');
    const thursdayCheck = document.getElementById('thursdayCheck');
    const fridayCheck = document.getElementById('fridayCheck');
    const saturdayCheck = document.getElementById('saturdayCheck');
    const sundayCheck = document.getElementById('sundayCheck');
    const simpleDoctorForm = document.getElementById('simpleDoctorForm');
    
    // Dashboard elements
    const dashboardAuthAlert = document.getElementById('dashboardAuthAlert');
    const doctorAuthAlert = document.getElementById('doctorAuthAlert');
    const bookingAuthAlert = document.getElementById('bookingAuthAlert');
    const doctorRegisterLink = document.getElementById('doctorRegisterLink');
    const doctorLoginLink = document.getElementById('doctorLoginLink');
    
    // Doctor Data Table Elements
    const adminDoctorSearch = document.getElementById('adminDoctorSearch');
    const adminSpecialtyFilter = document.getElementById('adminSpecialtyFilter');
    const doctorsDataTable = document.getElementById('doctorsDataTable');
    
    // ==================== INITIALIZATION ====================
    
    // Initialize the application
    async function initializeApp() {
        console.log('🚀 Initializing application...');
        
        // Check if we have a session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            console.log('Active session found, refreshing...');
            // Refresh the session to ensure it's valid
            const { error } = await supabase.auth.refreshSession();
            if (error) {
                console.log('Session refresh failed:', error);
                await supabase.auth.signOut();
            }
        }
        
        initEventListeners();
        await checkAuthState();
        await loadDoctors();
        setMinDateForAppointment();
        
        // If doctor, load schedule and populate form
        if (isDoctor && currentUser) {
            await loadDoctorSchedule(currentUser.id);
            populateSimpleDoctorForm();
        }
    }
    
    // ==================== CORE FUNCTIONS ====================
    
    // Set minimum date for appointment booking (today)
    function setMinDateForAppointment() {
        const today = new Date().toISOString().split('T')[0];
        if (appointmentDate) {
            appointmentDate.min = today;
            appointmentDate.value = today;
        }
    }
    
    // Initialize all event listeners
    function initEventListeners() {
        // Add this to initEventListeners function
const tabBtns = document.querySelectorAll('.tab-btn');
if (tabBtns) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchAppointmentTab(tabId);
        });
    });
}

// Add this function to switch appointment tabs
function switchAppointmentTab(tabId) {
    // Update active tab button
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        }
    });
    
    // Show active tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
        if (content.id === tabId + 'Tab') {
            content.style.display = 'block';
        }
    });
}
        // Mobile menu toggle
        if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        // Theme toggle
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
        
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                showPage(page);
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('active');
                }
            });
        });
        
        // Authentication modal
        if (closeAuthModal) closeAuthModal.addEventListener('click', () => hideModal(authModal));
        if (authModal) {
            authModal.addEventListener('click', (e) => {
                if (e.target === authModal) hideModal(authModal);
            });
        }
        
        // Auth tabs
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                switchAuthTab(tabName);
            });
        });
        
        // Registration role change
        if (registerRole) {
            registerRole.addEventListener('change', function() {
                const isDoctor = this.value === 'doctor';
                if (doctorRegistrationFields) {
                    doctorRegistrationFields.style.display = isDoctor ? 'block' : 'none';
                }
            });
        }
        
        // Login form submission
        if (loginForm) loginForm.addEventListener('submit', handleLogin);
        
        // Registration form submission
        if (registerForm) registerForm.addEventListener('submit', handleRegistration);
        
        // Auth buttons
        if (bookNowBtn) bookNowBtn.addEventListener('click', () => showPage('booking'));
        if (loginHomeBtn) loginHomeBtn.addEventListener('click', showAuthModal);
        
        // Confirmation modal
        if (closeConfirmationModal) closeConfirmationModal.addEventListener('click', () => hideModal(confirmationModal));
        if (confirmationModal) {
            confirmationModal.addEventListener('click', (e) => {
                if (e.target === confirmationModal) hideModal(confirmationModal);
            });
        }
        if (goToDashboardBtn) goToDashboardBtn.addEventListener('click', () => {
            hideModal(confirmationModal);
            showPage('dashboard');
        });
        if (bookAnotherBtn) bookAnotherBtn.addEventListener('click', () => {
            hideModal(confirmationModal);
            showPage('booking');
        });
        
        // Edit profile
        if (editProfileBtn) editProfileBtn.addEventListener('click', showEditProfileModal);
        if (closeEditProfileModal) closeEditProfileModal.addEventListener('click', () => hideModal(editProfileModal));
        if (editProfileModal) {
            editProfileModal.addEventListener('click', (e) => {
                if (e.target === editProfileModal) hideModal(editProfileModal);
            });
        }
        if (editProfileForm) editProfileForm.addEventListener('submit', handleEditProfile);
        
        // Booking form
        if (doctorSelect) doctorSelect.addEventListener('change', loadAvailableTimeSlots);
        if (appointmentDate) appointmentDate.addEventListener('change', loadAvailableTimeSlots);
        if (bookingForm) bookingForm.addEventListener('submit', handleBooking);
        
        // Doctor filters and search
        if (doctorSearch) doctorSearch.addEventListener('input', filterDoctors);
        if (specialtyFilter) specialtyFilter.addEventListener('change', filterDoctors);
        if (availabilityFilter) availabilityFilter.addEventListener('change', filterDoctors);
        
        // Simplified Doctor Dashboard Form
        if (simpleDoctorForm) simpleDoctorForm.addEventListener('submit', handleSimpleDoctorForm);
        
        // Doctor Data Table filters
        if (adminDoctorSearch) {
            adminDoctorSearch.addEventListener('input', filterDoctorsDataTable);
        }
        
        if (adminSpecialtyFilter) {
            adminSpecialtyFilter.addEventListener('change', filterDoctorsDataTable);
        }
        
        // Footer doctor links
        if (doctorRegisterLink) {
            doctorRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                showAuthModal();
                if (registerRole) {
                    registerRole.value = 'doctor';
                    registerRole.dispatchEvent(new Event('change'));
                }
                switchAuthTab('register');
            });
        }
        
        if (doctorLoginLink) {
            doctorLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                showAuthModal();
                const userRole = document.getElementById('userRole');
                if (userRole) userRole.value = 'doctor';
                switchAuthTab('login');
            });
        }
    }
    
    // ==================== AUTHENTICATION ====================
    
    // Check authentication state
    async function checkAuthState() {
        try {
            console.log('🔍 Checking authentication state...');
            
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.error('Session error:', sessionError);
                return;
            }
            
            if (session && session.user) {
                console.log('✅ User authenticated:', session.user.id);
                
                try {
                    // Try to get user profile without .single() first
                    const { data: userData, error: profileError } = await supabase
                        .from(TABLES.PROFILES)
                        .select('*')
                        .eq('id', session.user.id)
                        .limit(1);
                    
                    if (profileError) {
                        console.warn('Profile fetch error:', profileError.message);
                        
                        // Check if profile exists
                        if (profileError.message.includes('does not exist')) {
                            console.log('Creating new profile for user...');
                            await createUserProfile(session.user);
                            
                            // Try to fetch the newly created profile
                            const { data: newUserData } = await supabase
                                .from(TABLES.PROFILES)
                                .select('*')
                                .eq('id', session.user.id)
                                .limit(1);
                            
                            if (newUserData && newUserData.length > 0) {
                                currentUser = {
                                    ...session.user,
                                    ...newUserData[0]
                                };
                                isDoctor = newUserData[0].role === 'doctor';
                            }
                        }
                    } else if (userData && userData.length > 0) {
                        currentUser = {
                            ...session.user,
                            ...userData[0]
                        };
                        isDoctor = userData[0].role === 'doctor';
                        console.log('✅ User loaded:', currentUser.email, 'Role:', userData[0].role);
                    } else {
                        // No profile found, create one
                        console.log('Creating new profile for user...');
                        await createUserProfile(session.user);
                    }
                } catch (fetchError) {
                    console.error('Error fetching profile:', fetchError);
                }
                
                updateUIForAuthState();
                
                if (currentUser && !isDoctor) {
                    loadPatientProfile();
                }
                
                if (isDoctor) {
                    await loadDoctorSchedule(currentUser.id);
                    populateSimpleDoctorForm();
                }
            } else {
                console.log('❌ No active session found');
            }
            
            updateAuthNavigation();
            
        } catch (error) {
            console.error('Error in checkAuthState:', error);
        }
    }
    
    // Create user profile if it doesn't exist
    async function createUserProfile(user) {
        const profileData = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: user.user_metadata?.role || 'patient',
            phone: '',
            address: '',
            date_of_birth: null,
            gender: '',
            medical_history: '',
            is_available: false,
            rating: 0.0,
            specialization: null,
            license_number: null,
            experience_years: 0
        };
        
        console.log('Creating profile with data:', profileData);
        
        // Use upsert instead of insert to avoid duplicates
        const { data, error } = await supabase
            .from(TABLES.PROFILES)
            .upsert([profileData], {
                onConflict: 'id',
                ignoreDuplicates: false
            })
            .select();
        
        if (error) {
            console.error('Error creating/updating profile:', error);
            
            // If it's a duplicate error, try to fetch the existing profile
            if (error.code === '23505') {
                console.log('Profile already exists, fetching...');
                const { data: existingProfile } = await supabase
                    .from(TABLES.PROFILES)
                    .select('*')
                    .eq('id', user.id)
                    .limit(1);
                
                if (existingProfile && existingProfile.length > 0) {
                    return existingProfile[0];
                }
            }
            throw error;
        }
        
        console.log('✅ Profile created/updated successfully');
        return data && data.length > 0 ? data[0] : null;
    }
    
    // Handle login
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const role = document.getElementById('userRole').value;
        
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        const spinner = loginSubmitBtn.querySelector('.loading-spinner');
        const btnText = loginSubmitBtn.querySelector('.btn-text');
        btnText.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-block';
        loginSubmitBtn.disabled = true;
        
        try {
            console.log('Attempting login for:', email);
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('Login error:', error);
                throw error;
            }
            
            console.log('✅ Login successful, user ID:', data.user.id);
            
            // Get user profile
            const { data: profileData, error: profileError } = await supabase
                .from(TABLES.PROFILES)
                .select('*')
                .eq('id', data.user.id)
                .limit(1);
            
            let profile = null;
            
            if (profileError) {
                console.warn('Profile fetch error:', profileError.message);
                
                // Create profile if it doesn't exist
                profile = await createUserProfile(data.user);
            } else if (profileData && profileData.length > 0) {
                profile = profileData[0];
            } else {
                // No profile found, create one
                profile = await createUserProfile(data.user);
            }
            
            if (!profile) {
                throw new Error('Failed to load or create user profile');
            }
            
            // Check role if specified
            if (role && profile.role !== role) {
                await supabase.auth.signOut();
                throw new Error(`Please login as a ${role === 'doctor' ? 'patient' : 'doctor'} from the correct login page`);
            }
            
            currentUser = {
                ...data.user,
                ...profile
            };
            isDoctor = profile.role === 'doctor';
            
            showNotification('Login successful!', 'success');
            hideModal(authModal);
            updateUIForAuthState();
            updateAuthNavigation();
            
            if (isDoctor) {
                await loadDoctorSchedule(currentUser.id);
                populateSimpleDoctorForm();
                showPage('doctor-dashboard');
            } else {
                loadPatientProfile();
                showPage('dashboard');
            }
            
            loginForm.reset();
            
        } catch (error) {
            console.error('Login failed:', error);
            showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            if (btnText) btnText.style.display = 'inline-block';
            if (spinner) spinner.style.display = 'none';
            if (loginSubmitBtn) loginSubmitBtn.disabled = false;
        }
    }
    
    // Handle registration
    async function handleRegistration(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const role = registerRole.value;
        
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        const spinner = registerSubmitBtn.querySelector('.loading-spinner');
        const btnText = registerSubmitBtn.querySelector('.btn-text');
        btnText.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-block';
        registerSubmitBtn.disabled = true;
        
        try {
            console.log('Registering user:', email);
            
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        role: role
                    }
                }
            });
            
            if (authError) {
                console.error('Auth registration error:', authError);
                throw authError;
            }
            
            console.log('✅ Auth registration successful, creating profile...');
            
            // Profile data
            const profileData = {
                id: authData.user.id,
                email: email,
                full_name: name,
                role: role,
                phone: '',
                address: '',
                date_of_birth: null,
                gender: '',
                medical_history: '',
                is_available: false,
                rating: 0.0,
                specialization: null,
                license_number: null,
                experience_years: 0
            };
            
            // Create profile with upsert
            const { error: profileError } = await supabase
                .from(TABLES.PROFILES)
                .upsert([profileData], {
                    onConflict: 'id',
                    ignoreDuplicates: false
                });
            
            if (profileError) {
                console.error('Profile creation error:', profileError);
                
                // If it's a duplicate error, that's okay - profile already exists
                if (profileError.code !== '23505') {
                    throw profileError;
                }
            }
            
            // For doctors, create default schedule
            if (role === 'doctor') {
                const defaultSchedule = [
                    { doctor_id: authData.user.id, day: 'Monday', start_time: '09:00', end_time: '17:00', is_available: false },
                    { doctor_id: authData.user.id, day: 'Tuesday', start_time: '09:00', end_time: '17:00', is_available: false },
                    { doctor_id: authData.user.id, day: 'Wednesday', start_time: '09:00', end_time: '17:00', is_available: false },
                    { doctor_id: authData.user.id, day: 'Thursday', start_time: '09:00', end_time: '17:00', is_available: false },
                    { doctor_id: authData.user.id, day: 'Friday', start_time: '09:00', end_time: '17:00', is_available: false },
                    { doctor_id: authData.user.id, day: 'Saturday', start_time: '10:00', end_time: '14:00', is_available: false },
                    { doctor_id: authData.user.id, day: 'Sunday', start_time: '00:00', end_time: '00:00', is_available: false }
                ];
                
                // Insert schedule with error handling
                try {
                    await supabase.from(TABLES.DOCTOR_SCHEDULE).insert(defaultSchedule);
                } catch (scheduleError) {
                    console.warn('Error creating schedule:', scheduleError);
                }
            }
            
            showNotification('Registration successful!', 'success');
            hideModal(authModal);
            
            // Auto-login after registration
            try {
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (!loginError && loginData.user) {
                    currentUser = {
                        ...loginData.user,
                        ...profileData
                    };
                    isDoctor = role === 'doctor';
                    
                    updateUIForAuthState();
                    updateAuthNavigation();
                    
                    if (isDoctor) {
                        showNotification('Please complete your doctor profile in the dashboard', 'info');
                        showPage('doctor-dashboard');
                    } else {
                        showPage('dashboard');
                    }
                }
            } catch (loginError) {
                console.log('Auto-login skipped, user can login manually');
            }
            
            registerForm.reset();
            if (doctorRegistrationFields) doctorRegistrationFields.style.display = 'none';
            if (registerRole) registerRole.value = 'patient';
            
        } catch (error) {
            console.error('Registration failed:', error);
            showNotification(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            if (btnText) btnText.style.display = 'inline-block';
            if (spinner) spinner.style.display = 'none';
            if (registerSubmitBtn) registerSubmitBtn.disabled = false;
        }
    }
    
    // Handle logout
    async function handleLogout() {
        try {
            await supabase.auth.signOut();
            currentUser = null;
            isDoctor = false;
            
            showNotification('Logged out successfully', 'success');
            updateUIForAuthState();
            updateAuthNavigation();
            showPage('home');
            
        } catch (error) {
            showNotification('Error logging out', 'error');
        }
    }
    
    // Update UI based on authentication state
    function updateUIForAuthState() {
        if (currentUser) {
            if (!isDoctor) {
                if (patientInfoBanner) patientInfoBanner.style.display = 'flex';
                if (dashboardAuthAlert) dashboardAuthAlert.style.display = 'none';
                if (bookingAuthAlert) bookingAuthAlert.style.display = 'none';
            } else {
                if (doctorDashboardLink) doctorDashboardLink.style.display = 'inline-block';
            }
            
            if (homeAuthButtons) homeAuthButtons.style.display = 'none';
        } else {
            if (dashboardAuthAlert) dashboardAuthAlert.style.display = 'block';
            if (bookingAuthAlert) bookingAuthAlert.style.display = 'block';
            if (doctorAuthAlert) doctorAuthAlert.style.display = 'block';
            
            if (homeAuthButtons) homeAuthButtons.style.display = 'block';
            
            if (patientInfoBanner) patientInfoBanner.style.display = 'none';
        }
    }
    
    // Update authentication navigation
    function updateAuthNavigation() {
        if (!authNavItem) return;
        
        if (currentUser) {
            authNavItem.innerHTML = `
                <div class="user-menu">
                    <button class="user-menu-btn">
                        <i class="fas fa-user-circle"></i>
                        ${currentUser.full_name || currentUser.email}
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown">
                        <a href="#" data-page="dashboard">My Appointments</a>
                        ${isDoctor ? '<a href="#" data-page="doctor-dashboard">Doctor Dashboard</a>' : ''}
                        <a href="#" id="logoutBtn">Logout</a>
                    </div>
                </div>
            `;
            
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
            
            const userMenuBtn = document.querySelector('.user-menu-btn');
            const userDropdown = document.querySelector('.user-dropdown');
            
            if (userMenuBtn && userDropdown) {
                userMenuBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    userDropdown.classList.toggle('active');
                });
                
                document.addEventListener('click', () => {
                    userDropdown.classList.remove('active');
                });
            }
        } else {
            authNavItem.innerHTML = `
                <li><a href="#" class="nav-link auth-link" id="authNavLink">Login / Register</a></li>
            `;
            const authLink = document.getElementById('authNavLink');
            if (authLink) {
                authLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    showAuthModal();
                });
            }
        }
    }
    
    // ==================== DOCTORS MANAGEMENT ====================
    
    // Load all registered doctors from database
    async function loadDoctors() {
        try {
            console.log('👨‍⚕️ Loading doctors...');
            
            // Get doctors from profiles table
            const { data: doctors, error } = await supabase
                .from(TABLES.PROFILES)
                .select('*')
                .eq('role', 'doctor')
                .order('full_name');
            
            if (error) {
                console.error('Error loading doctors:', error);
                allDoctors = [];
                renderDoctorsList(allDoctors);
                populateDoctorSelect(allDoctors);
                renderDoctorsDataTable(allDoctors);
                return;
            }
            
            console.log(`✅ ${doctors?.length || 0} doctors loaded`);
            allDoctors = doctors || [];
            
            // For each doctor, load their schedule to determine real availability
            for (let doctor of allDoctors) {
                // Get doctor's schedule
                const { data: schedule } = await supabase
                    .from(TABLES.DOCTOR_SCHEDULE)
                    .select('*')
                    .eq('doctor_id', doctor.id);
                
                // Check if doctor has any available schedule slots for today
                if (schedule && schedule.length > 0) {
                    // Find today's schedule
                    const today = new Date();
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const todayName = days[today.getDay()];
                    
                    const todaySchedule = schedule.find(s => s.day === todayName);
                    
                    // Doctor is considered available if:
                    // 1. They have is_available = true in their profile
                    // 2. They have a schedule for today that is marked as available
                    // 3. Their schedule for today has valid working hours (not '00:00' to '00:00')
                    doctor.hasAvailableSchedule = todaySchedule ? 
                        (todaySchedule.is_available && todaySchedule.start_time !== '00:00' && todaySchedule.end_time !== '00:00') : 
                        false;
                    
                    doctor.schedule = schedule || [];
                    
                    // Calculate working days and hours from schedule
                    const availableDays = schedule.filter(s => s.is_available && s.start_time !== '00:00');
                    if (availableDays.length > 0) {
                        // Get working days
                        doctor.workingDays = availableDays.map(s => s.day.substring(0, 3)).join(', ');
                        
                        // Get working hours (assuming same hours for all days)
                        const firstDay = availableDays[0];
                        doctor.workingHours = `${formatTimeForDisplay(firstDay.start_time)} - ${formatTimeForDisplay(firstDay.end_time)}`;
                    } else {
                        doctor.workingDays = 'Not set';
                        doctor.workingHours = 'Not set';
                    }
                } else {
                    doctor.hasAvailableSchedule = false;
                    doctor.schedule = [];
                    doctor.workingDays = 'Not set';
                    doctor.workingHours = 'Not set';
                }
            }
            
            renderDoctorsList(allDoctors);
            populateDoctorSelect(allDoctors);
            renderDoctorsDataTable(allDoctors);
            
        } catch (error) {
            console.error('Failed to load doctors:', error);
            showNotification('Failed to load doctors. Please refresh the page.', 'error');
        }
    }
    
    // Render doctors list
    function renderDoctorsList(doctors) {
        if (!doctorsList) return;
        
        if (doctors.length === 0) {
            doctorsList.innerHTML = `
                <div class="no-doctors">
                    <i class="fas fa-user-md"></i>
                    <h3>No Doctors Available</h3>
                    <p>There are currently no doctors available. Please check back later.</p>
                </div>
            `;
            return;
        }
        
        const doctorsGrid = document.createElement('div');
        doctorsGrid.className = 'doctors-grid';
        
        doctors.forEach(doctor => {
            const doctorCard = createDoctorCard(doctor);
            doctorsGrid.appendChild(doctorCard);
        });
        
        doctorsList.innerHTML = '';
        doctorsList.appendChild(doctorsGrid);
    }
    
    // Add this function to render doctors in the data table
    function renderDoctorsDataTable(doctors) {
        const doctorsDataTable = document.getElementById('doctorsDataTable');
        if (!doctorsDataTable) return;
        
        const tbody = doctorsDataTable.querySelector('tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (doctors.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        <i class="fas fa-user-md" style="font-size: 2rem; color: var(--light-text); margin-bottom: 10px; display: block;"></i>
                        <p>No doctors found.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        doctors.forEach(doctor => {
            const row = document.createElement('tr');
            
            // Determine availability status
            let availabilityStatus = 'Offline';
            let statusClass = 'schedule-offline';
            
            if (doctor.is_available && doctor.hasAvailableSchedule) {
                availabilityStatus = 'Available Today';
                statusClass = 'schedule-available';
            } else if (doctor.is_available) {
                availabilityStatus = 'Available (Not Today)';
                statusClass = 'schedule-unavailable';
            }
            
            // Format working hours for display
            const workingHours = doctor.workingHours || 'Not set';
            const workingDays = doctor.workingDays || 'Not set';
            
            row.innerHTML = `
                <td>
                    <strong>${doctor.full_name || 'Unnamed Doctor'}</strong>
                    <div style="font-size: 0.85rem; color: var(--light-text); margin-top: 3px;">
                        ${doctor.email || ''}
                    </div>
                </td>
                <td>${doctor.specialization || 'General Medicine'}</td>
                <td>
                    <span class="${statusClass}" style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                        ${availabilityStatus}
                    </span>
                </td>
                <td>
                    <div><strong>Hours:</strong> ${workingHours}</div>
                    <div><strong>Days:</strong> ${workingDays}</div>
                </td>
                <td>
                    <div style="font-size: 0.85rem; color: var(--light-text);">
                        ${doctor.experience_years ? `${doctor.experience_years} yrs exp` : 'No experience info'}
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    // Create doctor card element
    // Create doctor card element
function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    card.dataset.id = doctor.id;
    card.dataset.specialty = doctor.specialization || 'general';
    
    // Determine status based on availability and schedule
    let status = 'offline';
    let statusText = 'Offline';
    let nextAvailable = 'Not currently available';
    
    // Get working hours for display
    const workingHours = doctor.workingHours || 'Hours not set';
    const workingDays = doctor.workingDays || 'Schedule not set';
    
    if (doctor.is_available && doctor.hasAvailableSchedule) {
        status = 'available';
        statusText = 'Available Today';
        nextAvailable = 'Available for appointments';
    } else if (doctor.is_available && doctor.schedule && doctor.schedule.length > 0) {
        status = 'unavailable';
        statusText = 'Not Available Today';
        
        // Find next available day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = new Date();
        const todayIndex = today.getDay();
        
        let nextAvailableDay = null;
        for (let i = 1; i <= 7; i++) {
            const dayIndex = (todayIndex + i) % 7;
            const dayName = days[dayIndex];
            const daySchedule = doctor.schedule.find(s => s.day === dayName && s.is_available && s.start_time !== '00:00');
            
            if (daySchedule) {
                nextAvailableDay = dayName;
                break;
            }
        }
        
        nextAvailable = nextAvailableDay ? 
            `Next available: ${nextAvailableDay.substring(0, 3)}` : 
            'Check schedule for availability';
    } else {
        status = 'offline';
        statusText = 'Offline';
        nextAvailable = 'Schedule not set';
    }
    
    card.innerHTML = `
        <div class="doctor-image">
            <i class="fas fa-user-md"></i>
            ${status === 'available' ? '<span class="online-indicator"></span>' : ''}
        </div>
        <div class="doctor-info">
            <h3 class="doctor-name">${doctor.full_name || 'Unnamed Doctor'}</h3>
            <p class="doctor-specialty">${doctor.specialization || 'General Medicine'}</p>
            ${doctor.experience_years ? `<p class="doctor-experience">${doctor.experience_years} years experience</p>` : ''}
            
            <!-- ADDED: Working Hours Display -->
            <div class="doctor-hours">
                <p><i class="fas fa-clock"></i> <strong>Working Hours:</strong> ${workingHours}</p>
                <p><i class="fas fa-calendar-alt"></i> <strong>Working Days:</strong> ${workingDays}</p>
            </div>
            
            <div class="doctor-schedule-info">
                <div class="schedule-status schedule-${status}">
                    <i class="fas fa-circle"></i>
                    ${statusText}
                </div>
                <p class="next-available">${nextAvailable}</p>
            </div>
            
            <div class="doctor-actions">
                <button class="btn btn-outline btn-small book-doctor-btn" data-id="${doctor.id}">
                    Book Appointment
                </button>
            </div>
        </div>
    `;
    
    const bookBtn = card.querySelector('.book-doctor-btn');
    if (bookBtn) {
        bookBtn.addEventListener('click', () => {
            if (!currentUser) {
                showAuthModal();
                return;
            }
            
            showPage('booking');
            if (doctorSelect) {
                doctorSelect.value = doctor.id;
                loadAvailableTimeSlots();
            }
        });
    }
    
    return card;
}
    
    // Filter doctors based on search and filters
    function filterDoctors() {
        const searchTerm = doctorSearch.value.toLowerCase();
        const specialty = specialtyFilter.value;
        const availability = availabilityFilter.value;
        
        const filteredDoctors = allDoctors.filter(doctor => {
            const matchesSearch = doctor.full_name.toLowerCase().includes(searchTerm) ||
                                (doctor.specialization || '').toLowerCase().includes(searchTerm);
            
            const matchesSpecialty = specialty === 'all' || 
                                   (doctor.specialization || 'general') === specialty;
            
            let matchesAvailability = true;
            if (availability === 'available') {
                matchesAvailability = doctor.is_available === true && doctor.hasAvailableSchedule === true;
            } else if (availability === 'online') {
                matchesAvailability = doctor.is_available === true;
            }
            
            return matchesSearch && matchesSpecialty && matchesAvailability;
        });
        
        renderDoctorsList(filteredDoctors);
    }
    
    // Filter doctors data table
    function filterDoctorsDataTable() {
        const searchTerm = adminDoctorSearch?.value.toLowerCase() || '';
        const specialty = adminSpecialtyFilter?.value || 'all';
        
        const filteredDoctors = allDoctors.filter(doctor => {
            const matchesSearch = doctor.full_name.toLowerCase().includes(searchTerm) ||
                                (doctor.specialization || '').toLowerCase().includes(searchTerm) ||
                                (doctor.email || '').toLowerCase().includes(searchTerm);
            
            const matchesSpecialty = specialty === 'all' || 
                                   (doctor.specialization || 'general') === specialty;
            
            return matchesSearch && matchesSpecialty;
        });
        
        renderDoctorsDataTable(filteredDoctors);
    }
    
    // Populate doctor select dropdown
    function populateDoctorSelect(doctors) {
        if (!doctorSelect) return;
        
        doctorSelect.innerHTML = '<option value="">Choose a doctor</option>';
        
        doctors.forEach(doctor => {
            if (doctor.is_available) {
                const option = document.createElement('option');
                option.value = doctor.id;
                option.textContent = `${doctor.full_name || 'Unnamed Doctor'} - ${doctor.specialization || 'General Medicine'}`;
                doctorSelect.appendChild(option);
            }
        });
        
        // If no available doctors, show a message
        if (doctorSelect.options.length === 1) {
            doctorSelect.innerHTML = '<option value="">No doctors available at the moment</option>';
        }
    }
    
    // ==================== DOCTOR DASHBOARD ====================
    
    // Load doctor schedule
    async function loadDoctorSchedule(doctorId) {
        try {
            console.log('📅 Loading schedule for doctor:', doctorId);
            
            const { data: schedule, error } = await supabase
                .from(TABLES.DOCTOR_SCHEDULE)
                .select('*')
                .eq('doctor_id', doctorId)
                .order('id');
            
            if (error) {
                console.error('Error loading doctor schedule:', error);
                doctorSchedule = [];
                return;
            }
            
            console.log(`✅ ${schedule?.length || 0} schedule entries loaded`);
            doctorSchedule = schedule || [];
            
        } catch (error) {
            console.error('Error loading doctor schedule:', error);
            doctorSchedule = [];
        }
    }
    
    // Handle simplified doctor form submission
    async function handleSimpleDoctorForm(e) {
        e.preventDefault();
        
        const doctorFullName = document.getElementById('doctorFullName').value;
        const doctorSpecialization = document.getElementById('doctorSpecializationSimple').value;
        const workStartTime = document.getElementById('workStartTime').value;
        const workEndTime = document.getElementById('workEndTime').value;
        
        // Get checked days
        const workDays = [];
        if (document.getElementById('mondayCheck').checked) workDays.push('monday');
        if (document.getElementById('tuesdayCheck').checked) workDays.push('tuesday');
        if (document.getElementById('wednesdayCheck').checked) workDays.push('wednesday');
        if (document.getElementById('thursdayCheck').checked) workDays.push('thursday');
        if (document.getElementById('fridayCheck').checked) workDays.push('friday');
        if (document.getElementById('saturdayCheck').checked) workDays.push('saturday');
        if (document.getElementById('sundayCheck').checked) workDays.push('sunday');
        
        if (!doctorFullName || !doctorSpecialization || !workStartTime || !workEndTime || workDays.length === 0) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        try {
            // Calculate if doctor has any available days
            const hasAvailableDays = workDays.length > 0;
            
            // First, update profile with doctor information
            const updateData = {
                full_name: doctorFullName,
                specialization: doctorSpecialization,
                is_available: hasAvailableDays
            };
            
            console.log('Updating profile with:', updateData);
            
            const { error: profileError } = await supabase
                .from(TABLES.PROFILES)
                .update(updateData)
                .eq('id', currentUser.id);
            
            if (profileError) {
                console.error('Profile update error:', profileError);
                throw profileError;
            }
            
            // Update current user object
            currentUser.full_name = doctorFullName;
            currentUser.specialization = doctorSpecialization;
            currentUser.is_available = hasAvailableDays;
            
            // Prepare schedule updates
            const scheduleUpdates = [];
            const daysMapping = {
                'monday': 'Monday',
                'tuesday': 'Tuesday',
                'wednesday': 'Wednesday',
                'thursday': 'Thursday',
                'friday': 'Friday',
                'saturday': 'Saturday',
                'sunday': 'Sunday'
            };
            
            for (const [dayKey, dayName] of Object.entries(daysMapping)) {
                const isAvailable = workDays.includes(dayKey);
                const scheduleData = {
                    doctor_id: currentUser.id,
                    day: dayName,
                    start_time: isAvailable ? workStartTime : '00:00',
                    end_time: isAvailable ? workEndTime : '00:00',
                    is_available: isAvailable
                };
                
                scheduleUpdates.push(scheduleData);
            }
            
            // First, delete existing schedule for this doctor
            console.log('Deleting old schedule...');
            const { error: deleteError } = await supabase
                .from(TABLES.DOCTOR_SCHEDULE)
                .delete()
                .eq('doctor_id', currentUser.id);
            
            if (deleteError) {
                console.warn('Error deleting old schedule:', deleteError);
                // Continue anyway - try to insert new schedule
            }
            
            // Then insert new schedule
            console.log('Inserting new schedule with', scheduleUpdates.length, 'entries');
            const { error: scheduleError } = await supabase
                .from(TABLES.DOCTOR_SCHEDULE)
                .insert(scheduleUpdates);
            
            if (scheduleError) {
                console.error('Schedule insert error:', scheduleError);
                throw scheduleError;
            }
            
            // Update local doctor schedule
            await loadDoctorSchedule(currentUser.id);
            
            // Update UI
            updateAuthNavigation();
            updateUIForAuthState();
            
            showNotification('Doctor profile and schedule updated successfully!', 'success');
            
            // Refresh doctors list
            await loadDoctors();
            
        } catch (error) {
            console.error('❌ Error saving doctor profile:', error);
            showNotification('Failed to save doctor profile: ' + error.message, 'error');
        }
    }
    
    // Populate the simplified doctor form
    function populateSimpleDoctorForm() {
        if (!currentUser || !isDoctor || !simpleDoctorForm) return;
        
        // Populate basic info
        if (doctorFullName) doctorFullName.value = currentUser.full_name || '';
        if (doctorSpecializationSimple) doctorSpecializationSimple.value = currentUser.specialization || '';
        
        // Find the first available day to get working hours
        const firstAvailableDay = doctorSchedule.find(s => s.is_available && s.start_time !== '00:00');
        
        if (firstAvailableDay) {
            if (workStartTime) workStartTime.value = firstAvailableDay.start_time;
            if (workEndTime) workEndTime.value = firstAvailableDay.end_time;
        } else {
            // Default values
            if (workStartTime) workStartTime.value = '09:00';
            if (workEndTime) workEndTime.value = '17:00';
        }
        
        // Check/uncheck day checkboxes based on schedule
        const daysMapping = {
            'Monday': mondayCheck,
            'Tuesday': tuesdayCheck,
            'Wednesday': wednesdayCheck,
            'Thursday': thursdayCheck,
            'Friday': fridayCheck,
            'Saturday': saturdayCheck,
            'Sunday': sundayCheck
        };
        
        for (const [dayName, checkbox] of Object.entries(daysMapping)) {
            if (checkbox) {
                const daySchedule = doctorSchedule.find(s => s.day === dayName);
                checkbox.checked = daySchedule ? daySchedule.is_available : false;
            }
        }
    }
    
    // ==================== PATIENT FUNCTIONS ====================
    
    // Load patient profile
    async function loadPatientProfile() {
        if (!currentUser || isDoctor) return;
        
        try {
            const { data: profile, error } = await supabase
                .from(TABLES.PROFILES)
                .select('*')
                .eq('id', currentUser.id)
                .limit(1);
            
            if (error) throw error;
            
            if (profile && profile.length > 0) {
                const patientNameDisplay = document.getElementById('patientNameDisplay');
                const patientContactDisplay = document.getElementById('patientContactDisplay');
                
                if (patientNameDisplay) {
                    patientNameDisplay.textContent = profile[0].full_name || 'Patient';
                }
                
                if (patientContactDisplay) {
                    patientContactDisplay.textContent = 
                        `Email: ${profile[0].email} | Phone: ${profile[0].phone || 'Not provided'}`;
                }
                
                const patientNameInput = document.getElementById('patientName');
                const patientEmailInput = document.getElementById('patientEmail');
                const patientPhoneInput = document.getElementById('patientPhone');
                
                if (patientNameInput && !patientNameInput.value) {
                    patientNameInput.value = profile[0].full_name || '';
                }
                
                if (patientEmailInput && !patientEmailInput.value) {
                    patientEmailInput.value = profile[0].email || '';
                }
                
                if (patientPhoneInput && !patientPhoneInput.value) {
                    patientPhoneInput.value = profile[0].phone || '';
                }
            }
            
        } catch (error) {
            console.error('Error loading patient profile:', error);
        }
    }
    
    // Show edit profile modal
    function showEditProfileModal() {
        if (!currentUser) return;
        
        const editPatientName = document.getElementById('editPatientName');
        const editPatientEmail = document.getElementById('editPatientEmail');
        const editPatientPhone = document.getElementById('editPatientPhone');
        const editPatientAddress = document.getElementById('editPatientAddress');
        const editPatientDob = document.getElementById('editPatientDob');
        const editPatientGender = document.getElementById('editPatientGender');
        const editPatientMedicalHistory = document.getElementById('editPatientMedicalHistory');
        
        if (editPatientName) editPatientName.value = currentUser.full_name || '';
        if (editPatientEmail) editPatientEmail.value = currentUser.email || '';
        if (editPatientPhone) editPatientPhone.value = currentUser.phone || '';
        if (editPatientAddress) editPatientAddress.value = currentUser.address || '';
        if (editPatientDob) editPatientDob.value = currentUser.date_of_birth || '';
        if (editPatientGender) editPatientGender.value = currentUser.gender || '';
        if (editPatientMedicalHistory) editPatientMedicalHistory.value = currentUser.medical_history || '';
        
        showModal(editProfileModal);
    }
    
    // Handle edit profile
    async function handleEditProfile(e) {
        e.preventDefault();
        
        if (!currentUser) return;
        
        try {
            const updatedData = {
                full_name: document.getElementById('editPatientName').value,
                email: document.getElementById('editPatientEmail').value,
                phone: document.getElementById('editPatientPhone').value,
                address: document.getElementById('editPatientAddress').value,
                date_of_birth: document.getElementById('editPatientDob').value || null,
                gender: document.getElementById('editPatientGender').value,
                medical_history: document.getElementById('editPatientMedicalHistory').value
            };
            
            const { error } = await supabase
                .from(TABLES.PROFILES)
                .update(updatedData)
                .eq('id', currentUser.id);
            
            if (error) throw error;
            
            currentUser = { ...currentUser, ...updatedData };
            
            loadPatientProfile();
            
            showNotification('Profile updated successfully', 'success');
            hideModal(editProfileModal);
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile', 'error');
        }
    }
    
    // ==================== BOOKING FUNCTIONS ====================
    
    // Load available time slots for selected doctor
    async function loadAvailableTimeSlots() {
        const doctorId = doctorSelect.value;
        const selectedDate = appointmentDate.value;
        
        if (!doctorId || !selectedDate) {
            if (timeSlots) timeSlots.innerHTML = '<p class="no-slots">Please select a doctor and date</p>';
            return;
        }
        
        const dateObj = new Date(selectedDate);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[dateObj.getDay()];
        
        if (timeSlots) timeSlots.innerHTML = '<div class="loading-slots"><i class="fas fa-spinner fa-spin"></i> Loading available time slots...</div>';
        
        try {
            const { data: schedule, error: scheduleError } = await supabase
                .from(TABLES.DOCTOR_SCHEDULE)
                .select('*')
                .eq('doctor_id', doctorId)
                .eq('day', dayOfWeek)
                .single();
            
            if (scheduleError) {
                if (timeSlots) timeSlots.innerHTML = '<p class="no-slots">No schedule found for this day</p>';
                return;
            }
            
            if (!schedule.is_available) {
                if (timeSlots) timeSlots.innerHTML = '<p class="no-slots">Doctor is not available on this day</p>';
                return;
            }
            
            const slots = generateTimeSlots(schedule.start_time, schedule.end_time, 30);
            
            const { data: existingAppointments, error: appointmentsError } = await supabase
                .from(TABLES.APPOINTMENTS)
                .select('appointment_time')
                .eq('doctor_id', doctorId)
                .eq('appointment_date', selectedDate)
                .eq('status', 'confirmed');
            
            const bookedSlots = existingAppointments?.map(app => app.appointment_time) || [];
            
            if (slots.length === 0) {
                if (timeSlots) timeSlots.innerHTML = '<p class="no-slots">No time slots available</p>';
                return;
            }
            
            let slotsHTML = '<div class="time-slots-grid">';
            slots.forEach(slot => {
                const isBooked = bookedSlots.includes(slot);
                slotsHTML += `
                    <label class="time-slot ${isBooked ? 'booked' : ''}">
                        <input type="radio" name="timeSlot" value="${slot}" ${isBooked ? 'disabled' : ''} data-time="${slot}">
                        <span class="slot-time">${formatTime(slot)}</span>
                        ${isBooked ? '<span class="slot-status">Booked</span>' : ''}
                    </label>
                `;
            });
            slotsHTML += '</div>';
            
            if (timeSlots) timeSlots.innerHTML = slotsHTML;
            
        } catch (error) {
            console.error('Error loading time slots:', error);
            if (timeSlots) timeSlots.innerHTML = '<p class="error-slots">Error loading time slots</p>';
        }
    }
    
    // Handle appointment booking
    async function handleBooking(e) {
        e.preventDefault();
        
        if (!currentUser) {
            showAuthModal();
            return;
        }
        
        const doctorId = doctorSelect.value;
        const selectedDate = appointmentDate.value;
        const selectedTimeSlot = document.querySelector('input[name="timeSlot"]:checked');
        
        if (!doctorId || !selectedDate || !selectedTimeSlot) {
            showNotification('Please fill in all required fields and select a time slot', 'error');
            return;
        }
        
        const appointmentId = 'APT' + Date.now() + Math.random().toString(36).substr(2, 9);
        
        const spinner = bookAppointmentBtn.querySelector('.loading-spinner');
        const btnText = bookAppointmentBtn.querySelector('.btn-text');
        btnText.style.display = 'none';
        if (spinner) spinner.style.display = 'inline-block';
        bookAppointmentBtn.disabled = true;
        
        try {
            const appointmentData = {
                appointment_id: appointmentId,
                patient_id: currentUser.id,
                doctor_id: doctorId,
                patient_name: document.getElementById('patientName').value,
                patient_email: document.getElementById('patientEmail').value,
                patient_phone: document.getElementById('patientPhone').value,
                appointment_date: selectedDate,
                appointment_time: selectedTimeSlot.dataset.time,
                reason: document.getElementById('appointmentReason').value || '',
                status: 'confirmed',
                created_at: new Date().toISOString()
            };
            
            const { data, error } = await supabase
                .from(TABLES.APPOINTMENTS)
                .insert([appointmentData])
                .select()
                .single();
            
            if (error) throw error;
            
            // Update confirmation modal
            const doctorOption = doctorSelect.options[doctorSelect.selectedIndex];
            const appointmentIdDisplay = document.getElementById('appointmentId');
            const appointmentDoctor = document.getElementById('appointmentDoctor');
            const appointmentDateTime = document.getElementById('appointmentDateTime');
            
            if (appointmentIdDisplay) appointmentIdDisplay.textContent = appointmentId;
            if (appointmentDoctor) appointmentDoctor.textContent = doctorOption ? doctorOption.text : 'Doctor';
            if (appointmentDateTime) {
                appointmentDateTime.textContent = 
                    `${new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })} at ${formatTime(selectedTimeSlot.dataset.time)}`;
            }
            
            showNotification('Appointment booked successfully!', 'success');
            showModal(confirmationModal);
            
            if (bookingForm) bookingForm.reset();
            if (timeSlots) timeSlots.innerHTML = '';
            setMinDateForAppointment(); // Reset date to today
            
        } catch (error) {
            console.error('Error booking appointment:', error);
            showNotification('Failed to book appointment: ' + error.message, 'error');
        } finally {
            if (btnText) btnText.style.display = 'inline-block';
            if (spinner) spinner.style.display = 'none';
            if (bookAppointmentBtn) bookAppointmentBtn.disabled = false;
        }
    }
    // Add this function to load patient appointments
async function loadPatientAppointments() {
    if (!currentUser || isDoctor) return;
    
    try {
        console.log('📅 Loading patient appointments for:', currentUser.id);
        
        const { data: appointments, error } = await supabase
            .from(TABLES.APPOINTMENTS)
            .select('*')
            .eq('patient_id', currentUser.id)
            .order('appointment_date', { ascending: true });
        
        if (error) {
            console.error('Error loading appointments:', error);
            showNotification('Failed to load appointments', 'error');
            return;
        }
        
        console.log(`✅ ${appointments?.length || 0} appointments loaded`);
        renderPatientAppointments(appointments || []);
        
    } catch (error) {
        console.error('Error in loadPatientAppointments:', error);
        showNotification('Error loading appointments', 'error');
    }
}

// Add this function to render patient appointments
function renderPatientAppointments(appointments) {
    const upcomingAppointments = document.getElementById('upcomingAppointments');
    const pastAppointments = document.getElementById('pastAppointments');
    const cancelledAppointments = document.getElementById('cancelledAppointments');
    
    if (!upcomingAppointments || !pastAppointments || !cancelledAppointments) return;
    
    // Clear existing content
    upcomingAppointments.innerHTML = '';
    pastAppointments.innerHTML = '';
    cancelledAppointments.innerHTML = '';
    
    if (appointments.length === 0) {
        const noAppointmentsHTML = `
            <div class="no-appointments">
                <i class="fas fa-calendar-times"></i>
                <h3>No Appointments Found</h3>
                <p>You don't have any appointments yet.</p>
                <button class="btn btn-primary" onclick="showPage('booking')">Book Your First Appointment</button>
            </div>
        `;
        upcomingAppointments.innerHTML = noAppointmentsHTML;
        return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Separate appointments by status and date
    const upcoming = [];
    const past = [];
    const cancelled = [];
    
    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        appointmentDate.setHours(0, 0, 0, 0);
        
        if (appointment.status === 'cancelled') {
            cancelled.push(appointment);
        } else if (appointmentDate >= today) {
            upcoming.push(appointment);
        } else {
            past.push(appointment);
        }
    });
    
    // Render upcoming appointments
    if (upcoming.length > 0) {
        upcoming.forEach(appointment => {
            upcomingAppointments.appendChild(createAppointmentCard(appointment));
        });
    } else {
        upcomingAppointments.innerHTML = `
            <div class="no-appointments">
                <i class="fas fa-calendar-check"></i>
                <h3>No Upcoming Appointments</h3>
                <p>You don't have any upcoming appointments.</p>
                <button class="btn btn-primary" onclick="showPage('booking')">Book an Appointment</button>
            </div>
        `;
    }
    
    // Render past appointments
    if (past.length > 0) {
        past.forEach(appointment => {
            pastAppointments.appendChild(createAppointmentCard(appointment));
        });
    } else {
        pastAppointments.innerHTML = `
            <div class="no-appointments">
                <i class="fas fa-history"></i>
                <h3>No Past Appointments</h3>
                <p>You don't have any past appointments.</p>
            </div>
        `;
    }
    
    // Render cancelled appointments
    if (cancelled.length > 0) {
        cancelled.forEach(appointment => {
            cancelledAppointments.appendChild(createAppointmentCard(appointment));
        });
    } else {
        cancelledAppointments.innerHTML = `
            <div class="no-appointments">
                <i class="fas fa-ban"></i>
                <h3>No Cancelled Appointments</h3>
                <p>You don't have any cancelled appointments.</p>
            </div>
        `;
    }
}

// Add this function to create appointment card
function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    card.dataset.id = appointment.appointment_id;
    
    // Format date
    const appointmentDate = new Date(appointment.appointment_date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format time
    const formattedTime = formatTime(appointment.appointment_time);
    
    // Get doctor name (we need to fetch this from doctors list)
    let doctorName = 'Doctor';
    const doctor = allDoctors.find(d => d.id === appointment.doctor_id);
    if (doctor) {
        doctorName = doctor.full_name || 'Doctor';
    }
    
    // Determine status class
    let statusClass = 'status-pending';
    let statusText = 'Pending';
    
    if (appointment.status === 'confirmed') {
        statusClass = 'status-confirmed';
        statusText = 'Confirmed';
    } else if (appointment.status === 'cancelled') {
        statusClass = 'status-cancelled';
        statusText = 'Cancelled';
    } else if (appointment.status === 'completed') {
        statusClass = 'status-completed';
        statusText = 'Completed';
    }
    
    card.innerHTML = `
        <div class="appointment-header">
            <div class="appointment-id">Appointment #${appointment.appointment_id.substring(0, 8)}</div>
            <div class="appointment-status ${statusClass}">${statusText}</div>
        </div>
        
        <div class="appointment-body">
            <div class="appointment-info-item">
                <strong>Date</strong>
                <span>${formattedDate}</span>
            </div>
            <div class="appointment-info-item">
                <strong>Time</strong>
                <span>${formattedTime}</span>
            </div>
            <div class="appointment-info-item">
                <strong>Doctor</strong>
                <span>${doctorName}</span>
            </div>
            <div class="appointment-info-item">
                <strong>Reason</strong>
                <span>${appointment.reason || 'General Consultation'}</span>
            </div>
        </div>
        
        <div class="appointment-actions">
            ${appointment.status === 'confirmed' ? `
                <button class="btn btn-outline btn-small cancel-appointment-btn" data-id="${appointment.appointment_id}">
                    Cancel Appointment
                </button>
                <button class="btn btn-primary btn-small reschedule-appointment-btn" data-id="${appointment.appointment_id}">
                    Reschedule
                </button>
            ` : ''}
            
            ${appointment.status === 'cancelled' ? `
                <button class="btn btn-outline btn-small book-again-btn" data-id="${appointment.doctor_id}">
                    Book Again
                </button>
            ` : ''}
        </div>
    `;
    
    // Add event listeners for buttons
    const cancelBtn = card.querySelector('.cancel-appointment-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => cancelAppointment(appointment.appointment_id));
    }
    
    const rescheduleBtn = card.querySelector('.reschedule-appointment-btn');
    if (rescheduleBtn) {
        rescheduleBtn.addEventListener('click', () => rescheduleAppointment(appointment));
    }
    
    const bookAgainBtn = card.querySelector('.book-again-btn');
    if (bookAgainBtn) {
        bookAgainBtn.addEventListener('click', () => {
            showPage('booking');
            if (doctorSelect && appointment.doctor_id) {
                doctorSelect.value = appointment.doctor_id;
                loadAvailableTimeSlots();
            }
        });
    }
    
    return card;
}

// Add this function to cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from(TABLES.APPOINTMENTS)
            .update({ status: 'cancelled' })
            .eq('appointment_id', appointmentId);
        
        if (error) throw error;
        
        showNotification('Appointment cancelled successfully', 'success');
        
        // Reload appointments
        if (currentUser && !isDoctor) {
            await loadPatientAppointments();
        }
        
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showNotification('Failed to cancel appointment', 'error');
    }
}

// Add this function to reschedule appointment
function rescheduleAppointment(appointment) {
    showNotification('Please book a new appointment with your preferred time', 'info');
    showPage('booking');
    
    // Pre-fill the booking form with existing data
    if (doctorSelect && appointment.doctor_id) {
        doctorSelect.value = appointment.doctor_id;
        
        // Set the date to today or tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        if (appointmentDate) {
            appointmentDate.value = tomorrowStr;
        }
        
        // Load time slots
        setTimeout(() => {
            loadAvailableTimeSlots();
        }, 500);
    }
}
    
    // ==================== HELPER FUNCTIONS ====================
    
    // Generate time slots between start and end time
    function generateTimeSlots(startTime, endTime, intervalMinutes) {
        if (startTime === '00:00' && endTime === '00:00') {
            return [];
        }
        
        const slots = [];
        let currentTime = new Date(`2000-01-01T${startTime}`);
        const endTimeObj = new Date(`2000-01-01T${endTime}`);
        
        while (currentTime < endTimeObj) {
            const hours = currentTime.getHours().toString().padStart(2, '0');
            const minutes = currentTime.getMinutes().toString().padStart(2, '0');
            slots.push(`${hours}:${minutes}`);
            currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
        }
        
        return slots;
    }
    
    // Format time for display
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }
    
    // Format time for display in table
    function formatTimeForDisplay(timeStr) {
        if (!timeStr || timeStr === '00:00') return 'N/A';
        
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }
    
    // Show page
    // Update the showPage function
function showPage(pageName) {
    pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === pageName) {
            page.classList.add('active');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    window.scrollTo(0, 0);
    
    if (pageName === 'dashboard' && currentUser && !isDoctor) {
        // Load patient appointments
        loadPatientAppointments();
    } else if (pageName === 'doctor-dashboard' && currentUser && isDoctor) {
        populateSimpleDoctorForm();
        // Make sure the doctor data table is visible
        const doctorDataDisplay = document.getElementById('doctorDataDisplay');
        if (doctorDataDisplay) {
            doctorDataDisplay.style.display = 'block';
        }
    } else if (pageName === 'doctors') {
        loadDoctors();
    }
}
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        if (mainNav) mainNav.classList.toggle('active');
    }
    
    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('.fa-moon');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            if (icon) icon.style.display = 'none';
            const sunIcon = themeToggle.querySelector('.fa-sun');
            if (sunIcon) sunIcon.style.display = 'block';
        } else {
            localStorage.setItem('theme', 'light');
            if (icon) icon.style.display = 'block';
            const sunIcon = themeToggle.querySelector('.fa-sun');
            if (sunIcon) sunIcon.style.display = 'none';
        }
    }
    
    // Show auth modal
    function showAuthModal() {
        showModal(authModal);
    }
    
    // Switch auth tab
    function switchAuthTab(tabName) {
        authTabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });
        
        authForms.forEach(form => {
            form.classList.toggle('active', form.id === `${tabName}Form`);
        });
        
        const modalTitle = document.getElementById('authModalTitle');
        if (modalTitle) {
            modalTitle.textContent = tabName === 'login' ? 'Login to MediQue' : 'Register for MediQue';
        }
    }
    
    // Show modal
    function showModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Hide modal
    function hideModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const notificationContainer = document.getElementById('notificationContainer');
        if (!notificationContainer) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    // ==================== START APPLICATION ====================
    
    // Initialize the app
    initializeApp();
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = themeToggle.querySelector('.fa-moon');
        if (icon) {
            icon.style.display = 'none';
            const sunIcon = themeToggle.querySelector('.fa-sun');
            if (sunIcon) sunIcon.style.display = 'block';
        }
    }
});