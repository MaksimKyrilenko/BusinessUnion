<template>
  <div class="edit-profile">
    <div v-if="isLoading" class="loading">
      Загрузка профиля...
    </div>
    <div v-else class="profile-content">
      <div class="profile-header">
        <h1>Редактирование профиля</h1>
        <div class="header-actions">
          <router-link to="/profile" class="btn btn-outline">Отмена</router-link>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="profile-form">
        <div class="form-section">
          <h2>Основная информация</h2>
          <div class="avatar-section">
            <div class="avatar-preview" :style="{ backgroundImage: profileData.avatar ? `url(${profileData.avatar})` : 'none' }">
              <div v-if="!profileData.avatar" class="avatar-placeholder">
                {{ getUserInitials() }}
              </div>
            </div>
            <div class="avatar-actions">
              <label class="btn btn-outline btn-sm">
                Загрузить фото
                <input type="file" accept="image/*" @change="handleAvatarChange" hidden />
              </label>
              <button v-if="profileData.avatar" type="button" class="btn btn-danger btn-sm" @click="removeAvatar">
                Удалить
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="firstName">Имя</label>
            <input
              type="text"
              id="firstName"
              v-model="userData.firstName"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName">Фамилия</label>
            <input
              type="text"
              id="lastName"
              v-model="userData.lastName"
              required
            />
          </div>

          <div class="form-group">
            <label for="middleName">Отчество</label>
            <input
              type="text"
              id="middleName"
              v-model="userData.middleName"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>О себе</h2>
          <div class="form-group">
            <label for="bio">Биография</label>
            <textarea
              id="bio"
              v-model="profileData.bio"
              rows="4"
              placeholder="Расскажите о себе"
            ></textarea>
          </div>
        </div>

        <div class="form-section">
          <h2>Портфолио и галерея</h2>
          <div class="gallery-section">
            <div class="gallery-container">
              <div v-for="(image, index) in profileData.gallery || []" :key="index" class="gallery-item">
                <div class="gallery-image" :style="{backgroundImage: `url(${image})`}">
                  <button class="remove-image" @click="removeGalleryImage(index)">&times;</button>
                </div>
              </div>
              <div class="gallery-item add-image">
                <label class="add-image-label">
                  <input type="file" accept="image/*" @change="handleGalleryImageAdd" hidden />
                  <i class="fas fa-plus"></i>
                  <span>Добавить</span>
                </label>
              </div>
            </div>
            <p class="gallery-help">Добавьте фотографии ваших проектов, дипломов или другие важные изображения</p>
          </div>
        </div>

        <div class="form-section">
          <h2>Профессиональная информация</h2>
          <div class="form-group">
            <label for="company">Компания</label>
            <input
              type="text"
              id="company"
              v-model="profileData.company"
              placeholder="Название компании"
            />
          </div>

          <div class="form-group">
            <label for="position">Должность</label>
            <input
              type="text"
              id="position"
              v-model="profileData.position"
              placeholder="Ваша должность"
            />
          </div>

          <div class="form-group">
            <label for="website">Веб-сайт</label>
            <input
              type="url"
              id="website"
              v-model="profileData.website"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Контактная информация</h2>
          <div class="form-group">
            <label for="phoneNumber">Телефон</label>
            <input
              type="tel"
              id="phoneNumber"
              v-model="profileData.phoneNumber"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div class="form-group">
            <label for="region">Регион</label>
            <input
              type="text"
              id="region"
              v-model="profileData.region"
              placeholder="Москва"
            />
          </div>

          <div class="form-group">
            <label for="address">Адрес</label>
            <input
              type="text"
              id="address"
              v-model="profileData.address"
              placeholder="Город, улица, дом"
            />
          </div>
        </div>
        
        <div class="form-section">
          <h2>Социальные сети</h2>
          <div class="form-group">
            <label for="vk">ВКонтакте</label>
            <input
              type="url"
              id="vk"
              v-model="profileData.socialLinks.vk"
              placeholder="https://vk.com/username"
            />
          </div>

          <div class="form-group">
            <label for="instagram">Instagram</label>
            <input
              type="url"
              id="instagram"
              v-model="profileData.socialLinks.instagram"
              placeholder="https://instagram.com/username"
            />
          </div>

          <div class="form-group">
            <label for="facebook">Facebook</label>
            <input
              type="url"
              id="facebook"
              v-model="profileData.socialLinks.facebook"
              placeholder="https://facebook.com/username"
            />
          </div>

          <div class="form-group">
            <label for="linkedin">LinkedIn</label>
            <input
              type="url"
              id="linkedin"
              v-model="profileData.socialLinks.linkedin"
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div class="form-group">
            <label for="twitter">Twitter</label>
            <input
              type="url"
              id="twitter"
              v-model="profileData.socialLinks.twitter"
              placeholder="https://twitter.com/username"
            />
          </div>

          <div class="form-group">
            <label for="telegram">Telegram</label>
            <input
              type="text"
              id="telegram"
              v-model="profileData.socialLinks.telegram"
              placeholder="@username"
            />
          </div>
        </div>

        <div class="form-section">
          <h2>Специализация и интересы</h2>
          <div class="form-group">
            <label>Специализация</label>
            <div class="tags-input">
              <div class="tags-container">
                <div v-for="(tag, index) in profileData.specialization" :key="index" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeSpecialization(index)">&times;</button>
                </div>
              </div>
              <input 
                type="text" 
                v-model="newSpecialization" 
                @keydown.enter.prevent="addSpecialization"
                placeholder="Добавьте специализацию и нажмите Enter"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Интересы</label>
            <div class="tags-input">
              <div class="tags-container">
                <div v-for="(tag, index) in profileData.interests" :key="index" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeInterest(index)">&times;</button>
                </div>
              </div>
              <input 
                type="text" 
                v-model="newInterest" 
                @keydown.enter.prevent="addInterest"
                placeholder="Добавьте интерес и нажмите Enter"
              />
            </div>
          </div>

          <div v-if="userData.userType === 'INVESTOR'" class="form-group">
            <label for="investmentSize">Размер инвестиций (₽)</label>
            <input
              type="number"
              id="investmentSize"
              v-model.number="profileData.investmentSize"
              min="0"
              step="10000"
            />
          </div>
        </div>
        
        <div class="form-section">
          <h2>Образование и квалификация</h2>
          <div class="form-group">
            <label for="education">Образование</label>
            <textarea
              id="education"
              v-model="profileData.education"
              rows="3"
              placeholder="Укажите ваше образование (университет, специальность, год окончания)"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>Сертификаты и курсы</label>
            <div class="tags-input">
              <div class="tags-container">
                <div v-for="(cert, index) in profileData.certifications" :key="index" class="tag">
                  {{ cert }}
                  <button type="button" @click="removeCertification(index)">&times;</button>
                </div>
              </div>
              <input 
                type="text" 
                v-model="newCertification" 
                @keydown.enter.prevent="addCertification"
                placeholder="Добавьте сертификат и нажмите Enter"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label>Языки</label>
            <div class="tags-input">
              <div class="tags-container">
                <div v-for="(lang, index) in profileData.languages" :key="index" class="tag">
                  {{ lang }}
                  <button type="button" @click="removeLanguage(index)">&times;</button>
                </div>
              </div>
              <input 
                type="text" 
                v-model="newLanguage" 
                @keydown.enter.prevent="addLanguage"
                placeholder="Добавьте язык и нажмите Enter"
              />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
          <router-link to="/profile" class="btn btn-outline">Отмена</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import api from '@/axios';

