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

    const alreadyRegNextBtn = document.querySelector('.js-already-reg-next');
    const alreadyNextSections = document.querySelectorAll('.js-already-reg-section');

    if (alreadyNextSections.length > 0 || alreadyRegNextBtn) {
        alreadyRegNextBtn.addEventListener('click', () => {
            alreadyNextSections.forEach((section) => {
                section.classList.remove('is-active');
                if (section.dataset.block === 'password') {
                    section.classList.add('is-active');
                }
            });
        })
    }

    const password = document.querySelector('.js-password-input');
    const passwordVisibilityBtn = document.querySelector('.js-password-visibility-btn')

    if (password) {
        passwordVisibilityBtn.addEventListener('click', () => {
            if (password.type === "password") {
                password.type = "text";
                passwordVisibilityBtn.classList.add('is-hidden');
            } else {
                password.type = "password";
                passwordVisibilityBtn.classList.remove('is-hidden');
            }
        })
    }


    class OrderDatepicker {
        constructor(el, options = {}) {
            this.el = el;
            this.options = Object.assign({
                startHour: 9,
                endHour: 21,
                stepMinutes: 60,
                minDaysAhead: 1,
                maxDaysAhead: 360,
                loadThreshold: 3
            }, options);

            this.input = el.querySelector('.order-datepicker__input');
            this.valueInput = el.querySelector('.order-datepicker__value');
            this.popup = el.querySelector('.order-datepicker__popup');
            this.calendarEl = el.querySelector('.order-datepicker__calendar');
            this.slotsEl = el.querySelector('.order-datepicker__slots');
            this.slotsDateEl = el.querySelector('.order-datepicker__slots-date');
            this.slotsListEl = el.querySelector('.order-datepicker__slots-list');

            this.MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            this.MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            this.WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

            this.today = this.startOfDay(new Date());
            this.minDate = this.addDays(this.today, this.options.minDaysAhead);
            this.maxDate = this.addDays(this.today, this.options.maxDaysAhead);

            this.viewDate = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1);
            this.selectedDate = null;
            this.selectedSlot = null;

            this.slotsProvider = (date) => this.mockSlots(date);
            this.slotsCache = new Map();

            this.render();
            this.bind();
        }

        startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
        addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
        pad(n) { return String(n).padStart(2, '0'); }
        key(d) { return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`; }
        time(minutes) { return `${this.pad(Math.floor(minutes / 60))}:${this.pad(minutes % 60)}`; }

        slotTimes() {
            const res = [];
            const { startHour, endHour, stepMinutes } = this.options;
            for (let m = startHour * 60; m + stepMinutes <= endHour * 60; m += stepMinutes) {
                res.push({ start: m, end: m + stepMinutes });
            }
            return res;
        }

        mockSlots(date) {
            const str = this.key(date);
            let hash = 2166136261;
            for (let i = 0; i < str.length; i++) {
                hash ^= str.charCodeAt(i);
                hash = Math.imul(hash, 16777619);
            }
            hash = hash >>> 0;

            const times = this.slotTimes();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const profile = hash % 10;
            let freeLeft = profile < 2 ? 0 : profile < 5 ? this.options.loadThreshold : times.length;

            return times.map((slot, i) => {
                let status;
                if (isWeekend || profile === 9) {
                    status = 'off';
                } else if (slot.start === 13 * 60) {
                    status = 'off';
                } else if (freeLeft > 0 && ((hash >> i) & 3) !== 0) {
                    status = 'free';
                    freeLeft--;
                } else {
                    status = 'busy';
                }
                return { start: slot.start, end: slot.end, status };
            });
        }

        getSlots(date) {
            const k = this.key(date);
            if (!this.slotsCache.has(k)) {
                this.slotsCache.set(k, this.slotsProvider(date) || []);
            }
            return this.slotsCache.get(k);
        }

        setSlotsProvider(fn) {
            this.slotsProvider = fn;
            this.slotsCache.clear();
            this.render();
        }

        dayStatus(date) {
            if (date < this.minDate || date > this.maxDate) return null;
            const slots = this.getSlots(date);
            if (!slots.length || slots.every(s => s.status === 'off')) return 'off';
            const free = slots.filter(s => s.status === 'free').length;
            if (!free) return 'busy';
            if (free <= this.options.loadThreshold) return 'load';
            return 'free';
        }

        render() {
            this.renderCalendar();
            this.renderSlots();
        }

        renderCalendar() {
            const year = this.viewDate.getFullYear();
            const month = this.viewDate.getMonth();
            const first = new Date(year, month, 1);
            const offset = (first.getDay() + 6) % 7;
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const prevDisabled = new Date(year, month, 0) < this.minDate;
            const nextDisabled = new Date(year, month + 1, 1) > this.maxDate;

            const chevron = (dir) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${dir === 'prev'
                ? 'M15.5 3.5 7 12l8.5 8.5 1.7-1.7L10.4 12l6.8-6.8z'
                : 'M8.5 3.5 7 5.2 13.6 12 6.8 18.8l1.7 1.7L17 12z'}"/></svg>`;

            let cells = '';
            for (let i = 0; i < offset; i++) {
                cells += '<span class="calendar__day calendar__day--empty"></span>';
            }
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const status = this.dayStatus(date);
                const selectable = status === 'free' || status === 'load';
                const classes = ['calendar__day'];
                if (status) classes.push(`calendar__day--${status}`);
                if (date.getTime() === this.today.getTime()) classes.push('is-today');
                if (this.selectedDate && date.getTime() === this.selectedDate.getTime()) classes.push('is-selected');

                cells += `<button type="button" class="${classes.join(' ')}" data-date="${this.key(date)}"`
                    + `${selectable ? '' : ' disabled'}>${day}</button>`;
            }

            this.calendarEl.innerHTML = `
                <div class="calendar__head">
                    <button type="button" class="calendar__nav calendar__nav--prev" aria-label="Предыдущий месяц"${prevDisabled ? ' disabled' : ''}>${chevron('prev')}</button>
                    <div class="calendar__title">${this.MONTHS[month]} ${year}</div>
                    <button type="button" class="calendar__nav calendar__nav--next" aria-label="Следующий месяц"${nextDisabled ? ' disabled' : ''}>${chevron('next')}</button>
                </div>
                <div class="calendar__weekdays">${this.WEEKDAYS.map(d => `<span>${d}</span>`).join('')}</div>
                <div class="calendar__days">${cells}</div>
            `;
        }

        renderSlots() {
            this.slotsEl.classList.toggle('is-empty', !this.selectedDate);

            if (!this.selectedDate) {
                this.slotsDateEl.textContent = '';
                this.slotsListEl.innerHTML = '<div class="order-datepicker__slots-empty">Выберите дату в календаре</div>';
                return;
            }

            const date = this.selectedDate;
            this.slotsDateEl.textContent = `${date.getDate()} ${this.MONTHS_GEN[date.getMonth()]}`;

            const colors = { free: '#5FB457', busy: '#B55556', off: '#555555' };
            const dateKey = this.key(date);

            this.slotsListEl.innerHTML = this.getSlots(date).map((slot, i) => {
                const id = `id_slot_${this.pad(i + 1)}`;
                const label = `${this.time(slot.start)} - ${this.time(slot.end)}`;
                const disabled = slot.status !== 'free';
                const checked = this.selectedSlot
                    && this.selectedSlot.dateKey === dateKey
                    && this.selectedSlot.start === slot.start;

                return `<label for="${id}" class="order-datepicker__slots-item${disabled ? ' order-datepicker__slots-item--disabled' : ''}">
                    <input type="radio" name="slots" id="${id}" data-start="${slot.start}" data-end="${slot.end}"${disabled ? ' disabled' : ''}${checked ? ' checked' : ''}>
                    <span style="--marker: ${colors[slot.status]}">${label}</span>
                </label>`;
            }).join('');
        }

        bind() {
            this.input.addEventListener('click', () => this.toggle());

            this.calendarEl.addEventListener('click', (e) => {
                const nav = e.target.closest('.calendar__nav');
                if (nav) {
                    const step = nav.classList.contains('calendar__nav--prev') ? -1 : 1;
                    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + step, 1);
                    this.renderCalendar();
                    return;
                }

                const day = e.target.closest('.calendar__day');
                if (day && !day.disabled && day.dataset.date) {
                    const [y, m, d] = day.dataset.date.split('-').map(Number);
                    this.selectedDate = new Date(y, m - 1, d);
                    this.render();
                }
            });

            this.slotsListEl.addEventListener('change', (e) => {
                const input = e.target.closest('input[name="slots"]');
                if (!input) return;
                this.selectedSlot = {
                    dateKey: this.key(this.selectedDate),
                    start: Number(input.dataset.start),
                    end: Number(input.dataset.end)
                };
                this.applyValue();
                this.close();
            });

            document.addEventListener('mousedown', (e) => {
                if (!this.el.contains(e.target)) this.close();
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.close();
            });
        }

        applyValue() {
            const d = this.selectedDate;
            const s = this.selectedSlot;
            this.input.value = `${d.getDate()} ${this.MONTHS_GEN[d.getMonth()]} ${d.getFullYear()} `
                + `${this.time(s.start)} - ${this.time(s.end)}`;
            if (this.valueInput) {
                this.valueInput.value = `${s.dateKey} ${this.time(s.start)}-${this.time(s.end)}`;
            }
            this.el.dispatchEvent(new CustomEvent('datepicker:change', {
                bubbles: true,
                detail: { date: s.dateKey, start: this.time(s.start), end: this.time(s.end) }
            }));
        }

        open() {
            if (this.selectedDate) {
                this.viewDate = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
                this.renderCalendar();
            }
            this.popup.classList.add('is-open');
        }
        close() { this.popup.classList.remove('is-open'); }
        toggle() { this.popup.classList.contains('is-open') ? this.close() : this.open(); }
    }

    const datepickerEl = document.querySelector('.order-datepicker');

    if (datepickerEl) {
        window.orderDatepicker = new OrderDatepicker(datepickerEl);
    }
})
