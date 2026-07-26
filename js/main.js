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

    const regBtn = document.querySelector('.js-reg-btn');
    const regBlock = document.querySelector('.js-reg-block');
    const regSection = document.querySelector('.js-reg-section');

    if(regBtn || regBlock || regSection) {
        
        regBtn.addEventListener('click', () => {
            regSection.classList.add('is-visible');
            regBlock.classList.add('is-hidden');
        })
    }

    const phoneMask = document.querySelector('#phone-mask');

    if (phoneMask) {
        IMask(phoneMask, {
                mask: '+{7}(000)000-00-00'
            }
        )
    }
})