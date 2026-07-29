$(document).ready(function() {
    const truckId = $('#truck-id').val();
    let currentCategory = 'all';

    // Fetch and display menu items
    function loadMenuItems(category) {
        currentCategory = category;
        $('#loading-message').show();
        $('#no-items-message').hide();
        $('#menu-items-container').empty();

        let url = category === 'all' 
            ? `/api/v1/menuItem/truck/${truckId}`
            : `/api/v1/menuItem/truck/${truckId}/category/${category}`;

        $.ajax({
            type: "GET",
            url: url,
            xhrFields: {
                withCredentials: true
            },
            success: function(menuItems) {
                $('#loading-message').hide();
                
                if (menuItems.length === 0) {
                    $('#no-items-message').show();
                    return;
                }

                let menuHTML = '';
                menuItems.forEach(function(item) {
                    const categoryBadge = getCategoryBadge(item.category);
                    
                    menuHTML += `
                        <div class="col-md-6" style="margin-bottom: 20px;">
                            <div class="panel panel-default">
                                <div class="panel-heading">
                                    <h4 class="panel-title">
                                        ${item.name}
                                        ${categoryBadge}
                                    </h4>
                                </div>
                                <div class="panel-body">
                                    <p>${item.description || 'No description available'}</p>
                                    <h4>Price: $${parseFloat(item.price).toFixed(2)}</h4>
                                    <div class="form-inline">
                                        <div class="form-group">
                                            <label for="quantity-${item.itemId}">Quantity:</label>
                                            <input type="number" class="form-control" id="quantity-${item.itemId}" 
                                                   value="1" min="1" max="99" style="width: 80px; margin-left: 10px;">
                                        </div>
                                        <button class="btn btn-success add-to-cart-btn" 
                                                data-item-id="${item.itemId}" 
                                                data-price="${item.price}"
                                                style="margin-left: 20px;">
                                            <span class="glyphicon glyphicon-shopping-cart"></span> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                $('#menu-items-container').html(menuHTML);
            },
            error: function(errorResponse) {
                $('#loading-message').hide();
                alert('Error loading menu: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Get category badge HTML
    function getCategoryBadge(category) {
        const badges = {
            'appetizer': '<span class="label label-info">Appetizer</span>',
            'main': '<span class="label label-primary">Main Course</span>',
            'dessert': '<span class="label label-warning">Dessert</span>',
            'beverage': '<span class="label label-success">Beverage</span>'
        };
        return badges[category] || '<span class="label label-default">' + category + '</span>';
    }

    // Handle category filter button click
    $(document).on('click', '.category-filter-btn', function() {
        $('.category-filter-btn').removeClass('active btn-primary').addClass('btn-default');
        $(this).removeClass('btn-default').addClass('active btn-primary');
        
        const category = $(this).data('category');
        loadMenuItems(category);
    });

    // Handle Add to Cart button click
    $(document).on('click', '.add-to-cart-btn', function() {
        const itemId = $(this).data('item-id');
        const price = $(this).data('price');
        const quantity = parseInt($('#quantity-' + itemId).val());

        if (quantity < 1) {
            alert('Quantity must be at least 1');
            return;
        }

        const data = {
            itemId: itemId,
            quantity: quantity,
            price: price
        };

        $.ajax({
            type: "POST",
            url: '/api/v1/cart/new',
            data: data,
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                alert('Item added to cart successfully!');
                // Reset quantity to 1
                $('#quantity-' + itemId).val(1);
            },
            error: function(errorResponse) {
                const errorMsg = errorResponse.responseJSON 
                    ? (errorResponse.responseJSON.error || errorResponse.responseJSON.message)
                    : errorResponse.responseText;
                alert('Error adding to cart: ' + errorMsg);
            }
        });
    });

    // Load all menu items on page load
    loadMenuItems('all');
});

