# StorageService — тести

## storage.service.spec.ts

Тестує `StorageService` — завантаження та видалення файлів через Cloudinary.

**`saveAvatar`**

- TC-CORE-U-010 — завантажує валідне зображення, повертає URL
- TC-CORE-U-011 — кидає BadRequestException для недопустимого MIME-типу
- TC-CORE-U-012 — кидає BadRequestException при перевищенні 5 MB

**`saveContentImage`**

- TC-CORE-U-013 — завантажує контент-зображення, повертає URL

**`removeAvatarFiles`**

- TC-CORE-U-014 — викликає cloudinary.destroy з правильним public_id
- TC-CORE-U-015 — не кидає виняток при збої Cloudinary
