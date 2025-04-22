// export const productPath: string = "../data/products.json";

// export const cartPath: string = "../data/cart.json";

// export const orderPath: string = "../data/orders.json";

// export const categoryPath: string = "../data/category.json";

export const productPath: string = "./data/products.json";

export const cartPath: string = "./data/cart.json";

export const orderPath: string = "./data/orders.json";

export const categoryPath: string = "./data/category.json";
export const userPath: string = "./data/user.json";

export const helpinfo: string = `
# CLI command list

## Product part

1. add a product
   -> node index.js product add --name "Laptop" --price 999.99 --inventory 500

2. list products
   -> node index.js product list (list of all products)
   -> node index.js product list --productid 5 (product based on product id)

3. update a product
   -> node index.js product update --productid 10 --name Fantech Mouse --price 5000 --inventory 80

4. delete a product
   -> node index.js product delete --productid 10

## Cart part

1. add a product to the cart
   -> node index.js cart add --userid kos7 --productid 3 --quantity 10

2. view products in the cart
   -> node index.js cart view --userid kos7 --productid 3 (view a product in the cart of a user)
   -> node index.js cart view --userid kos7 (view all products in the cart of a user)
   -> node index.js cart view (view all products in the cart)

3. remove product from the cart for a user
   -> node index.js cart remove --userid kos7 --productid 9
   (removes a product by matching productid and userid)

   -> node index.js cart remove --userid kos7
   (removes products by matching userid)

4. update a product for a user in the cart
   -> node index.js cart update --userid kos7 --productid 3 --price 90

5. calculate total price of all products in the cart of a user
   -> node index.js cart total --userid kos7

## Order part

1. add a product in cart to order
   -> node index.js order create --userid user123 --productid product123

2. view all orders in the order.json file
   -> node index.js order list --userid k202

3. to cancel a order of products
   -> node index.js order cancel --userid user123 --orderid order123

4. to cancel the order of a single product
   -> node index.js order cancelaorder --userid user123 --orderid order123 --productid product123


`;
