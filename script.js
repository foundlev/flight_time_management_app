document.addEventListener('DOMContentLoaded', () => {
    const titleStatusDisplay = document.getElementById('title-status');
    const flightTimeInput = document.getElementById('flight-time');
    const flightTimeLabel = document.getElementById('flight-time-label');
    const departureTimeDisplay = document.getElementById('departure-time');
    const roomExitTimeDisplay = document.getElementById('room-exit-time');
    const roomExitTimeDisplayParagraph = document.getElementById('room-exit-time-paragraph');
    const wakeUpTimeDisplay = document.getElementById('wake-up-time');
    const sleepDurationSlider = document.getElementById('sleep-duration');
    const sleepValueDisplay = document.getElementById('sleep-value');
    const sleepTimeContainer = document.getElementById('sleep-time-container');
    const sleepTimeDisplay = document.getElementById('sleep-time');
    const countdownDisplay = document.getElementById('countdown-display');
    const currentTimeDisplay = document.getElementById('current-time');
    const modeRadios = document.getElementsByName('mode');

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
        let mode = 'home';
        for (const radio of modeRadios) {
            if (radio.checked) {
                mode = radio.value;
                break;
            }
        }

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

            let departureOffset = mode === 'home' ? -2.75 * 60 * 60 * 1000 : -2 * 60 * 60 * 1000;
            let roomExitOffset = 0;
            let wakeUpOffset = -1 * 60 * 60 * 1000;

            if (mode === 'hotel') {
                roomExitOffset = -15 * 60 * 1000;
                roomExitTimeDisplay.style.display = '';
                roomExitTimeDisplayParagraph.style.display = '';
            } else {
                roomExitTimeDisplay.style.display = 'none';
                roomExitTimeDisplayParagraph.style.display = 'none';
            }

            const departureDate = new Date(flightDate.getTime() + departureOffset);
            const roomExitDate = new Date(departureDate.getTime() + roomExitOffset);
            const wakeUpDate = new Date(roomExitDate.getTime() + wakeUpOffset);

            departureTimeDisplay.textContent = `${String(departureDate.getHours()).padStart(2, '0')}:${String(departureDate.getMinutes()).padStart(2, '0')}`;
            roomExitTimeDisplay.textContent = `${String(roomExitDate.getHours()).padStart(2, '0')}:${String(roomExitDate.getMinutes()).padStart(2, '0')}`;
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

            flightTimeLabel.textContent = `Время вылета: ${String(flightDate.getHours()).padStart(2, '0')}:${String(flightDate.getMinutes()).padStart(2, '0')}`;
            updateCountdown(flightDate, departureDate, wakeUpDate, sleepDate);
        } else {
            departureTimeDisplay.textContent = '00:00';
            roomExitTimeDisplay.textContent = '00:00';
            wakeUpTimeDisplay.textContent = '00:00';
            sleepTimeContainer.style.display = 'none';
            countdownDisplay.textContent = '';
            flightTimeLabel.textContent = 'Время вылета';
        }
    };

    const updateCountdown = (flightDate, departureDate, wakeUpDate, sleepDate) => {
        const now = new Date();

        let targetDate = flightDate;
        let message = "До вылета: ";

        if (sleepDate && now < sleepDate) {
            targetDate = sleepDate;
            message = "До ухода ко сну: ";
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
            value = value.slice(4);
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
            event.target.value = `${value.slice(0, 2)}${value.slice(2)}`;
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

    for (const radio of modeRadios) {
        radio.addEventListener('change', (event) => {
            localStorage.setItem('mode', event.target.value);
            titleStatusDisplay.textContent = 'Расчёт времени ' + (event.target.value === 'home' ? '🏘' : '🏨');
            calculateTimes();
        });
    }

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

            const mode = Array.from(modeRadios).find(radio => radio.checked).value;
            let departureOffset = mode === 'home' ? -2.75 * 60 * 60 * 1000 : -2 * 60 * 60 * 1000;
            let roomExitOffset = 0;
            let wakeUpOffset = -1 * 60 * 60 * 1000;

            if (mode === 'hotel') {
                roomExitOffset = -15 * 60 * 1000;
            }

            const departureDate = new Date(flightDate.getTime() + departureOffset);
            const roomExitDate = new Date(departureDate.getTime() + roomExitOffset);
            const wakeUpDate = new Date(roomExitDate.getTime() + wakeUpOffset);

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
        }
        updateCurrentTime();
    }, 1000);

    if (localStorage.getItem('mode')) {
        const savedMode = localStorage.getItem('mode');
        for (const radio of modeRadios) {
            if (radio.value === savedMode) {
                radio.checked = true;
                titleStatusDisplay.textContent = 'Расчёт времени ' + (event.target.value === 'home' ? '🏘' : '🏨');
                break;
            }
        }
    }

    if (localStorage.getItem('flightTime')) {
        flightTimeInput.value = localStorage.getItem('flightTime');
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