// Performance optimized main script
document.addEventListener("DOMContentLoaded", function () {
    // Use requestIdleCallback for non-critical initialization
    const initNonCritical = (callback) => {
        if (window.requestIdleCallback) {
            requestIdleCallback(callback, { timeout: 2000 });
        } else {
            setTimeout(callback, 100);
        }
    };
    
    // Meeting pricing calculation functionality
    function initMeetingPricingCalculator() {
        const meetingTypeCards = document.querySelectorAll('.meeting-type-card');
        const hoursInput = document.getElementById('hoursInput');
        const decreaseHoursBtn = document.getElementById('decreaseHours');
        const increaseHoursBtn = document.getElementById('increaseHours');
        const selectedSessionTypeEl = document.getElementById('selectedSessionType');
        const pricePerSessionEl = document.getElementById('pricePerSession');
        const numberOfHoursEl = document.getElementById('numberOfHours');
        const totalAmountEl = document.getElementById('totalAmount');
        const proceedToPaymentBtn = document.getElementById('proceedToPaymentButton');
        const paymentSection = document.getElementById('paymentSection');
        const backToSelectionBtn = document.getElementById('backToSelectionButton');
        const submitPaymentBtn = document.getElementById('submitPaymentButton');
        
        // Payment summary elements
        const summarySessionTypeEl = document.getElementById('summarySessionType');
        const summaryDurationEl = document.getElementById('summaryDuration');
        const summaryHoursEl = document.getElementById('summaryHours');
        const summaryTotalEl = document.getElementById('summaryTotal');
        const paymentAmountEl = document.getElementById('paymentAmount');
        
        // Initialize with default values
        let selectedPrice = 15; // Default price for Quick Chat
        let selectedType = 'Quick Chat';
        let selectedDuration = '30 minutes';
        let hours = 1;
        
        // Update the calculation display
        function updateCalculation() {
            selectedSessionTypeEl.textContent = selectedType;
            pricePerSessionEl.textContent = `${selectedPrice}`;
            numberOfHoursEl.textContent = hours;
            totalAmountEl.textContent = `$${selectedPrice * hours}`;
            
            // Update payment summary if elements exist
            if (summarySessionTypeEl) summarySessionTypeEl.textContent = selectedType;
            if (summaryDurationEl) summaryDurationEl.textContent = selectedDuration;
            if (summaryHoursEl) summaryHoursEl.textContent = hours;
            if (summaryTotalEl) summaryTotalEl.textContent = `$${selectedPrice * hours}`;
            if (paymentAmountEl) paymentAmountEl.textContent = `$${selectedPrice * hours}`;
        }
        
        // Handle meeting type selection
        meetingTypeCards.forEach(card => {
            card.addEventListener('click', function() {
                // Update active state
                meetingTypeCards.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                // Update selected values
                selectedPrice = parseInt(this.dataset.price);
                selectedType = this.querySelector('h3').textContent;
                selectedDuration = this.querySelector('.duration').textContent;
                
                // Update calculation
                updateCalculation();
            });
        });
        
        // Handle hours input changes
        hoursInput.addEventListener('change', function() {
            hours = parseInt(this.value);
            if (hours < 1) {
                hours = 1;
                this.value = 1;
            } else if (hours > 10) {
                hours = 10;
                this.value = 10;
            }
            updateCalculation();
        });
        
        // Handle decrease hours button
        decreaseHoursBtn.addEventListener('click', function() {
            if (hours > 1) {
                hours--;
                hoursInput.value = hours;
                updateCalculation();
            }
        });
        
        // Handle increase hours button
        increaseHoursBtn.addEventListener('click', function() {
            if (hours < 10) {
                hours++;
                hoursInput.value = hours;
                updateCalculation();
            }
        });
        
        // Initialize calculation display
        updateCalculation();
        
        // Handle proceed to payment button
        if (proceedToPaymentBtn) {
            proceedToPaymentBtn.addEventListener('click', function() {
                // Redirect to booking page with parameters
                // Use relative path to work with the current server
                const bookingUrl = new URL('booking.html', window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/'));
                
                // Add parameters to URL
                bookingUrl.searchParams.append('sessionType', selectedType);
                bookingUrl.searchParams.append('duration', selectedDuration);
                bookingUrl.searchParams.append('hours', hours);
                bookingUrl.searchParams.append('amount', selectedPrice * hours);
                
                // Navigate to booking page
                window.location.href = bookingUrl.toString();
            });
        }
        
        // Handle close payment button
        const closePaymentBtn = document.getElementById('closePaymentBtn');
        if (closePaymentBtn) {
            closePaymentBtn.addEventListener('click', function() {
                if (paymentSection) {
                    paymentSection.classList.remove('active');
                    
                    // Re-enable body scrolling
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Handle back to selection button
        if (backToSelectionBtn) {
            backToSelectionBtn.addEventListener('click', function() {
                // Hide payment section
                if (paymentSection) {
                    paymentSection.classList.remove('active');
                    
                    // Re-enable body scrolling
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Handle submit payment button
        if (submitPaymentBtn) {
            submitPaymentBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Get form values
                const cardNumber = document.getElementById('cardNumber').value;
                const expiryDate = document.getElementById('expiryDate').value;
                const cvv = document.getElementById('cvv').value;
                const cardName = document.getElementById('cardName').value;
                const email = document.getElementById('email').value;
                const streetAddress = document.getElementById('streetAddress').value;
                const city = document.getElementById('city').value;
                const state = document.getElementById('state').value;
                const zipCode = document.getElementById('zipCode').value;
                
                // Basic validation
                if (!cardNumber || !expiryDate || !cvv || !cardName || !email || !streetAddress || !city || !state || !zipCode) {
                    alert('Please fill in all required fields');
                    return;
                }
                
                // Simple card number validation
                if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
                    alert('Please enter a valid 16-digit card number');
                    return;
                }
                
                // Simple expiry date validation
                if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
                    alert('Please enter a valid expiry date (MM/YY)');
                    return;
                }
                
                // Simple CVV validation
                if (!/^\d{3,4}$/.test(cvv)) {
                    alert('Please enter a valid CVV code');
                    return;
                }
                
                // Simple email validation
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    alert('Please enter a valid email address');
                    return;
                }
                
                // Here you would normally integrate with Stripe API
                // For now, show a success message
                alert('Payment successful! Your session has been booked.');
                
                // Show a confirmation message within the modal
                const paymentContainer = paymentSection.querySelector('.payment-container');
                if (paymentContainer) {
                    paymentContainer.innerHTML = `
                        <div class="payment-success">
                            <button id="closeSuccessBtn" class="close-payment-btn">
                                <i class="fa fa-times"></i>
                            </button>
                            <div class="success-icon">
                            <i class="fa fa-check-circle"></i>
                        </div>
                        <h3>Payment Successful!</h3>
                        <p>Your session has been booked. You will receive a confirmation email shortly.</p>
                        <div class="booking-details">
                            <div class="detail-item">
                                <span class="detail-label">Session:</span>
                                <span class="detail-value">${selectedType}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Duration:</span>
                                <span class="detail-value">${selectedDuration}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Hours:</span>
                                <span class="detail-value">${hours}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Total Paid:</span>
                                <span class="detail-value">$${selectedPrice * hours}</span>
                            </div>
                        </div>
                    </div>
                `;
                    
                    // Add event listener for the close success button
                    setTimeout(() => {
                        const closeSuccessBtn = document.getElementById('closeSuccessBtn');
                        if (closeSuccessBtn) {
                            closeSuccessBtn.addEventListener('click', function() {
                                if (paymentSection) {
                                    paymentSection.classList.remove('active');
                                    document.body.style.overflow = '';
                                }
                            });
                        }
                    }, 100);
                }
            });
        }
    }
    
    // Initialize meeting pricing calculator if elements exist
    // Only initialize the meeting pricing calculator if we're on the schedule meeting page
    if (document.querySelector('.meeting-types') && 
        document.getElementById('hoursInput') && 
        document.getElementById('selectedSessionType')) {
        initMeetingPricingCalculator();
    }
    
    // Hide the preloader when the window fully loads
    window.addEventListener("load", () => {
        const preloader = document.querySelector(".preloader");
        if (preloader) {
            preloader.style.display = "none";
        }
    });

    // Setup event listener for menu change
    const menuInputs = document.querySelectorAll("input[name='menu']");
    const rightCards = document.querySelectorAll('.right-cards');

    menuInputs.forEach(input => {
        input.addEventListener("change", event => {
            const targetId = event.target.id; // This gets something like 'resume-card'
            const targetCard = document.querySelector(`.${targetId}`); // This looks for '.resume-card'

            if (targetCard) {
                rightCards.forEach(card => card.style.display = 'none');
                targetCard.style.display = 'block'; // Ensure CSS allows this to show
                targetCard.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // Mobile Filter Dropdown Functionality
    function initMobileFilterDropdowns() {
        const dropdowns = document.querySelectorAll('.mobile-filter-dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.mobile-filter-trigger');
            const menu = dropdown.querySelector('.mobile-filter-dropdown-menu');
            const options = dropdown.querySelectorAll('.mobile-filter-option');
            const currentFilterSpan = trigger.querySelector('.current-filter span');
            const currentFilterIcon = trigger.querySelector('.current-filter i');
            
            // Toggle dropdown
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('active');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
            });
            
            // Handle option selection
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const category = option.dataset.category;
                    const optionText = option.querySelector('.option-content span').textContent;
                    const optionIcon = option.querySelector('.option-content i').className;
                    
                    // Update active states
                    options.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    
                    // Update trigger display
                    currentFilterSpan.textContent = optionText;
                    currentFilterIcon.className = optionIcon;
                    trigger.dataset.current = category;
                    
                    // Close dropdown
                    dropdown.classList.remove('active');
                    
                    // Trigger filtering
                    if (dropdown.closest('.works-filter-section')) {
                        filterProjects(category);
                    } else if (dropdown.closest('.certification-filter-section')) {
                        filterCertifications(category);
                    }
                });
            });
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-filter-dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                });
            }
        });
    }
    
    // Filter Projects Function
    function filterProjects(category) {
        const projects = document.querySelectorAll('.works-item');
        
        projects.forEach(project => {
            if (category === 'All' || project.dataset.category === category) {
                project.style.display = 'block';
                project.classList.remove('fade-out');
                project.classList.add('fade-in');
            } else {
                project.classList.add('fade-out');
                setTimeout(() => {
                    project.style.display = 'none';
                }, 300);
            }
        });
        
        // Update desktop filter buttons if they exist
        const desktopButtons = document.querySelectorAll('.works-filter-section .filter-btn');
        desktopButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
    }
    
    // Filter Certifications Function
    function filterCertifications(category) {
        const certifications = document.querySelectorAll('.certification-card');
        
        certifications.forEach(cert => {
            if (category === 'all' || cert.dataset.category === category) {
                cert.style.display = 'block';
                cert.classList.remove('fade-out');
                cert.classList.add('fade-in');
            } else {
                cert.classList.add('fade-out');
                setTimeout(() => {
                    cert.style.display = 'none';
                }, 300);
            }
        });
        
        // Update desktop filter buttons if they exist
        const desktopButtons = document.querySelectorAll('.certification-filter-section .filter-btn');
        desktopButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
    }
    
    // Initialize mobile dropdowns
    initMobileFilterDropdowns();
    
    // Handle desktop filter buttons (existing functionality)
    const desktopFilterButtons = document.querySelectorAll('.filter-btn');
    desktopFilterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.dataset.category;
            
            // Update active states
            const filterSection = button.closest('.works-filter-section, .certification-filter-section');
            const buttons = filterSection.querySelectorAll('.filter-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Trigger filtering
            if (filterSection.classList.contains('works-filter-section')) {
                filterProjects(category);
                // Update mobile dropdown if exists
                const mobileDropdown = filterSection.querySelector('.mobile-filter-dropdown');
                if (mobileDropdown) {
                    const trigger = mobileDropdown.querySelector('.mobile-filter-trigger');
                    const currentFilterSpan = trigger.querySelector('.current-filter span');
                    const currentFilterIcon = trigger.querySelector('.current-filter i');
                    const targetOption = mobileDropdown.querySelector(`[data-category="${category}"]`);
                    
                    if (targetOption) {
                        currentFilterSpan.textContent = targetOption.querySelector('.option-content span').textContent;
                        currentFilterIcon.className = targetOption.querySelector('.option-content i').className;
                        trigger.dataset.current = category;
                        
                        // Update mobile option active states
                        const mobileOptions = mobileDropdown.querySelectorAll('.mobile-filter-option');
                        mobileOptions.forEach(opt => opt.classList.remove('active'));
                        targetOption.classList.add('active');
                    }
                }
            } else if (filterSection.classList.contains('certification-filter-section')) {
                filterCertifications(category);
                // Update mobile dropdown if exists
                const mobileDropdown = filterSection.querySelector('.mobile-filter-dropdown');
                if (mobileDropdown) {
                    const trigger = mobileDropdown.querySelector('.mobile-filter-trigger');
                    const currentFilterSpan = trigger.querySelector('.current-filter span');
                    const currentFilterIcon = trigger.querySelector('.current-filter i');
                    const targetOption = mobileDropdown.querySelector(`[data-category="${category}"]`);
                    
                    if (targetOption) {
                        currentFilterSpan.textContent = targetOption.querySelector('.option-content span').textContent;
                        currentFilterIcon.className = targetOption.querySelector('.option-content i').className;
                        trigger.dataset.current = category;
                        
                        // Update mobile option active states
                        const mobileOptions = mobileDropdown.querySelectorAll('.mobile-filter-option');
                        mobileOptions.forEach(opt => opt.classList.remove('active'));
                        targetOption.classList.add('active');
                    }
                }
            }
        });
    });
});
