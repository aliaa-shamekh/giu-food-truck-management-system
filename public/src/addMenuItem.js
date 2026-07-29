$(document).ready(function() {
    
    // Handle form submission
    $('#add-item-form').submit(function(e) {
        e.preventDefault();
        
        const name = $('#name').val().trim();
        const category = $('#category').val();
        const description = $('#description').val().trim();
        const price = $('#price').val();

        // Validate required fields
        if (!name) {
            alert('Please enter an item name');
            $('#name').focus();
            return;
        }

        if (!category) {
            alert('Please select a category');
            $('#category').focus();
            return;
        }

        if (!price || parseFloat(price) <= 0) {
            alert('Please enter a valid price greater than 0');
            $('#price').focus();
            return;
        }

        // Prepare data
        const data = {
            name: name,
            category: category,
            description: description || '',
            price: parseFloat(price)
        };

        // Disable submit button to prevent double submission
        $('#submit-btn').prop('disabled', true).html(
            '<span class="glyphicon glyphicon-refresh glyphicon-spin"></span> Adding...'
        );

        // Make AJAX request
        $.ajax({
            type: "POST",
            url: '/api/v1/menuItem/new',
            data: data,
            xhrFields: {
                withCredentials: true
            },
            success: function(response) {
                alert('Menu item added successfully!');
                // Redirect to menu items page
                window.location.href = '/menuItems';
            },
            error: function(errorResponse) {
                // Re-enable submit button
                $('#submit-btn').prop('disabled', false).html(
                    '<span class="glyphicon glyphicon-plus"></span> Add Menu Item'
                );
                
                const errorMsg = errorResponse.responseJSON 
                    ? (errorResponse.responseJSON.error || errorResponse.responseJSON.message)
                    : errorResponse.responseText;
                alert('Error adding menu item: ' + errorMsg);
            }
        });
    });

    // Auto-format price input to 2 decimal places on blur
    $('#price').blur(function() {
        const value = parseFloat($(this).val());
        if (!isNaN(value) && value > 0) {
            $(this).val(value.toFixed(2));
        }
    });

    // Prevent negative values in price input
    $('#price').on('input', function() {
        if ($(this).val() < 0) {
            $(this).val(0);
        }
    });
});

