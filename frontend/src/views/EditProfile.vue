<template>
  <div class="edit-profile-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <i class="fas fa-user-edit"></i>
          </div>
          <div>
            <h1>Редактирование профиля</h1>
            <p class="header-subtitle">Обновите вашу личную информацию</p>
          </div>
        </div>
        <div class="header-right">
          <router-link to="/profile" class="btn-cancel">
            <i class="fas fa-times"></i>
            Отмена
          </router-link>
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="loader"></div>
      <p>Загрузка профиля...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="profile-form">
      <!-- Row 1: Avatar + Basic Info -->
      <div class="row row-1">
        <div class="form-card avatar-card">
          <div class="card-header">
            <i class="fas fa-camera"></i>
            <h3>Фото профиля</h3>
          </div>
          <div class="avatar-section">
            <div class="avatar-preview" :style="{ backgroundImage: profileData.avatar ? `url(${profileData.avatar})` : 'none' }">
              <div v-if="!profileData.avatar" class="avatar-placeholder">
                {{ getUserInitials() }}
              </div>
            </div>
            <div class="avatar-actions">
              <label class="btn-upload">
                <i class="fas fa-upload"></i>
                Загрузить
                <input type="file" accept="image/*" @change="handleAvatarChange" hidden />
              </label>
              <button v-if="profileData.avatar" type="button" class="btn-remove" @click="removeAvatar">
                <i class="fas fa-trash"></i>
                Удалить
              </button>
            </div>
          </div>
        </div>

        <div class="form-card">
          <div class="card-header">
            <i class="fas fa-id-card"></i>
            <h3>Основная информация</h3>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="firstName">Имя</label>
              <input type="text" id="firstName" v-model="userData.firstName" required placeholder="Введите имя" />
            </div>
            <div class="form-group">
              <label for="lastName">Фамилия</label>
              <input type="text" id="lastName" v-model="userData.lastName" required placeholder="Введите фамилию" />
            </div>
            <div class="form-group full-width">
              <label for="middleName">Отчество</label>
              <input type="text" id="middleName" v-model="userData.middleName" placeholder="Введите отчество" />
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2: Bio + Professional -->
      <div class="row row-2">
        <div class="form-card">
          <div class="card-header">
            <i class="fas fa-user-circle"></i>
            <h3>О себе</h3>
          </div>
          <div class="form-group">
            <label for="bio">Биография</label>
            <textarea id="bio" v-model="profileData.bio" rows="4" placeholder="Расскажите о себе..."></textarea>
          </div>
        </div>

        <div class="form-card">
          <div class="card-header">
            <i class="fas fa-briefcase"></i>
            <h3>Профессиональная информация</h3>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="company">Компания</label>
              <input type="text" id="company" v-model="profileData.company" placeholder="Название компании" />
            </div>
            <div class="form-group">
              <label for="position">Должность</label>
              <input type="text" id="position" v-model="profileData.position" placeholder="Ваша должность" />
            </div>
            <div class="form-group full-width">
              <label for="website">Веб-сайт</label>
              <input type="url" id="website" v-model="profileData.website" placeholder="https://example.com" />
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: Contact + Social -->
      <div class="row row-2">
        <div class="form-card">
          <div class="card-header">
            <i class="fas fa-address-book"></i>
            <h3>Контактная информация</h3>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="phoneNumber">Телефон</label>
              <input type="tel" id="phoneNumber" v-model="profileData.phoneNumber" placeholder="+7 (999) 123-45-67" />
            </div>
            <div class="form-group">
              <label for="region">Регион</label>
              <input type="text" id="region" v-model="profileData.region" placeholder="Москва" />
            </div>
            <div class="form-group full-width">
              <label for="address">Адрес</label>
              <input type="text" id="address" v-model="profileData.address" placeholder="Город, улица, дом" />
            </div>
          </div>
        </div>

        <div class="form-card">
          <div class="card-header">
            <i class="fas fa-share-alt"></i>
            <h3>Социальные сети</h3>
          </div>
          <div class="social-grid">
            <div class="social-input">
              <i class="fab fa-vk"></i>
              <input type="url" v-model="profileData.socialLinks.vk" placeholder="https://vk.com/username" />
            </div>
            <div class="social-input">
              <i class="fab fa-telegram"></i>
              <input type="text" v-model="profileData.socialLinks.telegram" placeholder="@username" />
            </div>
            <div class="social-input">
              <i class="fab fa-instagram"></i>
              <input type="url" v-model="profileData.socialLinks.instagram" placeholder="https://instagram.com/username" />
            </div>
            <div class="social-input">
              <i class="fab fa-linkedin"></i>
              <input type="url" v-model="profileData.socialLinks.linkedin" placeholder="https://linkedin.com/in/username" />
            </div>
            <div class="social-input">
              <i class="fab fa-twitter"></i>
              <input type="url" v-model="profileData.socialLinks.twitter" placeholder="https://twitter.com/username" />
            </div>
            <div class="social-input">
              <i class="fab fa-facebook"></i>
              <input type="url" v-model="profileData.socialLinks.facebook" placeholder="https://facebook.com/username" />
            </div>
          </div>
        </div>
      </div>

      <!-- Row 4: Education + Skills -->
      <div class="row row-2">
        <div class="form-card">
          <div class="card-header">
            <i class="fas fa-graduation-cap"></i>
            <h3>Образование и квалификация</h3>
          </div>
          <div class="form-group">
            <label for="education">Образование</label>
            <textarea id="education" v-model="profileData.education" rows="2" placeholder="Университет, специальность, год окончания"></textarea>
          </div>
          <div class="form-group">
            <label>Сертификаты</label>
            <div class="tags-input">
              <div class="tags-container">
                <span v-for="(cert, index) in profileData.certifications" :key="index" class="tag">
                  {{ cert }}
                  <button type="button" @click="removeCertification(index)">×</button>
                </span>
              </div>
              <input type="text" v-model="newCertification" @keydown.enter.prevent="addCertification" placeholder="Добавьте сертификат + Enter" />
            </div>
          </div>
          <div class="form-group">
            <label>Языки</label>
            <div class="tags-input">
              <div class="tags-container">
                <span v-for="(lang, index) in profileData.languages" :key="index" class="tag">
                  {{ lang }}
                  <button type="button" @click="removeLanguage(index)">×</button>
                </span>
              </div>
              <input type="text" v-model="newLanguage" @keydown.enter.prevent="addLanguage" placeholder="Добавьте язык + Enter" />
            </div>
          </div>
        </div>

        <div class="form-card">
          <div class="card-header">
            <i class="fas fa-star"></i>
            <h3>Специализация и интересы</h3>
          </div>
          <div class="form-group">
            <label>Специализация</label>
            <div class="tags-input">
              <div class="tags-container">
                <span v-for="(tag, index) in profileData.specialization" :key="index" class="tag primary">
                  {{ tag }}
                  <button type="button" @click="removeSpecialization(index)">×</button>
                </span>
              </div>
              <input type="text" v-model="newSpecialization" @keydown.enter.prevent="addSpecialization" placeholder="Добавьте специализацию + Enter" />
            </div>
          </div>
          <div class="form-group">
            <label>Интересы</label>
            <div class="tags-input">
              <div class="tags-container">
                <span v-for="(tag, index) in profileData.interests" :key="index" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeInterest(index)">×</button>
                </span>
              </div>
              <input type="text" v-model="newInterest" @keydown.enter.prevent="addInterest" placeholder="Добавьте интерес + Enter" />
            </div>
          </div>
          <div v-if="userData.userType === 'INVESTOR'" class="form-group">
            <label for="investmentSize">Размер инвестиций (₽)</label>
            <input type="number" id="investmentSize" v-model.number="profileData.investmentSize" min="0" step="10000" placeholder="0" />
          </div>
        </div>
      </div>

      <!-- Row 5: Gallery -->
      <div class="row row-full">
        <div class="form-card">
          <div class="card-header">
            <i class="fas fa-images"></i>
            <h3>Портфолио и галерея</h3>
          </div>
          <div class="gallery-grid">
            <div v-for="(image, index) in profileData.gallery || []" :key="index" class="gallery-item">
              <div class="gallery-image" :style="{backgroundImage: `url(${image})`}">
                <button type="button" class="remove-image" @click="removeGalleryImage(index)">×</button>
              </div>
            </div>
            <label class="gallery-item add-item">
              <input type="file" accept="image/*" @change="handleGalleryImageAdd" hidden />
              <i class="fas fa-plus"></i>
              <span>Добавить</span>
            </label>
          </div>
          <p class="gallery-hint">Добавьте фотографии ваших проектов, дипломов или другие важные изображения</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <router-link to="/profile" class="btn-secondary">
          <i class="fas fa-times"></i>
          Отмена
        </router-link>
        <button type="submit" class="btn-primary" :disabled="isSaving">
          <i class="fas fa-check"></i>
          {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import api from '@/axios';
import fileUploadService from '@/services/fileUpload.service';

export default {
  name: 'EditProfile',
  data() {
    return {
      isLoading: true,
      isSaving: false,
      isUploadingAvatar: false,
      isUploadingGallery: false,
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
      const userId = localStorage.getItem('userId');
      if (!userId) {
        this.$router.push('/login');
        return;
      }
      
      const response = await api.get('/users/profile');
      
      if (response.data.id && response.data.id.toString() !== userId) {
        localStorage.setItem('userId', response.data.id.toString());
      }
      
      this.userData = response.data;
      
      if (this.userData.profile) {
        const profile = this.userData.profile;
        const socialLinks = profile.socialLinks || {};
        
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
      } else {
        this.$router.push('/profile');
        return;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        this.$router.push('/login');
      }
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
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Недопустимый тип файла. Разрешены только JPEG, PNG, GIF и WEBP.');
        return;
      }
      
      try {
        this.isUploadingAvatar = true;
        // Загружаем в MinIO
        const result = await fileUploadService.uploadAvatar(file);
        this.profileData.avatar = result.url;
      } catch (error) {
        console.error('Ошибка загрузки аватара:', error);
        alert('Не удалось загрузить изображение.');
      } finally {
        this.isUploadingAvatar = false;
      }
    },
    
    compressImage(file, maxWidth, maxHeight) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
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
            
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const quality = file.type === 'image/jpeg' ? 0.8 : 0.9;
            const format = file.type || 'image/jpeg';
            resolve(canvas.toDataURL(format, quality));
          };
          img.onerror = reject;
          img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    
    removeAvatar() {
      this.profileData.avatar = null;
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
        if (!this.profileData.certifications) this.profileData.certifications = [];
        this.profileData.certifications.push(this.newCertification.trim());
        this.newCertification = '';
      }
    },
    removeCertification(index) {
      this.profileData.certifications.splice(index, 1);
    },
    
    addLanguage() {
      if (this.newLanguage.trim()) {
        if (!this.profileData.languages) this.profileData.languages = [];
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
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Недопустимый тип файла.');
        return;
      }
      
      try {
        this.isUploadingGallery = true;
        // Загружаем в MinIO
        const result = await fileUploadService.uploadImage(file);
        if (!this.profileData.gallery) this.profileData.gallery = [];
        this.profileData.gallery.push(result.url);
      } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        alert('Не удалось загрузить изображение.');
      } finally {
        this.isUploadingGallery = false;
      }
    },
    
    removeGalleryImage(index) {
      this.profileData.gallery.splice(index, 1);
    },
    
    async handleSubmit() {
      try {
        this.isSaving = true;
        const dataToSend = { ...this.profileData };
        
        dataToSend.investmentSize = Number(dataToSend.investmentSize) || 0;
        dataToSend.gallery = dataToSend.gallery || [];
        dataToSend.certifications = dataToSend.certifications || [];
        dataToSend.languages = dataToSend.languages || [];
        dataToSend.website = dataToSend.website || '';
        dataToSend.socialLinks = {
          linkedin: dataToSend.socialLinks?.linkedin || '',
          twitter: dataToSend.socialLinks?.twitter || '',
          telegram: dataToSend.socialLinks?.telegram || '',
          vk: dataToSend.socialLinks?.vk || '',
          instagram: dataToSend.socialLinks?.instagram || '',
          facebook: dataToSend.socialLinks?.facebook || ''
        };
        
        await api.patch('/users/profile', dataToSend);
        this.$router.push('/profile');
      } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось сохранить изменения.');
      } finally {
        this.isSaving = false;
      }
    }
  }
}
</script>


