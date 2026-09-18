// Appointment Booking Platform JavaScript

const services = [
    {
        id: 'consultation',
        name: 'Initial Consultation',
        duration: '30 mins',
        price: '$50',
        description: 'A 1-on-1 strategy call to discuss your goals and requirements.',
        icon: 'fa-comments'
    },
    {
        id: 'standard-session',
        name: 'Standard Service Session',
        duration: '60 mins',
        price: '$120',
        description: 'Comprehensive service execution and hands-on guidance.',
        icon: 'fa-clock'
    },
    {
        id: 'premium-package',
        name: 'VIP Premium Package',
        duration: '90 mins',
        price: '$200',
        description: 'In-depth review, priority scheduling, and follow-up support.',
        icon: 'fa-gem'
    },
    {
        id: 'express-audit',
        name: 'Express Audit & Review',
        duration: '45 mins',
        price: '$85',
        description: 'Rapid assessment of your current setup with actionable insights.',
        icon: 'fa-bolt'
    }
];

let currentStep = 1;
let selectedService = null;
let currentDate = new Date();
let selectedDateString = null;
let selectedTimeSlot = null;
let activeMonth = new Date().getMonth();
let activeYear = new Date().getFullYear();
let lastCreatedBooking = null;

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle');
const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');
const closeAdminModalBtn = document.getElementById('close-admin-modal');
const servicesListEl = document.getElementById('services-list');
const nextTo2Btn = document.getElementById('next-to-2');
const nextTo3Btn = document.getElementById('next-to-3');
const backTo1Btn = document.getElementById('back-to-1');
const backTo2Btn = document.getElementById('back-to-2');
const calendarDaysEl = document.getElementById('calendar-days');
const currentMonthYearEl = document.getElementById('current-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const timeSlotsContainer = document.getElementById('time-slots-container');
const selectedDateDisplay = document.getElementById('selected-date-display');
const chosenSummary = document.getElementById('chosen-summary');
const bookingForm = document.getElementById('booking-form');
const bookAnotherBtn = document.getElementById('book-another-btn');
const downloadIcsBtn = document.getElementById('download-ics-btn');
const adminBookingsList = document.getElementById('admin-bookings-list');
const adminSearch = document.getElementById('admin-search');
const clearAllBookingsBtn = document.getElementById('clear-all-bookings');

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderServices();
    renderCalendar();
    setupEventListeners();
});

function initTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

themeToggleBtn.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
});

function renderServices() {
    servicesListEl.innerHTML = services.map(service => `
        <div class="service-card border-2 rounded-2xl p-5 cursor-pointer transition border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 bg-white dark:bg-gray-800/50 flex flex-col justify-between" data-id="${service.id}">
            <div>
                <div class="flex justify-between items-start mb-3">
                    <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
                        <i class="fa-solid ${service.icon}"></i>
                    </div>
                    <span class="font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full text-xs">${service.price}</span>
                </div>
                <h3 class="font-bold text-lg mb-1">${service.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">${service.description}</p>
            </div>
            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <i class="fa-regular fa-clock mr-1.5 text-primary-500"></i> ${service.duration}
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('border-primary-600', 'bg-primary-50/20', 'dark:bg-primary-900/10'));
            card.classList.add('border-primary-600', 'bg-primary-50/20', 'dark:bg-primary-900/10');
            const serviceId = card.getAttribute('data-id');
            selectedService = services.find(s => s.id === serviceId);
            nextTo2Btn.removeAttribute('disabled');
        });
    });
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderCalendar() {
    currentMonthYearEl.textContent = `${monthNames[activeMonth]} ${activeYear}`;
    calendarDaysEl.innerHTML = '';

    const firstDayIndex = new Date(activeYear, activeMonth, 1).getDay();
    const totalDays = new Date(activeYear, activeMonth + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        calendarDaysEl.appendChild(emptyDiv);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.textContent = day;
        dayBtn.className = "calendar-day h-10 w-10 mx-auto rounded-xl flex items-center justify-center text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition";

        const thisDate = new Date(activeYear, activeMonth, day);
        const dateString = thisDate.toISOString().split('T')[0];

        if (thisDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
            dayBtn.classList.add('opacity-30', 'cursor-not-allowed');
            dayBtn.disabled = true;
        } else {
            if (selectedDateString === dateString) {
                dayBtn.classList.add('bg-primary-600', 'text-white', 'shadow-md', 'hover:bg-primary-700');
            }

            dayBtn.addEventListener('click', () => {
                selectedDateString = dateString;
                selectedTimeSlot = null;
                nextTo3Btn.setAttribute('disabled', 'true');
                renderCalendar();
                renderTimeSlots(dateString);
            });
        }
        calendarDaysEl.appendChild(dayBtn);
    }
}

function renderTimeSlots(dateStr) {
    const dateObj = new Date(dateStr);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    selectedDateDisplay.textContent = dateObj.toLocaleDateString('en-US', options);

    const allSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:30 PM'];
    const bookings = JSON.parse(localStorage.getItem('appointments') || '[]');
    const bookedTimesForDate = bookings.filter(b => b.dateString === dateStr).map(b => b.timeSlot);

    timeSlotsContainer.innerHTML = allSlots.map(slot => {
        const isBooked = bookedTimesForDate.includes(slot);
        if (isBooked) {
            return `<div class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 text-sm text-center font-medium cursor-not-allowed line-through">${slot}</div>`;
        }
        const isSelected = selectedTimeSlot === slot;
        return `<button type="button" class="slot-btn p-2.5 rounded-xl border text-sm font-medium transition ${isSelected ? 'border-primary-600 bg-primary-600 text-white shadow' : 'border-gray-200 dark:border-gray-700 hover:border-primary-500 bg-white dark:bg-gray-800'}" data-slot="${slot}">${slot}</button>`;
    }).join('');

    document.querySelectorAll('.slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('border-primary-600', 'bg-primary-600', 'text-white', 'shadow'));
            btn.classList.add('border-primary-600', 'bg-primary-600', 'text-white', 'shadow');
            selectedTimeSlot = btn.getAttribute('data-slot');
            chosenSummary.textContent = `${selectedDateDisplay.textContent} at ${selectedTimeSlot}`;
            nextTo3Btn.removeAttribute('disabled');
        });
    });
}

