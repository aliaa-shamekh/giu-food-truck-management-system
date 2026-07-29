$(document).ready(function() {
    
    // Load orders
    function loadOrders() {
        $('#loading-message').show();
        $('#no-orders-message').hide();
        $('#orders-container').empty();

        $.ajax({
            type: "GET",
            url: '/api/v1/order/myOrders',
            xhrFields: {
                withCredentials: true
            },
            success: function(orders) {
                $('#loading-message').hide();

                if (orders.length === 0) {
                    $('#no-orders-message').show();
                    return;
                }

                displayOrders(orders);
            },
            error: function(errorResponse) {
                $('#loading-message').hide();
                alert('Error loading orders: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Display orders
    function displayOrders(orders) {
        let ordersHTML = '';

        orders.forEach(function(order) {
            const statusBadge = getStatusBadge(order.orderStatus);
            const orderDate = new Date(order.createdAt).toLocaleString();
            const pickupTime = order.scheduledPickupTime 
                ? new Date(order.scheduledPickupTime).toLocaleString() 
                : 'Not scheduled';

            ordersHTML += `
                <div class="panel panel-default order-card status-${order.orderStatus}">
                    <div class="panel-body">
                        <div class="row">
                            <div class="col-md-8">
                                <h4>
                                    <span class="glyphicon glyphicon-shopping-cart"></span>
                                    Order #${order.orderId} - ${order.truckName}
                                    ${statusBadge}
                                </h4>
                                <p>
                                    <strong>Order Date:</strong> ${orderDate}<br>
                                    <strong>Pickup Time:</strong> ${pickupTime}<br>
                                    <strong>Total:</strong> $${parseFloat(order.totalPrice).toFixed(2)}
                                </p>
                            </div>
                            <div class="col-md-4 text-right">
                                <button class="btn btn-info view-details-btn" data-order-id="${order.orderId}">
                                    <span class="glyphicon glyphicon-eye-open"></span> View Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        $('#orders-container').html(ordersHTML);
    }

    // Get status badge
    function getStatusBadge(status) {
        const badges = {
            'pending': '<span class="label label-warning">Pending</span>',
            'preparing': '<span class="label label-info">Preparing</span>',
            'ready': '<span class="label label-success">Ready for Pickup</span>',
            'completed': '<span class="label label-default">Completed</span>',
            'cancelled': '<span class="label label-danger">Cancelled</span>'
        };
        return badges[status] || '<span class="label label-default">' + status + '</span>';
    }

    // View order details
    function viewOrderDetails(orderId) {
        $.ajax({
            type: "GET",
            url: `/api/v1/order/details/${orderId}`,
            xhrFields: {
                withCredentials: true
            },
            success: function(orderDetails) {
                displayOrderDetails(orderDetails);
                $('#orderDetailsModal').modal('show');
            },
            error: function(errorResponse) {
                alert('Error loading order details: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Display order details in modal
    function displayOrderDetails(orderDetails) {
        const statusBadge = getStatusBadge(orderDetails.orderStatus);
        const orderDate = new Date(orderDetails.createdAt).toLocaleString();
        const pickupTime = orderDetails.scheduledPickupTime 
            ? new Date(orderDetails.scheduledPickupTime).toLocaleString() 
            : 'Not scheduled';

        let detailsHTML = `
            <div class="panel panel-info">
                <div class="panel-heading">
                    <h4>Order #${orderDetails.orderId} - ${orderDetails.truckName}</h4>
                </div>
                <div class="panel-body">
                    <p>
                        <strong>Status:</strong> ${statusBadge}<br>
                        <strong>Order Date:</strong> ${orderDate}<br>
                        <strong>Pickup Time:</strong> ${pickupTime}
                    </p>
                </div>
            </div>

            <h4>Order Items</h4>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        `;

        orderDetails.items.forEach(function(item) {
            const subtotal = parseFloat(item.price) * item.quantity;
            detailsHTML += `
                <tr>
                    <td>${item.itemName}</td>
                    <td>${item.quantity}</td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                </tr>
            `;
        });

        detailsHTML += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-right"><strong>Total:</strong></td>
                        <td><strong>$${parseFloat(orderDetails.totalPrice).toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        `;

        $('#order-details-content').html(detailsHTML);
    }

    // Handle view details button
    $(document).on('click', '.view-details-btn', function() {
        const orderId = $(this).data('order-id');
        viewOrderDetails(orderId);
    });

    // Load orders on page load
    loadOrders();
});

