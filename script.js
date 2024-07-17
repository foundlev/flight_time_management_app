document.addEventListener('DOMContentLoaded', () => {
    const flightTimeInput = document.getElementById('flight-time');
    const departureTimeDisplay = document.getElementById('departure-time');
    const wakeUpTimeDisplay = document.getElementById('wake-up-time');
    const sleepDurationSlider = document.getElementById('sleep-duration');
    const sleepValueDisplay = document.getElementById('sleep-value');
    const sleepTimeContainer = document.getElementById('sleep-time-container');
    const sleepTimeDisplay = document.getElementById('sleep-time');
    const countdownDisplay = document.getElementById('countdown-display');
    const currentTimeDisplay = document.getElementById('current-time');

    const updateTheme = () => {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
    };

    const formatTime = (time) => {
        return time.length === 4 ? `${time.slice(0, 2)}:${time.slice(2)}` : time;
    };

    const updateCurrentTime = () => {
        const now = new Date();
        currentTimeDisplay.textContent = `Текущее время: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    const calculateTimes = () => {
        const flightTime = flightTimeInput.value.replace(':', '');
        if (flightTime.length === 4) {
            const flightHours = parseInt(flightTime.slice(0, 2), 10);
            const flightMinutes = parseInt(flightTime.slice(2), 10);

            const flightDate = new Date();
            const now = new Date();

            flightDate.setHours(flightHours);
            flightDate.setMinutes(flightMinutes);

            if (flightDate <= now) {
                flightDate.setDate(flightDate.getDate() + 1);
            }

            const departureDate = new Date(flightDate);
            departureDate.setHours(departureDate.getHours() - 2);
            departureDate.setMinutes(departureDate.getMinutes() - 45);
            departureTimeDisplay.textContent = `${String(departureDate.getHours()).padStart(2, '0')}:${String(departureDate.getMinutes()).padStart(2, '0')}`;

            const wakeUpDate = new Date(departureDate);
            wakeUpDate.setHours(departureDate.getHours() - 1);
            wakeUpTimeDisplay.textContent = `${String(wakeUpDate.getHours()).padStart(2, '0')}:${String(wakeUpDate.getMinutes()).padStart(2, '0')}`;

            let sleepDate;
            if (parseFloat(sleepDurationSlider.value) > 0) {
                sleepDate = new Date(wakeUpDate);
                sleepDate.setHours(wakeUpDate.getHours() - Math.floor(parseFloat(sleepDurationSlider.value)));
                sleepDate.setMinutes(wakeUpDate.getMinutes() - (parseFloat(sleepDurationSlider.value) % 1) * 60);
                sleepTimeDisplay.textContent = `${String(sleepDate.getHours()).padStart(2, '0')}:${String(sleepDate.getMinutes()).padStart(2, '0')}`;
                sleepTimeContainer.style.display = 'block';
            } else {
                sleepTimeContainer.style.display = 'none';
            }

            updateCountdown(flightDate, departureDate, wakeUpDate, sleepDate);
        } else {
            departureTimeDisplay.textContent = '00:00';
            wakeUpTimeDisplay.textContent = '00:00';
            sleepTimeContainer.style.display = 'none';
            countdownDisplay.textContent = '';
        }
    };

    const updateCountdown = (flightDate, departureDate, wakeUpDate, sleepDate) => {
        const now = new Date();

        let targetDate = flightDate;
        let message = "До вылета: ";

        if (sleepDate && now < sleepDate) {
            targetDate = sleepDate;
            message = "До отхода ко сну: ";
        } else if (now < wakeUpDate) {
            targetDate = wakeUpDate;
            message = "До подъема: ";
        } else if (now < departureDate) {
            targetDate = departureDate;
            message = "До выезда: ";
        }

        const timeRemaining = targetDate - now;

        if (timeRemaining > 0) {
            const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

            countdownDisplay.textContent = `${message}${hours} ч ${minutes} мин`;
        } else {
            countdownDisplay.textContent = '';
        }
    };

    flightTimeInput.addEventListener('input', (event) => {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 4) {
            value = value.slice(-4);
        }
        if (value.length === 1 && parseInt(value, 10) >= 3) {
            value = '0' + value;
        }
        if (value.length === 3 && parseInt(value[0], 10) > 2) {
            value = '0' + value;
        }
        if (value.length === 4) {
            const hours = value.slice(0, 2);
            const minutes = value.slice(2);
            if (parseInt(hours, 10) >= 24) {
                value = '00' + minutes;
            }
            if (parseInt(minutes[0], 10) > 5) {
                value = hours + '59';
            }
            event.target.value = `${value.slice(0, 2)}:${value.slice(2)}`;
        } else {
            event.target.value = value;
        }
        localStorage.setItem('flightTime', event.target.value.replace(':', ''));
        calculateTimes();
    });

    sleepDurationSlider.addEventListener('input', (event) => {
        sleepValueDisplay.textContent = event.target.value;
        localStorage.setItem('sleepDuration', event.target.value);
        calculateTimes();
    });

    setInterval(() => {
        const flightTime = flightTimeInput.value.replace(':', '');
        if (flightTime.length === 4) {
            const flightHours = parseInt(flightTime.slice(0, 2), 10);
            const flightMinutes = parseInt(flightTime.slice(2), 10);

            const flightDate = new Date();
            const now = new Date();

            flightDate.setHours(flightHours);
            flightDate.setMinutes(flightMinutes);

            if (flightDate <= now) {
                flightDate.setDate(flightDate.getDate() + 1);
            }

            const departureDate = new Date(flightDate);
            departureDate.setHours(departureDate.getHours() - 2);
            departureDate.setMinutes(departureDate.getMinutes() - 45);

            const wakeUpDate = new Date(departureDate);
            wakeUpDate.setHours(departureDate.getHours() - 1);

            let sleepDate;
            if (parseFloat(sleepDurationSlider.value) > 0) {
                sleepDate = new Date(wakeUpDate);
                sleepDate.setHours(wakeUpDate.getHours() - Math.floor(parseFloat(sleepDurationSlider.value)));
                sleepDate.setMinutes(wakeUpDate.getMinutes() - (parseFloat(sleepDurationSlider.value) % 1) * 60);
            }

            updateCountdown(flightDate, departureDate, wakeUpDate, sleepDate);
        }
        updateCurrentTime();
    }, 1000);

    if (localStorage.getItem('flightTime')) {
        flightTimeInput.value = formatTime(localStorage.getItem('flightTime'));
        flightTimeInput.dispatchEvent(new Event('input'));
    }

    if (localStorage.getItem('sleepDuration')) {
        sleepDurationSlider.value = localStorage.getItem('sleepDuration');
        sleepValueDisplay.textContent = sleepDurationSlider.value;
    }

    updateTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

    updateCurrentTime();
    calculateTimes();
});