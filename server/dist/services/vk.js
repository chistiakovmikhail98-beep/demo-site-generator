// Сервис для парсинга групп ВКонтакте
const VK_API_VERSION = '5.199';
// Извлекаем screen_name из ссылки ВК
function extractGroupId(url) {
    // Поддерживаем форматы:
    // https://vk.com/groupname или https://vk.ru/groupname
    // https://vk.com/public123456 или https://vk.ru/public123456
    // https://vk.com/club123456 или https://vk.ru/club123456
    // vk.com/groupname или vk.ru/groupname
    const patterns = [
        /vk\.(?:com|ru)\/([a-zA-Z0-9_]+)/,
        /vk\.(?:com|ru)\/public(\d+)/,
        /vk\.(?:com|ru)\/club(\d+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}
// Парсинг группы ВК
export async function parseVKGroup(url) {
    const VK_SERVICE_KEY = process.env.VK_SERVICE_KEY;
    if (!VK_SERVICE_KEY) {
        throw new Error('VK_SERVICE_KEY не установлен. Добавьте его в переменные окружения.');
    }
    const groupId = extractGroupId(url);
    if (!groupId) {
        throw new Error('Неверная ссылка на группу ВК');
    }
    console.log(`🔍 Парсинг группы ВК: ${groupId}`);
    // Получаем информацию о группе (включая аватарку)
    const groupResponse = await fetch(`https://api.vk.com/method/groups.getById?` +
        `group_id=${groupId}&` +
        `fields=description,site,contacts,addresses,phone,photo_200,photo_max_orig&` +
        `access_token=${VK_SERVICE_KEY}&` +
        `v=${VK_API_VERSION}`);
    const groupData = await groupResponse.json();
    if (groupData.error) {
        throw new Error(`VK API Error: ${groupData.error.error_msg}`);
    }
    const group = groupData.response.groups?.[0] || groupData.response?.[0];
    if (!group) {
        throw new Error('Группа не найдена');
    }
    // Посты НЕ парсим — только основная информация о группе
    // Собираем контакты
    const contacts = {
        vk: `https://vk.com/${group.screen_name}`,
    };
    if (group.site)
        contacts.site = group.site;
    if (group.phone)
        contacts.phone = group.phone;
    // Из addresses
    if (group.addresses?.main_address) {
        const addr = group.addresses.main_address;
        contacts.address = addr.city?.title
            ? `${addr.city.title}, ${addr.address}`
            : addr.address;
    }
    // Собираем контакты админов
    const admins = [];
    // Из contacts группы
    if (group.contacts?.length) {
        // Собираем user_ids для получения имён
        const userIds = group.contacts
            .filter(c => c.user_id)
            .map(c => c.user_id);
        // Получаем имена пользователей
        let userNames = {};
        if (userIds.length > 0) {
            try {
                const usersResponse = await fetch(`https://api.vk.com/method/users.get?` +
                    `user_ids=${userIds.join(',')}&` +
                    `access_token=${VK_SERVICE_KEY}&` +
                    `v=${VK_API_VERSION}`);
                const usersData = await usersResponse.json();
                if (usersData.response) {
                    for (const user of usersData.response) {
                        userNames[user.id] = `${user.first_name} ${user.last_name}`;
                    }
                }
            }
            catch (e) {
                console.log('⚠️ Не удалось получить имена админов');
            }
        }
        for (const contact of group.contacts) {
            // Общие контакты студии
            if (contact.phone && !contacts.phone)
                contacts.phone = contact.phone;
            if (contact.email && !contacts.email)
                contacts.email = contact.email;
            // Админ
            const admin = {
                role: contact.desc || 'Контакт',
                phone: contact.phone,
                email: contact.email,
            };
            if (contact.user_id) {
                admin.vkId = contact.user_id;
                admin.vkUrl = `https://vk.com/id${contact.user_id}`;
                admin.name = userNames[contact.user_id];
            }
            // Добавляем только если есть хоть какая-то инфа
            if (admin.name || admin.phone || admin.email || admin.vkUrl) {
                admins.push(admin);
            }
        }
    }
    console.log(`👥 Найдено ${admins.length} контактов админов`);
    // Собираем всё в один текст для AI
    const rawTextParts = [];
    rawTextParts.push(`Название: ${group.name}`);
    if (group.description) {
        rawTextParts.push(`\nОписание:\n${group.description}`);
    }
    rawTextParts.push(`\nКонтакты:`);
    if (contacts.phone)
        rawTextParts.push(`Телефон: ${contacts.phone}`);
    if (contacts.email)
        rawTextParts.push(`Email: ${contacts.email}`);
    if (contacts.address)
        rawTextParts.push(`Адрес: ${contacts.address}`);
    if (contacts.site)
        rawTextParts.push(`Сайт: ${contacts.site}`);
    rawTextParts.push(`ВКонтакте: ${contacts.vk}`);
    // Получаем аватарку (приоритет: максимальное разрешение > 200px)
    const avatarUrl = group.photo_max_orig || group.photo_200 || group.photo_100;
    const result = {
        name: group.name,
        description: group.description || '',
        contacts,
        admins,
        posts: [], // Посты не парсим
        rawText: rawTextParts.join('\n'),
        avatarUrl, // URL аватарки для логотипа
    };
    console.log(`✅ Получено: ${group.name} (${admins.length} админов, аватарка: ${avatarUrl ? 'да' : 'нет'})`);
    return result;
}
