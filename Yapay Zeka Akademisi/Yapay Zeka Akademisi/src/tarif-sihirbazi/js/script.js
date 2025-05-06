document.addEventListener('DOMContentLoaded', function() {
    console.log("--- DOMContentLoaded Başladı ---");

    const recipeForm = document.getElementById('recipe-form');
    const mealTypeEl = document.getElementById('meal-type');
    const ingredientsEl = document.getElementById('ingredients');
    const dietPreferenceEl = document.getElementById('diet-preference');
    const peopleCountEl = document.getElementById('people-count');
    const dishTypeEl = document.getElementById('dish-type');
    const prepTimeEl = document.getElementById('prep-time');
    const generateRecipeButton = document.getElementById('generate-recipe');
    const newRecipeButton = document.getElementById('new-recipe');
    const addFavoriteButton = document.getElementById('add-favorite');
    const favoritesListContainer = document.getElementById('favorites-list');
    const noFavoritesMessage = document.getElementById('no-favorites-message');
    const themeToggleButton = document.getElementById('theme-toggle');

    let currentDisplayedRecipe = null;
    let favorites = [];
    const RECIPE_BACKEND_URL = 'http://localhost:3000/api/generate-recipe'; 

    console.log("Tema ayarları yapılıyor...");
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeToggleButton) themeToggleButton.textContent = '☀️';
    }
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            let theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            themeToggleButton.textContent = theme === 'dark' ? '☀️' : '🌙';
            localStorage.setItem('theme', theme);
            console.log("Tema değiştirildi:", theme);
        });
    } else {
        console.warn("Tema değiştirme butonu bulunamadı.");
    }

    function generateEnergySavingTips(cookingMethods = []) {
        const tips = {
            "fırın": "Fırını önceden ısıtmak yerine, tarifinize uygun sıcaklıkta çalıştırın ve mümkünse birden fazla yemeği aynı anda pişirmeyi düşünün.",
            "ocak": "Ocakta yemek pişirirken veya su ısıtırken tencerenin/çaydanlığın kapağını kapalı tutarak enerji tasarrufu sağlayabilirsiniz. Tencere tabanının ocak gözüyle uyumlu boyutta olması da önemlidir.",
            "mikrodalga": "Mikrodalga fırını, özellikle küçük porsiyonları ısıtmak veya çözdürmek için geleneksel fırına göre daha az enerji tüketir.",
            "ızgara": "Elektrikli ızgarayı kullanırken, gereksiz yere uzun süre önceden ısıtmaktan kaçının.",
            "haşlama": "Sebzeleri veya diğer yiyecekleri haşlarken, sadece yeteri kadar su kullanın. Daha az su, daha hızlı kaynar ve daha az enerji harcar.",
            "su ısıtıcı": "Su ısıtıcısında (kettle) sadece ihtiyacınız kadar su ısıtın. Fazladan ısıtılan su enerji israfıdır.",
            "bulaşık makinesi": "Bulaşık makinesini tam dolmadan çalıştırmaktan kaçının. Mümkünse eko programları tercih edin.",
            "buzdolabı": "Buzdolabının kapağını gereksiz yere açık tutmayın. Sıcak yemekleri soğumadan buzdolabına koymayın."
        };

        let tipsHtml = ""; 
        const addedTips = new Set();

        if (!Array.isArray(cookingMethods)) {
            console.warn("generateEnergySavingTips: cookingMethods bir dizi olmalı.");
            return ""; 
        }

        cookingMethods.forEach(method => {
            const lowerMethod = method.toLowerCase().trim(); 
            if (tips[lowerMethod] && !addedTips.has(lowerMethod)) {
                if (addedTips.size === 0) {
                    tipsHtml += `<h4 class="mb-3"><i class="fas fa-bolt me-2"></i>Enerji Tasarrufu İpuçları:</h4>`; 
                }
                tipsHtml += `<p class="mb-2"><strong class="text-capitalize">${method}:</strong> ${tips[lowerMethod]}</p>`; 
                addedTips.add(lowerMethod);
            }
        });

        return tipsHtml; 
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        console.log("--- handleFormSubmit Başladı ---");
        currentDisplayedRecipe = null;

        const ingredientsValue = ingredientsEl ? ingredientsEl.value.trim() : '';
        if (!ingredientsValue) {
            alert("Lütfen elinizdeki malzemelerden en az birini girin.");
            if (ingredientsEl) ingredientsEl.focus();
            console.log("Malzeme girilmedi, işlem iptal edildi.");
            return;
        }

        const criteria = {
            ingredients: ingredientsValue,
            mealType: mealTypeEl ? mealTypeEl.value : 'Farketmez',
            diet: dietPreferenceEl ? dietPreferenceEl.value : 'Yok',
            servings: parseInt(peopleCountEl ? peopleCountEl.value : '1', 10) || 1,
            dishType: dishTypeEl ? dishTypeEl.value : 'Farketmez',
            maxPrepTime: prepTimeEl ? prepTimeEl.value : 'Farketmez'
        };
        console.log("API'ye gönderilecek kriterler:", criteria);

        if (typeof showLoadingState === 'function') showLoadingState("Tarifiniz sihirli fırında pişiriliyor...");
        else console.error("showLoadingState fonksiyonu bulunamadı!");

        if (generateRecipeButton) generateRecipeButton.disabled = true;
        if (newRecipeButton) newRecipeButton.disabled = true;
        if (addFavoriteButton) addFavoriteButton.disabled = true;

        try {
            console.log(`Tarif API isteği gönderiliyor: ${RECIPE_BACKEND_URL}`);
            const recipeData = await callApi(RECIPE_BACKEND_URL, criteria);
            console.log("Tarif API yanıtı alındı:", recipeData);

            if (recipeData && recipeData.title && !recipeData.error) {
                console.log("Başarılı tarif verisi alındı. İşleniyor...");
                currentDisplayedRecipe = recipeData;

                if (typeof displayRecipeInUI === 'function') displayRecipeInUI(recipeData);
                else console.error("displayRecipeInUI fonksiyonu bulunamadı!");

                console.log("Artan malzeme ipuçları (API yanıtından) işleniyor...");
                if (typeof displayLeftoverTips === 'function') {
                    displayLeftoverTips(recipeData); 
                } else {
                    console.error("displayLeftoverTips fonksiyonu bulunamadı!");
                }

                console.log("Enerji tasarrufu ipuçları işleniyor...");
                if (typeof displayEnergyTipsInUI === 'function' && typeof clearEnergyTipsInUI === 'function') {
                    if (recipeData.cookingMethods && Array.isArray(recipeData.cookingMethods) && recipeData.cookingMethods.length > 0) {
                        console.log("Pişirme yöntemleri bulundu:", recipeData.cookingMethods);
                        const energyTipsHtml = generateEnergySavingTips(recipeData.cookingMethods);
                        displayEnergyTipsInUI(energyTipsHtml); 
                    } else {
                        console.log("Tarifte pişirme yöntemi belirtilmemiş veya API yanıtında bulunamadı, enerji ipuçları gösterilmiyor.");
                        clearEnergyTipsInUI(); 
                    }
                } else {
                    console.error("Enerji ipuçları için UI fonksiyonları (displayEnergyTipsInUI/clearEnergyTipsInUI) bulunamadı!");
                }

            } else {
                console.error("Tarif API'sinden hata alındı veya veri eksik:", recipeData?.error);
                if (typeof showErrorState === 'function') {
                    showErrorState(recipeData?.error || 'Uygun bir tarif oluşturulamadı veya sunucudan eksik veri alındı.');
                } else { console.error("showErrorState fonksiyonu bulunamadı!"); }
            }

        } catch (error) {
            console.error('handleFormSubmit içinde kritik hata:', error);
            let errorMsg = "Tarif oluşturulurken beklenmedik bir hata oluştu.";
            if (error.message.toLowerCase().includes('failed to fetch')) {
                errorMsg = "Sunucuya bağlanılamadı. Sunucunun çalıştığından ve adresin doğru olduğundan emin olun.";
            } else if (error instanceof SyntaxError) {
                errorMsg = "Sunucudan gelen yanıt işlenemedi (Geçersiz format).";
            } else {
                errorMsg = error.message || errorMsg;
            }
            if (typeof showErrorState === 'function') showErrorState(errorMsg);
            else console.error("showErrorState fonksiyonu bulunamadı!");
        } finally {
            console.log("Finally bloğu çalıştı: Butonlar tekrar etkinleştiriliyor.");
            if (generateRecipeButton) generateRecipeButton.disabled = false;
            if (newRecipeButton) newRecipeButton.disabled = false;
            updateFavoriteButtonState(); 
            console.log("--- handleFormSubmit Bitti ---");
        }
    }

    async function callApi(url, payload) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
            });
            console.log(`Fetch yanıtı (${url}): Status: ${response.status}`);
            const contentType = response.headers.get("content-type");
            console.log(`Yanıt Content-Type (${url}):`, contentType);

            let responseData;
            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
                console.log(`İşlenen JSON verisi (${url}):`, responseData);
            } else {
                const textResponse = await response.text();
                console.error(`API'den (${url}) JSON olmayan yanıt metni (Status: ${response.status}):`, textResponse);
                return { error: `Sunucudan beklenmeyen bir formatta yanıt alındı (HTTP ${response.status}). İçerik: ${textResponse.substring(0, 100)}...` };
            }

            if (!response.ok) {
                console.error(`API yanıtı başarısız (${url}, HTTP ${response.status}). Yanıt:`, responseData);
                return { error: responseData.error || `Sunucu hatası oluştu (HTTP ${response.status})` };
            }
            return responseData; 

        } catch (error) {
            console.error(`API isteği sırasında kritik hata (${url}):`, error);
            throw error;
        }
    }

    function updateFavoriteButtonState() {
        if (!addFavoriteButton) return;
        const recipeTitle = currentDisplayedRecipe?.title;

        if (!recipeTitle) {
            addFavoriteButton.textContent = 'Favorilere Ekle';
            addFavoriteButton.classList.remove('is-favorite');
            addFavoriteButton.disabled = true;
            return;
        }

        addFavoriteButton.disabled = false;
        const isFavorite = favorites.some(fav => fav.title === recipeTitle);
        addFavoriteButton.textContent = isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
        addFavoriteButton.classList.toggle('is-favorite', isFavorite);
        console.log(`Favori butonu güncellendi: "${recipeTitle}" favori mi? ${isFavorite}`);
    }

    function handleAddToFavoritesClick() {
        if (!currentDisplayedRecipe || !currentDisplayedRecipe.title) {
            alert("Favorilere eklemek/çıkarmak için önce geçerli bir tarif görüntülenmelidir.");
            return;
        }
        console.log(`handleAddToFavoritesClick çağrıldı: "${currentDisplayedRecipe.title}"`);
        const recipeTitle = currentDisplayedRecipe.title;
        const index = favorites.findIndex(fav => fav.title === recipeTitle);

        if (index > -1) {
            favorites.splice(index, 1);
            console.log(`"${recipeTitle}" favorilerden çıkarıldı.`);
            alert(`"${recipeTitle}" favorilerden çıkarıldı.`);
        } else {
            const favoriteToAdd = {
                title: currentDisplayedRecipe.title,
                description: currentDisplayedRecipe.description,
            };
            favorites.push(favoriteToAdd);
            console.log(`"${recipeTitle}" favorilere eklendi.`);
            alert(`"${recipeTitle}" favorilere eklendi!`);
        }
        saveFavoritesToStorage(favorites);
        updateFavoriteButtonState();
        displayFavorites(favorites); 
    }

    function saveFavoritesToStorage(favs) {
        try {
            localStorage.setItem('recipeFavorites', JSON.stringify(favs));
            console.log("Favoriler localStorage'a kaydedildi:", favs.length);
        } catch (e) {
            console.error("Favoriler kaydedilirken hata oluştu:", e);
            alert("Favoriler kaydedilemedi. Tarayıcı depolama alanı dolu olabilir.");
        }
    }

    function loadFavoritesFromStorage() {
        console.log("loadFavoritesFromStorage çağrıldı.");
        const storedFavorites = localStorage.getItem('recipeFavorites');
        if (storedFavorites) {
            try {
                const parsedFavorites = JSON.parse(storedFavorites);
                favorites = Array.isArray(parsedFavorites) ? parsedFavorites : [];
                if (!Array.isArray(parsedFavorites)) {
                    console.warn("localStorage'daki favoriler dizi değil, sıfırlanıyor.");
                    localStorage.removeItem('recipeFavorites'); 
                }
                console.log("Yüklenen ve parse edilen favoriler:", favorites.length);
            } catch (e) {
                console.error("Favoriler localStorage'dan yüklenirken parse hatası:", e);
                favorites = []; 
                localStorage.removeItem('recipeFavorites'); 
            }
        } else {
            console.log("localStorage'da kayıtlı favori bulunamadı.");
            favorites = [];
        }
        displayFavorites(favorites);
    }

    function displayFavorites(favs) {
        console.log("displayFavorites çağrıldı. Gösterilecek favoriler (filtrelenmeden önce):", favs.length);
        if (!favoritesListContainer || !noFavoritesMessage) {
            console.error("Favori listesi alanı veya mesaj elementi bulunamadı!");
            return;
        }
        favoritesListContainer.innerHTML = ''; 

        const validFavorites = favs.filter(recipe => recipe && recipe.title && recipe.title.trim() !== '');
        console.log("Gösterilecek geçerli (başlıklı) favoriler:", validFavorites.length);

        if (validFavorites.length === 0) {
            noFavoritesMessage.style.display = 'block'; 
            console.log("Gösterilecek geçerli favori yok.");
        } else {
            noFavoritesMessage.style.display = 'none'; 
            validFavorites.forEach(recipe => {
                const card = document.createElement('div');
                card.className = 'col-md-6 col-lg-4 mb-4'; 
                card.innerHTML = `
                <div class="card h-100 shadow-sm">
                <div class="card-body d-flex flex-column">
                <h5 class="card-title">${recipe.title}</h5>
                ${recipe.description ? `<p class="card-text small text-muted mb-3">${recipe.description.substring(0, 100)}...</p>` : ''}
                <div class="mt-auto text-end">
                <button class="btn btn-sm btn-outline-danger remove-favorite-btn" data-title="${recipe.title}" title="Favorilerden Çıkar">
                <i class="fas fa-trash-alt"></i> Çıkar
                </button>
                </div>
                </div>
                </div>
                `;
                favoritesListContainer.appendChild(card);
            });
            console.log(`${validFavorites.length} geçerli favori kartı DOM'a eklendi.`);
        }
    }

    function handleFavoriteListClick(event) {
        const removeButton = event.target.closest('.remove-favorite-btn');
        if (removeButton) {
            event.preventDefault(); 
            const recipeTitleToRemove = removeButton.dataset.title;
            console.log(`Favori listesinden çıkarma isteği: "${recipeTitleToRemove}"`);
            if (recipeTitleToRemove) {
                const indexToRemove = favorites.findIndex(fav => fav.title === recipeTitleToRemove);
                if (indexToRemove > -1) {
                    favorites.splice(indexToRemove, 1); 
                    saveFavoritesToStorage(favorites); 
                    displayFavorites(favorites); 
                    updateFavoriteButtonState(); 
                    alert(`"${recipeTitleToRemove}" favorilerden çıkarıldı.`);
                    console.log(`"${recipeTitleToRemove}" favorilerden çıkarıldı ve liste güncellendi.`);
                } else {
                    console.warn(`Çıkarılmak istenen "${recipeTitleToRemove}" favori listesinde bulunamadı.`);
                }
            }
        }
    }

    console.log("Başlangıç durumu ayarlanıyor...");
    if (typeof updateRecipeArea === 'function') {
        updateRecipeArea('<p>Malzemelerinizi girin ve tarif oluşturun!</p>', false);
    } else { console.error("updateRecipeArea fonksiyonu bulunamadı!"); }
    if (typeof clearLeftoverTips === 'function') {
        clearLeftoverTips();
    } else { console.error("clearLeftoverTips fonksiyonu bulunamadı!"); }
    if (typeof clearEnergyTipsInUI === 'function') {
        clearEnergyTipsInUI(); 
    } else { console.error("clearEnergyTipsInUI fonksiyonu bulunamadı!"); }

    loadFavoritesFromStorage();
    updateFavoriteButtonState();

    console.log("Olay dinleyicileri ekleniyor...");
    if (recipeForm) {
        recipeForm.addEventListener('submit', handleFormSubmit);
        console.log("Form submit dinleyicisi eklendi.");
    } else { console.error("Hata: 'recipe-form' ID'li form bulunamadı!"); }

    if (newRecipeButton) {
        newRecipeButton.addEventListener('click', () => {
            console.log("'Yeni Tarif Oluştur' butonuna tıklandı.");
            if (typeof clearEnergyTipsInUI === 'function') {
                clearEnergyTipsInUI();
            }
            if (recipeForm && ingredientsEl && ingredientsEl.value.trim()) {
                handleFormSubmit(new Event('submit', { bubbles: true, cancelable: true }));
            } else {
                alert("Yeni bir tarif oluşturmak için lütfen önce malzeme girin.");
                if (ingredientsEl) ingredientsEl.focus();
            }
        });
        console.log("Yeni tarif butonu dinleyicisi eklendi.");
    } else { console.warn("Uyarı: 'new-recipe' butonu bulunamadı."); }

    if (addFavoriteButton) {
        addFavoriteButton.addEventListener('click', handleAddToFavoritesClick);
        console.log("Favori ekle/çıkar butonu dinleyicisi eklendi.");
    } else { console.warn("Uyarı: 'add-favorite' butonu bulunamadı."); }

    if (favoritesListContainer) {
        favoritesListContainer.addEventListener('click', handleFavoriteListClick);
        console.log("Favori listesi tıklama dinleyicisi eklendi.");
    } else { console.error("Hata: 'favorites-list' alanı bulunamadı!"); }

    console.log("--- script.js Başarıyla Yüklendi ve Çalıştırıldı ---");

});