class TxtType {
    constructor(element, toRotate, period) {
        this.toRotate = toRotate;
        this.el = element;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.isDeleting = false;
        this.tick();
    }

    tick() {
        const current = this.loopNum % this.toRotate.length;
        const fullTxt = this.toRotate[current];

        // Update text: either add a character or remove one
        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        // Update HTML content
        this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;

        // Variable typing speed logic
        let delta = 200 - Math.random() * 100;
        if (this.isDeleting) delta /= 2;

        if (!this.isDeleting && this.txt === fullTxt) {
            // Text finished typing; start deleting after pause
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            // Text finished deleting; start next message
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        setTimeout(() => this.tick(), delta);
    }
}

function loadDynamicTypingEffect() {
    const elements = document.getElementsByClassName('typewrite');
    for (let i = 0; i < elements.length; i++) {
        const period = elements[i].getAttribute('data-period');
        const data = elements[i].getAttribute('data-type');
        if (data) {
            new TxtType(elements[i], JSON.parse(data), period);
        }
    }
    // Inject CSS for cursor effect
    const css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff }";
    document.body.appendChild(css);
}

// Attach the typing effect once the DOM is fully loaded, but only if not already handled by the enhanced version
document.addEventListener("DOMContentLoaded", function() {
  // Skip initialization if the enhanced version is already running
  if (!window.loadDynamicTypingEffectExecuted) {
    loadDynamicTypingEffect();
  }
});