function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        if (activeMonth === 0) { activeMonth = 11; activeYear--; } else { activeMonth--; }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        if (activeMonth === 11) { activeMonth = 0; activeYear++; } else { activeMonth++; }
        renderCalendar();
    });

    nextTo2Btn.addEventListener('click', () => switchStep(2));
    backTo1Btn.addEventListener('click', () => switchStep(1));
    nextTo3Btn.addEventListener('click', () => { updateSummaryStep3(); switchStep(3); });
    backTo2Btn.addEventListener('click', () => switchStep(2));

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('client-name').value.trim();
        const email = document.getElementById('client-email').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const notes = document.getElementById('client-notes').value.trim();

        const bookingRef = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const dateTimeStr = `${selectedDateDisplay.textContent} at ${selectedTimeSlot}`;

        const newBooking = {
            ref: bookingRef,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            serviceDuration: selectedService.duration,
            servicePrice: selectedService.price,
            dateString: selectedDateString,
            timeSlot: selectedTimeSlot,
            dateTimeFormatted: dateTimeStr,
            clientName: name,
            clientEmail: email,
            clientPhone: phone,
            clientNotes: notes,
            createdAt: new Date().toISOString()
        };

        const existing = JSON.parse(localStorage.getItem('appointments') || '[]');
        existing.push(newBooking);
        localStorage.setItem('appointments', JSON.stringify(existing));

        lastCreatedBooking = newBooking;

        document.getElementById('success-ref').textContent = bookingRef;
        document.getElementById('success-service').textContent = selectedService.name;
        document.getElementById('success-datetime').textContent = dateTimeStr;
        document.getElementById('success-client').textContent = `${name} (${email})`;

        document.getElementById('step-3-content').classList.add('hidden');
        document.getElementById('success-view').classList.remove('hidden');
        document.querySelector('.flex.justify-center.items-center.mb-10').classList.add('hidden');
    });

    bookAnotherBtn.addEventListener('click', resetBookingFlow);

    downloadIcsBtn.addEventListener('click', () => {
        if (!lastCreatedBooking) return;
        generateAndDownloadICS(lastCreatedBooking);
    });

    adminBtn.addEventListener('click', () => {
        renderAdminBookings();
        adminModal.classList.remove('hidden');
    });

    closeAdminModalBtn.addEventListener('click', () => adminModal.classList.add('hidden'));
    adminModal.addEventListener('click', (e) => { if (e.target === adminModal) adminModal.classList.add('hidden'); });

    adminSearch.addEventListener('input', (e) => renderAdminBookings(e.target.value));

    clearAllBookingsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all appointments?')) {
            localStorage.removeItem('appointments');
            renderAdminBookings();
        }
    });
}

