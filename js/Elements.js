const elementKeys = {
    aboutCard: "about-card",
    resumeCard: "resume-card",
    worksCard: "works-card",
    blogsCard: "blogs-card",
    contactCard: "contact-card",
    menuInputs: "menu"
};

// Function to lazily load and cache DOM elements
const elementsCache = {};
function getElement(key) {
    if (!elementsCache[key]) {
        elementsCache[key] = document.querySelector(`.${elementKeys[key]}`);
    }
    return elementsCache[key];
}

// Example of using getElement function
// This ensures elements are only accessed when actually used, improving initial load performance
document.addEventListener("DOMContentLoaded", function () {
    const aboutCard = getElement('aboutCard'); // Access the about card when needed
    console.log(aboutCard); // Example action using the about card
});
