function updateRecipeArea(htmlContent, showButtons = false) {
    console.log("updateRecipeArea çağrıldı. showButtons:", showButtons);
    const recipeDetails = document.getElementById('recipe-details');
    const newRecipeButton = document.getElementById('new-recipe');
    const addFavoriteButton = document.getElementById('add-favorite');

    if (recipeDetails) {
        recipeDetails.innerHTML = htmlContent;
    } else {
        console.error("UI Hatası: 'recipe-details' elementi bulunamadı.");
    }

    if (newRecipeButton && addFavoriteButton) {
        const displayStyle = showButtons ? 'inline-block' : 'none';
        newRecipeButton.style.display = displayStyle;
        addFavoriteButton.style.display = displayStyle;
        console.log(`Butonların display stili ayarlandı: ${displayStyle}`);
    } else {
        if (!newRecipeButton) console.warn("UI Uyarısı: 'new-recipe' butonu bulunamadı.");
        if (!addFavoriteButton) console.warn("UI Uyarısı: 'add-favorite' butonu bulunamadı.");
    }
}

function clearLeftoverTips() {
    console.log("clearLeftoverTips çağrıldı.");
    const tipsOutput = document.getElementById('tips-output'); 
    const tipsDetails = document.getElementById('tips-details'); 

    if (tipsOutput) {
        tipsOutput.style.display = 'none'; 
    } else {
        console.warn("UI Uyarısı: '#tips-output' elementi bulunamadı (temizleme).");
    }
    if (tipsDetails) {
        tipsDetails.innerHTML = ''; 
    } else {
        console.warn("UI Uyarısı: '#tips-details' elementi bulunamadı (temizleme).");
    }
}

function clearEnergyTipsInUI() {
    console.log("clearEnergyTipsInUI çağrıldı.");
    const energyTipsContainer = document.getElementById('energy-tips');
    const energyTipsDetails = document.getElementById('energy-tips-details');

    if (energyTipsContainer) {
        energyTipsContainer.style.display = 'none';
    } else {
        console.warn("UI Uyarısı: '#energy-tips' elementi bulunamadı (temizleme).");
    }
    if (energyTipsDetails) {
        energyTipsDetails.innerHTML = '';
    } else {
        console.warn("UI Uyarısı: '#energy-tips-details' elementi bulunamadı (temizleme).");
    }
}

function showLoadingState(message = "Yükleniyor, lütfen bekleyin...") {
    console.log("showLoadingState çağrıldı.");
    updateRecipeArea(`<div class="d-flex justify-content-center align-items-center p-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden"></span></div><p class="ms-3 mb-0">${message}</p></div>`, false);
    clearLeftoverTips();
    clearEnergyTipsInUI(); 
}

function showErrorState(errorMessage) {
    console.log("showErrorState çağrıldı. Mesaj:", errorMessage);
    updateRecipeArea(`<div class="alert alert-danger" role="alert"><i class="fas fa-exclamation-triangle me-2"></i>Hata: ${errorMessage}</div>`, false);
    clearLeftoverTips();
    clearEnergyTipsInUI(); 
}

function displayRecipeInUI(recipe) {
    console.log("displayRecipeInUI çağrıldı. Tarif:", recipe);
    if (!recipe || !recipe.title) {
        console.error("displayRecipeInUI: Geçersiz tarif verisi alındı.");
        showErrorState("Geçersiz veya eksik tarif verisi alındı.");
        return;
    }

    const recipeHtml = `
    <h2 class="mb-3">${recipe.title}</h2>
    ${recipe.description ? `<p class="lead mb-4 fst-italic">${recipe.description}</p>` : ''}
    <div class="row g-4">
    <div class="col-lg-5">
    <h4 class="mb-3"><i class="fas fa-shopping-basket me-2"></i>Malzemeler:</h4>
    <ul class="list-group list-group-flush mb-4">
    ${(Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0)
            ? recipe.ingredients.map(ingredient => `<li class="list-group-item ps-0">${ingredient}</li>`).join('')
            : '<li class="list-group-item text-muted ps-0">Malzeme listesi belirtilmemiş.</li>'
        }
    </ul>
    </div>
    <div class="col-lg-7">
    <h4 class="mb-3"><i class="fas fa-utensils me-2"></i>Yapılışı:</h4>
    <div class="instructions-text">${recipe.instructions || 'Talimatlar belirtilmemiş.'}</div>
    </div>
    </div>
    <hr class="my-4">
    <div class="row text-muted small">
    <div class="col-md-6 mb-2 mb-md-0">
    <i class="fas fa-users me-1"></i><strong>Kişi Sayısı:</strong> ${recipe.servings || 'Belirtilmemiş'}
    </div>
    <div class="col-md-6">
    <i class="fas fa-clock me-1"></i><strong>Tahmini Süre:</strong> ${recipe.prepTime || 'Belirtilmemiş'}
    </div>
    </div>
    ${ ''}
    ${ ''}
    `;
    updateRecipeArea(recipeHtml, true);
}

