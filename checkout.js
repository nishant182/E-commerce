(() => {
    const cartStorageKey = "ecomStoreCart";
    const ordersStorageKey = "ecomStoreOrders";
    const itemsContainer = document.getElementById("items");
    const emptyCartMessage = document.getElementById("empty-cart-message");
    const form = document.getElementById("checkout-form");
    const placeOrderButton = document.getElementById("place-order");
    const overlay = document.getElementById("success-overlay");

    function readArray(key) {
        try {
            const value = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(value) ? value : [];
        } catch (error) {
            console.warn(`Could not read ${key}:`, error);
            return [];
        }
    }

    function loadCart() {
        return readArray(cartStorageKey)
            .filter(item => item
                && typeof item.name === "string"
                && Number.isFinite(Number(item.price))
                && Number(item.price) >= 0
                && Number.isFinite(Number(item.quantity))
                && Number(item.quantity) > 0)
            .map(item => ({
                name: item.name,
                price: Number(item.price),
                quantity: Math.floor(Number(item.quantity)),
                image: typeof item.image === "string" ? item.image : ""
            }));
    }

    const cart = loadCart();
    const money = value => new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

    function renderCart() {
        itemsContainer.replaceChildren();

        cart.forEach(item => {
            const row = document.createElement("div");
            row.className = "checkout-item";

            const image = document.createElement("img");
            image.alt = "";
            image.loading = "lazy";
            if (item.image) {
                image.src = item.image;
                image.addEventListener("error", () => image.removeAttribute("src"), { once: true });
            }

            const copy = document.createElement("div");
            copy.className = "checkout-item-copy";
            const name = document.createElement("span");
            name.className = "checkout-item-name";
            name.textContent = item.name;
            const quantity = document.createElement("span");
            quantity.className = "checkout-item-meta";
            quantity.textContent = `Qty ${item.quantity}`;
            copy.append(name, quantity);

            const price = document.createElement("span");
            price.className = "checkout-item-price";
            price.textContent = money(item.price * item.quantity);
            row.append(image, copy, price);
            itemsContainer.appendChild(row);
        });

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = Math.round(subtotal * 0.08);
        document.getElementById("subtotal").textContent = money(subtotal);
        document.getElementById("tax").textContent = money(tax);
        document.getElementById("total").textContent = money(subtotal + tax);
        emptyCartMessage.hidden = cart.length > 0;
        placeOrderButton.disabled = cart.length === 0;
        form.querySelectorAll("input, select").forEach(field => {
            field.disabled = cart.length === 0;
        });
    }

    function prefillAccount() {
        try {
            const activeEmail = localStorage.getItem("ecomStoreActiveAccount") || "";
            const accounts = readArray("ecomStoreAccounts");
            const account = accounts.find(saved => String(saved.email || "").toLowerCase() === activeEmail.toLowerCase());
            if (!account) return;

            document.getElementById("email").value = account.email || "";
            const nameParts = String(account.name || "").trim().split(/\s+/).filter(Boolean);
            document.getElementById("first-name").value = nameParts.shift() || "";
            document.getElementById("last-name").value = nameParts.join(" ");
            document.getElementById("address").value = account.address || "";
        } catch (error) {
            console.warn("Could not prefill the demo account:", error);
        }
    }

    function saveOrder(order) {
        try {
            const orders = readArray(ordersStorageKey);
            orders.unshift(order);
            localStorage.setItem(ordersStorageKey, JSON.stringify(orders));
            return true;
        } catch (error) {
            console.error("Could not save the demo order:", error);
            return false;
        }
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        if (!cart.length || !form.reportValidity()) return;

        const formData = new FormData(form);
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = Math.round(subtotal * 0.08);
        const orderId = `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const order = {
            id: orderId,
            email: String(formData.get("email") || "").trim().toLowerCase(),
            customerName: `${String(formData.get("firstName") || "").trim()} ${String(formData.get("lastName") || "").trim()}`.trim(),
            createdAt: new Date().toISOString(),
            status: "Demo order confirmed",
            currency: "INR",
            items: cart.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
            subtotal,
            tax,
            total: subtotal + tax
        };
        const orderSaved = saveOrder(order);

        document.getElementById("order-number").textContent = `ORDER #${orderId}`;
        document.getElementById("success-copy").textContent = orderSaved
            ? "Your demo order is in. This checkout does not process a real payment."
            : "Your demo order is confirmed, but could not be saved to this browser's order history.";
        overlay.classList.add("open");
        document.getElementById("close-success").focus();

        if (orderSaved) {
            try {
                localStorage.removeItem(cartStorageKey);
            } catch (error) {
                console.warn("Could not clear the saved demo cart:", error);
            }
            cart.length = 0;
            renderCart();
        }
    });

    function closeConfirmation() {
        overlay.classList.remove("open");
        if (placeOrderButton.disabled) document.querySelector(".checkout-back-link").focus();
        else placeOrderButton.focus();
    }

    document.getElementById("close-success").addEventListener("click", closeConfirmation);
    document.getElementById("continue-button").addEventListener("click", () => {
        window.location.href = "index.html";
    });
    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeConfirmation();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && overlay.classList.contains("open")) closeConfirmation();
    });

    prefillAccount();
    renderCart();
})();
