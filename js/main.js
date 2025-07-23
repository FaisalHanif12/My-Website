document.addEventListener("DOMContentLoaded", function () {
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
        
        // Initialize with default values
        let selectedPrice = 15; // Default price for Quick Chat
        let selectedType = 'Quick Chat';
        let hours = 1;
        
        // Update the calculation display
        function updateCalculation() {
            selectedSessionTypeEl.textContent = selectedType;
            pricePerSessionEl.textContent = `${selectedPrice}`;
            numberOfHoursEl.textContent = hours;
            totalAmountEl.textContent = `${selectedPrice * hours}`;
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
    }
    
    // Initialize meeting pricing calculator if elements exist
    // Only initialize the meeting pricing calculator if we're on the schedule meeting page
    if (document.querySelector('.meeting-types') && 
        document.getElementById('hoursInput') && 
        document.getElementById('selectedSessionType')) {
        initMeetingPricingCalculator();
    }
    
    // Initialize Meeting Pricing Calculator
    function initMeetingPricingCalculator() {
        const meetingTypeCards = document.querySelectorAll('.meeting-type-card');
        const hoursInput = document.getElementById('hoursInput');
        const decreaseBtn = document.getElementById('decreaseHours');
        const increaseBtn = document.getElementById('increaseHours');
        
        // Display elements
        const selectedSessionTypeEl = document.getElementById('selectedSessionType');
        const pricePerSessionEl = document.getElementById('pricePerSession');
        const numberOfHoursEl = document.getElementById('numberOfHours');
        const totalAmountEl = document.getElementById('totalAmount');
        
        // Check if all required elements exist
        if (!hoursInput || !decreaseBtn || !increaseBtn || 
            !selectedSessionTypeEl || !pricePerSessionEl || 
            !numberOfHoursEl || !totalAmountEl) {
            console.log('Some elements for meeting pricing calculator not found');
            return; // Exit the function if any element is missing
        }
        
        // Initial values
        let selectedPrice = 15; // Default to Quick Chat price
        let selectedType = 'Quick Chat';
        let hours = 1;
        
        // Function to update calculation display
        function updateCalculation() {
            selectedSessionTypeEl.textContent = selectedType;
            pricePerSessionEl.textContent = `${selectedPrice}`;
            numberOfHoursEl.textContent = hours;
            totalAmountEl.textContent = `$${selectedPrice * hours}`;
        }
        
        // Handle meeting type card selection
        meetingTypeCards.forEach(card => {
            card.addEventListener('click', () => {
                // Update active state
                meetingTypeCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                // Update selected price and type
                selectedPrice = parseInt(card.dataset.price);
                selectedType = card.querySelector('h3').textContent;
                
                // Update calculation
                updateCalculation();
            });
        });
        
        // Handle hours input change
        hoursInput.addEventListener('change', () => {
            let value = parseInt(hoursInput.value);
            
            // Validate input
            if (isNaN(value) || value < 1) {
                value = 1;
            } else if (value > 10) {
                value = 10;
            }
            
            // Update hours and input value
            hours = value;
            hoursInput.value = value;
            
            // Update calculation
            updateCalculation();
        });
        
        // Handle decrease button
        decreaseBtn.addEventListener('click', () => {
            if (hours > 1) {
                hours--;
                hoursInput.value = hours;
                updateCalculation();
            }
        });
        
        // Handle increase button
        increaseBtn.addEventListener('click', () => {
            if (hours < 10) {
                hours++;
                hoursInput.value = hours;
                updateCalculation();
            }
        });
        
        // Initialize calculation display
        updateCalculation();
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