function displayLeftoverTips(recipeData) {
    console.log("displayLeftoverTips çağrıldı. Gelen Veri:", recipeData);
    const tipsOutput = document.getElementById('tips-output'); 
    const tipsDetails = document.getElementById('tips-details'); 

    if (!tipsOutput || !tipsDetails) {
        console.error("UI Hatası: '#tips-output' veya '#tips-details' elementi bulunamadı.");
        return;
    }

    const storageTips = (Array.isArray(recipeData?.storage_tips) ? recipeData.storage_tips : []);
    const usageTips = (Array.isArray(recipeData?.usage_tips) ? recipeData.usage_tips : []);

    console.log("Saklama İpuçları:", storageTips);
    console.log("Kullanım Fikirleri:", usageTips);

    if (storageTips.length === 0 && usageTips.length === 0) {
        console.log("Gösterilecek artan malzeme ipucu bulunamadı, alan gizleniyor.");
        tipsDetails.innerHTML = '';
        tipsOutput.style.display = 'none';
        return;
    }

    let tipsHtml = '';

    if (storageTips.length > 0) {
        tipsHtml += `<h5 class="mt-3"><i class="fas fa-box-open me-2"></i>Saklama İpuçları:</h5>
    <ul class="list-group list-group-flush mb-3">`;
        storageTips.forEach(tip => {
            tipsHtml += `<li class="list-group-item small">${tip}</li>`;
        });
        tipsHtml += `</ul>`;
    }

    if (usageTips.length > 0) {
        tipsHtml += `<h5 class="mt-3"><i class="fas fa-lightbulb me-2"></i>Alternatif Kullanım Fikirleri:</h5>
    <ul class="list-group list-group-flush">`;
        usageTips.forEach(tip => {
            tipsHtml += `<li class="list-group-item small">${tip}</li>`;
        });
        tipsHtml += `</ul>`;
    }

    tipsDetails.innerHTML = tipsHtml;
    tipsOutput.style.display = 'block';
    console.log("Artan malzeme ipuçları alanı güncellendi ve gösterildi.");
}

function displayEnergyTipsInUI(tipsHtml) {
    console.log("displayEnergyTipsInUI çağrıldı.");
    const energyTipsContainer = document.getElementById('energy-tips');
    const energyTipsDetails = document.getElementById('energy-tips-details');

    if (!energyTipsContainer || !energyTipsDetails) {
        console.error("UI Hatası: Enerji ipuçları için gerekli HTML elemanları ('energy-tips' veya 'energy-tips-details') bulunamadı.");
        return;
    }

    if (!tipsHtml || tipsHtml.trim() === '') {
        energyTipsDetails.innerHTML = '';
        energyTipsContainer.style.display = 'none';
        console.log("Enerji ipuçları içeriği boş, alan gizlendi.");
    } else {
        energyTipsDetails.innerHTML = tipsHtml; 
        energyTipsContainer.style.display = 'block'; 
        console.log("Enerji ipuçları alanı güncellendi ve gösterildi.");
    }
}

function clearInputFields(inputIds) {
    console.log("clearInputFields çağrıldı. ID'ler:", inputIds);
    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = false;
            } else if (element.tagName === 'SELECT') {
                element.selectedIndex = 0; 
            } else {
                element.value = ''; 
            }
        } else {
            console.warn(`UI Uyarısı: Temizlenecek element bulunamadı - ID: ${id}`);
        }
    });
}

console.log("ui.js başarıyla yüklendi.");