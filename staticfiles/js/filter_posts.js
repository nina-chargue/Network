import { load_posts, getFilterTypeFromUI } from './post.js';

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

    // ✅ Only call `load_posts("foryou")` if it hasn't already been loaded
    if (!window.postsAlreadyLoaded) {
        window.postsAlreadyLoaded = true;
        load_posts("foryou");
        setActiveFilter(filterForYouButton, filterFollowingButton);
    }

    function setActiveFilter(activeButton, inactiveButton) {
        activeButton.classList.add("active");
        inactiveButton.classList.remove("active");
    }
});
