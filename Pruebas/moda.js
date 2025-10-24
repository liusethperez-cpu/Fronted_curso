const moda = {  
    init: function() {
        this.cacheDOM();
        this.bindEvents();
    },
    cacheDOM: function() {
        this.$menuBtn = document.getElementById('menuBtn');
        this.$nav = document.querySelector('nav');
    },
    bindEvents: function() {
        this.$menuBtn.addEventListener('click', this.toggleMenu.bind(this));
    },
    toggleMenu: function() {
        this.$nav.classList.toggle('open');
    }
};
document.addEventListener('DOMContentLoaded', function() {
    moda.init();
}); 

export default moda;


