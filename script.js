const API_URL =
    "https://script.google.com/macros/s/AKfycbzZftAsnQmS6El2y4YAr0_4-ZzuflJP743luDtb6zTMEN9MLBhmROpPbD-53YtPdcAZ/exec";


let allProducts = [];
let filteredProducts = [];


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    const loadingText =
        document.getElementById("loadingText");

    try {

        loadingText.textContent =
            "Memuat produk...";

        const response =
            await fetch(API_URL);

        if (!response.ok) {

            throw new Error(
                "Gagal mengambil data."
            );
        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Data produk gagal dimuat."
            );
        }

        allProducts =
            Array.isArray(result.products)
                ? result.products
                : [];

        filteredProducts =
            [...allProducts];


        createCategoryFilter();
        createTimeFilter();

        renderProducts();

        loadingText.textContent =
            "Data berhasil dimuat.";

    } catch (error) {

        console.error(
            "Error:",
            error
        );

        loadingText.textContent =
            "Gagal memuat produk.";

        allProducts = [];
        filteredProducts = [];

        renderProducts();
    }
}


// ==========================================
// CATEGORY FILTER
// ==========================================

function createCategoryFilter() {

    const filter =
        document.getElementById(
            "categoryFilter"
        );

    const categories =
        [
            ...new Set(
                allProducts
                    .map(product =>
                        product.category
                    )
                    .filter(Boolean)
            )
        ].sort();


    filter.innerHTML =
        `
        <option value="all">
            Semua kategori
        </option>
        `;


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );

        option.value = category;

        option.textContent = category;

        filter.appendChild(option);
    });
}


// ==========================================
// TIME FILTER
// ==========================================

function createTimeFilter() {

    const filter =
        document.getElementById(
            "timeFilter"
        );

    const times =
        [
            ...new Set(
                allProducts
                    .map(product =>
                        product.time
                    )
                    .filter(Boolean)
            )
        ].sort();


    filter.innerHTML =
        `
        <option value="all">
            Semua jam
        </option>
        `;


    times.forEach(time => {

        const option =
            document.createElement(
                "option"
            );

        option.value = time;

        option.textContent = time;

        filter.appendChild(option);
    });
}


// ==========================================
// FILTER PRODUCTS
// ==========================================

function applyFilters() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase()
            .trim();


    const category =
        document
            .getElementById("categoryFilter")
            .value;


    const time =
        document
            .getElementById("timeFilter")
            .value;


    const minPrice =
        Number(
            document
                .getElementById("minPrice")
                .value
        ) || 0;


    const maxPriceValue =
        document
            .getElementById("maxPrice")
            .value;


    const maxPrice =
        maxPriceValue === ""
            ? Infinity
            : Number(maxPriceValue);


    filteredProducts =
        allProducts.filter(product => {

            const productName =
                String(
                    product.name || ""
                ).toLowerCase();


            const matchSearch =
                productName.includes(
                    search
                );


            const matchCategory =
                category === "all" ||
                product.category === category;


            const matchTime =
                time === "all" ||
                product.time === time;


            const price =
                Number(
                    product.newPrice
                ) || 0;


            const matchMinPrice =
                price >= minPrice;


            const matchMaxPrice =
                price <= maxPrice;


            return (
                matchSearch &&
                matchCategory &&
                matchTime &&
                matchMinPrice &&
                matchMaxPrice
            );
        });


    renderProducts();
}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {

    const container =
        document.getElementById(
            "productContainer"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    const productCount =
        document.getElementById(
            "productCount"
        );


    container.innerHTML = "";


    productCount.textContent =
        filteredProducts.length;


    if (
        filteredProducts.length === 0
    ) {

        emptyState.style.display =
            "block";

        return;
    }


    emptyState.style.display =
        "none";


    filteredProducts.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );

            container.appendChild(card);
        }
    );
}


