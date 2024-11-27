var app = new Vue({
    el: '#app',
    data: {
        sitename: 'School Lessons & Activities',
        showCart: false,
        productList: []
    },
    methods: {
        toggleView() {
            this.showCart = !this.showCart;
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
