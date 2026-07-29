$(document).ready(function() {
    
    // Load dashboard data
    function loadDashboard() {
        loadTruckInfo();
        loadMenuItemsCount();
        loadOrdersStats();
        loadRecentOrders();
    }

    // Load truck information
    function loadTruckInfo() {
        $.ajax({
            type: "GET",
            url: '/api/v1/trucks/myTruck',
            xhrFields: {
                withCredentials: true
            },
            success: function(truck) {
                $('#truck-name').text(truck.truckName);
                $('#truck-status').html(`<span class="label label-${truck.truckStatus === 'available' ? 'success' : 'default'}">${truck.truckStatus}</span>`);
                $('#order-status').html(`<span class="label label-${truck.orderStatus === 'available' ? 'success' : 'warning'}">${truck.orderStatus}</span>`);
                $('#availability-toggle').val(truck.orderStatus);
            },
            error: function(errorResponse) {
                alert('Error loading truck info: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Load menu items count
    function loadMenuItemsCount() {
        $.ajax({
            type: "GET",
            url: '/api/v1/menuItem/view',
            xhrFields: {
                withCredentials: true
            },
            success: function(menuItems) {
                $('#total-menu-items').text(menuItems.length);
            },
            error: function(errorResponse) {
                $('#total-menu-items').text('N/A');
            }
        });
    }

    // Load orders statistics
    function loadOrdersStats() {
        $.ajax({
            type: "GET",
            url: '/api/v1/order/truckOrders',
            xhrFields: {
                withCredentials: true
            },
            success: function(orders) {
                $('#total-orders').text(orders.length);
                
                const pendingCount = orders.filter(o => o.orderStatus === 'pending').length;
                $('#pending-orders').text(pendingCount);
            },
            error: function(errorResponse) {
                $('#total-orders').text('N/A');
                $('#pending-orders').text('N/A');
            }
        });
    }

    // Load recent orders
    function loadRecentOrders() {
        $.ajax({
            type: "GET",
            url: '/api/v1/order/truckOrders',
            xhrFields: {
                withCredentials: true
            },
            success: function(orders) {
                if (orders.length === 0) {
                    $('#recent-orders-container').html('<p class="text-center text-muted">No orders yet</p>');
                    return;
                }

                // Show only the 5 most recent orders
                const recentOrders = orders.slice(0, 5);
                let ordersHTML = '<table class="table table-striped table-hover">';
                ordersHTML += `
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                `;

                recentOrders.forEach(function(order) {
                    const statusBadge = getStatusBadge(order.orderStatus);
                    const orderDate = new Date(order.createdAt).toLocaleString();
                    
                    ordersHTML += `
                        <tr>
                            <td>#${order.orderId}</td>
                            <td>${order.customerName}</td>
                            <td>${statusBadge}</td>
                            <td>$${parseFloat(order.totalPrice).toFixed(2)}</td>
                            <td>${orderDate}</td>
                        </tr>
                    `;
                });

                ordersHTML += '</tbody></table>';
                ordersHTML += '<a href="/truckOrders" class="btn btn-default btn-block">View All Orders</a>';
                
                $('#recent-orders-container').html(ordersHTML);
            },
            error: function(errorResponse) {
                $('#recent-orders-container').html('<p class="text-center text-danger">Error loading orders</p>');
            }
        });
    }

    // Get status badge
    function getStatusBadge(status) {
        const badges = {
            'pending': '<span class="label label-warning">Pending</span>',
            'preparing': '<span class="label label-info">Preparing</span>',
            'ready': '<span class="label label-success">Ready</span>',
            'completed': '<span class="label label-default">Completed</span>',
            'cancelled': '<span class="label label-danger">Cancelled</span>'
        };
        return badges[status] || '<span class="label label-default">' + status + '</span>';
    }

    // Handle availability toggle
    $('#availability-toggle').change(function() {
        const newStatus = $(this).val();
        
        $.ajax({
            type: "PUT",
            url: '/api/v1/trucks/updateOrderStatus',
            data: { orderStatus: newStatus },
            xhrFields: {
                withCredentials: true
            },
            success: function() {
                alert('Order availability updated successfully!');
                loadTruckInfo();
            },
            error: function(errorResponse) {
                alert('Error updating availability: ' + (errorResponse.responseText || 'Unknown error'));
                loadTruckInfo(); // Reload to reset the toggle
            }
        });
    });

    // Load dashboard on page load
    loadDashboard();
    $('#loading-message').hide();
});