export default {
  name: 'EditProfile',
  data() {
    return {
      isLoading: true,
      isSaving: false,
      userData: {
        id: null,
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        userType: '',
        profile: null
      },
      profileData: {
        bio: '',
        avatar: null,
        company: '',
        position: '',
        website: '',
        socialLinks: {
          linkedin: '',
          twitter: '',
          telegram: '',
          vk: '',
          instagram: '',
          facebook: ''
        },
        specialization: [],
        interests: [],
        investmentSize: 0,
        gallery: [],
        phoneNumber: '',
        address: '',
        region: '',
        education: '',
        certifications: [],
        languages: []
      },
      newSpecialization: '',
      newInterest: '',
      newCertification: '',
      newLanguage: '',
      avatarFile: null,
      galleryFiles: []
    }
  },
  async created() {
    try {
      // Получим ID текущего пользователя из localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('ID пользователя не найден в localStorage');
        this.$router.push('/login');
        return;
      }
      
      console.log('Загружаем профиль для редактирования, пользователь ID:', userId);
      
      const response = await api.get('/users/profile');
      
      // Проверяем, что ID загруженного профиля совпадает с ID в localStorage
      if (response.data.id && response.data.id.toString() !== userId) {
        console.warn('ID загруженного профиля не совпадает с ID в localStorage');
        // Принудительно обновим localStorage
        localStorage.setItem('userId', response.data.id.toString());
      }
      
      this.userData = response.data;
      
      if (this.userData.profile) {
        // Заполняем данные профиля
        const profile = this.userData.profile;
        
        // Инициализируем socialLinks с пустыми строками, если они null или undefined
        const socialLinks = profile.socialLinks || {};
        
        // Инициализируем данные профиля
        this.profileData = {
          bio: profile.bio || '',
          avatar: profile.avatar || null,
          company: profile.company || '',
          position: profile.position || '',
          website: profile.website || '',
          socialLinks: {
            linkedin: socialLinks.linkedin || '',
            twitter: socialLinks.twitter || '',
            telegram: socialLinks.telegram || '',
            vk: socialLinks.vk || '',
            instagram: socialLinks.instagram || '',
            facebook: socialLinks.facebook || ''
          },
          specialization: Array.isArray(profile.specialization) ? [...profile.specialization] : [],
          interests: Array.isArray(profile.interests) ? [...profile.interests] : [],
          investmentSize: profile.investmentSize || 0,
          gallery: Array.isArray(profile.gallery) ? [...profile.gallery] : [],
          phoneNumber: profile.phoneNumber || '',
          address: profile.address || '',
          region: profile.region || '',
          education: profile.education || '',
          certifications: Array.isArray(profile.certifications) ? [...profile.certifications] : [],
          languages: Array.isArray(profile.languages) ? [...profile.languages] : []
        };
        
        // Проверяем изображение аватара, если оно есть
        if (this.profileData.avatar) {
          console.log('Аватар профиля получен из API', {
            preview: typeof this.profileData.avatar === 'string' 
              ? this.profileData.avatar.substring(0, 50) + '...' 
              : 'не является строкой'
          });
          
          // Проверяем, что аватар действительно изображение
          const img = new Image();
          img.onload = () => {
            console.log('Аватар успешно загружен из базы данных');
          };
          img.onerror = () => {
            console.error('Ошибка при загрузке аватара из базы данных');
            this.profileData.avatar = null;
          };
          img.src = this.profileData.avatar;
        }
      } else {
        // Инициализируем пустой профиль, если его нет
        this.profileData = {
          bio: '',
          avatar: null,
          company: '',
          position: '',
          website: '',
          socialLinks: {
            linkedin: '',
            twitter: '',
            telegram: '',
            vk: '',
            instagram: '',
            facebook: ''
          },
          specialization: [],
          interests: [],
          investmentSize: 0,
          gallery: [],
          phoneNumber: '',
          address: '',
          region: '',
          education: '',
          certifications: [],
          languages: []
        };
        
        // Если профиля нет, перенаправляем на страницу профиля
        // чтобы сначала создать его
        this.$router.push('/profile');
        return;
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error.response?.data || error.message);
      
      // Если ошибка 401, перенаправляем на логин
      if (error.response && error.response.status === 401) {
        // Очищаем данные авторизации
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        
        this.$router.push('/login');
        return;
      }
      
      this.$emit('error', 'Не удалось загрузить профиль. Пожалуйста, попробуйте позже.');
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    getUserInitials() {
      if (!this.userData.firstName && !this.userData.lastName) return '?';
      return (this.userData.firstName?.charAt(0) || '') + (this.userData.lastName?.charAt(0) || '');
    },
    async handleAvatarChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Недопустимый тип файла. Разрешены только JPEG, PNG, GIF и WEBP.');
        return;
      }
      
      try {
        // Сжимаем и конвертируем изображение в base64
        const compressedBase64 = await this.compressImage(file, 300, 300);
        
        this.profileData.avatar = compressedBase64;
        console.log('Аватар успешно сжат и преобразован в base64', {
          length: compressedBase64.length,
          preview: compressedBase64.substring(0, 50) + '...'
        });
        
        // Создаем элемент изображения для проверки
        const img = new Image();
        img.onload = () => {
          console.log('Аватар успешно загружен', {
            width: img.width,
            height: img.height
          });
        };
        img.onerror = () => {
          console.error('Ошибка при загрузке аватара из base64 строки');
          this.profileData.avatar = null;
        };
        img.src = compressedBase64;
      } catch (error) {
        console.error('Ошибка при обработке аватара:', error);
        this.profileData.avatar = null;
        alert('Не удалось обработать изображение. Попробуйте другой файл.');
      }
    },
    
    // Метод для сжатия изображения
    compressImage(file, maxWidth, maxHeight) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // Определяем размеры для сжатия, сохраняя пропорции
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
            
            // Создаем canvas для сжатия
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Рисуем изображение на canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Конвертируем canvas в base64 с качеством 0.8 (80%)
            // Для JPEG используем 0.8 качество, для других форматов используем их родной формат
            const quality = file.type === 'image/jpeg' ? 0.8 : 0.9;
            const format = file.type || 'image/jpeg';
            
            // Получаем base64 строку
            const base64 = canvas.toDataURL(format, quality);
            resolve(base64);
          };
          
          img.onerror = (error) => {
            reject(error);
          };
          
          img.src = event.target.result;
        };
        
        reader.onerror = (error) => {
          reject(error);
        };
        
        reader.readAsDataURL(file);
      });
    },
    removeAvatar() {
      this.profileData.avatar = null;
      this.avatarFile = null;
    },
    addSpecialization() {
      if (this.newSpecialization.trim()) {
        this.profileData.specialization.push(this.newSpecialization.trim());
        this.newSpecialization = '';
      }
    },
    removeSpecialization(index) {
      this.profileData.specialization.splice(index, 1);
    },
    addInterest() {
      if (this.newInterest.trim()) {
        this.profileData.interests.push(this.newInterest.trim());
        this.newInterest = '';
      }
    },
    removeInterest(index) {
      this.profileData.interests.splice(index, 1);
    },
    
    addCertification() {
      if (this.newCertification.trim()) {
        if (!this.profileData.certifications) {
          this.profileData.certifications = [];
        }
        this.profileData.certifications.push(this.newCertification.trim());
        this.newCertification = '';
      }
    },
    
    removeCertification(index) {
      this.profileData.certifications.splice(index, 1);
    },
    
    addLanguage() {
      if (this.newLanguage.trim()) {
        if (!this.profileData.languages) {
          this.profileData.languages = [];
        }
        this.profileData.languages.push(this.newLanguage.trim());
        this.newLanguage = '';
      }
    },
    
    removeLanguage(index) {
      this.profileData.languages.splice(index, 1);
    },
    
    async handleGalleryImageAdd(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Недопустимый тип файла. Разрешены только JPEG, PNG, GIF и WEBP.');
        return;
      }
      
      try {
        // Сжимаем и конвертируем изображение в base64
        const compressedBase64 = await this.compressImage(file, 600, 600);
        
        if (!this.profileData.gallery) {
          this.profileData.gallery = [];
        }
        
        this.profileData.gallery.push(compressedBase64);
        console.log('Изображение галереи успешно сжато и преобразовано в base64', {
          length: compressedBase64.length,
          preview: compressedBase64.substring(0, 50) + '...'
        });
        
        // Создаем элемент изображения для проверки
        const img = new Image();
        img.onload = () => {
          console.log('Изображение галереи успешно загружено', {
            width: img.width,
            height: img.height
          });
        };
        img.onerror = () => {
          console.error('Ошибка при загрузке изображения галереи из base64 строки');
          this.profileData.gallery.pop(); // Удаляем последнее добавленное изображение
        };
        img.src = compressedBase64;
      } catch (error) {
        console.error('Ошибка при обработке изображения галереи:', error);
        alert('Не удалось обработать изображение. Попробуйте другой файл.');
      }
    },
    removeGalleryImage(index) {
      this.profileData.gallery.splice(index, 1);
      if (this.galleryFiles[index]) {
        this.galleryFiles.splice(index, 1);
      }
    },
    async handleSubmit() {
      try {
        this.isSaving = true;
        
        // Подготовим данные для отправки
        const dataToSend = { ...this.profileData };
        
        // Проверка размера данных для отправки
        if (dataToSend.avatar) {
          const avatarSizeKB = Math.round(dataToSend.avatar.length / 1024);
          console.log(`Размер аватара: ${avatarSizeKB} KB`);
          
          // Если аватар слишком большой (более 2MB в base64), сжимаем его
          if (avatarSizeKB > 2048) {
            alert('Аватар слишком большой. Пожалуйста, используйте изображение меньшего размера.');
            this.isSaving = false;
            return;
          }
        }
        
        // Проверка размера галереи
        if (dataToSend.gallery && dataToSend.gallery.length > 0) {
          const totalGallerySizeKB = dataToSend.gallery.reduce((size, img) => {
            return size + (img ? Math.round(img.length / 1024) : 0);
          }, 0);
          console.log(`Общий размер галереи: ${totalGallerySizeKB} KB`);
          
          if (totalGallerySizeKB > 8192) { // Более 8MB
            alert('Общий размер галереи слишком большой. Пожалуйста, уменьшите количество или размер изображений.');
            this.isSaving = false;
            return;
          }
        }
        
        // Обработка числовых полей
        if (dataToSend.investmentSize === null || dataToSend.investmentSize === undefined || dataToSend.investmentSize === '') {
          dataToSend.investmentSize = 0; // Устанавливаем значение по умолчанию, если поле пустое
        } else {
          // Убедимся, что значение является числом
          dataToSend.investmentSize = Number(dataToSend.investmentSize);
          
          // Если после преобразования получился NaN, устанавливаем 0
          if (isNaN(dataToSend.investmentSize)) {
            dataToSend.investmentSize = 0;
          }
        }
        
        // Обработка массивов
        if (!dataToSend.gallery) {
          dataToSend.gallery = [];
        }
        
        if (!dataToSend.certifications) {
          dataToSend.certifications = [];
        }
        
        if (!dataToSend.languages) {
          dataToSend.languages = [];
        }
        
        // Обработка URL-полей (если они пустые, отправляем пустую строку)
        if (dataToSend.website === null || dataToSend.website === undefined) {
          dataToSend.website = '';
        }
        
        // Обработка socialLinks
        if (!dataToSend.socialLinks) {
          dataToSend.socialLinks = {
            linkedin: '',
            twitter: '',
            telegram: '',
            vk: '',
            instagram: '',
            facebook: ''
          };
        } else {
          // Заполняем пустыми строками, если значения отсутствуют
          dataToSend.socialLinks = {
            linkedin: dataToSend.socialLinks.linkedin || '',
            twitter: dataToSend.socialLinks.twitter || '',
            telegram: dataToSend.socialLinks.telegram || '',
            vk: dataToSend.socialLinks.vk || '',
            instagram: dataToSend.socialLinks.instagram || '',
            facebook: dataToSend.socialLinks.facebook || ''
          };
        }
        
        // Обновляем профиль
        try {
          console.log('Отправляемые данные:', dataToSend);
          await api.patch('/users/profile', dataToSend);
          this.$router.push('/profile');
          this.$emit('success', 'Профиль успешно обновлен');
        } catch (error) {
          console.error('Ошибка при обновлении профиля:', error.response?.data || error.message);
          let errorMessage = 'Не удалось сохранить изменения.';
          
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage += ' ' + error.response.data.message;
          } else {
            errorMessage += ' Пожалуйста, попробуйте позже.';
          }
          
          this.$emit('error', errorMessage);
        }
      } finally {
        this.isSaving = false;
      }
    }
  }
}
</script>

<style scoped>
.edit-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.profile-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.form-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="url"],
.form-group input[type="number"],
.form-group input[type="tel"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-outline {
  background-color: transparent;
  color: #4361ee;
  border: 1px solid #4361ee;
}

.btn-outline:hover {
  background-color: #f0f4ff;
}

.btn-danger {
  background-color: transparent;
  color: #e53e3e;
  border: 1px solid #e53e3e;
}

.btn-danger:hover {
  background-color: #fff5f5;
}

.avatar-section {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
  color: #4361ee;
  background-size: cover;
  background-position: center;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-input {
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  padding: 0.5rem;
  background-color: #fff;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  background-color: #f0f4ff;
  color: #4361ee;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #4361ee;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tags-input input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
}

.gallery-section {
  margin-top: 1rem;
}

.gallery-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.gallery-item {
  position: relative;
  height: 120px;
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: #f0f4ff;
}

.gallery-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.remove-image {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.add-image {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px dashed #ccc;
  transition: all 0.2s;
}

.add-image:hover {
  border-color: #4361ee;
  background-color: rgba(67, 97, 238, 0.05);
}

.add-image-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
  color: #666;
}

.add-image-label i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.gallery-help {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style> 