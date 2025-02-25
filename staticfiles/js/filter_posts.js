import {load_posts} from './index.js';

document.addEventListener("DOMContentLoaded", function () {

    const textarea = document.querySelector('textarea');
    if (textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto'; 
            this.style.height = (this.scrollHeight) + 'px';  
        });
    }

    const filterForYouButton = document.querySelector("#filterForYou");
    const filterFollowingButton = document.querySelector("#filterFollowing");

    filterForYouButton.addEventListener("click", () => {
        setActiveFilter(filterForYouButton, filterFollowingButton);
        load_posts("foryou");
    });
    
    filterFollowingButton.addEventListener("click", () => {
        setActiveFilter(filterFollowingButton, filterForYouButton);
        load_posts("following");
    });

    load_posts("foryou");
    setActiveFilter(filterForYouButton, filterFollowingButton);

    function setActiveFilter(activeButton, inactiveButton) {
        activeButton.classList.add("active");
        inactiveButton.classList.remove("active");
    }

});
