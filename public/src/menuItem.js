$(document).ready(function() {
    
    // Load menu items
    function loadMenuItems() {
        $('#loading-message').show();
        $('#no-items-message').hide();
        $('#menu-items-table-container').empty();

        $.ajax({
            type: "GET",
            url: '/api/v1/menuItem/view',
            xhrFields: {
                withCredentials: true
            },
            success: function(menuItems) {
                $('#loading-message').hide();

                if (menuItems.length === 0) {
                    $('#no-items-message').show();
                    return;
                }

                displayMenuItems(menuItems);
            },
            error: function(errorResponse) {
                $('#loading-message').hide();
                alert('Error loading menu items: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Display menu items in table
    function displayMenuItems(menuItems) {
        let tableHTML = '<div class="table-responsive"><table class="table table-striped table-hover">';
        tableHTML += `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
        `;

        menuItems.forEach(function(item) {
            const categoryBadge = getCategoryBadge(item.category);
            const statusBadge = item.status === 'available' 
                ? '<span class="label label-success">Available</span>' 
                : '<span class="label label-default">Unavailable</span>';
            const description = item.description || 'N/A';
            const truncatedDesc = description.length > 50 ? description.substring(0, 50) + '...' : description;

            tableHTML += `
                <tr>
                    <td>${item.itemId}</td>
                    <td>${item.name}</td>
                    <td>${categoryBadge}</td>
                    <td>${truncatedDesc}</td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-info btn-sm view-item-btn" data-item-id="${item.itemId}">
                            <span class="glyphicon glyphicon-eye-open"></span> View
                        </button>
                        <button class="btn btn-primary btn-sm edit-item-btn" data-item-id="${item.itemId}">
                            <span class="glyphicon glyphicon-edit"></span> Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-item-btn" data-item-id="${item.itemId}">
                            <span class="glyphicon glyphicon-trash"></span> Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table></div>';
        $('#menu-items-table-container').html(tableHTML);
    }

    // Get category badge
    function getCategoryBadge(category) {
        const badges = {
            'appetizer': '<span class="label label-info">Appetizer</span>',
            'main': '<span class="label label-primary">Main Course</span>',
            'dessert': '<span class="label label-warning">Dessert</span>',
            'beverage': '<span class="label label-success">Beverage</span>'
        };
        return badges[category] || '<span class="label label-default">' + category + '</span>';
    }

    // View item details
    function viewItemDetails(itemId) {
        $.ajax({
            type: "GET",
            url: `/api/v1/menuItem/view/${itemId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function(item) {
                const categoryBadge = getCategoryBadge(item.category);
                const statusBadge = item.status === 'available' 
                    ? '<span class="label label-success">Available</span>' 
                    : '<span class="label label-default">Unavailable</span>';
                
                let detailsHTML = `
                    <div class="panel panel-info">
                        <div class="panel-body">
                            <h4>${item.name} ${categoryBadge}</h4>
                            <p><strong>Item ID:</strong> ${item.itemId}</p>
                            <p><strong>Description:</strong> ${item.description || 'No description'}</p>
                            <p><strong>Price:</strong> $${parseFloat(item.price).toFixed(2)}</p>
                            <p><strong>Status:</strong> ${statusBadge}</p>
                            <p><strong>Created:</strong> ${new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                `;

                $('#item-details-content').html(detailsHTML);
                $('#viewItemModal').modal('show');
            },
            error: function(errorResponse) {
                alert('Error loading item details: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Edit item
    function editItem(itemId) {
        $.ajax({
            type: "GET",
            url: `/api/v1/menuItem/view/${itemId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function(item) {
                $('#edit-item-id').val(item.itemId);
                $('#edit-name').val(item.name);
                $('#edit-category').val(item.category);
                $('#edit-description').val(item.description || '');
                $('#edit-price').val(parseFloat(item.price));
                $('#editItemModal').modal('show');
            },
            error: function(errorResponse) {
                alert('Error loading item: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Save edited item
    function saveEditedItem() {
        const itemId = $('#edit-item-id').val();
        const name = $('#edit-name').val();
        const category = $('#edit-category').val();
        const description = $('#edit-description').val();
        const price = $('#edit-price').val();

        if (!name || !category || !price) {
            alert('Please fill in all required fields (Name, Category, Price)');
            return;
        }

        const data = {
            name: name,
            category: category,
            description: description,
            price: parseFloat(price)
        };

        $.ajax({
            type: "PUT",
            url: `/api/v1/menuItem/edit/${itemId}`,
            data: data,
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                alert('Menu item updated successfully!');
                $('#editItemModal').modal('hide');
                loadMenuItems();
            },
            error: function(errorResponse) {
                alert('Error updating item: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Delete item
    function deleteItem(itemId) {
        if (!confirm('Are you sure you want to delete this menu item?')) {
            return;
        }

        $.ajax({
            type: "DELETE",
            url: `/api/v1/menuItem/delete/${itemId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                alert('Menu item deleted successfully!');
                loadMenuItems();
            },
            error: function(errorResponse) {
                alert('Error deleting item: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Event handlers
    $(document).on('click', '.view-item-btn', function() {
        const itemId = $(this).data('item-id');
        viewItemDetails(itemId);
    });

    $(document).on('click', '.edit-item-btn', function() {
        const itemId = $(this).data('item-id');
        editItem(itemId);
    });

    $(document).on('click', '.delete-item-btn', function() {
        const itemId = $(this).data('item-id');
        deleteItem(itemId);
    });

    $('#save-edit-btn').click(function() {
        saveEditedItem();
    });

    // Load menu items on page load
    loadMenuItems();
});