// ==========================================
// CREATE PRODUCT CARD
// ==========================================

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    const name =
        escapeHTML(
            product.name || "-"
        );


    const category =
        escapeHTML(
            product.category || "-"
        );


    const time =
        escapeHTML(
            product.time || "-"
        );


    const oldPrice =
        Number(
            product.oldPrice
        ) || 0;


    const newPrice =
        Number(
            product.newPrice
        ) || 0;


    const discount =
        calculateDiscount(
            oldPrice,
            newPrice
        );


    const shopeeURL =
        safeURL(
            product.shopee
        );


    const imageURL =
        convertDriveImageURL(
            product.image
        );


    // ======================================
    // IMAGE
    // ======================================

    let imageHTML = "";


    if (imageURL) {

        imageHTML =
            `
            <div class="product-image-wrapper">

                <img
                    class="product-image"
                    src="${escapeAttribute(imageURL)}"
                    alt="${escapeAttribute(name)}"
                    loading="lazy"
                    onerror="this.parentElement.innerHTML='<div class=&quot;product-image-placeholder&quot;>Foto tidak tersedia</div>'"
                >

            </div>
            `;

    } else {

        imageHTML =
            `
            <div class="product-image-wrapper">

                <div class="product-image-placeholder">
                    Foto tidak tersedia
                </div>

            </div>
            `;
    }


    // ======================================
    // CARD
    // ======================================

    card.innerHTML =
        `
        ${imageHTML}

        <div class="product-content">

            <div class="product-name">
                ${name}
            </div>


            <div class="product-meta">

                <span class="product-badge">
                    ${category}
                </span>

                <span class="product-badge">
                    ${time}
                </span>

            </div>


            <div class="price-section">

                <div class="old-price">
                    ${formatRupiah(oldPrice)}
                </div>

                <div class="new-price">
                    ${formatRupiah(newPrice)}
                </div>

                ${
                    discount > 0
                        ? `
                        <span class="discount">
                            Hemat ${discount}%
                        </span>
                        `
                        : ""
                }

            </div>


            ${
                shopeeURL
                    ? `
                    <a
                        href="${shopeeURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="buy-button"
                    >
                        Click Link
                    </a>
                    `
                    : `
                    <div class="buy-button">
                        Link tidak tersedia
                    </div>
                    `
            }

        </div>
        `;


    return card;
}


// ==========================================
// GOOGLE DRIVE IMAGE URL
// ==========================================

function convertDriveImageURL(url) {

    if (!url) {
        return "";
    }


    url =
        String(url).trim();


    // --------------------------------------
    // Kalau sudah format direct image
    // --------------------------------------

    if (
        url.includes(
            "drive.google.com/uc"
        )
    ) {

        return url;
    }


    // --------------------------------------
    // Format:
    // drive.google.com/file/d/FILE_ID/view
    // --------------------------------------

    let match =
        url.match(
            /drive\.google\.com\/file\/d\/([^/]+)/
        );


    if (match) {

        const fileId =
            match[1];

        return (
            "https://drive.google.com/uc?export=view&id=" +
            encodeURIComponent(fileId)
        );
    }


    // --------------------------------------
    // Format:
    // open?id=FILE_ID
    // --------------------------------------

    match =
        url.match(
            /[?&]id=([^&]+)/
        );


    if (match) {

        const fileId =
            match[1];

        return (
            "https://drive.google.com/uc?export=view&id=" +
            encodeURIComponent(fileId)
        );
    }


    return url;
}


// ==========================================
// CALCULATE DISCOUNT
// ==========================================

function calculateDiscount(
    oldPrice,
    newPrice
) {

    if (
        !oldPrice ||
        !newPrice ||
        oldPrice <= newPrice
    ) {

        return 0;
    }


    return Math.round(
        (
            (oldPrice - newPrice) /
            oldPrice
        ) * 100
    );
}


// ==========================================
// FORMAT RUPIAH
// ==========================================

function formatRupiah(value) {

    const number =
        Number(value) || 0;


    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number);
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ==========================================
// ESCAPE ATTRIBUTE
// ==========================================

function escapeAttribute(value) {

    return escapeHTML(value);
}


// ==========================================
// SAFE URL
// ==========================================

function safeURL(url) {

    if (!url) {
        return "";
    }


    try {

        const parsed =
            new URL(url);


        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        ) {

            return parsed.href;
        }

    } catch (error) {

        return "";
    }


    return "";
}


// ==========================================
// EVENT LISTENERS
// ==========================================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        applyFilters
    );


document
    .getElementById("categoryFilter")
    .addEventListener(
        "change",
        applyFilters
    );


document
    .getElementById("timeFilter")
    .addEventListener(
        "change",
        applyFilters
    );


document
    .getElementById("minPrice")
    .addEventListener(
        "input",
        applyFilters
    );


document
    .getElementById("maxPrice")
    .addEventListener(
        "input",
        applyFilters
    );


document
    .getElementById("resetFilter")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "searchInput"
                )
                .value = "";


            document
                .getElementById(
                    "categoryFilter"
                )
                .value = "all";


            document
                .getElementById(
                    "timeFilter"
                )
                .value = "all";


            document
                .getElementById(
                    "minPrice"
                )
                .value = "";


            document
                .getElementById(
                    "maxPrice"
                )
                .value = "";


            applyFilters();
        }
    );


// ==========================================
// START
// ==========================================

loadProducts();
