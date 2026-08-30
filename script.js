// ==========================================
// GOOGLE APPS SCRIPT API
// ==========================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbzZftAsnQmS6El2y4YAr0_4-ZzuflJP743luDtb6zTMEN9MLBhmROpPbD-53YtPdcAZ/exec";


// ==========================================
// GLOBAL DATA
// ==========================================

let products = [];


// ==========================================
// ELEMENT
// ==========================================

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const timeFilter =
    document.getElementById("timeFilter");

const minPrice =
    document.getElementById("minPrice");

const maxPrice =
    document.getElementById("maxPrice");

const resetFilter =
    document.getElementById("resetFilter");

const productContainer =
    document.getElementById("productContainer");

const productCount =
    document.getElementById("productCount");

const emptyState =
    document.getElementById("emptyState");

const loadingText =
    document.getElementById("loadingText");


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

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


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                data.message ||
                "Terjadi kesalahan."
            );

        }


        products =
            data.products || [];


        loadingText.textContent = "";


        createCategoryFilter();

        createTimeFilter();

        renderProducts(products);


    } catch (error) {

        console.error(error);


        loadingText.textContent =
            "Gagal memuat data produk.";

        productContainer.innerHTML = "";

        productCount.textContent = "0";

    }

}


// ==========================================
// CATEGORY FILTER
// ==========================================

function createCategoryFilter() {

    const categories = [
        ...new Set(
            products
                .map(product =>
                    product.category
                )
                .filter(category =>
                    category
                )
        )
    ];


    categories.sort();


    categoryFilter.innerHTML = `
        <option value="all">
            Semua kategori
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            category;


        option.textContent =
            category;


        categoryFilter.appendChild(
            option
        );

    });

}


// ==========================================
// TIME FILTER
// ==========================================

function createTimeFilter() {

    const times = [
        ...new Set(
            products
                .map(product =>
                    product.time
                )
                .filter(time =>
                    time
                )
        )
    ];


    times.sort();


    timeFilter.innerHTML = `
        <option value="all">
            Semua jam
        </option>
    `;


    times.forEach(time => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            time;


        option.textContent =
            time;


        timeFilter.appendChild(
            option
        );

    });

}


// ==========================================
// FILTER PRODUCTS
// ==========================================

function filterProducts() {

    const keyword =
        searchInput.value
            .toLowerCase()
            .trim();


    const category =
        categoryFilter.value;


    const time =
        timeFilter.value;


    const minimum =
        Number(minPrice.value) || 0;


    const maximum =
        Number(maxPrice.value) ||
        Infinity;


    const filtered =
        products.filter(product => {

            const matchesSearch =
                String(product.name)
                    .toLowerCase()
                    .includes(keyword);


            const matchesCategory =
                category === "all" ||
                product.category === category;


            const matchesTime =
                time === "all" ||
                product.time === time;


            const matchesPrice =
                product.newPrice >= minimum &&
                product.newPrice <= maximum;


            return (
                matchesSearch &&
                matchesCategory &&
                matchesTime &&
                matchesPrice
            );

        });


    renderProducts(filtered);

}


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts(data) {

    productContainer.innerHTML = "";

    productCount.textContent =
        data.length;


    if (data.length === 0) {

        emptyState.style.display =
            "block";

        return;

    }


    emptyState.style.display =
        "none";


    data.forEach(product => {

        const card =
            createProductCard(product);


        productContainer.appendChild(
            card
        );

    });

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


    const discount =
        calculateDiscount(
            product.oldPrice,
            product.newPrice
        );


    const oldPrice =
        formatRupiah(
            product.oldPrice
        );


    const newPrice =
        formatRupiah(
            product.newPrice
        );


    const imageURL =
        safeImageURL(
            product.image
        );


    card.innerHTML = `

        <img
            class="product-image"
            src="${imageURL}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
        >


        <div class="product-content">

            <div class="product-name">
                ${escapeHTML(product.name)}
            </div>


            <div class="product-meta">

                <span class="badge">
                    ${escapeHTML(product.category)}
                </span>


                <span class="badge badge-time">
                    🕐 ${escapeHTML(product.time)}
                </span>

            </div>


            <div class="price-area">

                <div class="old-price">
                    ${oldPrice}
                </div>


                <div class="new-price">
                    ${newPrice}
                </div>


                ${
                    discount > 0
                    ? `
                        <span class="discount">
                            Turun ${discount}%
                        </span>
                    `
                    : ""
                }


                <a
                    class="buy-button"
                    href="${safeURL(product.shopee)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Click Link Product
                </a>

            </div>

        </div>

    `;


    // ==================================
    // IMAGE ERROR
    // ==================================

    const image =
        card.querySelector(
            ".product-image"
        );


    image.addEventListener(
        "error",
        function () {

            this.src =
                "https://placehold.co/600x600/e0f2fe/0369a1?text=No+Image";

        },
        {
            once: true
        }
    );


    return card;

}


// ==========================================
// SAFE IMAGE URL
// ==========================================

function safeImageURL(url) {

    if (!url) {

        return (
            "https://placehold.co/600x600/e0f2fe/0369a1?text=No+Image"
        );

    }


    try {

        const parsed =
            new URL(url);


        if (
            parsed.protocol === "https:" ||
            parsed.protocol === "http:"
        ) {

            return parsed.href;

        }


        return (
            "https://placehold.co/600x600/e0f2fe/0369a1?text=No+Image"
        );

    } catch {

        return (
            "https://placehold.co/600x600/e0f2fe/0369a1?text=No+Image"
        );

    }

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
        oldPrice <= 0 ||
        newPrice >= oldPrice
    ) {

        return 0;

    }


    const result =
        (
            (oldPrice - newPrice) /
            oldPrice
        ) * 100;


    return Math.round(result);

}


// ==========================================
// RUPIAH FORMAT
// ==========================================

function formatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

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
// SAFE URL
// ==========================================

function safeURL(url) {

    try {

        const parsed =
            new URL(url);


        if (
            parsed.protocol === "https:" ||
            parsed.protocol === "http:"
        ) {

            return parsed.href;

        }


        return "#";

    } catch {

        return "#";

    }

}


// ==========================================
// EVENT LISTENERS
// ==========================================

searchInput.addEventListener(
    "input",
    filterProducts
);


categoryFilter.addEventListener(
    "change",
    filterProducts
);


timeFilter.addEventListener(
    "change",
    filterProducts
);


minPrice.addEventListener(
    "input",
    filterProducts
);


maxPrice.addEventListener(
    "input",
    filterProducts
);


// ==========================================
// RESET FILTER
// ==========================================

resetFilter.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        categoryFilter.value = "all";

        timeFilter.value = "all";

        minPrice.value = "";

        maxPrice.value = "";


        renderProducts(products);

    }
);


// ==========================================
// START
// ==========================================

loadProducts();
