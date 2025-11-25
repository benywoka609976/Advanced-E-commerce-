(function(){
    // Theme switcher
    const themes = ["theme-default","theme-redwhite","theme-blackwhite","theme-purpleblue","theme-maroonwhite","theme-goldblack"];
    let themeIdx = 0;
    const themeBtn = document.getElementById("themeSwitcherBtn");
    function applyTheme(idx) {
        document.body.classList.remove(...themes);
        document.body.classList.add(themes[idx]);
        localStorage.setItem("rosmatt_theme",idx);
    }
    if (themeBtn) {
        themeBtn.addEventListener("click",() => {
            themeIdx = (themeIdx+1)%themes.length;
            applyTheme(themeIdx);
        });
    }
    window.addEventListener("DOMContentLoaded", () => {
        let idx=+localStorage.getItem("rosmatt_theme")||0; themeIdx=idx; applyTheme(idx);
        updateCartCount();
        renderCartFloat();
    });

    // Cart Manager
    function getCart() { return JSON.parse(localStorage.getItem("rosmatt_cart")||"[]"); }
    function setCart(cart) { localStorage.setItem("rosmatt_cart",JSON.stringify(cart)); }
    function updateCartCount() {
        const cart = getCart();
        [...document.querySelectorAll("#cartCount")].forEach(n=>n.textContent=cart.reduce((t,i)=>t+i.qty,0));
    }
    function addToCart(id,name,price) {
        let cart=getCart();
        let idx=cart.findIndex(i=>i.id===id);
        if(idx>-1)cart[idx].qty++;else cart.push({id,name,price,qty:1});
        setCart(cart); updateCartCount(); renderCartFloat();
    }
    function removeFromCart(id) {
        let cart=getCart().filter(i=>i.id!==id);
        setCart(cart); updateCartCount(); renderCartFloat();
    }
    function changeItemQty(id,qty) {
        let cart=getCart(); let idx=cart.findIndex(i=>i.id===id);
        if(idx>-1){cart[idx].qty=qty<1?1:qty;} setCart(cart); updateCartCount(); renderCartFloat();
    }
    function emptyCart() { setCart([]); updateCartCount(); renderCartFloat(); }
    function renderCartFloat() {
        const cartDiv=document.getElementById("cartFloat");
        if(!cartDiv)return;
        let cart=getCart();
        if(cart.length===0){cartDiv.classList.add("hidden"); return;}
        let total = cart.reduce((t,i)=>t+i.price*i.qty,0);
        let html=`<div class="cart-header">🛒 Cart</div>
        <div class="cart-items">${cart.map(item=>`
            <div class="cart-item">
                <span>${item.name}</span>
                <span>Ksh ${item.price} x
                    <input type="number" min="1" value="${item.qty}" class="qty-input" data-id="${item.id}" style="width:36px;" />
                    <button class="rm-cart-btn" data-id="${item.id}">×</button>
                </span>
            </div>`).join('')}
        </div>
        <div class="cart-total">Total: Ksh ${total}</div>
        <div class="cart-actions">
            <button class="checkout-btn">Checkout</button>
            <button class="empty-cart-btn">Empty</button>
        </div>`;
        cartDiv.innerHTML=html; cartDiv.classList.remove("hidden");
        // Cart functionality
        cartDiv.querySelectorAll(".rm-cart-btn").forEach(btn=>{
            btn.onclick=()=>removeFromCart(btn.dataset.id);
        });
        cartDiv.querySelectorAll(".qty-input").forEach(inp=>{
            inp.onchange=()=>changeItemQty(inp.dataset.id,parseInt(inp.value));
        });
        cartDiv.querySelector(".checkout-btn").onclick=()=>redirectWhatsappOrder(cart);
        cartDiv.querySelector(".empty-cart-btn").onclick=emptyCart;
    }
    function redirectWhatsappOrder(cart) {
        let msg = "RosmaTT Kenya Order:%0A"
            +cart.map(i=>`${i.qty} x ${i.name} (Ksh${i.price})`).join('%0A')
            +`%0ATotal: Ksh${cart.reduce((t,i)=>t+i.price*i.qty,0)}`;
        window.open(`https://wa.me/254714227080?text=${msg}`,"_blank");
    }
    // Add-to-cart and details on product cards
    document.addEventListener("click",function(e){
        // Add to cart
        if(e.target.matches(".add-cart-btn")){
            let card=e.target.closest(".product-card");
            let {id,name,price}=card.dataset;
            addToCart(id,name,+price);
        }
        // Details Pop modal
        if(e.target.matches(".details-btn")){
            let card=e.target.closest(".product-card");
            showProductModal({
                title: card.querySelector("h3").textContent,
                img: card.querySelector("img").src,
                price: card.dataset.price,
                desc: "This is a detailed description. Replace with actual product info."
            });
        }
        // Close Modal
        if(e.target.matches(".close-modal"))hideModal();
        if(e.target.classList.contains("modal"))hideModal();
    });

    // Product Modal
    function showProductModal(product){
        const modal=document.getElementById("productModal");
        modal.innerHTML=`
            <div class="modal-content">
                <button class="close-modal">×</button>
                <img src="${product.img}" alt="${product.title}" style="width:140px;border-radius:8px;">
                <h2>${product.title}</h2>
                <p class="modal-price">Ksh ${product.price}</p>
                <p>${product.desc}</p>
            </div>`;
        modal.classList.remove("hidden");
    }
    function hideModal(){
        document.getElementById("productModal").classList.add("hidden");
    }

    // Lazy loading for images using IntersectionObserver
    if("IntersectionObserver" in window){
        let lazyImages=[...document.querySelectorAll("img[loading='lazy']")];
        let observer=new IntersectionObserver((entries,obs)=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    let img=entry.target;
                    img.src=img.dataset.src||img.src;
                    obs.unobserve(img);
                }
            });
        },{rootMargin:"100px"});
        lazyImages.forEach(img=>observer.observe(img));
    }

    // Query/contact form WhatsApp redirect
    document.addEventListener("submit",function(e){
        if(e.target.matches(".contact-form")){
            e.preventDefault();
            const name=e.target.name.value, msg=e.target.query.value;
            window.open(`https://wa.me/254714227080?text=${encodeURIComponent("Query from "+name+": "+msg)}`,"_blank");
        }
    });
})();
