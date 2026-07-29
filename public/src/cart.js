$(document).ready(function() {
    let cartItems = [];

    // Load cart items
    function loadCart() {
        $('#loading-message').show();
        $('#empty-cart-message').hide();
        $('#cart-items-container').empty();
        $('#cart-summary').hide();

        $.ajax({
            type: "GET",
            url: '/api/v1/cart/view',
            xhrFields: {
                withCredentials: true
            },
            success: function(items) {
                $('#loading-message').hide();
                cartItems = items;

                if (items.length === 0) {
                    $('#empty-cart-message').show();
                    return;
                }

                displayCartItems(items);
                calculateTotal();
                $('#cart-summary').show();
            },
            error: function(errorResponse) {
                $('#loading-message').hide();
                alert('Error loading cart: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Display cart items
    function displayCartItems(items) {
        let cartHTML = '<div class="table-responsive"><table class="table table-striped table-hover">';
        cartHTML += `
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
        `;

        items.forEach(function(item) {
            const subtotal = parseFloat(item.price) * item.quantity;
            cartHTML += `
                <tr>
                    <td>${item.itemName}</td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>
                        <div class="input-group" style="width: 150px;">
                            <span class="input-group-btn">
                                <button class="btn btn-default decrease-qty-btn" type="button" data-cart-id="${item.cartId}">
                                    <span class="glyphicon glyphicon-minus"></span>
                                </button>
                            </span>
                            <input type="number" class="form-control text-center quantity-input" 
                                   id="qty-${item.cartId}" value="${item.quantity}" min="1" readonly>
                            <span class="input-group-btn">
                                <button class="btn btn-default increase-qty-btn" type="button" data-cart-id="${item.cartId}">
                                    <span class="glyphicon glyphicon-plus"></span>
                                </button>
                            </span>
                        </div>
                    </td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger btn-sm remove-item-btn" data-cart-id="${item.cartId}">
                            <span class="glyphicon glyphicon-trash"></span> Remove
                        </button>
                    </td>
                </tr>
            `;
        });

        cartHTML += '</tbody></table></div>';
        $('#cart-items-container').html(cartHTML);
    }

    // Calculate total
    function calculateTotal() {
        let total = 0;
        cartItems.forEach(function(item) {
            total += parseFloat(item.price) * item.quantity;
        });
        $('#cart-total').text(total.toFixed(2));
    }

    // Update cart quantity
    function updateQuantity(cartId, newQuantity) {
        if (newQuantity < 1) return;

        $.ajax({
            type: "PUT",
            url: `/api/v1/cart/edit/${cartId}`,
            data: { quantity: newQuantity },
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                loadCart(); // Reload cart to reflect changes
            },
            error: function(errorResponse) {
                alert('Error updating quantity: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Remove item from cart
    function removeItem(cartId) {
        if (!confirm('Are you sure you want to remove this item?')) {
            return;
        }

        $.ajax({
            type: "DELETE",
            url: `/api/v1/cart/delete/${cartId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                loadCart(); // Reload cart
                alert('Item removed from cart');
            },
            error: function(errorResponse) {
                alert('Error removing item: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Handle increase quantity
    $(document).on('click', '.increase-qty-btn', function() {
        const cartId = $(this).data('cart-id');
        const currentQty = parseInt($('#qty-' + cartId).val());
        updateQuantity(cartId, currentQty + 1);
    });

    // Handle decrease quantity
    $(document).on('click', '.decrease-qty-btn', function() {
        const cartId = $(this).data('cart-id');
        const currentQty = parseInt($('#qty-' + cartId).val());
        if (currentQty > 1) {
            updateQuantity(cartId, currentQty - 1);
        }
    });

    // Handle remove item
    $(document).on('click', '.remove-item-btn', function() {
        const cartId = $(this).data('cart-id');
        removeItem(cartId);
    });

    // Handle place order
    $('#place-order-btn').click(function() {
        const pickupTime = $('#pickup-time').val();
        
        if (!pickupTime) {
            alert('Please select a pickup time');
            return;
        }

        const data = {
            scheduledPickupTime: pickupTime
        };

        $.ajax({
            type: "POST",
            url: '/api/v1/order/new',
            data: data,
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                alert('Order placed successfully!');
                window.location.href = '/myOrders';
            },
            error: function(errorResponse) {
                const errorMsg = errorResponse.responseJSON 
                    ? (errorResponse.responseJSON.error || errorResponse.responseJSON.message)
                    : errorResponse.responseText;
                alert('Error placing order: ' + errorMsg);
            }
        });
    });

    // Load cart on page load
    loadCart();
});

