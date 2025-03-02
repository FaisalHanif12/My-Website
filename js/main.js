document.addEventListener("DOMContentLoaded", function () {
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
});
