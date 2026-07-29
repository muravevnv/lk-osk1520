document.addEventListener('DOMContentLoaded', () => {

    class Tabs {
        constructor(selector = '[data-tabs]') {
            this.elements = document.querySelectorAll(selector);

            if (this.elements.length) {

                this.elements.forEach(el => {

                    const uniqueId = el.dataset.id || '';
                    let panelsSelector = '[data-tabs-panel]'
                    let controlsSelector = '[data-tabs-control]'
                    if (uniqueId) {
                        panelsSelector += `[data-id="${uniqueId}"]`
                        controlsSelector += `[data-id="${uniqueId}"]`
                    }

                    const panels = el.querySelectorAll(panelsSelector);
                    const controls = el.querySelectorAll(controlsSelector);

                    controls.forEach(control => {
                        control.addEventListener('click', (e) => {
                            e.preventDefault();
                            const target = e.target.closest(controlsSelector);
                            this.update(target, controls, panels);
                        });

                    });

                });

            }
        }
        update(target, controls, panels) {
            if (!target.classList.contains('is-selected')) {
                const id = target.dataset.tabsControl;
                controls.forEach((control) => {
                    control.classList.remove('is-selected');
                });
                target.classList.add('is-selected');
                panels.forEach((panel) => {
                    if (panel.dataset.tabsPanel === id) {
                        panel.classList.add('is-selected');
                    } else {
                        panel.classList.remove('is-selected');
                    }
                });
            }
        }
    }

    const tabs = new Tabs();

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

    if (regBtn || regBlock || regSection) {

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