(() => {
    const productGrid = document.getElementById("productGrid");
    const toggleProductsButton = document.getElementById("toggleProductsButton");
    const productGridActions = productGrid?.parentElement.querySelector(".product-grid-actions");
    const headerWishlistButton = document.getElementById("headerWishlistButton");
    const headerWishlistCount = document.getElementById("headerWishlistCount");
    const productsPerPage = 8;
    const wishlistStorageKey = "ecomStoreWishlist";

    if (!productGrid || !toggleProductsButton || !productGridActions) {
        return;
    }

    let showAllProducts = false;
    let showWishlistOnly = false;

    function loadWishlist() {
        try {
            const savedWishlist = JSON.parse(localStorage.getItem(wishlistStorageKey) || "[]");
            return new Set(Array.isArray(savedWishlist) ? savedWishlist.map(String) : []);
        } catch (error) {
            console.warn("Could not load wishlist from localStorage:", error);
            return new Set();
        }
    }

    const wishlist = loadWishlist();

    function saveWishlist() {
        try {
            localStorage.setItem(wishlistStorageKey, JSON.stringify([...wishlist]));
        } catch (error) {
            console.error("Could not save wishlist to localStorage:", error);
        }
    }

    const toggleWishlistViewButton = document.createElement("button");
    toggleWishlistViewButton.className = "view-all-products-btn wishlist-view-btn";
    toggleWishlistViewButton.type = "button";
    toggleWishlistViewButton.setAttribute("aria-pressed", "false");
    productGridActions.appendChild(toggleWishlistViewButton);

    const wishlistEmptyMessage = document.createElement("div");
    wishlistEmptyMessage.className = "wishlist-empty-message";
    wishlistEmptyMessage.textContent = "Your wishlist is empty or has no products matching the current filters.";
    wishlistEmptyMessage.hidden = true;
    productGridActions.insertAdjacentElement("beforebegin", wishlistEmptyMessage);

    function addWishlistButton(card) {
        const productImage = card.querySelector(".product-image");
        const productId = card.querySelector("[data-product-id]")?.dataset.productId;
        const productName = card.querySelector(".product-name")?.textContent.trim() || "product";

        if (!productImage || !productId) {
            return;
        }

        let wishlistButton = productImage.querySelector(".wishlist-toggle-btn");

        if (!wishlistButton) {
            wishlistButton = document.createElement("button");
            wishlistButton.className = "wishlist-toggle-btn";
            wishlistButton.type = "button";
            wishlistButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.2 8.7c0 5.1-8.2 10-8.2 10s-8.2-4.9-8.2-10a4.2 4.2 0 0 1 8.2-1.2 4.2 4.2 0 0 1 8.2 1.2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
            productImage.appendChild(wishlistButton);
        }

        const isInWishlist = wishlist.has(String(productId));
        wishlistButton.dataset.productId = productId;
        wishlistButton.classList.toggle("is-in-wishlist", isInWishlist);
        wishlistButton.setAttribute("aria-pressed", String(isInWishlist));
        wishlistButton.setAttribute(
            "aria-label",
            `${isInWishlist ? "Remove" : "Add"} ${productName} ${isInWishlist ? "from" : "to"} wishlist`
        );
        wishlistButton.title = isInWishlist ? "Remove from wishlist" : "Add to wishlist";
    }

    function updateProductVisibility() {
        document.querySelectorAll(".product-grid .product-card").forEach(addWishlistButton);
        const productCards = productGrid.querySelectorAll(".product-card");
        const eligibleCards = [];

        productCards.forEach(card => {
            const productId = card.querySelector(".wishlist-toggle-btn")?.dataset.productId;
            const isInWishlist = productId && wishlist.has(String(productId));

            if (!showWishlistOnly || isInWishlist) {
                eligibleCards.push(card);
            }
        });

        eligibleCards.forEach((card, index) => {
            card.hidden = !showAllProducts && index >= productsPerPage;
        });

        productCards.forEach(card => {
            if (showWishlistOnly && !eligibleCards.includes(card)) {
                card.hidden = true;
            }
        });

        const defaultEmptyMessage = productGrid.querySelector(".empty-message");
        if (defaultEmptyMessage) {
            defaultEmptyMessage.hidden = showWishlistOnly;
        }

        wishlistEmptyMessage.hidden = !showWishlistOnly || eligibleCards.length > 0;
        toggleProductsButton.hidden = eligibleCards.length <= productsPerPage;
        toggleProductsButton.textContent = showAllProducts ? "Show less" : "View all products";
        toggleProductsButton.setAttribute("aria-expanded", String(showAllProducts));

        toggleWishlistViewButton.textContent = showWishlistOnly
            ? `Back to all products (${wishlist.size})`
            : `View wishlist (${wishlist.size})`;
        toggleWishlistViewButton.setAttribute("aria-pressed", String(showWishlistOnly));
        if (headerWishlistCount) headerWishlistCount.textContent = String(wishlist.size);
        headerWishlistButton?.setAttribute("aria-label", `View wishlist, ${wishlist.size} ${wishlist.size === 1 ? "item" : "items"}`);
    }

    const productGridObserver = new MutationObserver(() => {
        showAllProducts = false;
        updateProductVisibility();
    });

    productGridObserver.observe(productGrid, { childList: true });

    toggleProductsButton.addEventListener("click", () => {
        showAllProducts = !showAllProducts;
        updateProductVisibility();
    });

    toggleWishlistViewButton.addEventListener("click", () => {
        showWishlistOnly = !showWishlistOnly;
        showAllProducts = false;
        updateProductVisibility();
    });

    document.addEventListener("click", event => {
        if (event.target.closest("#headerWishlistButton")) {
            showWishlistOnly = !showWishlistOnly;
            showAllProducts = false;
            updateProductVisibility();
            productGrid.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        const wishlistButton = event.target.closest(".wishlist-toggle-btn");
        if (!wishlistButton) {
            return;
        }

        const productId = String(wishlistButton.dataset.productId);
        if (wishlist.has(productId)) {
            wishlist.delete(productId);
        } else {
            wishlist.add(productId);
        }

        saveWishlist();
        updateProductVisibility();
    });

    updateProductVisibility();
})();

(() => {
    const header = document.querySelector("header");
    const cartButton = document.getElementById("cartBtn");

    if (!header || !cartButton) {
        return;
    }

    const accountsStorageKey = "ecomStoreAccounts";
    const activeAccountStorageKey = "ecomStoreActiveAccount";
    const ordersStorageKey = "ecomStoreOrders";
    const passwordIterations = 120000;

    function loadAccounts() {
        try {
            const savedAccounts = JSON.parse(localStorage.getItem(accountsStorageKey) || "[]");
            return Array.isArray(savedAccounts) ? savedAccounts : [];
        } catch (error) {
            console.warn("Could not load demo accounts:", error);
            return [];
        }
    }

    let accounts = loadAccounts();
    let activeAccount = null;
    let resetCode = "";
    let resetEmail = "";
    let resetExpiresAt = 0;

    try {
        const activeEmail = localStorage.getItem(activeAccountStorageKey);
        activeAccount = accounts.find(account => account.email === activeEmail) || null;
    } catch (error) {
        console.warn("Could not load the signed-in demo account:", error);
    }

    const accountButton = document.createElement("button");
    accountButton.className = "account-button";
    accountButton.type = "button";
    accountButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span></span>';
    const accountLabel = accountButton.querySelector("span");
    header.insertBefore(accountButton, cartButton);

    const authModal = document.createElement("div");
    authModal.className = "auth-modal";
    authModal.hidden = true;
    authModal.setAttribute("role", "dialog");
    authModal.setAttribute("aria-modal", "true");
    authModal.setAttribute("aria-labelledby", "authModalTitle");
    authModal.innerHTML = `
        <section class="auth-modal-panel">
            <button class="auth-close-btn" type="button" aria-label="Close account dialog">&times;</button>
            <p class="auth-eyebrow">EcomStore account</p>
            <h2 id="authModalTitle" class="auth-modal-title"></h2>
            <p class="auth-demo-note">
                Demo only: accounts are saved in this browser. Password reset codes appear here; no email is sent.
            </p>
            <div class="auth-modal-content"></div>
        </section>
    `;
    document.body.appendChild(authModal);

    const authContent = authModal.querySelector(".auth-modal-content");
    const authTitle = authModal.querySelector(".auth-modal-title");
    const authCloseButton = authModal.querySelector(".auth-close-btn");

    function updateAccountButton() {
        accountLabel.textContent = activeAccount
            ? `Hi, ${activeAccount.name}`
            : "Sign in / Register";
        accountButton.setAttribute("aria-label", activeAccount
            ? `Account for ${activeAccount.name}`
            : "Sign in or register");
    }

    function saveAccounts(nextAccounts) {
        try {
            localStorage.setItem(accountsStorageKey, JSON.stringify(nextAccounts));
            accounts = nextAccounts;
            return true;
        } catch (error) {
            console.error("Could not save demo accounts:", error);
            return false;
        }
    }

    function normalizeEmail(email) {
        return String(email || "").trim().toLowerCase();
    }

    function loadOrders() {
        try {
            const savedOrders = JSON.parse(localStorage.getItem(ordersStorageKey) || "[]");
            return Array.isArray(savedOrders) ? savedOrders : [];
        } catch (error) {
            console.warn("Could not load order history:", error);
            return [];
        }
    }

    function saveOrders(orderList) {
        try {
            localStorage.setItem(ordersStorageKey, JSON.stringify(orderList));
            return true;
        } catch (error) {
            console.error("Could not save order history:", error);
            return false;
        }
    }

    function setActiveAccount(account) {
        activeAccount = account;
        updateAccountButton();

        try {
            if (account) {
                localStorage.setItem(activeAccountStorageKey, account.email);
            } else {
                localStorage.removeItem(activeAccountStorageKey);
            }
        } catch (error) {
            console.warn("Could not save the demo account session:", error);
        }
    }

    function bytesToHex(bytes) {
        return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
    }

    function hexToBytes(hex) {
        return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    }

    async function hashPassword(password, saltHex) {
        if (!window.crypto?.subtle || !window.crypto?.getRandomValues) {
            throw new Error("Password security is unavailable in this browser. Open the store through localhost and try again.");
        }

        const salt = saltHex
            ? hexToBytes(saltHex)
            : window.crypto.getRandomValues(new Uint8Array(16));
        const passwordKey = await window.crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(password),
            "PBKDF2",
            false,
            ["deriveBits"]
        );
        const derivedBits = await window.crypto.subtle.deriveBits({
            name: "PBKDF2",
            salt,
            iterations: passwordIterations,
            hash: "SHA-256"
        }, passwordKey, 256);

        return {
            salt: saltHex || bytesToHex(salt),
            hash: bytesToHex(new Uint8Array(derivedBits))
        };
    }

    function showMessage(form, message, kind = "error") {
        const messageElement = form.querySelector(".auth-message");
        messageElement.textContent = message;
        messageElement.className = `auth-message ${kind}`;
        messageElement.hidden = false;
    }

    function showForm(view, options = {}) {
        const forms = {
            login: {
                title: "Welcome back",
                markup: `
                    <form class="auth-form" data-auth-form="login">
                        <label>Email address<input name="email" type="email" autocomplete="email" required></label>
                        <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
                        <p class="auth-message" role="status" hidden></p>
                        <button class="auth-submit-btn" type="submit">Sign in</button>
                        <div class="auth-form-links">
                            <button type="button" data-auth-view="forgot">Forgot password?</button>
                            <span>New here? <button type="button" data-auth-view="register">Create an account</button></span>
                        </div>
                    </form>
                `
            },
            register: {
                title: "Create your account",
                markup: `
                    <form class="auth-form" data-auth-form="register">
                        <label>Full name<input name="name" type="text" autocomplete="name" maxlength="80" required></label>
                        <label>Email address<input name="email" type="email" autocomplete="email" required></label>
                        <label>Password<input name="password" type="password" autocomplete="new-password" minlength="8" required><small>Use at least 8 characters.</small></label>
                        <label>Confirm password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></label>
                        <p class="auth-message" role="status" hidden></p>
                        <button class="auth-submit-btn" type="submit">Register</button>
                        <div class="auth-form-links"><span>Already registered? <button type="button" data-auth-view="login">Sign in</button></span></div>
                    </form>
                `
            },
            forgot: {
                title: "Reset your password",
                markup: `
                    <form class="auth-form" data-auth-form="forgot">
                        <p class="auth-form-intro">Enter the email address used for your account.</p>
                        <label>Email address<input name="email" type="email" autocomplete="email" required></label>
                        <p class="auth-message" role="status" hidden></p>
                        <button class="auth-submit-btn" type="submit">Get reset code</button>
                        <div class="auth-form-links"><button type="button" data-auth-view="login">Back to sign in</button></div>
                    </form>
                `
            },
            reset: {
                title: "Choose a new password",
                markup: `
                    <form class="auth-form" data-auth-form="reset">
                        <p class="auth-form-intro">Enter the 6-digit code and choose a new password.</p>
                        <div class="auth-reset-code" role="status"></div>
                        <label>Reset code<input name="code" type="text" inputmode="numeric" pattern="[0-9]{6}" autocomplete="one-time-code" maxlength="6" required></label>
                        <label>New password<input name="password" type="password" autocomplete="new-password" minlength="8" required></label>
                        <label>Confirm new password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></label>
                        <p class="auth-message" role="status" hidden></p>
                        <button class="auth-submit-btn" type="submit">Save new password</button>
                    </form>
                `
            },
            "edit-profile": {
                title: "Edit your profile",
                markup: `
                    <form class="auth-form" data-auth-form="edit-profile">
                        <label>Full name<input name="name" type="text" autocomplete="name" maxlength="80" required></label>
                        <label>Email address<input name="email" type="email" autocomplete="email" required></label>
                        <label>Phone number<input name="phone" type="tel" autocomplete="tel" maxlength="30"></label>
                        <label>Address<input name="address" type="text" autocomplete="street-address" maxlength="180"></label>
                        <p class="auth-message" role="status" hidden></p>
                        <button class="auth-submit-btn" type="submit">Save profile</button>
                        <div class="auth-form-links"><button type="button" data-auth-view="profile">Cancel</button></div>
                    </form>
                `
            },
            "change-password": {
                title: "Change your password",
                markup: `
                    <form class="auth-form" data-auth-form="change-password">
                        <label>Current password<input name="currentPassword" type="password" autocomplete="current-password" required></label>
                        <label>New password<input name="password" type="password" autocomplete="new-password" minlength="8" required><small>Use at least 8 characters.</small></label>
                        <label>Confirm new password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></label>
                        <p class="auth-message" role="status" hidden></p>
                        <button class="auth-submit-btn" type="submit">Update password</button>
                        <div class="auth-form-links"><button type="button" data-auth-view="profile">Cancel</button></div>
                    </form>
                `
            }
        };

        authTitle.textContent = forms[view].title;
        authContent.innerHTML = forms[view].markup;

        const emailInput = authContent.querySelector('[name="email"]');
        if (emailInput && options.email) {
            emailInput.value = options.email;
        }

        if (view === "edit-profile" && activeAccount) {
            ["name", "email", "phone", "address"].forEach(fieldName => {
                const field = authContent.querySelector(`[name="${fieldName}"]`);
                if (field) {
                    field.value = activeAccount[fieldName] || "";
                }
            });
        }

        const resetCodeMessage = authContent.querySelector(".auth-reset-code");
        if (resetCodeMessage) {
            resetCodeMessage.textContent = `Demo reset code: ${options.code || ""}`;
        }

        authContent.querySelector("input")?.focus();
    }

    function renderAccountDashboard() {
        authTitle.textContent = "Your account";
        authContent.innerHTML = `
            <div class="auth-account-view">
                <p>Signed in as</p>
                <strong class="auth-account-name"></strong>
                <span class="auth-account-email"></span>
                <div class="auth-account-actions">
                    <button type="button" data-auth-view="profile">View profile</button>
                    <button type="button" data-auth-view="edit-profile">Edit profile</button>
                    <button type="button" data-auth-view="change-password">Change password</button>
                    <button type="button" data-auth-view="orders">View order history</button>
                    <button type="button" class="auth-signout-btn" data-auth-action="logout">Sign out</button>
                </div>
            </div>
        `;
        authContent.querySelector(".auth-account-name").textContent = activeAccount?.name || "";
        authContent.querySelector(".auth-account-email").textContent = activeAccount?.email || "";
    }

    function renderProfileView() {
        authTitle.textContent = "Your profile";
        authContent.innerHTML = `
            <div class="auth-profile-view">
                <dl>
                    <div><dt>Full name</dt><dd data-profile-field="name"></dd></div>
                    <div><dt>Email address</dt><dd data-profile-field="email"></dd></div>
                    <div><dt>Phone number</dt><dd data-profile-field="phone"></dd></div>
                    <div><dt>Address</dt><dd data-profile-field="address"></dd></div>
                </dl>
                <div class="auth-form-links">
                    <button type="button" data-auth-view="account">Back to account</button>
                    <button type="button" data-auth-view="edit-profile">Edit profile</button>
                </div>
            </div>
        `;

        ["name", "email", "phone", "address"].forEach(fieldName => {
            const value = activeAccount?.[fieldName] || "Not added";
            authContent.querySelector(`[data-profile-field="${fieldName}"]`).textContent = value;
        });
    }

    function renderOrderHistory() {
        authTitle.textContent = "Order history";
        authContent.replaceChildren();

        const backButton = document.createElement("button");
        backButton.type = "button";
        backButton.className = "auth-back-button";
        backButton.dataset.authView = "account";
        backButton.textContent = "Back to account";
        authContent.appendChild(backButton);

        const matchingOrders = loadOrders()
            .filter(order => normalizeEmail(order.email) === normalizeEmail(activeAccount?.email))
            .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));

        if (matchingOrders.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "auth-orders-empty";
            emptyMessage.textContent = "No orders are linked to this profile yet. Use this account email at checkout to see future demo orders here.";
            authContent.appendChild(emptyMessage);
            return;
        }

        const orderList = document.createElement("div");
        orderList.className = "auth-order-list";

        matchingOrders.forEach(order => {
            const currency = order.currency === "USD" ? "USD" : "INR";
            const formatOrderAmount = amount => new Intl.NumberFormat(
                currency === "INR" ? "en-IN" : "en-US",
                { style: "currency", currency, maximumFractionDigits: currency === "INR" ? 0 : 2 }
            ).format(Number(amount) || 0);
            const orderCard = document.createElement("article");
            orderCard.className = "auth-order-card";

            const orderHeading = document.createElement("div");
            orderHeading.className = "auth-order-heading";

            const orderId = document.createElement("strong");
            orderId.textContent = order.id || "Demo order";

            const orderDate = document.createElement("span");
            const parsedDate = new Date(order.createdAt);
            orderDate.textContent = Number.isNaN(parsedDate.getTime())
                ? "Date unavailable"
                : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsedDate);

            orderHeading.append(orderId, orderDate);
            orderCard.appendChild(orderHeading);

            const itemList = document.createElement("ul");
            itemList.className = "auth-order-items";
            (Array.isArray(order.items) ? order.items : []).forEach(item => {
                const itemRow = document.createElement("li");
                const itemName = document.createElement("span");
                itemName.textContent = `${item.name || "Store item"} × ${Number(item.quantity) || 1}`;
                const itemPrice = document.createElement("span");
                itemPrice.textContent = formatOrderAmount((Number(item.price) || 0) * (Number(item.quantity) || 1));
                itemRow.append(itemName, itemPrice);
                itemList.appendChild(itemRow);
            });
            orderCard.appendChild(itemList);

            const orderTotal = document.createElement("p");
            orderTotal.className = "auth-order-total";
            orderTotal.textContent = `Total: ${formatOrderAmount(order.total)}`;
            orderCard.appendChild(orderTotal);

            const orderStatus = document.createElement("span");
            orderStatus.className = "auth-order-status";
            orderStatus.textContent = order.status || "Demo order confirmed";
            orderCard.appendChild(orderStatus);

            orderList.appendChild(orderCard);
        });

        authContent.appendChild(orderList);
    }

    function openAuthModal(view = activeAccount ? "account" : "login") {
        authModal.hidden = false;
        document.body.classList.add("auth-modal-open");

        if (view === "account") {
            renderAccountDashboard();
        } else if (view === "profile") {
            renderProfileView();
        } else if (view === "orders") {
            renderOrderHistory();
        } else {
            showForm(view);
        }
    }

    function closeAuthModal() {
        authModal.hidden = true;
        document.body.classList.remove("auth-modal-open");
        accountButton.focus();
    }

    function makeResetCode() {
        const randomValues = window.crypto.getRandomValues(new Uint32Array(1));
        return String(100000 + randomValues[0] % 900000);
    }

    accountButton.addEventListener("click", () => openAuthModal());
    authCloseButton.addEventListener("click", closeAuthModal);
    document.getElementById("footerAccountButton")?.addEventListener("click", () => openAuthModal());

    authModal.addEventListener("click", event => {
        if (event.target === authModal) {
            closeAuthModal();
            return;
        }

        const viewButton = event.target.closest("[data-auth-view]");
        if (viewButton) {
            const email = authContent.querySelector('[name="email"]')?.value.trim() || "";
            const nextView = viewButton.dataset.authView;
            if (["account", "profile", "orders"].includes(nextView)) {
                openAuthModal(nextView);
            } else {
                showForm(nextView, { email });
            }
            return;
        }

        if (event.target.closest('[data-auth-action="logout"]')) {
            setActiveAccount(null);
            closeAuthModal();
        }
    });

    authModal.addEventListener("submit", async event => {
        const form = event.target.closest("[data-auth-form]");
        if (!form) {
            return;
        }

        event.preventDefault();
        const formData = new FormData(form);
        const submitButton = form.querySelector('[type="submit"]');
        submitButton.disabled = true;

        try {
            if (form.dataset.authForm === "register") {
                const name = String(formData.get("name")).trim();
                const email = String(formData.get("email")).trim().toLowerCase();
                const password = String(formData.get("password"));
                const confirmPassword = String(formData.get("confirmPassword"));

                if (password !== confirmPassword) {
                    showMessage(form, "Passwords do not match.");
                    return;
                }

                if (accounts.some(account => account.email === email)) {
                    showMessage(form, "An account with this email already exists. Sign in instead.");
                    return;
                }

                const passwordRecord = await hashPassword(password);
                const newAccount = { name, email, ...passwordRecord };

                if (!saveAccounts([...accounts, newAccount])) {
                    showMessage(form, "Could not save this demo account in the browser.");
                    return;
                }

                setActiveAccount(newAccount);
                openAuthModal("account");
            } else if (form.dataset.authForm === "login") {
                const email = String(formData.get("email")).trim().toLowerCase();
                const password = String(formData.get("password"));
                const account = accounts.find(savedAccount => savedAccount.email === email);

                if (!account) {
                    showMessage(form, "Email or password is incorrect.");
                    return;
                }

                const passwordRecord = await hashPassword(password, account.salt);
                if (passwordRecord.hash !== account.hash) {
                    showMessage(form, "Email or password is incorrect.");
                    return;
                }

                setActiveAccount(account);
                openAuthModal("account");
            } else if (form.dataset.authForm === "forgot") {
                const email = String(formData.get("email")).trim().toLowerCase();
                const account = accounts.find(savedAccount => savedAccount.email === email);

                if (!account) {
                    showMessage(form, "No demo account was found for this email.");
                    return;
                }

                resetEmail = email;
                resetCode = makeResetCode();
                resetExpiresAt = Date.now() + 10 * 60 * 1000;
                showForm("reset", { email, code: resetCode });
            } else if (form.dataset.authForm === "reset") {
                const enteredCode = String(formData.get("code")).trim();
                const password = String(formData.get("password"));
                const confirmPassword = String(formData.get("confirmPassword"));
                const emailForLogin = resetEmail;

                if (Date.now() > resetExpiresAt || enteredCode !== resetCode) {
                    showMessage(form, "That reset code is incorrect or has expired. Request a new code.");
                    return;
                }

                if (password !== confirmPassword) {
                    showMessage(form, "Passwords do not match.");
                    return;
                }

                const passwordRecord = await hashPassword(password);
                const updatedAccounts = accounts.map(account => account.email === resetEmail
                    ? { ...account, ...passwordRecord }
                    : account);

                if (!saveAccounts(updatedAccounts)) {
                    showMessage(form, "Could not save the new password in the browser.");
                    return;
                }

                resetCode = "";
                resetEmail = "";
                resetExpiresAt = 0;
                showForm("login", { email: emailForLogin });
                const message = authContent.querySelector(".auth-message");
                message.textContent = "Password updated. You can sign in with your new password.";
                message.classList.add("success");
                message.hidden = false;
            } else if (form.dataset.authForm === "edit-profile") {
                if (!activeAccount) {
                    showMessage(form, "Sign in before editing your profile.");
                    return;
                }

                const name = String(formData.get("name")).trim();
                const email = normalizeEmail(formData.get("email"));
                const phone = String(formData.get("phone") || "").trim();
                const address = String(formData.get("address") || "").trim();
                const oldEmail = normalizeEmail(activeAccount.email);

                if (accounts.some(account => normalizeEmail(account.email) === email && normalizeEmail(account.email) !== oldEmail)) {
                    showMessage(form, "Another account already uses this email address.");
                    return;
                }

                const updatedAccount = { ...activeAccount, name, email, phone, address };
                const updatedOrders = loadOrders();
                const migratedOrders = email === oldEmail
                    ? updatedOrders
                    : updatedOrders.map(order => normalizeEmail(order.email) === oldEmail
                        ? { ...order, email }
                        : order);

                if (email !== oldEmail && !saveOrders(migratedOrders)) {
                    showMessage(form, "Could not update the email on this profile's order history.");
                    return;
                }

                const updatedAccounts = accounts.map(account => normalizeEmail(account.email) === oldEmail
                    ? updatedAccount
                    : account);

                if (!saveAccounts(updatedAccounts)) {
                    if (email !== oldEmail) {
                        saveOrders(updatedOrders);
                    }
                    showMessage(form, "Could not save your profile in this browser.");
                    return;
                }

                setActiveAccount(updatedAccount);
                openAuthModal("profile");
            } else if (form.dataset.authForm === "change-password") {
                if (!activeAccount) {
                    showMessage(form, "Sign in before changing your password.");
                    return;
                }

                const currentPassword = String(formData.get("currentPassword"));
                const password = String(formData.get("password"));
                const confirmPassword = String(formData.get("confirmPassword"));
                const currentPasswordRecord = await hashPassword(currentPassword, activeAccount.salt);

                if (currentPasswordRecord.hash !== activeAccount.hash) {
                    showMessage(form, "Current password is incorrect.");
                    return;
                }

                if (password !== confirmPassword) {
                    showMessage(form, "New passwords do not match.");
                    return;
                }

                const passwordRecord = await hashPassword(password);
                const updatedAccount = { ...activeAccount, ...passwordRecord };
                const updatedAccounts = accounts.map(account => normalizeEmail(account.email) === normalizeEmail(activeAccount.email)
                    ? updatedAccount
                    : account);

                if (!saveAccounts(updatedAccounts)) {
                    showMessage(form, "Could not save the new password in this browser.");
                    return;
                }

                setActiveAccount(updatedAccount);
                openAuthModal("account");
            }
        } catch (error) {
            console.error("Demo account action failed:", error);
            showMessage(form, error.message || "This account action could not be completed.");
        } finally {
            if (submitButton.isConnected) {
                submitButton.disabled = false;
            }
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !authModal.hidden) {
            closeAuthModal();
        }
    });

    updateAccountButton();
})();
