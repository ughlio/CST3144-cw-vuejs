var app = new Vue({
    el: '#app',
    data: {
        sitename: 'School Lessons & Activities',
        showCart: false,
        productList: [],
        cart: [],
        sortKey: 'topic',
        sortOrder: 1 // 1 for ascending, -1 for descending
    },
    methods: {
        toggleView() {
            this.showCart = !this.showCart;
        },
        sortBy(key) {
            if (this.sortKey !== key) {
                this.sortKey = key;
                this.sortOrder = 1;
            }
            this.applySort();
        },
        toggleSortOrder() {
            this.sortOrder *= -1;
            this.applySort();
        },
        applySort() {
            this.productList.sort((a, b) => {
                let modifier = this.sortOrder;
                return (a[this.sortKey] > b[this.sortKey] ? 1 : a[this.sortKey] < b[this.sortKey] ? -1 : 0) * modifier;
            });
        },
        addToCart(lesson) {
            if (lesson.space > 0) {
                // Reduce the available space by one
                lesson.space--;

                // Check if the lesson is already in the cart
                let cartItem = this.cart.find(item => item.id === lesson.id);
                if (cartItem) {
                    // If it is, increase the quantity
                    cartItem.quantity++;
                    cartItem.availableSpace = lesson.space; // Update the available space
                } else {
                    // If not, add it to the cart
                    this.cart.push({
                        id: lesson.id,
                        topic: lesson.topic,
                        location: lesson.location,
                        price: lesson.price,
                        quantity: 1,
                        availableSpace: lesson.space // Capture the available space after adding to cart
                    });
                }
            }
        },
        removeFromCart(cartItem) {
            let lesson = this.productList.find(item => item.id === cartItem.id);

            if (cartItem.quantity > 0) {
                cartItem.quantity--;
                lesson.space++;
                cartItem.availableSpace = lesson.space;

                if (cartItem.quantity === 0) {
                    this.cart = this.cart.filter(item => item.id !== cartItem.id);
                }

                // If the cart is empty after removal, switch back to product view
                if (this.cart.length === 0) {
                    this.showCart = false;
                }
            }
        }
    },
    created() {
        fetch('https://cst3144-cw-server.onrender.com/lessons')
            .then(response => response.json())
            .then(data => {
                this.productList = data.map(item => ({
                    id: item._id, // Use the _id from the server data
                    topic: item.topic,
                    location: item.location,
                    price: item.price,
                    space: item.space
                }));
            })
            .catch(error => console.error('Failed to load lessons:', error));
    }
});
