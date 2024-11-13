const showRefreshNotification = () => {
    const notification = document.getElementById('refresh-notification');
    notification.style.display = 'flex';
    notification.style.top = '20px'; // Показать уведомление, выдвигая его сверху
    setTimeout(() => {
        notification.style.top = '-80px'; // Убрать уведомление за пределы экрана
    }, 1000); // Уведомление будет отображаться 1 секунду
    setTimeout(() => {
        notification.style.display = 'none';
    }, 1500); // Скрыть уведомление после завершения анимации
};

function updatePage() {
    showRefreshNotification(); // Показать уведомление
    setTimeout(() => {
        window.location.reload(true); // Обновляем страницу через 1 секунду после показа уведомления
    }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
    const titleStatusDisplay = document.getElementById('title-status');
    const flightTimeInput = document.getElementById('flight-time');
    const flightNumberInput = document.getElementById('flight-number');
    const flightInfoLabel = document.getElementById('flight-info-label');
    const flightTimeLabel = document.getElementById('flight-time-label');
    const departureTimeDisplay = document.getElementById('departure-time');
    const oldDepartureTimeDisplay = document.getElementById('old-departure-time');
    const roomExitTimeDisplay = document.getElementById('room-exit-time');
    const roomExitTimeDisplayParagraph = document.getElementById('room-exit-time-paragraph');
    const wakeUpTimeDisplay = document.getElementById('wake-up-time');
    const oldWakeUpTimeDisplay = document.getElementById('old-wake-up-time')
    const sleepDurationSlider = document.getElementById('sleep-duration');
    const sleepValueDisplay = document.getElementById('sleep-value');
    const sleepTimeContainer = document.getElementById('sleep-time-container');
    const sleepTimeDisplay = document.getElementById('sleep-time');
    const countdownDisplay = document.getElementById('countdown-display');
    const currentTimeDisplay = document.getElementById('current-time');
    const modeRadios = document.getElementsByName('mode');

    const outputGroup = document.getElementById('output-group');
    const modeGroup = document.getElementById('mode-group');
    const sliderGroup = document.getElementById('slider-group');

    const departureTimeEditor = document.getElementById('edit-departure-time');
    const wakeUpTimeEditor = document.getElementById('edit-wake-up-time');

    let previousMinutes = null;
    let previousSeconds = null;

    let mode = 'home';

    let flightsData = {}; // Переменная для хранения данных рейсов
    let flightsDataRosia = {};
    let moscowFlightString = null;

    fetch('flights_rosia.json')
        .then(response => response.json())
        .then(data => {
            flightsDataRosia = data; // Сохранение загруженных данных в переменную
            setFlightInfo();
        })
        .catch(error => console.error('Ошибка загрузки flights_rosia.json:', error));

    fetch('flights.json')
        .then(response => response.json())
        .then(data => {
            flightsData = data; // Сохранение загруженных данных в переменную
            setFlightInfo();
        })
        .catch(error => console.error('Ошибка загрузки flights.json:', error));

    departureTimeEditor.addEventListener('click', function() {
        if (localStorage.getItem('newDepartureTime')) {

            localStorage.removeItem('newDepartureTime');
            updatePage();
//            alert('Время выхода сброшено');

        } else {

            // Запрашиваем ввод у пользователя
            const currentDepartureTime = departureTimeDisplay.textContent;
            currentDepartureTimeDigit = currentDepartureTime.replace(/:/g, '');
            passengerTimeString = changeStringTime(currentDepartureTime, 35);

            let input = prompt(`Укажите новое время выезда.\nТекущее: ${currentDepartureTime}\nДля выезда пассажиром (+35 мин): ${passengerTimeString}`);

            if (input !== null) {
                // Удаляем символ ":" из строки
                let sanitizedInput = input.replace(/:/g, '');

                if (sanitizedInput.length == 3) {
                    sanitizedInput = "0" + sanitizedInput;
                }

                if (currentDepartureTimeDigit == sanitizedInput) {
                    alert('Новое время совпадает с текущим');
                } else if (/^\d{4}$/.test(sanitizedInput)) {
                    // Проверяем, что строка состоит из 4 цифр
                    // Сохраняем строку в localStorage
                    localStorage.setItem('newDepartureTime', sanitizedInput);
                    updatePage();
//                    alert('Время выхода изменено');
                } else {
                    alert('Новое время должно быть из 4 цифр');
                }
            }

        }
    });

    wakeUpTimeEditor.addEventListener('click', function() {
        if (localStorage.getItem('newWakeUpTime')) {

            localStorage.removeItem('newWakeUpTime');
            updatePage();
//            alert('Время подъема сброшено');

        } else {

            // Запрашиваем ввод у пользователя
            const currentWakeUpTime = wakeUpTimeDisplay.textContent;
            const extraShortTime = changeStringTime(currentWakeUpTime, 30);
            const shirtTime = changeStringTime(currentWakeUpTime, -20);
            const shirtBaggageTime = changeStringTime(currentWakeUpTime, -35);
            let input = prompt(`Укажите новое время подъема.\nТекущее: ${currentWakeUpTime}\nБез еды и душа (+30 мин): ${extraShortTime}\nГлажка рубашки (-20 мин): ${shirtTime}\nГлажка рубашки + чемодан (-35 мин): ${shirtBaggageTime}`);
            currentWakeUpTimeDigit = currentWakeUpTime.replace(/:/g, '');

            if (input !== null) {
                // Удаляем символ ":" из строки
                let sanitizedInput = input.replace(/:/g, '');

                if (sanitizedInput.length == 3) {
                    sanitizedInput = "0" + sanitizedInput;
                }

                if (currentWakeUpTimeDigit == sanitizedInput) {
                    alert('Новое время совпадает с текущим');
                } else if (/^\d{4}$/.test(sanitizedInput)) {
                    // Проверяем, что строка состоит из 4 цифр
                    // Сохраняем строку в localStorage
                    localStorage.setItem('newWakeUpTime', sanitizedInput);
                    updatePage();
//                    alert('Время подъема изменено');
                } else {
                    alert('Новое время должно быть из 4 цифр');
                }
            }

        }
    });

    function changeStringTime(currentStringTime, changeValueInt) {
        let nowTime = currentStringTime.includes(':') ? currentStringTime.replace(/:/g, '') : currentStringTime;

        // Разделяем строку на часы и минуты
        let hours = parseInt(nowTime.substring(0, 2), 10);
        let minutes = parseInt(nowTime.substring(2, 4), 10);

        // Изменяем минуты на указанное значение
        minutes += changeValueInt;

        // Если минут стало 60 или больше, корректируем часы
        if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
        } else if (minutes < 0) {
            hours += Math.floor(minutes / 60);  // уменьшаем часы при отрицательных минутах
            minutes = (minutes % 60 + 60) % 60; // корректируем минуты в диапазоне 0-59
        }

        // Если часы стали 24 или больше, обнуляем их (переход через полночь)
        if (hours >= 24) {
            hours = hours % 24;
        } else if (hours < 0) {
            hours = (hours % 24 + 24) % 24;
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    function setFlightInfo() {
        const flightNumber = flightNumberInput.value; // Получаем текущий номер рейса

        // Проверка наличия номера рейса в данных
        if (flightsData[flightNumber]) {
            const flightInfo = flightsData[flightNumber];
            const flightTimeInputValue = flightTimeInput.value;

            if (flightInfo.ETD == moscowFlightString) {
                flightInfoLabel.innerHTML = `✅ ${flightInfo.from.icao}/${flightInfo.from.iata} (${flightInfo.ETD}) → ${flightInfo.to.icao}/${flightInfo.to.iata} (${flightInfo.STA})`;
            } else {
                flightInfoLabel.innerHTML = `❌ ${flightInfo.from.icao}/${flightInfo.from.iata} (<b>${flightInfo.ETD}</b>) → ${flightInfo.to.icao}/${flightInfo.to.iata} (${flightInfo.STA})`;
            };

            // Обновление текста с информацией о рейсе

        } else if (flightsDataRosia[flightNumber]) {
            const flightInfo = flightsDataRosia[flightNumber];
            flightInfoLabel.innerHTML = `💼 (Local Time) ${flightInfo.from.iata} (${flightInfo.ETD}) → ${flightInfo.to.iata} (${flightInfo.STA})`;

        } else {
            // Очищаем текст, если рейс не найден
            flightInfoLabel.innerHTML = '<b>⚠️ Отсутствует информация о рейсе</b>';
        }
    };

    let touchStartY = 0;
    let touchEndY = 0;
    const minSwipeDistance = 300; // Минимальная длина свайпа, чтобы он был засчитан

    let flightTimeInputLast = null;

//    document.addEventListener('touchstart', (event) => {
//        touchStartY = event.touches[0].clientY;
//    }, false);

//    document.addEventListener('touchmove', (event) => {
//        touchEndY = event.touches[0].clientY;
//    }, false);
//
//    document.addEventListener('touchend', () => {
//        if (touchStartY && touchEndY - touchStartY > minSwipeDistance) {
//            // Свайп вниз
//            updatePage();
//        } else {
//            touchStartY = 0;
//            touchEndY = 0;
//        }
//    }, false);

    const updateTheme = () => {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
    };

    const formatTime = (time) => {
        return time.length === 4 ? `${time.slice(0, 2)}:${time.slice(2)}` : time;
    };

    const updateCurrentTime = () => {
        const now = new Date();
        now.setDate(1);
        now.setMonth(0);
        now.setYear(2024);
        currentTimeDisplay.innerHTML = `Текущее время: <span>${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}</span>`;
    };

    const updateCountdown = (flightDate, departureDate, wakeUpDate, sleepDate, roomExitDate, mode) => {
        const now = new Date();
        const nowTimeMinutes = now.getHours() * 60 + now.getMinutes()
        updateCurrentTime();

        let targetDate = null;
        let message = null;
        let highlightElement = null;

        let sleepTimeMinutes = sleepDate ? sleepDate.getHours() * 60 + sleepDate.getMinutes() : null
        let wakeUpTimeMinutes = wakeUpDate ? wakeUpDate.getHours() * 60 + wakeUpDate.getMinutes() : null
        let roomExitTimeMinutes = roomExitDate ? roomExitDate.getHours() * 60 + roomExitDate.getMinutes() : null
        let departureTimeMinutes = departureDate ? departureDate.getHours() * 60 + departureDate.getMinutes() : null
        let flightTimeMinutes = flightDate ? flightDate.getHours() * 60 + flightDate.getMinutes() : null

        let times = [];

        if (sleepTimeMinutes !== null) {
            sleepTimeMinutes = sleepTimeMinutes < nowTimeMinutes ? sleepTimeMinutes + 24 * 60 : sleepTimeMinutes;
            times.push({ time: sleepTimeMinutes, event: 'sleep' });
        }

        if (wakeUpTimeMinutes !== null  && sleepTimeMinutes !== null) {
            wakeUpTimeMinutes = wakeUpTimeMinutes < nowTimeMinutes ? wakeUpTimeMinutes + 24 * 60 : wakeUpTimeMinutes;
            times.push({ time: wakeUpTimeMinutes, event: 'wakeUp' });
        }

        if (roomExitTimeMinutes !== null && mode === 'hotel') {
            roomExitTimeMinutes = roomExitTimeMinutes < nowTimeMinutes ? roomExitTimeMinutes + 24 * 60 : roomExitTimeMinutes;
            times.push({ time: roomExitTimeMinutes, event: 'roomExit' });
        }

        if (departureTimeMinutes !== null) {
            departureTimeMinutes = departureTimeMinutes < nowTimeMinutes ? departureTimeMinutes + 24 * 60 : departureTimeMinutes;
            times.push({ time: departureTimeMinutes, event: 'departure' });
        }

        if (flightTimeMinutes !== null) {
            flightTimeMinutes = flightTimeMinutes < nowTimeMinutes ? flightTimeMinutes + 24 * 60 : flightTimeMinutes;
            times.push({ time: flightTimeMinutes, event: 'flight' });
        }

        // Находим минимальное время и соответствующее событие
        let nextEvent = times.reduce((min, current) => current.time < min.time ? current : min, { time: Infinity });

        // Логика выбора следующего события и установки targetDate
        if (nextEvent.event === 'sleep') {
            targetDate = sleepTimeMinutes;
            message = "До ухода ко сну: ";
            highlightElement = sleepTimeContainer;
        } else if (nextEvent.event === 'wakeUp') {
            targetDate = wakeUpTimeMinutes;
            message = "До подъема: ";
            highlightElement = wakeUpTimeDisplay.parentElement;
        } else if (nextEvent.event === 'roomExit') {
            targetDate = roomExitTimeMinutes;
            message = "До выхода из номера: ";
            highlightElement = roomExitTimeDisplay.parentElement;
        } else if (nextEvent.event === 'departure') {
            targetDate = departureTimeMinutes;
            message = "До выезда: ";
            highlightElement = departureTimeDisplay.parentElement;
        } else {
            targetDate = flightTimeMinutes;
            message = "До вылета: ";
            highlightElement = flightTimeLabel.parentElement;
        }

        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        if (highlightElement) {
            highlightElement.classList.add('highlight');
        }

        const minutesRemining = targetDate - nowTimeMinutes;
        let hours = Math.floor(minutesRemining / 60); // Вычисляем количество часов
        let minutes = minutesRemining % 60; // Вычисляем остаток минут

        countdownDisplay.innerHTML = `<span>${message}</span>${hours} ч ${minutes} мин`;

//        if (timeRemaining > 0) {
//        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
//        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
//        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

//        // Обновляем отображение только если минуты или секунды изменились
//        if (previousMinutes !== minutes || previousSeconds !== seconds) {
//            previousMinutes = minutes;
//            previousSeconds = seconds;
//            countdownDisplay.innerHTML = `<span>${message}</span>${hours} ч ${minutes} мин`;
//        }
//
//        // Переход к следующему этапу, если осталось 0 минут и 0 секунд
//        if (hours === 0 && minutes === 0 && seconds === 0) {
//            previousMinutes = null; // Сброс предыдущих минут для правильного обновления
//            previousSeconds = null; // Сброс предыдущих секунд для правильного обновления
//        }
//        } else {
//            countdownDisplay.textContent = '';
//        }

        // Используем requestAnimationFrame для более точного обновления времени
//        requestAnimationFrame(() => updateCountdown(flightDate, departureDate, wakeUpDate, sleepDate, roomExitDate, mode));
    };

    const calculateTimes = () => {
        const flightTime = flightTimeInput.value.replace(':', '');
        for (const radio of modeRadios) {
            if (radio.checked) {
                mode = radio.value;
                break;
            }
        }

        if (flightTime.length === 4) {
            outputGroup.style = '';
            modeGroup.style = '';
            sliderGroup.style = '';

            const flightHours = parseInt(flightTime.slice(0, 2), 10);
            const flightMinutes = parseInt(flightTime.slice(2), 10);

            const flightDate = new Date();
            flightDate.setDate(1);
            flightDate.setMonth(0);
            flightDate.setYear(2024);
            const now = new Date();
            now.setDate(1);
            now.setMonth(0);
            now.setYear(2024);

            flightDate.setHours(flightHours);
            flightDate.setMinutes(flightMinutes);

            if (flightDate <= now) {
                flightDate.setDate(flightDate.getDate() + 1);
            }

            let departureOffset = mode === 'home' ? -2.75 * 60 * 60 * 1000 : -2 * 60 * 60 * 1000;
            let roomExitOffset = 0;
            let wakeUpOffset = (-1.25 * 60 - 5) * 60 * 1000;

            if (mode === 'hotel') {
                wakeUpOffset = (-1 * 60 - 5) * 60 * 1000;
                roomExitOffset = -15 * 60 * 1000;
                roomExitTimeDisplay.style.display = '';
                roomExitTimeDisplayParagraph.style.display = '';
            } else {
                roomExitTimeDisplay.style.display = 'none';
                roomExitTimeDisplayParagraph.style.display = 'none';
            }

            let tempDepartureDate = null;
            let tempOldDepartureDate = null;

            if (localStorage.getItem('newDepartureTime')) {
                const newDepartureTimeRaw = localStorage.getItem('newDepartureTime');

                const newDepartureHours = parseInt(newDepartureTimeRaw.slice(0, 2), 10);
                const newDepartureMinutes = parseInt(newDepartureTimeRaw.slice(2), 10);

                tempDepartureDate = new Date();
                tempDepartureDate.setDate(1);
                tempDepartureDate.setMonth(0);
                tempDepartureDate.setYear(2024);
                tempDepartureDate.setHours(newDepartureHours);
                tempDepartureDate.setMinutes(newDepartureMinutes);

                tempOldDepartureDate = new Date(flightDate.getTime() + departureOffset);
                tempOldDepartureDate.setDate(1);
                tempOldDepartureDate.setMonth(0);
                tempOldDepartureDate.setYear(2024);
            } else {
                tempDepartureDate = new Date(flightDate.getTime() + departureOffset);
                tempDepartureDate.setDate(1);
                tempDepartureDate.setMonth(0);
                tempDepartureDate.setYear(2024);
            }

            const departureDate = tempDepartureDate;
            const oldDepartureDate = tempOldDepartureDate;

            const roomExitDate = new Date(departureDate.getTime() + roomExitOffset);
            roomExitDate.setDate(1);
            roomExitDate.setMonth(0);
            roomExitDate.setYear(2024);

            let tempWakeUpDate = null;
            let tempOldWakeUpDate = null;

            if (localStorage.getItem('newWakeUpTime')) {
                const newWakeUpTimeRaw = localStorage.getItem('newWakeUpTime');

                const newWakeUpHours = parseInt(newWakeUpTimeRaw.slice(0, 2), 10);
                const newWakeUpMinutes = parseInt(newWakeUpTimeRaw.slice(2), 10);

                tempWakeUpDate = new Date();
                tempWakeUpDate.setDate(1);
                tempWakeUpDate.setMonth(0);
                tempWakeUpDate.setYear(2024);
                tempWakeUpDate.setHours(newWakeUpHours);
                tempWakeUpDate.setMinutes(newWakeUpMinutes);

                tempOldWakeUpDate = new Date(roomExitDate.getTime() + wakeUpOffset);
                tempOldWakeUpDate.setDate(1);
                tempOldWakeUpDate.setMonth(0);
                tempOldWakeUpDate.setYear(2024);
            } else {
                tempWakeUpDate = new Date(roomExitDate.getTime() + wakeUpOffset);
                tempWakeUpDate.setDate(1);
                tempWakeUpDate.setMonth(0);
                tempWakeUpDate.setYear(2024);
            }

            const wakeUpDate = tempWakeUpDate;
            const oldWakeUpDate = tempOldWakeUpDate;

            departureTimeDisplay.textContent = `${String(departureDate.getHours()).padStart(2, '0')}:${String(departureDate.getMinutes()).padStart(2, '0')}`;
            if (oldDepartureDate) {
                oldDepartureTimeDisplay.textContent = `${String(oldDepartureDate.getHours()).padStart(2, '0')}:${String(oldDepartureDate.getMinutes()).padStart(2, '0')}`;
            } else {
                oldDepartureTimeDisplay.textContent = '';
            }

            roomExitTimeDisplay.textContent = `${String(roomExitDate.getHours()).padStart(2, '0')}:${String(roomExitDate.getMinutes()).padStart(2, '0')}`;

            wakeUpTimeDisplay.textContent = `${String(wakeUpDate.getHours()).padStart(2, '0')}:${String(wakeUpDate.getMinutes()).padStart(2, '0')}`;
            if (tempOldWakeUpDate) {
                oldWakeUpTimeDisplay.textContent =  `${String(oldWakeUpDate.getHours()).padStart(2, '0')}:${String(oldWakeUpDate.getMinutes()).padStart(2, '0')}`;
            } else {
                oldWakeUpTimeDisplay.textContent = '';
            }

            let sleepDate;
            if (parseFloat(sleepDurationSlider.value) > 0) {
                sleepDate = new Date(wakeUpDate);
                sleepDate.setHours(wakeUpDate.getHours() - Math.floor(parseFloat(sleepDurationSlider.value)));
                sleepDate.setMinutes(wakeUpDate.getMinutes() - (parseFloat(sleepDurationSlider.value) % 1) * 60);
                sleepDate.setDate(1);
                sleepDate.setMonth(0);
                sleepDate.setYear(2024);
                sleepTimeDisplay.textContent = `${String(sleepDate.getHours()).padStart(2, '0')}:${String(sleepDate.getMinutes()).padStart(2, '0')}`;
                sleepTimeContainer.style.display = 'block';
                wakeUpTimeEditor.style.display = 'block';
            } else {
                sleepTimeContainer.style.display = 'none';
                wakeUpTimeEditor.style.display = 'none';
            }

            function convertToMoscowTime(localTime) {
                // Форматируем время в московской временной зоне
                const moscowTime = new Intl.DateTimeFormat('ru-RU', {
                    timeZone: 'Europe/Moscow',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false, // Используем 24-часовой формат
                }).format(localTime);

                return moscowTime;
            }

            const moscowFlightDate = convertToMoscowTime(flightDate);
            // Разбиваем строку московского времени на компоненты
            const [datePart, timePart] = moscowFlightDate.split(', ');
            const [hours, minutes] = timePart.split(':');
            moscowFlightString = `${hours}:${minutes}`;

            // Обновляем текст метки времени полета
            if (flightDate.getHours() == hours) {
                flightTimeLabel.innerHTML = `Вылет: ${String(flightDate.getHours()).padStart(2, '0')}:${String(flightDate.getMinutes()).padStart(2, '0')} (✅ МСК: ${hours}:${minutes})`;
            } else {
                flightTimeLabel.innerHTML = `Вылет: ${String(flightDate.getHours()).padStart(2, '0')}:${String(flightDate.getMinutes()).padStart(2, '0')} (⚠️ <b>МСК: ${hours}:${minutes}</b>)`;
            }
            updateCountdown(flightDate, departureDate, wakeUpDate, sleepDate, roomExitDate, mode);
            setFlightInfo();
        } else {
            outputGroup.style.display = 'none';
            modeGroup.style.display = 'none';
            sliderGroup.style.display = 'none';

            departureTimeDisplay.textContent = '00:00';
            oldDepartureTimeDisplay.textContent = '';
            roomExitTimeDisplay.textContent = '00:00';
            wakeUpTimeDisplay.textContent = '00:00';
            sleepTimeContainer.style.display = 'none';
            countdownDisplay.textContent = 'Укажите время вылета';
            flightTimeLabel.textContent = 'Время вылета';
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

            if (flightTimeInputLast != value) {
                if (flightTimeInputLast !== null) {
                    localStorage.removeItem('newDepartureTime');
                    localStorage.removeItem('newWakeUpTime');
                }
                flightTimeInputLast = value;
            }

            const hours = value.slice(0, 2);
            const minutes = value.slice(2);
            if (parseInt(hours, 10) >= 24) {
                value = '00' + minutes;
            }
            if (parseInt(minutes[0], 10) > 5) {
                value = hours + '59';
            }
            event.target.value = `${value.slice(0, 2)}${value.slice(2)}`;
            updateCountdown();
        } else {
            event.target.value = value;
        }
        localStorage.setItem('flightTime', event.target.value.replace(':', ''));
        calculateTimes();
    });

    sleepDurationSlider.addEventListener('input', (event) => {
        touchStartY = 0;
        sleepValueDisplay.textContent = event.target.value;
        localStorage.setItem('sleepDuration', event.target.value);
        updateCountdown();
        calculateTimes();
    });

    for (const radio of modeRadios) {
        radio.addEventListener('change', (event) => {
            localStorage.setItem('mode', event.target.value);
            titleStatusDisplay.textContent = 'Расчёт времени ' + (event.target.value === 'home' ? '🏘' : '🏨');
            updateCountdown();
            calculateTimes();
        });
    }

    if (localStorage.getItem('mode')) {
        const savedMode = localStorage.getItem('mode');
        for (const radio of modeRadios) {
            if (radio.value === savedMode) {
                radio.checked = true;
                titleStatusDisplay.textContent = 'Расчёт времени ' + (savedMode === 'home' ? '🏘' : '🏨');
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

    // Ограничение ввода только цифрами и проверка номера рейса
    flightNumberInput.addEventListener('input', (event) => {
        // Удаляем все нецифровые символы
        event.target.value = event.target.value.replace(/\D/g, '');
        setFlightInfo();
        localStorage.setItem('flightNumber', event.target.value);
    });

    if (localStorage.getItem('flightNumber')) {
        flightNumberInput.value = localStorage.getItem('flightNumber');
    }

    updateTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);

    updateCountdown();
    calculateTimes();
    setInterval(calculateTimes, 5000);
});

// Логика для кнопки обновления
document.getElementById('refresh-button').addEventListener('click', function() {
    // Попытка получить страницу с интернета, игнорируя кэш
    fetch(window.location.href, { cache: "no-store" })
        .then(function(response) {
            if (response.ok) {
                // Если запрос успешен, перезагружаем страницу для обновления контента
                updatePage();
            } else {
                // Если ответ не ок, показываем уведомление об отсутствии интернета
                showNoInternetNotification();
            }
        })
        .catch(function(error) {
            // Если произошла ошибка (например, нет интернета), показываем уведомление
            showNoInternetNotification();
        });
});

function showNoInternetNotification() {
    const notification = document.getElementById('no-internet-notification');
    notification.style.display = 'block';
    // Скрываем уведомление через несколько секунд
    setTimeout(function() {
        notification.style.display = 'none';
    }, 3000);
}
