var app = new Vue({
    el: '#app',
    data: {
        sitename: 'School Lessons & Activities',
        showCart: false,
        productList: [],
        cart: [],
        sortKey: 'topic',
        sortOrder: 1, // 1 for ascending, -1 for descending
        customerName: '',
        customerPhone: '',
        nameError: '',
        phoneError: '',
        isFormValid: false,
        orderSubmitted: false
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
                lesson.space--;

                let cartItem = this.cart.find(item => item.id === lesson.id);
                if (cartItem) {
                    cartItem.quantity++;
                    cartItem.availableSpace = lesson.space;
                } else {
                    this.cart.push({
                        id: lesson.id,
                        topic: lesson.topic,
                        location: lesson.location,
                        price: lesson.price,
                        quantity: 1,
                        availableSpace: lesson.space,
                        imageUrl: lesson.imageUrl
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
            }

            // If the cart is empty after removal, switch back to product view
            if (this.cart.length === 0) {
                this.showCart = false;
            }
        },
        validateName() {
            const nameRegex = /^[A-Za-z\s]+$/;
            if (!this.customerName) {
                this.nameError = 'Name is required.';
            } else if (!nameRegex.test(this.customerName)) {
                this.nameError = 'Name must contain letters only.';
            } else {
                this.nameError = '';
            }
            this.checkFormValidity();
        },
        validatePhone() {
            const phoneRegex = /^\d+$/;
            if (!this.customerPhone) {
                this.phoneError = 'Phone number is required.';
            } else if (!phoneRegex.test(this.customerPhone)) {
                this.phoneError = 'Phone must contain numbers only.';
            } else {
                this.phoneError = '';
            }
            this.checkFormValidity();
        },
        checkFormValidity() {
            this.isFormValid = !this.nameError && !this.phoneError && this.customerName && this.customerPhone;
        },
        checkout() {
            // Collect order data
            const orderData = {
                name: this.customerName,
                phone: this.customerPhone,
                lessons: this.cart.map(item => ({
                    id: item.id,
                    topic: item.topic,
                    location: item.location,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl
                }))
            };

            // POST request to save the new order
            fetch('https://cst3144-cw-server.onrender.com/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to submit order.');
                }
                return response.json();
            })
            .then(data => {
                // After order is saved, update lesson spaces
                const updatePromises = this.cart.map(item => {
                    const newSpace = item.availableSpace;
                    return fetch(`https://cst3144-cw-server.onrender.com/lessons/${item.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ space: newSpace })
                    });
                });

                return Promise.all(updatePromises);
            })
            .then(responses => {
                // Check if all PUT requests were successful
                if (responses.some(response => !response.ok)) {
                    throw new Error('Failed to update lesson spaces.');
                }
                // Show confirmation message
                this.orderSubmitted = true;

                // Reset cart and form
                this.cart = [];
                this.customerName = '';
                this.customerPhone = '';
                this.isFormValid = false;

                // Switch back to the product list
                this.showCart = false;
            })
            .catch(error => {
                console.error(error);
                alert('An error occurred while processing your order.');
            });
        }
    },
    created() {
        fetch('https://cst3144-cw-server.onrender.com/lessons')
            .then(response => response.json())
            .then(data => {
                this.productList = data.map(item => ({
                    id: item._id,
                    topic: item.topic,
                    location: item.location,
                    price: item.price,
                    space: item.space,
                    imageUrl: item.imageUrl 
                }));
            })
            .catch(error => console.error('Failed to load lessons:', error));
    }
});
