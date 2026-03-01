// Сервис для парсинга групп ВКонтакте
const VK_API_VERSION = '5.199';
// Извлекаем screen_name из ссылки ВК
function extractGroupId(url) {
    // Поддерживаем форматы:
    // https://vk.com/groupname или https://vk.ru/groupname
    // https://vk.com/public123456 или https://vk.ru/public123456
    // https://vk.com/club123456 или https://vk.ru/club123456
    // vk.com/groupname или vk.ru/groupname
    // Также поддерживаем точки в screen_name (например endorphin.achinsk)
    const patterns = [
        /vk\.(?:com|ru)\/([a-zA-Z0-9_.]+)/,
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
    // Получаем последние 10 постов для анализа (там может быть расписание)
    let posts = [];
    try {
        const wallResponse = await fetch(`https://api.vk.com/method/wall.get?` +
            `owner_id=-${group.id}&` +
            `count=10&` +
            `access_token=${VK_SERVICE_KEY}&` +
            `v=${VK_API_VERSION}`);
        const wallData = await wallResponse.json();
        if (wallData.response?.items) {
            posts = wallData.response.items
                .map((post) => post.text)
                .filter((text) => text && text.length > 20) // Только посты с текстом
                .slice(0, 10);
            console.log(`📝 Получено ${posts.length} постов со стены`);
        }
    }
    catch (e) {
        console.log('⚠️ Не удалось получить посты:', e);
    }
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
    // Добавляем посты (там может быть расписание, цены, акции)
    if (posts.length > 0) {
        rawTextParts.push(`\n\nПоследние посты (могут содержать расписание, цены, акции):`);
        posts.forEach((post, i) => {
            rawTextParts.push(`\n--- Пост ${i + 1} ---\n${post}`);
        });
    }
    // Получаем аватарку (приоритет: максимальное разрешение > 200px)
    const avatarUrl = group.photo_max_orig || group.photo_200 || group.photo_100;
    const result = {
        name: group.name,
        description: group.description || '',
        contacts,
        admins,
        posts,
        rawText: rawTextParts.join('\n'),
        avatarUrl, // URL аватарки для логотипа
    };
    console.log(`✅ Получено: ${group.name} (${admins.length} админов, ${posts.length} постов, аватарка: ${avatarUrl ? 'да' : 'нет'})`);
    return result;
}
// Парсинг фотографий из галереи группы ВК
export async function parseVKPhotos(url, limit = 50) {
    const VK_SERVICE_KEY = process.env.VK_SERVICE_KEY;
    if (!VK_SERVICE_KEY) {
        throw new Error('VK_SERVICE_KEY не установлен');
    }
    const groupId = extractGroupId(url);
    if (!groupId) {
        throw new Error('Неверная ссылка на группу ВК');
    }
    console.log(`📸 Парсинг фото группы ВК: ${groupId} (лимит: ${limit})`);
    // Сначала получаем числовой ID группы
    const groupResponse = await fetch(`https://api.vk.com/method/groups.getById?` +
        `group_id=${groupId}&` +
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
    const numericGroupId = group.id;
    // Получаем все фото группы (photos.getAll)
    const photosResponse = await fetch(`https://api.vk.com/method/photos.getAll?` +
        `owner_id=-${numericGroupId}&` + // Минус для группы
        `count=${Math.min(limit, 200)}&` + // VK max 200 за запрос
        `photo_sizes=1&` + // Получить все размеры
        `skip_hidden=1&` + // Пропустить скрытые
        `access_token=${VK_SERVICE_KEY}&` +
        `v=${VK_API_VERSION}`);
    const photosData = await photosResponse.json();
    if (photosData.error) {
        console.log(`⚠️ Ошибка photos.getAll: ${photosData.error.error_msg}`);
        // Пробуем альтернативный метод - фото со стены
        return await parseWallPhotos(numericGroupId, limit, VK_SERVICE_KEY);
    }
    const photos = [];
    for (const photo of photosData.response.items || []) {
        // Находим максимальный размер
        const sizes = photo.sizes || [];
        const maxSize = sizes.reduce((max, size) => {
            if (!max || (size.width * size.height > max.width * max.height)) {
                return size;
            }
            return max;
        }, null);
        if (maxSize) {
            photos.push({
                id: photo.id,
                url: maxSize.url,
                width: maxSize.width,
                height: maxSize.height,
                text: photo.text || undefined,
            });
        }
    }
    console.log(`📸 Получено ${photos.length} фото из альбомов`);
    return photos;
}
// Альтернативный метод - фото со стены группы
async function parseWallPhotos(groupId, limit, token) {
    console.log(`📰 Пробуем получить фото со стены...`);
    const wallResponse = await fetch(`https://api.vk.com/method/wall.get?` +
        `owner_id=-${groupId}&` +
        `count=${Math.min(limit * 2, 100)}&` + // Берём больше постов
        `access_token=${token}&` +
        `v=${VK_API_VERSION}`);
    const wallData = await wallResponse.json();
    if (wallData.error) {
        console.log(`⚠️ Ошибка wall.get: ${wallData.error.error_msg}`);
        return [];
    }
    const photos = [];
    for (const post of wallData.response.items || []) {
        // Ищем фото в аттачментах
        for (const attachment of post.attachments || []) {
            if (attachment.type === 'photo' && photos.length < limit) {
                const photo = attachment.photo;
                const sizes = photo.sizes || [];
                const maxSize = sizes.reduce((max, size) => {
                    if (!max || (size.width * size.height > max.width * max.height)) {
                        return size;
                    }
                    return max;
                }, null);
                if (maxSize) {
                    photos.push({
                        id: photo.id,
                        url: maxSize.url,
                        width: maxSize.width,
                        height: maxSize.height,
                        text: photo.text || post.text?.slice(0, 100) || undefined,
                    });
                }
            }
        }
    }
    console.log(`📰 Получено ${photos.length} фото со стены`);
    return photos;
}
