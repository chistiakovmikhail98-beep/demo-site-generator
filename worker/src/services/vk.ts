// VK group parsing service

const VK_API_VERSION = '5.131';

export interface ParsedVKData {
  name: string;
  description: string;
  contacts: {
    phone?: string;
    email?: string;
    site?: string;
    address?: string;
    vk?: string;
  };
  admins: AdminContact[];
  posts: string[];
  rawText: string;
  avatarUrl?: string;
}

export interface AdminContact {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  vkId?: number;
  vkUrl?: string;
}

export interface VKPhoto {
  id: number;
  url: string;
  width: number;
  height: number;
  text?: string;
}

function extractGroupId(url: string): string | null {
  const patterns = [
    /vk\.(?:com|ru)\/([a-zA-Z0-9_.]+)/,
    /vk\.(?:com|ru)\/public(\d+)/,
    /vk\.(?:com|ru)\/club(\d+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function parseVKGroup(url: string): Promise<ParsedVKData> {
  const VK_SERVICE_KEY = process.env.VK_SERVICE_KEY;
  if (!VK_SERVICE_KEY) throw new Error('VK_SERVICE_KEY не установлен');

  const groupId = extractGroupId(url);
  if (!groupId) throw new Error('Неверная ссылка на группу ВК');

  console.log(`🔍 Парсинг группы ВК: ${groupId}`);

  const groupResponse = await fetch(
    `https://api.vk.com/method/groups.getById?group_id=${groupId}&fields=description,site,contacts,addresses,phone,photo_200,photo_max_orig&access_token=${VK_SERVICE_KEY}&v=${VK_API_VERSION}`
  );
  const groupData = await groupResponse.json();
  if (groupData.error) throw new Error(`VK API Error: ${groupData.error.error_msg}`);

  const group = groupData.response.groups?.[0] || groupData.response?.[0];
  if (!group) throw new Error('Группа не найдена');

  // Wall posts
  let posts: string[] = [];
  try {
    const wallResponse = await fetch(
      `https://api.vk.com/method/wall.get?owner_id=-${group.id}&count=10&access_token=${VK_SERVICE_KEY}&v=${VK_API_VERSION}`
    );
    const wallData = await wallResponse.json();
    if (wallData.response?.items) {
      posts = wallData.response.items
        .map((p: any) => p.text)
        .filter((t: string) => t && t.length > 20)
        .slice(0, 10);
    }
  } catch (e) {
    console.log('⚠️ Не удалось получить посты:', e);
  }

  // Contacts
  const contacts: ParsedVKData['contacts'] = { vk: `https://vk.com/${group.screen_name}` };
  if (group.site) contacts.site = group.site;
  if (group.phone) contacts.phone = group.phone;
  if (group.addresses?.main_address) {
    const addr = group.addresses.main_address;
    contacts.address = addr.city?.title ? `${addr.city.title}, ${addr.address}` : addr.address;
  }

  // Admin contacts
  const admins: AdminContact[] = [];
  if (group.contacts?.length) {
    const userIds = group.contacts.filter((c: any) => c.user_id).map((c: any) => c.user_id);
    let userNames: Record<number, string> = {};
    if (userIds.length > 0) {
      try {
        const usersResponse = await fetch(
          `https://api.vk.com/method/users.get?user_ids=${userIds.join(',')}&access_token=${VK_SERVICE_KEY}&v=${VK_API_VERSION}`
        );
        const usersData = await usersResponse.json();
        if (usersData.response) {
          for (const user of usersData.response) {
            userNames[user.id] = `${user.first_name} ${user.last_name}`;
          }
        }
      } catch {}
    }

    for (const contact of group.contacts) {
      if (contact.phone && !contacts.phone) contacts.phone = contact.phone;
      if (contact.email && !contacts.email) contacts.email = contact.email;

      const admin: AdminContact = {
        role: contact.desc || 'Контакт',
        phone: contact.phone,
        email: contact.email,
      };
      if (contact.user_id) {
        admin.vkId = contact.user_id;
        admin.vkUrl = `https://vk.com/id${contact.user_id}`;
        admin.name = userNames[contact.user_id];
      }
      if (admin.name || admin.phone || admin.email || admin.vkUrl) {
        admins.push(admin);
      }
    }
  }

  // Build raw text for AI
  const rawTextParts: string[] = [`Название: ${group.name}`];
  if (group.description) rawTextParts.push(`\nОписание:\n${group.description}`);
  rawTextParts.push(`\nКонтакты:`);
  if (contacts.phone) rawTextParts.push(`Телефон: ${contacts.phone}`);
  if (contacts.email) rawTextParts.push(`Email: ${contacts.email}`);
  if (contacts.address) rawTextParts.push(`Адрес: ${contacts.address}`);
  if (contacts.site) rawTextParts.push(`Сайт: ${contacts.site}`);
  rawTextParts.push(`ВКонтакте: ${contacts.vk}`);

  if (posts.length > 0) {
    rawTextParts.push(`\n\nПоследние посты:`);
    posts.forEach((post, i) => rawTextParts.push(`\n--- Пост ${i + 1} ---\n${post}`));
  }

  const avatarUrl = group.photo_max_orig || group.photo_200 || group.photo_100;

  console.log(`✅ Получено: ${group.name} (${admins.length} админов, ${posts.length} постов)`);

  return {
    name: group.name,
    description: group.description || '',
    contacts,
    admins,
    posts,
    rawText: rawTextParts.join('\n'),
    avatarUrl,
  };
}

export async function parseVKPhotos(url: string, limit: number = 50): Promise<VKPhoto[]> {
  const VK_SERVICE_KEY = process.env.VK_SERVICE_KEY;
  if (!VK_SERVICE_KEY) throw new Error('VK_SERVICE_KEY не установлен');

  const groupId = extractGroupId(url);
  if (!groupId) throw new Error('Неверная ссылка на группу ВК');

  console.log(`📸 Парсинг фото группы ВК: ${groupId}`);

  // Get numeric group ID
  const groupResponse = await fetch(
    `https://api.vk.com/method/groups.getById?group_id=${groupId}&access_token=${VK_SERVICE_KEY}&v=${VK_API_VERSION}`
  );
  const groupData = await groupResponse.json();
  if (groupData.error) throw new Error(`VK API Error: ${groupData.error.error_msg}`);
  const group = groupData.response.groups?.[0] || groupData.response?.[0];
  if (!group) throw new Error('Группа не найдена');

  // Try photos.getAll first
  const photosResponse = await fetch(
    `https://api.vk.com/method/photos.getAll?owner_id=-${group.id}&count=${Math.min(limit, 200)}&photo_sizes=1&skip_hidden=1&access_token=${VK_SERVICE_KEY}&v=${VK_API_VERSION}`
  );
  const photosData = await photosResponse.json();

  if (photosData.error) {
    console.log(`⚠️ photos.getAll failed, trying wall...`);
    return parseWallPhotos(group.id, limit, VK_SERVICE_KEY);
  }

  const photos: VKPhoto[] = [];
  for (const photo of photosData.response.items || []) {
    const sizes = photo.sizes || [];
    const maxSize = sizes.reduce((max: any, size: any) =>
      (!max || size.width * size.height > max.width * max.height) ? size : max, null
    );
    if (maxSize) {
      photos.push({ id: photo.id, url: maxSize.url, width: maxSize.width, height: maxSize.height, text: photo.text || undefined });
    }
  }

  console.log(`📸 Получено ${photos.length} фото`);
  return photos;
}

async function parseWallPhotos(groupId: number, limit: number, token: string): Promise<VKPhoto[]> {
  const wallResponse = await fetch(
    `https://api.vk.com/method/wall.get?owner_id=-${groupId}&count=${Math.min(limit * 2, 100)}&access_token=${token}&v=${VK_API_VERSION}`
  );
  const wallData = await wallResponse.json();
  if (wallData.error) return [];

  const photos: VKPhoto[] = [];
  for (const post of wallData.response.items || []) {
    for (const attachment of post.attachments || []) {
      if (attachment.type === 'photo' && photos.length < limit) {
        const photo = attachment.photo;
        const sizes = photo.sizes || [];
        const maxSize = sizes.reduce((max: any, size: any) =>
          (!max || size.width * size.height > max.width * max.height) ? size : max, null
        );
        if (maxSize) {
          photos.push({ id: photo.id, url: maxSize.url, width: maxSize.width, height: maxSize.height, text: photo.text || post.text?.slice(0, 100) || undefined });
        }
      }
    }
  }

  console.log(`📰 Получено ${photos.length} фото со стены`);
  return photos;
}
