document.addEventListener('DOMContentLoaded', () => {
    const accordions = document.querySelectorAll('[data-accordion]');

    accordions.forEach((accordion) => {
    const trigger = accordion.querySelector('[data-accordion-trigger]');
    const content = accordion.querySelector('[data-accordion-content]');

    trigger.addEventListener('click', () => {
        const isOpen = !content.hidden;

        content.hidden = isOpen;
        trigger.setAttribute('aria-expanded', String(!isOpen));
    });

    trigger.setAttribute('aria-expanded', 'false');
    });
})