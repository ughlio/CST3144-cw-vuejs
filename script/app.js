var app = new Vue({
    el: '#app',
    data: {
        sitename: 'School Lessons & Activities',
        showCart: false,
        productList: [],
        sortKey: 'topic',
        sortOrder: 1 // 1 for ascending, -1 for descending
    },
    methods: {
        toggleView() {
            this.showCart = !this.showCart;
        },

        sortBy(key) {
            if (this.sortKey !== key) {
                this.sortKey = key; // Change the sort key
                this.sortOrder = 1; // Default to ascending when a new key is selected
            }
            this.applySort();
        },
        toggleSortOrder() {
            this.sortOrder *= -1; // Toggle the sort order
            this.applySort();
        },
        applySort() {
            this.productList.sort((a, b) => {
                let modifier = this.sortOrder;
                return (a[this.sortKey] > b[this.sortKey] ? 1 : a[this.sortKey] < b[this.sortKey] ? -1 : 0) * modifier;
            });
        }

    },
    created() {
        fetch('https://cst3144-cw-server.onrender.com/lessons')
            .then(response => response.json())
            .then(data => {
                this.productList = data.map(item => ({
                    id: item.id,
                    topic: item.topic,
                    location: item.location,
                    price: item.price,
                    space: item.space
                }));
            })
            .catch(error => console.error('Failed to load lessons:', error));
    }
    
});
