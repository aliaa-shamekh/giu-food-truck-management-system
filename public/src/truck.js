$(document).ready(function() {
    // Fetch and display all available trucks
    function loadTrucks() {
        $.ajax({
            type: "GET",
            url: '/api/v1/trucks/view',
            success: function(trucks) {
                $('#loading-message').hide();
                console.log("ajax request request");
                if (trucks.length === 0) {
                    $('#no-trucks-message').show();
                    return;
                }

                let trucksHTML = '';
                trucks.forEach(function(truck) {
                    const statusBadge = truck.orderStatus === 'available' 
                        ? '<span class="label label-success">Available</span>' 
                        : '<span class="label label-danger">Unavailable</span>';
                    
                    trucksHTML += `
                        <div class="col-md-4 col-sm-6" style="margin-bottom: 20px;">
                            <div class="panel panel-default">
                                <div class="panel-body text-center">
                                    <span class="glyphicon glyphicon-cutlery" style="font-size: 60px; color: #337ab7;"></span>
                                    <h3>${truck.truckName}</h3>
                                    <p>${statusBadge}</p>
                                    <button class="btn btn-primary view-menu-btn" data-truck-id="${truck.truckId}">
                                        <span class="glyphicon glyphicon-list"></span> View Menu
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });

                $('#trucks-container').html(trucksHTML);
            },
            error: function(errorResponse) {
                $('#loading-message').hide();
                alert('Error loading trucks: ' + (errorResponse.responseText || 'Unknown error'));
            }
        });
    }

    // Handle View Menu button click
    $(document).on('click', '.view-menu-btn', function() {
        const truckId = $(this).data('truck-id');
        window.location.href = '/truckMenu/' + truckId;
    });

    // Load trucks on page load
    loadTrucks();
});

