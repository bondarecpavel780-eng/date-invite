export const showScreen = (screenId) => {
    const currentScreen = document.querySelector('.screen.active');
    const targetScreen = document.getElementById(screenId);

    if (!targetScreen) return;

    if (currentScreen) {
        // 1. Старый экран начинает плавно исчезать
        currentScreen.classList.remove('active');
        currentScreen.classList.add('fade-out');
        
        // 2. СРАЗУ ЖЕ готовим новый экран к появлению (он появится прямо поверх старого)
        targetScreen.classList.remove('hidden');
        
        // 3. Запускаем красивую анимацию появления нового экрана
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                targetScreen.classList.add('active');
            });
        });
        
        // 4. Окончательно прячем старый экран только через 300мс (когда он станет невидимым)
        setTimeout(() => {
            currentScreen.classList.add('hidden');
            currentScreen.classList.remove('fade-out');
        }, 300); 
    } else {
        // Для самого первого экрана при загрузке
        targetScreen.classList.remove('hidden');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                targetScreen.classList.add('active');
            });
        });
    }
};

export const initDateConstraints = () => {
    const dateInput = document.getElementById('date-input');
    if (!dateInput) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    
    dateInput.value = formattedToday;
    dateInput.min = formattedToday;
};