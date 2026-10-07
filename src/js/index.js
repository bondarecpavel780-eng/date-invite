import '../css/main.css';
import '../css/animations.css';
import '../css/components.css';

import { appState } from './state.js';
import { showScreen, initDateConstraints } from './ui.js';
import { sendToTelegram } from './telegram.js';

let noClickCount = 0; // Лічильник натискань на "Ні"

const initApp = () => {
    // Ініціалізуємо календар (ставимо сьогоднішню дату)
    initDateConstraints();

    // --- ЕКРАН 0: Вступ ---
    document.getElementById('btn-start').addEventListener('click', () => {
        showScreen('step-1');
    });

    // --- ЕКРАН 1: Головне питання ---
    const btnYes = document.getElementById('btn-yes');
    const btnNo = document.getElementById('btn-no');

    let noClickCount = 0;

    // Твої варіанти тексту
    const texts = [
        "Так!",
        "Ай ай ай",
        "Ти впевнена?",
        "Може все ж Так?",
        "Хтось любить бавитись)",
        "Я буду стояти на своєму)",
        "Так, піду"
    ];

    // Динамічно вираховуємо границю росту (довжина масиву мінус 1)
    const maxGrowthClicks = texts.length - 1;

    // Початкові значення розмірів для кнопки "Так"
    let yesFontSize = 1.5; // в rem
    let yesPaddingY = 16;  // в px
    let yesPaddingX = 36;  // в px

    btnYes.addEventListener('click', () => {
        appState.agreed = true;
        btnNo.style.display = 'none';
        showScreen('step-2');
    });

    btnNo.addEventListener('click', () => {
        noClickCount++;

        if (noClickCount <= maxGrowthClicks) {
            // 1. Збільшуємо кнопку "Так" і міняємо текст
            yesFontSize += 0.8;
            yesPaddingY += 14;
            yesPaddingX += 24;

            btnYes.style.fontSize = `${yesFontSize}rem`;
            btnYes.style.padding = `${yesPaddingY}px ${yesPaddingX}px`;
            btnYes.innerText = texts[noClickCount];

        } else if (noClickCount < 15) {
            // Переносим кнопку в корень документа, чтобы на нее не влияли стили карточки
            if (btnNo.parentElement !== document.body) {
                document.body.appendChild(btnNo);
            }

            btnNo.classList.add('runaway');

            // Безпечна зона у пікселях, щоб кнопка не торкалася самих країв екрану
            const safeZone = 20;

            // Вираховуємо межі: розмір вікна мінус розмір кнопки мінус безпечна зона
            const maxX = window.innerWidth - btnNo.offsetWidth - safeZone;
            const maxY = window.innerHeight - btnNo.offsetHeight - safeZone;

            // Генеруємо випадкові координати в межах видимої зони
            const randomX = Math.max(safeZone, Math.floor(Math.random() * maxX));
            const randomY = Math.max(safeZone, Math.floor(Math.random() * maxY));

            btnNo.style.left = `${randomX}px`;
            btnNo.style.top = `${randomY}px`;

        } else {
            // 3. На 12-й клік кнопка "Ні" остаточно зникає
            btnNo.style.display = 'none';
        }
    });

    // --- ЕКРАН 2: Вибір категорії ---
    const categoryBtns = document.querySelectorAll('.category-btn');

    const walkModal = document.getElementById('walk-modal');
    const walkInput = document.getElementById('walk-input');
    const btnContinueWalk = document.getElementById('btn-continue-walk');
    const btnSkipWalk = document.getElementById('btn-skip-walk');

    const continueWalkChoice = () => {
        const walkPlace = walkInput.value.trim();
        appState.category = 'walk';
        appState.subChoice = walkPlace ? `Куди бажаєш: ${walkPlace}` : 'Просто гуляємо 🌳';
        walkModal.classList.add('hidden');
        walkModal.setAttribute('aria-hidden', 'true');
        walkInput.value = '';
        showScreen('step-4');
    };

    if (walkModal && walkInput && btnContinueWalk && btnSkipWalk) {
        walkModal.addEventListener('click', (e) => {
            if (e.target === walkModal) {
                walkModal.classList.add('hidden');
                walkModal.setAttribute('aria-hidden', 'true');
            }
        });

        btnContinueWalk.addEventListener('click', continueWalkChoice);
        btnSkipWalk.addEventListener('click', continueWalkChoice);
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Знаходимо саму кнопку, навіть якщо клікнули на емодзі всередині
            const targetBtn = e.target.closest('.category-btn');
            if (!targetBtn) return;

            const category = targetBtn.dataset.category;
            appState.category = category;

            // Перенаправляємо на відповідний екран залежно від вибору
            if (category === 'walk') {
                walkModal.classList.remove('hidden');
                walkModal.setAttribute('aria-hidden', 'false');
                walkInput.focus();
            } else if (category === 'movie') {
                showScreen('step-3-movie');
            } else if (category === 'food') {
                showScreen('step-3-food');
            } else if (category === 'home') {
                showScreen('step-3-home');
            } else if (category === 'custom') {
                showScreen('step-3-custom');
            }
        });
    });

    // --- ЕКРАН 3A: Кіно ---
    const movieInput = document.getElementById('movie-input');
    const btnNextMovie = document.getElementById('btn-next-movie');

    movieInput.addEventListener('input', (e) => {
        // Розблоковуємо кнопку, якщо щось введено
        if (e.target.value.trim().length > 0) {
            btnNextMovie.classList.remove('disabled');
        } else {
            btnNextMovie.classList.add('disabled');
        }
    });

    btnNextMovie.addEventListener('click', () => {
        appState.subChoice = movieInput.value;
        showScreen('step-4');
    });
    // --- ЕКРАН 3B: Їжа ---
    const foodBtns = document.querySelectorAll('.food-btn');
    const foodInput = document.getElementById('food-input');
    const btnNextFood = document.getElementById('btn-next-food');

    // Вибір швидких варіантів (Мак, Суші, Піца)
    foodBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            foodBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');

            foodInput.value = '';
            appState.subChoice = e.target.dataset.food;
            btnNextFood.classList.remove('disabled');
        });
    });

    // Якщо вона вводить свій варіант їжі
    foodInput.addEventListener('input', (e) => {
        foodBtns.forEach(b => b.classList.remove('selected'));

        if (e.target.value.trim().length > 0) {
            appState.subChoice = e.target.value;
            btnNextFood.classList.remove('disabled');
        } else {
            btnNextFood.classList.add('disabled');
        }
    });

    btnNextFood.addEventListener('click', () => {
        showScreen('step-4');
    });
    // --- ЕКРАН 3C: Вдома ---
    const homeBtns = document.querySelectorAll('.home-btn');
    const homeInput = document.getElementById('home-input');
    const btnNextHome = document.getElementById('btn-next-home');

    // Вибір плиток (У мене / У тебе)
    homeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            homeBtns.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');

            appState.subChoice = e.target.dataset.home;
            btnNextHome.classList.remove('disabled');
        });
    });

    // Якщо вона вводить свій варіант вдома (якщо є таке поле)
    if (homeInput) {
        homeInput.addEventListener('input', (e) => {
            homeBtns.forEach(b => b.classList.remove('selected')); // скидаємо кнопки

            if (e.target.value.trim().length > 0) {
                appState.subChoice = e.target.value;
                btnNextHome.classList.remove('disabled');
            } else {
                btnNextHome.classList.add('disabled');
            }
        });
    }

    // ТЕ САМЕ ПРОПУЩЕНЕ МІСЦЕ: Перехід на наступний екран
    btnNextHome.addEventListener('click', () => {
        const comment = document.getElementById('home-comment').value.trim();
        if (comment) {
            appState.subChoice += ` (Коментар: ${comment})`;
        }
        showScreen('step-4');
    });

    // --- ЕКРАН 3D: Твій варіант ---
    const customInput = document.getElementById('custom-input');
    const btnNextCustom = document.getElementById('btn-next-custom');

    if (customInput && btnNextCustom) {
        customInput.addEventListener('input', (e) => {
            if (e.target.value.trim().length > 0) {
                appState.subChoice = e.target.value;
                btnNextCustom.classList.remove('disabled');
            } else {
                btnNextCustom.classList.add('disabled');
            }
        });

        btnNextCustom.addEventListener('click', () => {
            showScreen('step-4');
        });
    }

    // --- ЕКРАН 4: Дата та час ---
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const btnFinish = document.getElementById('btn-finish');

    const checkDateTime = () => {
        if (dateInput.value && timeInput.value) {
            // Збираємо обрану дату та час в один об'єкт Date
            const now = new Date();
            const selectedDate = new Date(`${dateInput.value}T${timeInput.value}`);

            // Якщо обраний час вже в минулому — блокуємо кнопку
            if (selectedDate > now) {
                btnFinish.classList.remove('disabled');
            } else {
                btnFinish.classList.add('disabled');
            }
        } else {
            btnFinish.classList.add('disabled');
        }
    };

    const backBtns = document.querySelectorAll('.back-btn');

    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {

            const targetScreenId = e.currentTarget.getAttribute('data-target');
            appState.category = '';
            appState.subChoice = '';
            showScreen(targetScreenId);
        });
    });

    // Обмежуємо вибір часу в UI, якщо обрано сьогоднішній день
    dateInput.addEventListener('change', () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const formattedToday = `${yyyy}-${mm}-${dd}`;

        if (dateInput.value === formattedToday) {
            const currentHours = String(today.getHours()).padStart(2, '0');
            const currentMinutes = String(today.getMinutes()).padStart(2, '0');
            timeInput.min = `${currentHours}:${currentMinutes}`;
        } else {
            timeInput.removeAttribute('min'); // Якщо майбутній день — обмежень немає
        }
        checkDateTime();
    });

    timeInput.addEventListener('change', checkDateTime);
    timeInput.addEventListener('input', checkDateTime); // Додатковий слухач для моментальної реакції

    btnFinish.addEventListener('click', () => {
        appState.date = dateInput.value;
        appState.time = timeInput.value;

        // Форматуємо дату (з 2026-10-07 робимо 07.10.2026)
        const formattedDate = appState.date.split('-').reverse().join('.');

        // Виводимо текст на фінальний екран
        const finalDatetimeEl = document.getElementById('final-datetime');
        if (finalDatetimeEl) {
            finalDatetimeEl.innerText = `Зустрічаємось ${formattedDate} о ${appState.time} 🕒`;
        }

        // Відправляємо дані в ТГ
        sendToTelegram(appState);

        showScreen('step-5');
    });
};

document.addEventListener('DOMContentLoaded', initApp);