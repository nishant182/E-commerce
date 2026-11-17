const cartStorageKey = "ecomStoreCart";
const checkoutAddressKey = "ecomStoreCheckoutAddress";
const checkoutCouponKey = "ecomStoreCheckoutCoupon";

const checkoutForm = document.getElementById("addressForm");
const checkoutItems = document.getElementById("checkoutItems");
const itemCountLabel = document.getElementById("itemCountLabel");
const subtotalValue = document.getElementById("subtotalValue");
const discountRow = document.getElementById("discountRow");
const discountValue = document.getElementById("discountValue");
const totalValue = document.getElementById("totalValue");
const couponInput = document.getElementById("couponInput");
const couponFeedback = document.getElementById("couponFeedback");
const checkoutNotice = document.getElementById("checkoutNotice");
const checkoutContent = document.getElementById("checkoutContent");
const emptyCartMessage = document.getElementById("emptyCartMessage");
const paymentStep = document.getElementById("paymentStep");

const coupons = {
    SAVE10: { type: "percent", value: 10, label: "10% off" },
    WELCOME5: { type: "fixed", value: 50, label: "₹50 off orders over ₹500", minimum: 500 }
};

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
    } catch (error) {
        console.warn(`Could not read ${key} from localStorage:`, error);
        return fallback;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Could not save ${key} to localStorage:`, error);
        return false;
    }
}

function loadCheckoutCart() {
    const savedCart = readStorage(cartStorageKey, []);
    if (!Array.isArray(savedCart)) return [];

    return savedCart.filter(item =>
        item
        && item.name
        && Number.isFinite(Number(item.price))
        && Number(item.price) >= 0
        && Number.isFinite(Number(item.quantity))
        && Number(item.quantity) > 0
    ).map(item => ({
        ...item,
        price: Number(item.price),
        quantity: Math.floor(Number(item.quantity))
    }));
}

const cart = loadCheckoutCart();
let activeCoupon = "";

function formatCurrency(amount) {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function showNotice(message, isError = false) {
    checkoutNotice.textContent = message;
    checkoutNotice.classList.toggle("error", isError);
    checkoutNotice.hidden = false;
}

function getDiscount(subtotal) {
    const coupon = coupons[activeCoupon];
    if (!coupon) return 0;
    if (coupon.minimum && subtotal < coupon.minimum) return 0;

    const discount = coupon.type === "percent"
        ? subtotal * coupon.value / 100
        : coupon.value;
    return Math.min(subtotal, Math.round(discount));
}

function renderOrderSummary() {
    checkoutItems.replaceChildren();

    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    itemCountLabel.textContent = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "checkout-item";

        const image = document.createElement("img");
        image.src = item.image || "";
        image.alt = "";
        image.loading = "lazy";

        const copy = document.createElement("div");
        copy.className = "checkout-item-copy";

        const name = document.createElement("span");
        name.className = "checkout-item-name";
        name.textContent = item.name;

        const quantity = document.createElement("span");
        quantity.className = "checkout-item-quantity";
        quantity.textContent = `Qty ${item.quantity}`;

        const price = document.createElement("span");
        price.className = "checkout-item-price";
        price.textContent = formatCurrency(item.price * item.quantity);

        copy.append(name, quantity);
        row.append(image, copy, price);
        checkoutItems.append(row);
    });

    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const discount = getDiscount(subtotal);

    subtotalValue.textContent = formatCurrency(subtotal);
    discountRow.hidden = discount === 0;
    discountValue.textContent = `−${formatCurrency(discount)}`;
    totalValue.textContent = formatCurrency(subtotal - discount);

    checkoutContent.hidden = cart.length === 0;
    emptyCartMessage.hidden = cart.length > 0;
}

function loadSavedAddress() {
    const savedAddress = readStorage(checkoutAddressKey, null);
    if (!savedAddress || typeof savedAddress !== "object") return;

    Object.entries(savedAddress).forEach(([name, value]) => {
        const field = checkoutForm.elements.namedItem(name);
        if (field && typeof value === "string") field.value = value;
    });
}

function setCouponFeedback(message, isError = false) {
    couponFeedback.textContent = message;
    couponFeedback.classList.toggle("error-text", isError);
}

function applyCoupon() {
    const code = couponInput.value.trim().toUpperCase();
    const coupon = coupons[code];

    if (!coupon) {
        setCouponFeedback("That coupon code isn't valid.", true);
        return;
    }

    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    if (coupon.minimum && subtotal < coupon.minimum) {
        setCouponFeedback(`Add ${formatCurrency(coupon.minimum - subtotal)} more to use ${code}.`, true);
        return;
    }

    activeCoupon = code;
    writeStorage(checkoutCouponKey, activeCoupon);
    renderOrderSummary();
    setCouponFeedback(`${code} applied: ${coupon.label}.`);
}

function restoreCoupon() {
    const savedCoupon = readStorage(checkoutCouponKey, "");
    if (typeof savedCoupon !== "string" || !coupons[savedCoupon]) return;

    activeCoupon = savedCoupon;
    couponInput.value = savedCoupon;

    const coupon = coupons[activeCoupon];
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    if (coupon.minimum && subtotal < coupon.minimum) {
        activeCoupon = "";
        couponInput.value = "";
        writeStorage(checkoutCouponKey, "");
        return;
    }

    setCouponFeedback(`${activeCoupon} applied: ${coupon.label}.`);
}

document.getElementById("applyCoupon").addEventListener("click", applyCoupon);
couponInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        applyCoupon();
    }
});

checkoutForm.addEventListener("submit", event => {
    event.preventDefault();
    if (cart.length === 0 || !checkoutForm.reportValidity()) return;

    const address = Object.fromEntries(new FormData(checkoutForm).entries());
    if (!writeStorage(checkoutAddressKey, address)) {
        showNotice("Could not save your address in this browser. Please try again.", true);
        return;
    }

    paymentStep.hidden = false;
    showNotice("Delivery details saved. Choose a payment method below.");
    paymentStep.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("confirmPayment").addEventListener("click", () => {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedMethod) {
        showNotice("Please choose a payment method to continue.", true);
        return;
    }

    if (selectedMethod.value === "cod") {
        showNotice("Cash on delivery selected. Connect an order service to place this order.");
    } else {
        showNotice("Online payment selected. Connect a payment gateway to process this payment.");
    }
});

loadSavedAddress();
restoreCoupon();
renderOrderSummary();
