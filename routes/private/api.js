const db = require('../../connectors/db');
// check function getUser in milestone 3 description and session.js
const {getUser} = require('../../utils/session');
// getUser takes only one input of req 
// await getUser(req);

function handlePrivateBackendApi(app) {
  
  // insert all your private server side end points here
  app.get('/test' , async (req,res) => {
     try{
      return res.status(200).send("succesful connection");
     }catch(err){
      console.log("error message", err.message);
      return res.status(400).send(err.message)
     }    
  });

  // Menu Item Management Endpoints

  // POST /api/v1/menuItem/new - Truck Owner Create menu item
  app.post('/api/v1/menuItem/new', async (req, res) => {
    try {
      const user = await getUser(req);
      
      // Only truck owners can create menu items
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      // Truck owner must have a truck
      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      const { name, price, description, category } = req.body;

      // Validate required fields
      if (!name || price === undefined || !category) {
        return res.status(400).json({ error: 'Name, price, and category are required fields' });
      }

      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      // Insert menu item – status and createdAt use DB defaults
      await db('FoodTruck.MenuItems').insert({
        truckId: user.truckId,
        name,
        description: description || null,
        price: numericPrice,
        category
      });

      return res.status(200).json({ message: 'menu item was created successfully' });
    } catch (err) {
      console.log("error message", err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/menuItem/view - Truck Owner View my menu items
  app.get('/api/v1/menuItem/view', async (req, res) => {
    try {
      const user = await getUser(req);
      
      // Check if user is a truck owner
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      // Check if truck owner has a truck
      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      // Get all menu items for the truck owner's truck
      const menuItems = await db('FoodTruck.MenuItems')
        .where({
          truckId: user.truckId,
          status: 'available'
        })
        .orderBy('itemId', 'asc');

      return res.status(200).json(menuItems);
    } catch (err) {
      console.log("error message", err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/menuItem/view/:itemId - Truck Owner View specific menu item
  app.get('/api/v1/menuItem/view/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      const itemId = parseInt(req.params.itemId);
      
      // Check if user is a truck owner
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      // Check if truck owner has a truck
      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      // Validate itemId
      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      // Get the menu item and verify it belongs to the truck owner's truck
      const menuItem = await db('FoodTruck.MenuItems')
        .where('itemId', itemId)
        .where('truckId', user.truckId)
        .first();

      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found or you do not have permission to view it' });
      }

      return res.status(200).json(menuItem);
    } catch (err) {
      console.log("error message", err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/v1/menuItem/edit/:itemId - Truck Owner Edit menu item
  app.put('/api/v1/menuItem/edit/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      const itemId = parseInt(req.params.itemId);
      
      // Check if user is a truck owner
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      // Check if truck owner has a truck
      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      // Validate itemId
      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      // Verify the menu item exists and belongs to the truck owner's truck
      const existingItem = await db('FoodTruck.MenuItems')
        .where('itemId', itemId)
        .where('truckId', user.truckId)
        .first();

      if (!existingItem) {
        return res.status(404).json({ error: 'Menu item not found or you do not have permission to edit it' });
      }

      // Prepare update data
      const updateData = {};
      if (req.body.name !== undefined) updateData.name = req.body.name;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.price !== undefined) {
        const price = Number(req.body.price);
        if (Number.isNaN(price) || price <= 0) {
          return res.status(400).json({ error: 'Price must be a positive number' });
        }
        updateData.price = price;
      }
      if (req.body.category !== undefined) updateData.category = req.body.category;

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields provided to update' });
      }

      // Update the menu item
      await db('FoodTruck.MenuItems')
        .where('itemId', itemId)
        .where('truckId', user.truckId)
        .update(updateData);

      return res.status(200).json({ message: 'menu item updated successfully' });
    } catch (err) {
      console.log("error message", err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/v1/menuItem/delete/:itemId - Truck Owner Delete menu item
  app.delete('/api/v1/menuItem/delete/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      const itemId = parseInt(req.params.itemId);
      
      // Check if user is a truck owner
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      // Check if truck owner has a truck
      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      // Validate itemId
      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      // Verify the menu item exists and belongs to the truck owner's truck
      const existingItem = await db('FoodTruck.MenuItems')
        .where('itemId', itemId)
        .where('truckId', user.truckId)
        .first();

      if (!existingItem) {
        return res.status(404).json({ error: 'Menu item not found or you do not have permission to delete it' });
      }

      // Soft delete: set status to unavailable
      await db('FoodTruck.MenuItems')
        .where('itemId', itemId)
        .where('truckId', user.truckId)
        .update({ status: 'unavailable' });

      return res.status(200).json({ message: 'menu item deleted successfully' });
    } catch (err) {
      console.log("error message", err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // =========================
  // Truck Management
  // =========================

  // GET /api/v1/trucks/view - Customer View all available trucks
  app.get('/api/v1/trucks/view', async (req, res) => {
    try {
      const trucks = await db('FoodTruck.Trucks')
        .where({
          truckStatus: 'available',
          orderStatus: 'available'
        })
        .orderBy('truckId', 'asc');

      return res.status(200).json(trucks);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/trucks/myTruck - Truck Owner View my truck info
  app.get('/api/v1/trucks/myTruck', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      const truck = await db('FoodTruck.Trucks')
        .where('truckId', user.truckId)
        .first();

      if (!truck) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      return res.status(200).json(truck);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/v1/trucks/updateOrderStatus - Truck Owner Update truck availability
  app.put('/api/v1/trucks/updateOrderStatus', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      const { orderStatus } = req.body;
      const allowedStatuses = ['available', 'unavailable'];

      if (!orderStatus || !allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({ error: 'Invalid orderStatus value' });
      }

      await db('FoodTruck.Trucks')
        .where('truckId', user.truckId)
        .update({ orderStatus });

      return res.status(200).json({ message: 'truck order status updated successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // =========================
  // Browse Menu (Customer)
  // =========================

  // GET /api/v1/menuItem/truck/:truckId - View truck's menu
  app.get('/api/v1/menuItem/truck/:truckId', async (req, res) => {
    try {
      const truckId = parseInt(req.params.truckId);
      if (Number.isNaN(truckId)) {
        return res.status(400).json({ error: 'Invalid truck ID' });
      }

      const menuItems = await db('FoodTruck.MenuItems')
        .where({
          truckId,
          status: 'available'
        })
        .orderBy('itemId', 'asc');

      return res.status(200).json(menuItems);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/menuItem/truck/:truckId/category/:category - Search menu by category
  app.get('/api/v1/menuItem/truck/:truckId/category/:category', async (req, res) => {
    try {
      const truckId = parseInt(req.params.truckId);
      const { category } = req.params;

      if (Number.isNaN(truckId)) {
        return res.status(400).json({ error: 'Invalid truck ID' });
      }

      const menuItems = await db('FoodTruck.MenuItems')
        .where({
          truckId,
          status: 'available',
          category
        })
        .orderBy('itemId', 'asc');

      return res.status(200).json(menuItems);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // =========================
  // Cart Management (Customer)
  // =========================

  // POST /api/v1/cart/new - Add item to cart
  app.post('/api/v1/cart/new', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const { itemId, quantity, price } = req.body;
      const numericItemId = parseInt(itemId);
      const numericQuantity = parseInt(quantity);
      const numericPrice = Number(price);

      if (Number.isNaN(numericItemId) || Number.isNaN(numericQuantity) || numericQuantity <= 0 || Number.isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Invalid itemId, quantity, or price' });
      }

      // Get the menu item to know its truck and validate price
      const menuItem = await db('FoodTruck.MenuItems')
        .where({
          itemId: numericItemId,
          status: 'available'
        })
        .first();

      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found or unavailable' });
      }

      // Validate that the provided price matches the menu item's current price
      if (Number(menuItem.price) !== numericPrice) {
        return res.status(400).json({ error: 'Price mismatch. Please refresh the menu and try again' });
      }

      const itemTruckId = menuItem.truckId;

      // Check existing cart items to ensure all from same truck
      const existingCartItems = await db('FoodTruck.Carts as c')
        .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
        .where('c.userId', user.userId)
        .select('m.truckId');

      if (existingCartItems.length > 0) {
        const existingTruckId = existingCartItems[0].truckId;
        if (existingTruckId !== itemTruckId) {
          return res.status(400).json({ message: 'Cannot order from multiple trucks' });
        }
      }

      await db('FoodTruck.Carts').insert({
        userId: user.userId,
        itemId: numericItemId,
        quantity: numericQuantity,
        price: numericPrice
      });

      return res.status(200).json({ message: 'item added to cart successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/cart/view - View cart
  app.get('/api/v1/cart/view', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const cartItems = await db('FoodTruck.Carts as c')
        .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
        .where('c.userId', user.userId)
        .select(
          'c.cartId',
          'c.userId',
          'c.itemId',
          'm.name as itemName',
          'c.price',
          'c.quantity'
        )
        .orderBy('c.cartId', 'asc');

      return res.status(200).json(cartItems);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // DELETE /api/v1/cart/delete/:cartId - Remove from cart
  app.delete('/api/v1/cart/delete/:cartId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const cartId = parseInt(req.params.cartId);
      if (Number.isNaN(cartId)) {
        return res.status(400).json({ error: 'Invalid cart ID' });
      }

      const cartItem = await db('FoodTruck.Carts')
        .where({
          cartId,
          userId: user.userId
        })
        .first();

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found or does not belong to user' });
      }

      await db('FoodTruck.Carts')
        .where('cartId', cartId)
        .del();

      return res.status(200).json({ message: 'item removed from cart successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/v1/cart/edit/:cartId - Update cart quantity
  app.put('/api/v1/cart/edit/:cartId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const cartId = parseInt(req.params.cartId);
      const { quantity } = req.body;
      const numericQuantity = parseInt(quantity);

      if (Number.isNaN(cartId) || Number.isNaN(numericQuantity) || numericQuantity <= 0) {
        return res.status(400).json({ error: 'Invalid cart ID or quantity' });
      }

      const cartItem = await db('FoodTruck.Carts')
        .where({
          cartId,
          userId: user.userId
        })
        .first();

      if (!cartItem) {
        return res.status(404).json({ error: 'Cart item not found or does not belong to user' });
      }

      await db('FoodTruck.Carts')
        .where('cartId', cartId)
        .update({ quantity: numericQuantity });

      return res.status(200).json({ message: 'cart updated successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // =========================
  // Order Management
  // =========================

  // POST /api/v1/order/new - Place order
  app.post('/api/v1/order/new', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const { scheduledPickupTime } = req.body;

      // Get all cart items for this user with their truckId
      const cartItems = await db('FoodTruck.Carts as c')
        .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
        .where('c.userId', user.userId)
        .select(
          'c.cartId',
          'c.itemId',
          'c.quantity',
          'c.price',
          'm.truckId'
        );

      if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }

      // Ensure all items from same truck
      const firstTruckId = cartItems[0].truckId;
      const multipleTrucks = cartItems.some(ci => ci.truckId !== firstTruckId);
      if (multipleTrucks) {
        return res.status(400).json({ error: 'Cannot order from multiple trucks' });
      }

      // Calculate total price
      const totalPrice = cartItems.reduce((sum, ci) => {
        return sum + Number(ci.price) * ci.quantity;
      }, 0);

      // Insert order
      // Set estimatedEarliestPickup to scheduledPickupTime (can be updated later by truck owner)
      const [order] = await db('FoodTruck.Orders')
        .insert({
          userId: user.userId,
          truckId: firstTruckId,
          orderStatus: 'pending',
          totalPrice,
          scheduledPickupTime: scheduledPickupTime || null,
          estimatedEarliestPickup: scheduledPickupTime || null
        })
        .returning('*');

      // Insert order items
      const orderItemsToInsert = cartItems.map(ci => ({
        orderId: order.orderId,
        itemId: ci.itemId,
        quantity: ci.quantity,
        price: ci.price
      }));

      if (orderItemsToInsert.length > 0) {
        await db('FoodTruck.OrderItems').insert(orderItemsToInsert);
      }

      // Clear cart
      await db('FoodTruck.Carts')
        .where('userId', user.userId)
        .del();

      return res.status(200).json({ message: 'order placed successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/order/myOrders - Customer view my orders
  app.get('/api/v1/order/myOrders', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const orders = await db('FoodTruck.Orders as o')
        .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
        .where('o.userId', user.userId)
        .select(
          'o.orderId',
          'o.userId',
          'o.truckId',
          't.truckName',
          'o.orderStatus',
          'o.totalPrice',
          'o.scheduledPickupTime',
          'o.estimatedEarliestPickup',
          'o.createdAt'
        )
        .orderBy('o.orderId', 'desc');

      return res.status(200).json(orders);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/order/details/:orderId - Customer view order details
  app.get('/api/v1/order/details/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'customer') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const orderId = parseInt(req.params.orderId);
      if (Number.isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      const order = await db('FoodTruck.Orders as o')
        .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
        .where('o.orderId', orderId)
        .andWhere('o.userId', user.userId)
        .select(
          'o.orderId',
          't.truckName',
          'o.orderStatus',
          'o.totalPrice',
          'o.scheduledPickupTime',
          'o.estimatedEarliestPickup',
          'o.createdAt'
        )
        .first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found or does not belong to user' });
      }

      const items = await db('FoodTruck.OrderItems as oi')
        .join('FoodTruck.MenuItems as m', 'oi.itemId', 'm.itemId')
        .where('oi.orderId', orderId)
        .select(
          'm.name as itemName',
          'oi.quantity',
          'oi.price'
        );

      const orderDetails = {
        ...order,
        items
      };

      return res.status(200).json(orderDetails);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/order/truckOwner/:orderId - Truck owner view order details
  app.get('/api/v1/order/truckOwner/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      const orderId = parseInt(req.params.orderId);
      if (Number.isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      const order = await db('FoodTruck.Orders as o')
        .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
        .where('o.orderId', orderId)
        .andWhere('o.truckId', user.truckId)
        .select(
          'o.orderId',
          't.truckName',
          'o.orderStatus',
          'o.totalPrice',
          'o.scheduledPickupTime',
          'o.estimatedEarliestPickup',
          'o.createdAt'
        )
        .first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found or does not belong to this truck' });
      }

      const items = await db('FoodTruck.OrderItems as oi')
        .join('FoodTruck.MenuItems as m', 'oi.itemId', 'm.itemId')
        .where('oi.orderId', orderId)
        .select(
          'm.name as itemName',
          'oi.quantity',
          'oi.price'
        );

      const orderDetails = {
        ...order,
        items
      };

      return res.status(200).json(orderDetails);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/v1/order/truckOrders - Truck owner view orders for my truck
  app.get('/api/v1/order/truckOrders', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      const orders = await db('FoodTruck.Orders as o')
        .join('FoodTruck.Users as u', 'o.userId', 'u.userId')
        .where('o.truckId', user.truckId)
        .select(
          'o.orderId',
          'o.userId',
          'u.name as customerName',
          'o.orderStatus',
          'o.totalPrice',
          'o.scheduledPickupTime',
          'o.estimatedEarliestPickup',
          'o.createdAt'
        )
        .orderBy('o.orderId', 'desc');

      return res.status(200).json(orders);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // PUT /api/v1/order/updateStatus/:orderId - Truck owner update order status
  app.put('/api/v1/order/updateStatus/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user || user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck owner does not have a truck registered' });
      }

      const orderId = parseInt(req.params.orderId);
      if (Number.isNaN(orderId)) {
        return res.status(400).json({ error: 'Invalid order ID' });
      }

      const { orderStatus, estimatedEarliestPickup } = req.body;
      const allowedStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

      if (!orderStatus || !allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({ error: 'Invalid orderStatus value' });
      }

      // Ensure order belongs to this truck
      const order = await db('FoodTruck.Orders')
        .where({
          orderId,
          truckId: user.truckId
        })
        .first();

      if (!order) {
        return res.status(404).json({ error: 'Order not found or does not belong to this truck' });
      }

      const updateData = { orderStatus };
      if (estimatedEarliestPickup !== undefined) {
        updateData.estimatedEarliestPickup = estimatedEarliestPickup;
      }

      await db('FoodTruck.Orders')
        .where('orderId', orderId)
        .update(updateData);

      return res.status(200).json({ message: 'order status updated successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

};

module.exports = {handlePrivateBackendApi};