function switchStep(step) {
    currentStep = step;
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.add('hidden'));
    document.getElementById(`step-${step}-content`).classList.remove('hidden');

    document.querySelectorAll('.step-indicator').forEach(ind => {
        const sNum = parseInt(ind.getAttribute('data-step'));
        const circle = ind.querySelector('div');
        if (sNum === step) {
            ind.classList.remove('opacity-50');
            circle.className = "w-8 h-8 rounded-full flex items-center justify-center font-bold bg-primary-600 text-white text-sm";
        } else if (sNum < step) {
            ind.classList.remove('opacity-50');
            circle.className = "w-8 h-8 rounded-full flex items-center justify-center font-bold bg-emerald-600 text-white text-sm";
        } else {
            ind.classList.add('opacity-50');
            circle.className = "w-8 h-8 rounded-full flex items-center justify-center font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm";
        }
    });
}

function updateSummaryStep3() {
    document.getElementById('summary-service-name').textContent = selectedService.name;
    document.getElementById('summary-service-meta').textContent = `${selectedService.duration} • ${selectedService.price}`;
    document.getElementById('summary-datetime').textContent = `${selectedDateDisplay.textContent} at ${selectedTimeSlot}`;
}

function resetBookingFlow() {
    currentStep = 1;
    selectedService = null;
    selectedDateString = null;
    selectedTimeSlot = null;
    document.getElementById('success-view').classList.add('hidden');
    document.querySelector('.flex.justify-center.items-center.mb-10').classList.remove('hidden');
    renderServices();
    renderCalendar();
    timeSlotsContainer.innerHTML = `<div class="col-span-2 text-center py-10 text-gray-400 text-sm">Please pick a date from the calendar first.</div>`;
    selectedDateDisplay.textContent = 'Select a date';
    chosenSummary.textContent = 'No time selected';
    nextTo2Btn.setAttribute('disabled', 'true');
    nextTo3Btn.setAttribute('disabled', 'true');
    bookingForm.reset();
    switchStep(1);
}

function renderAdminBookings(searchTerm = '') {
    const bookings = JSON.parse(localStorage.getItem('appointments') || '[]');
    const filtered = bookings.filter(b => 
        b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.ref.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filtered.length === 0) {
        adminBookingsList.innerHTML = `<div class="text-center py-10 text-gray-400 text-sm">No appointments found.</div>`;
        return;
    }

    adminBookingsList.innerHTML = filtered.map(b => `
        <div class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
                <div class="flex items-center space-x-2 mb-1">
                    <span class="font-mono text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">${b.ref}</span>
                    <span class="font-bold text-sm">${b.serviceName}</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400"><i class="fa-regular fa-calendar mr-1"></i> ${b.dateTimeFormatted}</p>
                <p class="text-xs text-gray-500 dark:text-gray-500 mt-1"><i class="fa-regular fa-user mr-1"></i> ${b.clientName} (${b.clientEmail}, ${b.clientPhone})</p>
                ${b.clientNotes ? `<p class="text-xs italic text-gray-500 mt-1">Note: "${b.clientNotes}"</p>` : ''}
            </div>
            <button onclick="cancelBooking('${b.ref}')" class="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition whitespace-nowrap">
                Cancel
            </button>
        </div>
    `).join('');
}

window.cancelBooking = function(ref) {
    if (confirm(`Are you sure you want to cancel booking ${ref}?`)) {
        let bookings = JSON.parse(localStorage.getItem('appointments') || '[]');
        bookings = bookings.filter(b => b.ref !== ref);
        localStorage.setItem('appointments', JSON.stringify(bookings));
        renderAdminBookings(adminSearch.value);
    }
};

function generateAndDownloadICS(booking) {
    const startDateTime = new Date(`${booking.dateString} ${booking.timeSlot}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    const formatDateICS = (d) => {
        return d.toISOString().replace(/-/g, '').replace(/:/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${booking.serviceName} with BookEase`,
        `DESCRIPTION:Appointment reference: ${booking.ref}\\nClient: ${booking.clientName}`,
        `DTSTART:${formatDateICS(startDateTime)}`,
        `DTEND:${formatDateICS(endDateTime)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `appointment-${booking.ref}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}