# Futbol Taktik Tahtası (Tactical Board)

Bu proje, futbol antrenörleri ve meraklıları için React Native ve Expo kullanılarak geliştirilmiş, interaktif bir taktik tahtası uygulamasıdır. Kullanıcılar sahada oyuncuları hareket ettirebilir, çizim yapabilir, dizilişleri kaydedebilir ve taktiksel şemalar oluşturup galeriye kaydedebilirler.

## 🚀 Özellikler

*   **İnteraktif Saha:** Oyuncuları sürükleyip bırakma.
*   **Çizim Araçları:** Serbest çizim, oklar, çizgiler, daireler ve dikdörtgenler çizme.
*   **Özelleştirme:** Çizgi rengi, kalınlığı, opaklığı ve oyuncu boyutlarını ayarlama.
*   **Galeriye Kayıt:** Hazırlanan taktikleri cihaz galerisine yüksek kalitede kaydetme.
*   **Android Uyumluluğu:** Android cihazlarda dokunmatik kontroller için optimize edilmiştir.
*   **Dizilişler:** Hazır ve özelleştirilebilir takım dizilişleri.

## 🛠️ Gereksinimler

Projeyi çalıştırmadan önce bilgisayarınızda aşağıdakilerin kurulu olduğundan emin olun:

*   **Node.js** (LTS sürümü önerilir)
*   **Git**
*   **Expo Go** uygulaması (Mobil cihazınızda test etmek için)
*   **Android Studio** (Yerel Android APK buildleri için - Opsiyonel)

## 📦 Kurulum

Projeyi klonladıktan sonra proje dizininde bir terminal açın ve aşağıdaki adımları izleyin:

### 1. Bağımlılıkları Yükleyin

Tüm gerekli paketleri yüklemek için:

```bash
npm install
```

Eğer `npm install` sırasında sürüm uyumsuzluğu hataları alırsanız, `legacy-peer-deps` bayrağını kullanabilirsiniz, ancak genellikle `npx expo install` en uyumlu sürümleri kurar:

```bash
npx expo install --fix
```

**Kullanılan Temel Paketler:**
*   `expo`: Çekirdek SDK
*   `react-native-svg`: Çizim ve ikonlar için
*   `react-native-gesture-handler`: Gelişmiş dokunmatik kontroller
*   `@react-native-community/slider`: Ayar çubukları
*   `expo-media-library`: Galeriye erişim ve kayıt
*   `react-native-view-shot`: Ekran görüntüsü alma

## ▶️ Uygulamayı Çalıştırma

Geliştirme sunucusunu başlatmak için:

```bash
npx expo start -c
```
* `-c` bayrağı önbelleği (cache) temizleyerek başlatır, sorunsuz bir başlangıç için önerilir.

**Test Etme:**
1.  Terminalde çıkan QR kodunu telefonunuzdaki **Expo Go** uygulaması ile (Android) veya Kamera uygulaması ile (iOS) taratın.
2.  Android Emülatör için `a`, iOS Simülatör için `i` tuşuna basın.

## 📱 Android APK Oluşturma (Build)

Uygulamanın APK dosyasını oluşturmak için iki yöntem vardır:

### Yöntem 1: EAS Build (Bulut Tabanlı - Önerilen)

Expo Application Services (EAS) kullanarak bulutta build alabilirsiniz.

1.  EAS CLI yüklü değilse yükleyin:
    ```bash
    npm install -g eas-cli
    ```
2.  Expo hesabınıza giriş yapın:
    ```bash
    eas login
    ```
3.  Build işlemini başlatın:
    ```bash
    eas build -p android --profile preview
    ```
4.  İşlem bittiğinde size bir indirme linki verilecektir.

### Yöntem 2: Android Studio (Yerel Build)

Kendi bilgisayarınızda build almak isterseniz:

1.  Native dosyaları oluşturun (Prebuild):
    ```bash
    npx expo prebuild
    ```
    *   Bu işlem proje ana dizininde `android` klasörünü oluşturur.
2.  **Android Studio**'yu açın ve `android` klasörünü proje olarak seçin ("Open an existing project").
3.  Gradle senkronizasyonunun bitmesini bekleyin.
4.  Menüden **Build > Build Bundle(s) / APK(s) > Build APK(s)** seçeneğine tıklayın.
5.  Build tamamlandığında sağ altta çıkan bildirimden "locate" diyerek `app-debug.apk` dosyasına ulaşabilirsiniz.

Alternatif olarak terminalden:
```bash
cd android
./gradlew assembleDebug
```

## ⚠️ Sık Karşılaşılan Sorunlar ve Çözümleri

**1. "AUDIO Permission" Hatası:**
*   Uygulama sadece görsel kaydettiği halde ses izni hatası alıyorsanız, `MediaLibrary.requestPermissionsAsync(true)` (sadece yazma izni) kullanıldığından emin olun. Bu projede bu düzeltme uygulanmıştır.

**2. Slider veya Kaydırma Çalışmıyor (Android):**
*   Android'de `Slider` bileşenine dokunarak belirli bir noktaya gitmek için `tapToSeek={true}` özelliği eklenmiştir.
*   Panellerin dokunmatik olayları algılaması için `GestureHandlerRootView` ile uygulama sarmalanmıştır.

**3. Dosya İzinleri:**
*   Android 13+ sürümünde görsel kaydederken galeri izni "Photos and Videos" olarak görünür. Uygulama `writeOnly` izni istediği için, kullanıcı sadece gerekli izni onaylamalıdır.

## 🤝 Katkıda Bulunma

1.  Bu repoyu fork edin.
2.  Yeni bir feature branch oluşturun (`git checkout -b feature/yeniozellik`).
3.  Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`).
4.  Branch'inizi push edin (`git push origin feature/yeniozellik`).
5.  Bir Pull Request oluşturun.

---
Geliştirici: İsmail Soykök
