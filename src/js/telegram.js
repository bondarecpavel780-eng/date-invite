// Підставляємо свої дані
const BOT_TOKEN = '8971563687:AAFqPDjf_djUnIsKvFpkRzh-gGElaZ81fkE';
const CHAT_ID = '1074955637';

export const sendToTelegram = async (appState) => {
    // Формуємо красиве повідомлення
    const message = `
🎉 Нове побачення!
Категорія: ${appState.category}
Вибір: ${appState.subChoice || 'Не вказано'}
Дата: ${appState.date}
Час: ${appState.time}
    `;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message
            })
        });

        if (response.ok) {
            console.log('Успішно відправлено в Telegram!');
        } else {
            console.error('Помилка відправки');
        }
    } catch (error) {
        console.error('Помилка мережі:', error);
    }
};