<style scoped>
.edit-profile-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 1.5rem;
}

/* Header */
.page-header {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1E6BFF 0%, #4F8FFF 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.header-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0.25rem 0 0 0;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: #f1f5f9;
  color: #64748b;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
}

/* Form Layout */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.row {
  display: grid;
  gap: 0.75rem;
}

.row-1 {
  grid-template-columns: 1fr 2fr;
}

.row-2 {
  grid-template-columns: 1fr 1fr;
}

.row-full {
  grid-template-columns: 1fr;
}

/* Cards */
.form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-header i {
  width: 36px;
  height: 36px;
  background: #f0f7ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1E6BFF;
  font-size: 1rem;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

/* Avatar Card */
.avatar-card {
  display: flex;
  flex-direction: column;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1E6BFF 0%, #4F8FFF 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  border: 4px solid #f0f7ff;
}

.avatar-placeholder {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.avatar-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-upload,
.btn-remove {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-upload {
  background: #1E6BFF;
  color: white;
}

.btn-upload:hover {
  background: #1557d9;
}

.btn-remove {
  background: #fef2f2;
  color: #ef4444;
}

.btn-remove:hover {
  background: #fee2e2;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9375rem;
  color: #1a1a2e;
  transition: all 0.2s;
  background: #ffffff;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1E6BFF;
  box-shadow: 0 0 0 3px rgba(30, 107, 255, 0.1);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

/* Social Grid */
.social-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.social-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.social-input:focus-within {
  border-color: #1E6BFF;
  background: #ffffff;
}

.social-input i {
  font-size: 1.125rem;
  color: #64748b;
  width: 24px;
  text-align: center;
}

.social-input input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: #1a1a2e;
  padding: 0.375rem 0;
}

.social-input input:focus {
  outline: none;
}

/* Tags Input */
.tags-input {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.75rem;
  background: #ffffff;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tags-container:empty {
  margin-bottom: 0;
}

.tag {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  background: #f0f7ff;
  color: #1E6BFF;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
}

.tag.primary {
  background: #1E6BFF;
  color: white;
}

.tag button {
  background: none;
  border: none;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
}

.tag button:hover {
  opacity: 1;
}

.tags-input input {
  width: 100%;
  border: none;
  font-size: 0.875rem;
  color: #1a1a2e;
  padding: 0.25rem 0;
}

.tags-input input:focus {
  outline: none;
}

/* Gallery */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
}

.gallery-item {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
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
  top: 0.375rem;
  right: 0.375rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.gallery-image:hover .remove-image {
  opacity: 1;
}

.add-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
  color: #64748b;
}

.add-item:hover {
  border-color: #1E6BFF;
  background: #f0f7ff;
  color: #1E6BFF;
}

.add-item i {
  font-size: 1.5rem;
}

.add-item span {
  font-size: 0.75rem;
  font-weight: 500;
}

.gallery-hint {
  font-size: 0.8125rem;
  color: #94a3b8;
  margin-top: 0.75rem;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: #1E6BFF;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1557d9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #64748b;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #64748b;
  gap: 1rem;
}

.loader {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f7ff;
  border-top-color: #1E6BFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .row-1 {
    grid-template-columns: 1fr;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .edit-profile-page {
    padding: 1rem;
  }
  
  .row-2 {
    grid-template-columns: 1fr;
  }
  
  .form-grid,
  .social-grid {
    grid-template-columns: 1fr;
  }
  
  .gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    justify-content: center;
  }
}
</style>
