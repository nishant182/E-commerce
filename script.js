
// Step 1: Connect HTML Elements

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const cartButton = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");
const categoryFilters = document.getElementById("category-Filters");
const productGrid = document.getElementById("productGrid");
const sortSelect = document.getElementById("sortSelect");
const searchSuggestions = document.getElementById("searchSuggestions");
const bestSellersGrid = document.getElementById("bestSellersGrid");
const recommendedGrid = document.getElementById("recommendedGrid");


// Product Modal Elements

const productModal = document.getElementById("productModel");
const productDetails = document.getElementById("productDetails");
const closeModal = document.getElementById("closeModel");


// Step 2: Initial Project Data

const defaultProducts = [
    { id: 1, name: "Wireless Headphones", price: 1299, originalPrice: 1999, discountPercent: 35, brand: "Aural", Categories: "electronics", rating: 4.5, image: "https://m.media-amazon.com/images/I/31818K7ii3L._SY300_SX300_QL70_FMwebp_.jpg" },
    { id: 2, name: "Bluetooth Speaker", price: 899, originalPrice: 1499, discountPercent: 40, brand: "Sonic", Categories: "electronics", rating: 4.2, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { id: 3, name: "Smart Watch", price: 1599, originalPrice: 2499, discountPercent: 36, brand: "Astra", Categories: "electronics", rating: 4.3, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { id: 4, name: "Smartphone", price: 12999, originalPrice: 15999, discountPercent: 19, brand: "Nova", Categories: "electronics", rating: 4.6, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400" },
    { id: 5, name: "Running Shoes", price: 1999, originalPrice: 2999, discountPercent: 33, brand: "Stride", Categories: "fashion", rating: 4.4, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400" },
    { id: 6, name: "Classic Sunglasses", price: 699, originalPrice: 1099, discountPercent: 36, brand: "Vista", Categories: "fashion", rating: 4.1, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400" },
    { id: 7, name: "Laptop", price: 45999, originalPrice: 52999, discountPercent: 13, brand: "Nova", Categories: "computer accessories", rating: 4.7, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400" },
    { id: 8, name: "Wireless Mouse", price: 499, originalPrice: 799, discountPercent: 38, brand: "Orbit", Categories: "computer accessories", rating: 4.3, image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400" },
    { id: 9, name: "Table Lamp", price: 799, originalPrice: 1299, discountPercent: 38, brand: "Morrow", Categories: "home & living", rating: 4.2, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400" },
    { id: 10, name: "Coffee Mug", price: 299, originalPrice: 499, discountPercent: 40, brand: "Morrow", Categories: "home & living", rating: 4.0, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400" }
];

const productsStorageKey = "ecomStoreProducts";

function saveProducts(productList) {
    try {
        localStorage.setItem(productsStorageKey, JSON.stringify(productList));
    } catch (error) {
        console.error("Could not save products to localStorage:", error);
    }
}

function loadProducts() {
    try {
        const savedProducts = JSON.parse(localStorage.getItem(productsStorageKey) || "null");
        const hasValidProducts = Array.isArray(savedProducts)
            && savedProducts.length > 0
            && savedProducts.every(product =>
                product
                && Number.isFinite(Number(product.id))
                && typeof product.name === "string"
                && Number.isFinite(Number(product.price))
                && typeof product.Categories === "string"
                && Number.isFinite(Number(product.rating))
                && typeof product.image === "string"
            );

        if (hasValidProducts) {
            return savedProducts;
        }
    } catch (error) {
        console.warn("Could not load products from localStorage; using defaults:", error);
    }

    const initialProducts = defaultProducts.map(product => ({ ...product }));
    saveProducts(initialProducts);
    return initialProducts;
}

const products = loadProducts();
document.getElementById("heroProductCount").textContent = String(products.length);
const averageRating = products.reduce((total, product) => total + Number(product.rating), 0) / products.length;
document.getElementById("heroRating").textContent = `${averageRating.toFixed(1)} / 5`;


// Step 3: Cart Data

const cartStorageKey = "ecomStoreCart";

function loadCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
        return Array.isArray(savedCart)
            ? savedCart.filter(item => item
                && Number.isFinite(Number(item.id))
                && typeof item.name === "string"
                && Number.isFinite(Number(item.price))
                && Number.isFinite(Number(item.quantity))
                && Number(item.quantity) > 0)
                .map(item => ({ ...item, price: Number(item.price), quantity: Math.floor(Number(item.quantity)) || 1 }))
            : [];
    } catch (error) {
        return [];
    }
}

const cart = loadCart();


// Step 4: Helper Function To Escape HTML

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


// Step 5: Render Products

function renderProductCard(product) {
    const price = Number(product.price);
    const originalPrice = Number(product.originalPrice) > price
        ? Number(product.originalPrice)
        : Math.ceil(price * 1.2 / 10) * 10;
    const discountPercent = Number(product.discountPercent) > 0
        ? Number(product.discountPercent)
        : Math.round((originalPrice - price) / originalPrice * 100);
    const defaultBrands = {
        electronics: "EcomStore Select",
        fashion: "Studio Edit",
        "computer accessories": "Orbit",
        "home & living": "Morrow"
    };
    const brand = product.brand || defaultBrands[String(product.Categories).toLowerCase()] || "EcomStore Select";

    return `
        <article class="product-card" data-product-id="${Number(product.id)}">
            <div class="product-image">
                <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
                <span class="product-discount-badge">${discountPercent}% off</span>
                <span class="product-rating" aria-label="${Number(product.rating).toFixed(1)} out of 5">
                    <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m8 1.5 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.3l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.5Z" fill="currentColor"/></svg>
                    ${Number(product.rating).toFixed(1)}
                </span>
            </div>
            <div class="product-card-content">
                <p class="product-brand">${escapeHTML(brand)}</p>
                <h3 class="product-name">${escapeHTML(product.name)}</h3>
                <div class="product-review-line"><span class="review-stars" aria-hidden="true">★★★★★</span><span>${Number(product.rating).toFixed(1)} / 5</span></div>
                <div class="product-price-row">
                    <span class="product-price">₹${price.toLocaleString("en-IN")}</span>
                    <del class="product-original-price">₹${originalPrice.toLocaleString("en-IN")}</del>
                </div>
                <div class="product-card-actions">
                    <button class="view-details-btn" type="button" data-product-id="${Number(product.id)}" aria-label="Quick view ${escapeHTML(product.name)}">Quick view</button>
                    <button class="add-to-cart-btn" type="button" data-product-id="${Number(product.id)}" title="Add ${escapeHTML(product.name)} to cart">
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 4h2l2.1 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6.1M10 20h.01M17 20h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Add to cart
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderProducts(productList) {
    if (productList.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-message">
                <span class="empty-mark" aria-hidden="true">⌕</span>
                <h3>No products found</h3>
                <p>Try a different search or category.</p>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = productList.map(renderProductCard).join("");
}

// Step 6: Check HTML Connections

// Step 7: Display Products

renderProducts(products);

function renderShowcaseGrids() {
    if (bestSellersGrid) {
        bestSellersGrid.innerHTML = [...products]
            .sort((first, second) => Number(second.rating) - Number(first.rating))
            .slice(0, 4)
            .map(renderProductCard)
            .join("");
    }

    if (recommendedGrid) {
        const picks = [4, 5, 8, 10]
            .map(id => products.find(product => Number(product.id) === id))
            .filter(Boolean);
        recommendedGrid.innerHTML = (picks.length ? picks : products.slice(0, 4))
            .map(renderProductCard)
            .join("");
    }
}

renderShowcaseGrids();

function updateDealCountdown() {
    const now = new Date();
    const nextDay = new Date(now);
    nextDay.setHours(24, 0, 0, 0);
    const remainingSeconds = Math.max(0, Math.floor((nextDay.getTime() - now.getTime()) / 1000));
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    document.getElementById("countdownHours").textContent = String(hours).padStart(2, "0");
    document.getElementById("countdownMinutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("countdownSeconds").textContent = String(seconds).padStart(2, "0");
}

updateDealCountdown();
window.setInterval(updateDealCountdown, 1000);


// Apply Filters

let selectedCategory = "all";
let productModalReturnFocus = null;

function matchesSearch(product, searchTerm) {
    const searchableText = [product.name, product.brand, product.Categories]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return searchableText.includes(searchTerm);
}

function updateSearchSuggestions() {
    if (!searchSuggestions) return;
    const searchTerm = searchInput.value.toLowerCase().trim();
    const matches = searchTerm.length > 1
        ? products.filter(product => matchesSearch(product, searchTerm)).slice(0, 5)
        : [];

    searchSuggestions.replaceChildren();
    searchSuggestions.hidden = matches.length === 0;
    searchInput.setAttribute("aria-expanded", String(matches.length > 0));
    if (!matches.length) return;

    const heading = document.createElement("div");
    heading.className = "suggestion-heading";
    heading.textContent = "Suggested products";
    searchSuggestions.appendChild(heading);

    matches.forEach(product => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "search-suggestion";
        option.setAttribute("role", "option");
        option.dataset.productId = String(product.id);

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = "";
        image.loading = "lazy";

        const copy = document.createElement("span");
        copy.className = "suggestion-copy";
        const name = document.createElement("strong");
        name.textContent = product.name;
        const brand = document.createElement("span");
        brand.textContent = product.brand || product.Categories;
        copy.append(name, brand);

        const price = document.createElement("span");
        price.className = "suggestion-price";
        price.textContent = `₹${Number(product.price).toLocaleString("en-IN")}`;
        option.append(image, copy, price);
        searchSuggestions.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    let filteredProducts = products.filter(product => matchesSearch(product, searchTerm));
    if (selectedCategory !== "all") {
        filteredProducts = filteredProducts.filter(product =>
            String(product.Categories).toLowerCase() === selectedCategory.toLowerCase()
        );
    }

    const sortValue = sortSelect.value;
    if (sortValue === "price-low") {
        filteredProducts.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortValue === "price-high") {
        filteredProducts.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortValue === "rating") {
        filteredProducts.sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    renderProducts(filteredProducts);
}

searchBtn.addEventListener("click", () => {
    applyFilters();
    searchSuggestions.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
});

searchInput.addEventListener("input", () => {
    applyFilters();
    updateSearchSuggestions();
});

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        applyFilters();
        searchSuggestions.hidden = true;
        searchInput.setAttribute("aria-expanded", "false");
    } else if (event.key === "ArrowDown" && !searchSuggestions.hidden) {
        event.preventDefault();
        searchSuggestions.querySelector("[role='option']")?.focus();
    } else if (event.key === "Escape") {
        searchSuggestions.hidden = true;
        searchInput.setAttribute("aria-expanded", "false");
    }
});

searchSuggestions.addEventListener("click", event => {
    const option = event.target.closest("[data-product-id]");
    if (!option) return;
    const product = products.find(item => String(item.id) === option.dataset.productId);
    if (!product) return;

    productModalReturnFocus = document.activeElement;
    const originalPrice = Number(product.originalPrice) > Number(product.price)
        ? Number(product.originalPrice)
        : Math.ceil(Number(product.price) * 1.2 / 10) * 10;
    const brand = product.brand || "EcomStore Select";
    searchInput.value = product.name;
    selectedCategory = "all";
    categoryFilters.querySelectorAll(".category-button").forEach(button => {
        button.classList.toggle("active", button.dataset.category === "all");
    });
    applyFilters();
    searchSuggestions.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.focus();
});

document.addEventListener("click", event => {
    if (!event.target.closest(".search-box")) {
        searchSuggestions.hidden = true;
        searchInput.setAttribute("aria-expanded", "false");
    }
});

searchSuggestions.addEventListener("keydown", event => {
    const options = [...searchSuggestions.querySelectorAll("[role='option']")];
    const currentIndex = options.indexOf(document.activeElement);
    if (event.key === "ArrowDown") {
        event.preventDefault();
        options[Math.min(currentIndex + 1, options.length - 1)]?.focus();
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (currentIndex <= 0) searchInput.focus();
        else options[currentIndex - 1]?.focus();
    } else if (event.key === "Escape") {
        searchSuggestions.hidden = true;
        searchInput.setAttribute("aria-expanded", "false");
        searchInput.focus();
    }
});

// Category Button

categoryFilters.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-category]");

    if (!button) return;

    selectedCategory = button.dataset.category;

    categoryFilters.querySelectorAll(".category-button").forEach(categoryButton => {
        categoryButton.classList.toggle("active", categoryButton === button);
    });

    applyFilters();
});


// Sorting

sortSelect.addEventListener("change", applyFilters);

document.addEventListener("click", event => {
    const categoryTarget = event.target.closest("[data-category-target]");
    if (categoryTarget) {
        selectedCategory = categoryTarget.dataset.categoryTarget.toLowerCase();
        categoryFilters.querySelectorAll(".category-button").forEach(button => {
            button.classList.toggle("active", button.dataset.category === selectedCategory);
        });
        applyFilters();
        document.getElementById("products").scrollIntoView({ behavior: "smooth", block: "start" });
        closeMobileMenu();
        return;
    }

    if (event.target.closest("#categoryNav a")) {
        closeMobileMenu();
    }
});

const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const categoryNav = document.getElementById("categoryNav");
function closeMobileMenu() {
    categoryNav.classList.remove("is-open");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenuToggle.setAttribute("aria-label", "Open navigation");
}

mobileMenuToggle.addEventListener("click", () => {
    const isOpen = categoryNav.classList.toggle("is-open");
    mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    mobileMenuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});


// Step 9: Product Modal Function

function openProductModal(productId) {

    const product = products.find(item => {
        return String(item.id) === String(productId);
    });

    if (!product) return;

    productDetails.innerHTML = `
        <img
            class="modal-product-image"
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
        >

        <p class="modal-product-brand">${escapeHTML(brand)} · ${escapeHTML(product.Categories)}</p>
        <h2 class="modal-product-name" id="productModalTitle">
            ${escapeHTML(product.name)}
        </h2>
        <p class="modal-product-rating">★ ${Number(product.rating).toFixed(1)} / 5</p>
        <div class="modal-product-prices"><strong class="modal-product-price">₹${Number(product.price).toLocaleString("en-IN")}</strong><del>₹${originalPrice.toLocaleString("en-IN")}</del></div>
        <p class="Modal-product-description">A considered pick from EcomStore, selected for everyday quality and design.</p>
        <button class="add-to-cart-btn modal-add-to-cart" type="button" data-product-id="${Number(product.id)}">Add to cart</button>
    `;

    productModal.classList.remove("hidden");
    productModal.setAttribute("aria-hidden", "false");
    closeModal.focus();

}


function closeProductModal() {
    productModal.classList.add("hidden");
    productModal.setAttribute("aria-hidden", "true");
    productModalReturnFocus?.focus();
}

document.addEventListener("click", event => {
    const detailsButton = event.target.closest(".view-details-btn");
    if (detailsButton) {
        openProductModal(detailsButton.dataset.productId);
        return;
    }

    const addButton = event.target.closest(".add-to-cart-btn");
    if (addButton) addTocart(addButton.dataset.productId);
});


// Close Product Modal Using X Button

closeModal.addEventListener("click", function() {
    closeProductModal();
});


// Close Product Modal When Clicking Outside

productModal.addEventListener("click", function(event) {

    if (event.target === productModal) {
        closeProductModal();
    }

});


// Close Modal Using Escape Key

document.addEventListener("keydown", function(event) {
    if (event.key !== "Escape") return;
    if (!productModal.classList.contains("hidden")) closeProductModal();
    if (!cartModal.classList.contains("hidden")) closeCartModal();
});


// Cart Functionality Javascript

const cartModal = document.getElementById("cartModal");
const closeCart = document.getElementById("closeCart");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const clearCartButton = document.getElementById("clearCart");
const checkoutButton = document.getElementById("checkoutBtn");
const cartToast = document.getElementById("cartToast");
const cartToastMessage = document.getElementById("cartToastMessage");
let cartToastTimeout;

function showCartToast(message) {
    cartToastMessage.textContent = message;
    cartToast.classList.add("show");

    window.clearTimeout(cartToastTimeout);
    cartToastTimeout = window.setTimeout(() => {
        cartToast.classList.remove("show");
    }, 2800);
}


// Add Product To Cart

function addTocart(productId) {

    const product = products.find(item => {
        return String(item.id) === String(productId);
    });

    if (!product) return;

    const existingItem = cart.find(item => {
        return String(item.id) === String(productId);
    });

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
    showCartToast(`${product.name} has been added to your cart successfully.`);
}


// Update Cart

function updateCart() {

    try {
        localStorage.setItem(cartStorageKey, JSON.stringify(cart));
    } catch (error) {
        console.error("Could not save cart to localStorage:", error);
    }

    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;
    checkoutButton.disabled = cart.length === 0;

    cartItemsContainer.replaceChildren();

    if (cart.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "cart-empty-message";
        emptyMessage.textContent = "Your cart is empty.";
        cartItemsContainer.appendChild(emptyMessage);
    }

    let totalPrice = 0;

    cart.forEach(item => {

        totalPrice += item.price * item.quantity;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        const name = document.createElement("h4");
        name.textContent = item.name;

        const price = document.createElement("p");
        price.textContent = `₹${Number(item.price).toLocaleString("en-IN")} each`;

        const quantityControl = document.createElement("div");
        quantityControl.className = "cart-quantity-control";

        const decreaseButton = document.createElement("button");
        decreaseButton.type = "button";
        decreaseButton.textContent = "−";
        decreaseButton.dataset.action = "decrease";
        decreaseButton.dataset.productId = item.id;
        decreaseButton.setAttribute("aria-label", `Decrease ${item.name} quantity`);

        const quantity = document.createElement("span");
        quantity.className = "cart-quantity-value";
        quantity.textContent = String(item.quantity);

        const increaseButton = document.createElement("button");
        increaseButton.type = "button";
        increaseButton.textContent = "+";
        increaseButton.dataset.action = "increase";
        increaseButton.dataset.productId = item.id;
        increaseButton.setAttribute("aria-label", `Increase ${item.name} quantity`);

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-cart-item";
        removeButton.textContent = "Remove";
        removeButton.dataset.action = "remove";
        removeButton.dataset.productId = item.id;
        removeButton.setAttribute("aria-label", `Remove ${item.name} from cart`);

        quantityControl.append(decreaseButton, quantity, increaseButton);
        cartItem.append(name, price, quantityControl, removeButton);

        cartItemsContainer.appendChild(cartItem);
    });

    cartTotal.textContent =
        `Total: ₹${totalPrice.toLocaleString("en-IN")}`;
}


// Open Cart Modal

cartButton.addEventListener("click", function() {
    cartModal.classList.remove("hidden");
    cartModal.setAttribute("aria-hidden", "false");
    updateCart();
    closeCart.focus();
});

checkoutButton.addEventListener("click", function() {
    if (cart.length === 0) return;

    window.location.href = "checkout.html";
});


// Close Cart Modal

function closeCartModal() {
    cartModal.classList.add("hidden");
    cartModal.setAttribute("aria-hidden", "true");
    cartButton.focus();
}

closeCart.addEventListener("click", closeCartModal);


// Close Cart Modal When Clicking Outside

cartModal.addEventListener("click", function(event) {

    if (event.target === cartModal) {
        closeCartModal();
    }

});


// increase,Decrease or remove product

cartItemsContainer.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) return

    const productId = button.dataset.productId
    const action = button.dataset.action

    const itemIndex = cart.findIndex(item =>
        String(item.id) === String(productId)
    )

    if (itemIndex === -1) return

    if (action === "increase"){
        cart[itemIndex].quantity++
    } 
    if (action === "decrease") {
        cart[itemIndex].quantity--

        if (cart[itemIndex].quantity <=0) {
            cart.splice(itemIndex, 1)
        }
    }
    if (action === "remove") {
        cart.splice(itemIndex, 1)
    }

    updateCart()
})

// Clear Cart

clearCartButton.addEventListener("click", function() {

    cart.length = 0;

    updateCart();
});

// Restore the saved cart and count when the page loads.
updateCart();


