require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Hata: GEMINI_API_KEY ortam değişkeni bulunamadı. Lütfen .env dosyasını kontrol edin.");
    process.exit(1);
}

// --- Gemini API Yapılandırması ---
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
});
console.log("Gemini API başarıyla yapılandırıldı.");

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Metin Ayrıştırma Yardımcı Fonksiyonları ---

function extractFirstNumber(text) {
    if (!text) return null;
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
}

function cleanInstructionLine(line) {
    if (!line) return "";
    let cleaned = line.trim();
    cleaned = cleaned.replace(/^\d+\.\s*/, '');
    cleaned = cleaned.replace(/^-+\s*/, '');
    return cleaned.trim();
}

// --- API Endpoint (/api/generate-recipe) ---
app.post('/api/generate-recipe', async (req, res) => {
    console.log("\n--- Tarif Oluşturma İsteği Alındı ---");
    console.log("İstek Gövdesi:", req.body);

    try {
        const criteria = req.body;
        if (!criteria) {
            console.error("Hata: İstek gövdesi boş.");
            return res.status(400).json({ error: "İstek gövdesinde JSON verisi bulunamadı." });
        }


        const ingredients_str = criteria.ingredients || '';
        const meal_type = criteria.mealType || 'farketmez';
        const diet = criteria.diet || 'farketmez';
        const servings = criteria.servings || 2;
        const recipe_type = criteria.dishType || 'farketmez';
        const prep_time_limit = criteria.maxPrepTime || 'any';

        if (!ingredients_str || !ingredients_str.trim()) {
            console.error("Hata: Malzeme bilgisi eksik.");
            return res.status(400).json({ error: "Lütfen en az bir malzeme girin." });
        }

        let prepTimeText = 'farketmez';
        if (prep_time_limit === '60') prepTimeText = '1 saatten az';
        else if (prep_time_limit === '180') prepTimeText = '1-3 saat arası';
        else if (prep_time_limit === '999') prepTimeText = '3 saatten fazla';

        // --- Gemini Prompt (Yapılandırılmış Metin İsteniyor) ---
        const prompt = `
    Aşağıdaki kriterlere uygun bir yemek tarifi oluştur:

    Elimdeki Ana Malzemeler: ${ingredients_str}
    Öğün Türü: ${meal_type !== 'any' ? meal_type : 'farketmez'}
    Diyet Tercihi: ${diet !== 'any' ? diet : 'farketmez'}
    Kişi Sayısı: ${servings}
    Yemek Türü: ${recipe_type !== 'any' ? recipe_type : 'farketmez'}
    Maksimum Hazırlama Süresi: ${prepTimeText}

    Lütfen tarifi şu formatta ver (başlıklar dahil ve her bölüm arasında boşluk bırakma):
    Başlık: [Tarifin Başlığı]
    Açıklama: [Yemeğin kısa ve çekici bir açıklaması.]
    Malzemeler:
    - [Malzeme 1 (miktar ve birim ile)]
    - [Malzeme 2]
    ...
    Yapılışı:
    [Adım adım yapılış talimatları, her adım yeni satırda olabilir]
    Kişi: [Kişi Sayısı]
    Süre: [Tahmini Hazırlama Süresi (dakika)]
    Kullanılan Malzemeler: [Tarifte kullanılan ana malzeme 1], [Tarifte kullanılan ana malzeme 2], ...
    Kullanılan Pişirme Yöntemleri: [fırın, ocak, mikrodalga, ızgara, haşlama vb.]
    ---
    İpuçları Bölümü:
    Yukarıda oluşturduğun tarifte KULLANILMAYAN ama başlangıçta verilen '${ingredients_str}' listesindeki malzemeler için saklama ve alternatif kullanım ipuçları ver. Eğer başlangıçtaki tüm malzemeler tarifte kullanıldıysa, bu bölümü boş bırak veya "Tüm malzemeler kullanıldı." yaz.
    İpuçlarını şu formatta ver (başlıklar dahil ve her bölüm arasında boşluk bırakma):
    Saklama İpuçları:
    - [Kullanılmayan Malzeme 1]: [Saklama İpucu]
    - [Kullanılmayan Malzeme 2]: [Saklama İpucu]
    ...
    Kullanım Fikirleri:
    - [Kullanılmayan Malzeme 1]: [Kullanım Fikri]
    - [Kullanılmayan Malzeme 2]: [Kullanım Fikri]
    ...

    Eğer kriterlere uygun tarif bulamazsan, sadece "Uygun tarif bulunamadı." yaz.
    `;

        console.log(`\n--- Gemini'ye Gönderilen Prompt ---\n${prompt}\n---------------------------------\n`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const raw_text_response = await response.text();

        console.log(`\n--- Gemini'den Gelen Ham Yanıt ---\n${raw_text_response}\n------------------------------\n`);

        if (raw_text_response.includes("Uygun tarif bulunamadı.")) {
            console.log("Model uygun tarif bulamadı.");
            return res.status(404).json({ error: "Bu kriterlere uygun tarif bulunamadı." });
        }

        let recipe_part = raw_text_response;
        let tips_part = "";
        const separator = "---";
        const separatorIndex = raw_text_response.indexOf(separator);

        if (separatorIndex !== -1) {
            recipe_part = raw_text_response.substring(0, separatorIndex).trim();
            const potentialTipsPart = raw_text_response.substring(separatorIndex + separator.length).trim();
            const tipsHeader = "İpuçları Bölümü:";
            const tipsHeaderIndex = potentialTipsPart.toLowerCase().indexOf(tipsHeader.toLowerCase());
            if (tipsHeaderIndex !== -1) {
                tips_part = potentialTipsPart.substring(tipsHeaderIndex + tipsHeader.length).trim();
            } else {
                tips_part = potentialTipsPart;
            }
        } else {
            console.warn("Uyarı: Yanıtta '---' ayırıcısı bulunamadı, ipuçları ayrıştırılamayabilir.");
        }

        const recipeData = {
            title: "Başlık Bulunamadı",
            description: "",
            ingredients: [],
            instructions: "",
            servings: servings,
            prepTime: "",
            usedIngredients: [],
            cookingMethods: [],
            storage_tips: [],
            usage_tips: []
        };

        let parsingState = null;
        const tempInstructions = [];

        recipe_part.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            const lowerLine = trimmedLine.toLowerCase();

            if (lowerLine.startsWith("başlık:")) {
                recipeData.title = trimmedLine.substring("başlık:".length).trim();
                parsingState = null;
            } else if (lowerLine.startsWith("açıklama:")) {
                recipeData.description = trimmedLine.substring("açıklama:".length).trim();
                parsingState = null;
            } else if (lowerLine.startsWith("malzemeler:")) {
                parsingState = 'ingredients';
            } else if (lowerLine.startsWith("yapılışı:")) {
                parsingState = 'instructions';
            } else if (lowerLine.startsWith("kişi:")) {
                const num = extractFirstNumber(trimmedLine);
                if (num !== null) recipeData.servings = num;
                parsingState = null;
            } else if (lowerLine.startsWith("süre:")) {
                recipeData.prepTime = trimmedLine.substring("süre:".length).trim();
                parsingState = null;
            } else if (lowerLine.startsWith("kullanılan malzemeler:")) {
                 const usedStr = trimmedLine.substring("kullanılan malzemeler:".length).trim();
                 recipeData.usedIngredients = usedStr.split(',').map(item => item.trim()).filter(item => item);
                 parsingState = null;
            }
            else if (lowerLine.startsWith("kullanılan pişirme yöntemleri:")) {
                const methodsStr = trimmedLine.substring("kullanılan pişirme yöntemleri:".length).trim();
                const cleanedMethodsStr = methodsStr.replace(/^\[|\]$/g, '');
                recipeData.cookingMethods = cleanedMethodsStr.split(',')
                                              .map(method => method.trim().toLowerCase()) 
                                              .filter(method => method);
                parsingState = null;
            }
            else {
                if (parsingState === 'ingredients' && (trimmedLine.startsWith('-') || trimmedLine.startsWith('*'))) {
                    recipeData.ingredients.push(trimmedLine.substring(1).trim());
                } else if (parsingState === 'instructions') {
                    const cleanedLine = cleanInstructionLine(trimmedLine);
                    if (cleanedLine) {
                        tempInstructions.push(cleanedLine);
                    }
                }
            }
        });
        recipeData.instructions = tempInstructions.join("\n");

        if (tips_part && !tips_part.toLowerCase().includes("tüm malzemeler kullanıldı.")) {
            let tipParsingState = null;
            tips_part.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return;

                const lowerLine = trimmedLine.toLowerCase();

                if (lowerLine.startsWith("saklama ipuçları:")) {
                    tipParsingState = 'storage';
                } else if (lowerLine.startsWith("kullanım fikirleri:")) {
                    tipParsingState = 'usage';
                } else {
                    if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
                        const tipText = trimmedLine.substring(1).trim();
                        if (tipText) {
                            if (tipParsingState === 'storage') {
                                recipeData.storage_tips.push(tipText);
                            } else if (tipParsingState === 'usage') {
                                recipeData.usage_tips.push(tipText);
                            }
                        }
                    }
                }
            });
        }

        if (recipeData.title === "Başlık Bulunamadı" || !recipeData.instructions) {
            console.warn("Uyarı: Gemini yanıtından tarif bilgileri düzgün ayrıştırılamadı.");
            return res.status(500).json({
                error: "Tarif formatı anlaşılamadı. Lütfen tekrar deneyin.",
                raw_response: raw_text_response
            });
        }
        
        console.log("\n--- Frontend'e Gönderilecek Son JSON ---");
        console.log(JSON.stringify(recipeData, null, 2));

        
        console.log("\n--- Başarılı Yanıt Oluşturuldu ---");
        console.log("Gönderilen JSON:", recipeData);
        res.status(200).json(recipeData);

    } catch (error) {
        console.error("\n--- Sunucu Hatası Oluştu ---");
        console.error("Hata Mesajı:", error.message);
        if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
             console.error("Engelleme Nedeni:", error.response.promptFeedback.blockReason);
             console.error("Engelleme Mesajı:", error.response.promptFeedback.blockReasonMessage);
             return res.status(400).json({ error: `Tarif üretilemedi. İçerik güvenlik filtrelerine takılmış olabilir: ${error.response.promptFeedback.blockReasonMessage || error.response.promptFeedback.blockReason}` });
        }
        console.error("Hata Detayı:", error);
        res.status(500).json({ error: "Beklenmedik bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin." });
    }
});

app.listen(port, () => {
    console.log(`Tarif Sihirbazı backend sunucusu http://localhost:${port} adresinde çalışıyor`);
});