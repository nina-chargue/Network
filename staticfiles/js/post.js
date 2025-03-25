import { openCommentModal, openEditPostModal, formatTimestamp, timeAgo, initializeModalListeners } from "./modals.js";
import { toggleLike, deletePost, saveEditedPost, addComment, createPost, autoResizeTextarea} from "./crud_functions.js";

if (!window.jsAlreadyLoaded) {
    window.jsAlreadyLoaded = true; // Prevents duplicate execution

    document.addEventListener("DOMContentLoaded", async function () {
        console.log("📌 DOMContentLoaded Fired");

        const postId = getPostIdFromURL();

        if (postId) {
            await displaySinglePost(postId);
            attachEventListeners(postId);
        } else {
            // Create post
            const composeForm = document.getElementById('compose-form');
            if (composeForm) {
                composeForm.addEventListener('submit', createPost);
            }
            
            // Comment Form
            const commentForm = document.getElementById("modal-comment-form");
            if (commentForm) {
                commentForm.addEventListener("submit", (event) => {
                    event.preventDefault();
                    addComment(postId);
                });
            }

            // Delete Post Button
            const deletePostButton = document.getElementById("deletePostButton");
            if (deletePostButton) {
                deletePostButton.addEventListener("click", function() {
                    const postId = this.dataset.postId; 
                    if (postId && confirm("Are you sure you want to delete this post?")) {
                        deletePost(postId);
                    }
                });
            }

            // Save edited post
            const saveEditButton = document.getElementById("saveEditPostButton");
            if (saveEditButton) {
                saveEditButton.addEventListener("click", function() {
                    const postId = this.dataset.postId;
                    if (postId) {
                        saveEditedPost(postId);
                    }
                });
            }

            // Autorresize textareas
            if (typeof autoResizeTextarea === "function") {
                autoResizeTextarea();
            } else {
                console.warn("autoResizeTextarea function is not defined.");
            }
        }

        initializeModalListeners();
    });
}

function getPostIdFromURL() {
    const pathSegments = window.location.pathname.split("/").filter(segment => segment);
    return pathSegments.length >= 2 && pathSegments[0] === "post" ? parseInt(pathSegments[1], 10) : null;
}

export function getFilterTypeFromUI() {
    const forYouButton = document.getElementById("filterForYou");
    const followingButton = document.getElementById("filterFollowing");

    if (forYouButton?.classList.contains("active")) {
        return "foryou";
    } else if (followingButton?.classList.contains("active")) {
        return "following";
    }
    
    return "foryou";
}

let currentPage = 1;
const postsPerPage = 10;
let allPosts = [];

export function load_posts(filterType) {
    const endpoint = `/api/posts/filter/${filterType}/`;

    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("API response:", data);
            if (Array.isArray(data.posts)) {
                allPosts = data.posts;
                currentPage = 1;
                renderPage(currentPage);
            } else {
                console.error("Error: 'posts' is not an array");
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function renderPage(page) {
    const startIndex = (page - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToDisplay = allPosts.slice(startIndex, endIndex);

    displayPosts(postsToDisplay);

    renderPaginationControls();
}

function renderPaginationControls() {
    const paginationContainer = document.querySelector(".paginationContainer");
    if (!paginationContainer) {
        console.error("❌ Error: .paginationContainer element not found in the DOM.");
        return;
    }

    paginationContainer.innerHTML = '';

    if (currentPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.className = "pagination-btn prev-button";
        prevButton.addEventListener("click", () => {
            currentPage--;
            renderPage(currentPage);
        });
        paginationContainer.appendChild(prevButton);
    }

    if (currentPage * postsPerPage < allPosts.length) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.className = "pagination-btn next-button";
        nextButton.addEventListener("click", () => {
            currentPage++;
            renderPage(currentPage);
        });
        paginationContainer.appendChild(nextButton);
    }
}

async function displayPosts(posts) {
    const postsContainer = document.querySelector(".postsContainer");

    if (!postsContainer) {
        console.error("Error: .postsContainer element not found in the DOM.");
        return;
    }

    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.className = "post";

        const fillColor = post.is_liked ? '#FF204E' : 'rgb(113, 118, 123)';

        postElement.innerHTML = `
            <div class="post-header">
                <div>
                    <img src="${post.profile_picture}" alt="${post.creator}'s profile picture" class="profile-picture">
                    <a href="/profile/${post.creator}" class="link">${post.creator}</a>
                    <span class="timestamp formatted-timestamp" id="postTimestamp"> · ${formatTimestamp(post.date_created)}</span>
                </div>
                ${post.is_author ? `<button class="edit-post-button" id="editPostButton-${post.id}" data-post-id="${post.id}"><svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1xvli5t r-1hdv0qi">
                        <g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g>
                    </svg></button>` : ""}
            </div>
            <div class="post-content" style="cursor: pointer;" data-post-id="${post.id}">
                <p id="postContent">${post.post}</p>
            </div>
            <div class="post-footer">
                <a class="comment-link" id="commentLink-${post.id}" data-post-id="${post.id}">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1xvli5t r-1hdv0qi"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                </a>
                <div class="like-container">
                    <div class="like-button" id="likeButton-${post.id}" data-post-id="${post.id}">
                        <svg version="1.0" xmlns="http://www.w3.org/2000/svg" 
                             viewBox="0 0 225 225" preserveAspectRatio="xMidYMid meet">
                            <g transform="translate(0.000000,225.000000) scale(0.1,-0.1)" stroke="none" fill="${fillColor}">
                                <path d="M645 2080 c-155 -32 -272 -120 -312 -233 -41 -118 -12 -304 67 -427
                                28 -44 158 -176 165 -168 2 2 -4 37 -12 78 -20 104 -13 277 15 348 56 145 215
                                266 412 313 30 7 59 16 63 19 11 10 -135 57 -214 69 -73 12 -127 12 -184 1z"/>
                                <path d="M1397 2075 c-71 -18 -157 -54 -157 -66 0 -5 27 -9 60 -9 56 0 61 -2
                                87 -36 15 -20 45 -56 65 -80 57 -68 106 -178 118 -264 6 -41 17 -84 25 -97 21
                                -32 73 -67 129 -88 65 -24 90 -75 90 -190 0 -157 -71 -306 -188 -393 -51 -38
                                -56 -44 -31 -38 46 11 179 70 242 108 93 55 204 171 247 260 53 107 60 185 22
                                263 -30 60 -77 95 -161 121 -117 35 -143 75 -156 243 -8 100 -13 122 -37 161
                                -57 93 -216 140 -355 105z"/>
                                <path d="M995 1836 c-121 -38 -185 -117 -185 -228 0 -44 4 -54 35 -85 54 -54
                                69 -45 95 65 14 56 58 104 122 133 43 19 71 23 150 24 57 0 97 4 95 9 -6 17
                                -97 75 -135 86 -49 13 -128 12 -177 -4z"/>
                                <path d="M1118 1627 c-110 -31 -174 -129 -137 -210 25 -54 118 -70 163 -28 14
                                13 28 32 31 42 5 15 12 14 65 -14 79 -40 167 -43 205 -7 30 28 31 54 5 98 -62
                                102 -208 154 -332 119z"/>
                                <path d="M162 1566 c-48 -70 -56 -179 -21 -274 35 -96 35 -95 -20 -177 -83
                                -125 -101 -226 -57 -321 30 -64 66 -99 136 -133 48 -23 67 -26 155 -26 138 0
                                143 3 94 57 -49 53 -95 145 -111 221 -11 52 -10 67 10 145 27 103 26 107 -52
                                226 -62 94 -83 145 -99 244 l-12 71 -23 -33z"/>
                                <path d="M709 1433 c-10 -12 -13 -43 -11 -117 4 -140 23 -178 114 -226 91 -48
                                112 -68 152 -148 84 -168 143 -182 343 -86 102 49 204 138 237 209 42 87 22
                                209 -37 236 -28 13 -47 5 -163 -71 -48 -31 -91 -51 -120 -56 -145 -21 -328 71
                                -427 216 -44 65 -63 74 -88 43z"/>
                                <path d="M526 1048 c-20 -29 -20 -106 -1 -183 55 -211 290 -391 556 -424 177
                                -23 336 45 400 172 24 45 28 45 -128 11 -143 -31 -303 -31 -363 0 -75 39 -107
                                82 -140 190 -33 104 -108 184 -223 236 -55 26 -82 25 -101 -2z"/>
                                <path d="M2160 915 c-28 -46 -75 -77 -246 -163 -149 -76 -250 -145 -305 -210
                                -35 -41 -165 -290 -156 -298 7 -8 293 121 372 168 39 22 94 55 124 72 30 17
                                82 57 116 88 68 63 117 152 135 249 11 55 5 129 -10 129 -5 0 -18 -16 -30 -35z"/>
                                <path d="M305 433 c82 -132 215 -222 390 -264 161 -39 396 -24 560 34 l39 14
                                -80 6 c-103 8 -186 38 -329 121 -72 42 -144 74 -197 90 -99 29 -274 56 -359
                                56 l-60 0 36 -57z"/>
                            </g>
                        </svg>
                    </div>
                    <span class="likes-count" id="likesCount-${post.id}">${post.likes_count || 0}</span>
                </div>
            </div>
        `;

        postsContainer.appendChild(postElement);

        if (post.is_author) {
            postElement.querySelector('.edit-post-button').addEventListener('click', function() {
                openEditPostModal(post.id);
            });
        }

        postElement.querySelector('.post-content').addEventListener("click", function() {
            window.location.href = `/post/${post.id}/`; 
        });

        document.querySelector(`#likeButton-${post.id}`).addEventListener("click", function() {
            toggleLike(post.id);
        });

        document.querySelector(`.comment-link[data-post-id="${post.id}"]`).addEventListener("click", function() {
            openCommentModal(post.id);
        });

        // attachEventListeners(post.id);

    });
}

async function displaySinglePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) throw new Error(`Failed to fetch post: ${response.statusText}`);
        const data = await response.json();
        updatePostUI(data, postId);
    } catch (error) {
        console.error("❌ Error fetching post details:", error);
    }
}

function updatePostUI(data, postId) {
    updateElement("profilePicture", "src", data.post.profile_picture);
    updateElement("postUsername", "textContent", data.post.username);
    updateElement("postUsername", "href", `/profile/${data.post.username}`);
    updateElement("postTimestamp", "textContent", timeAgo(data.post.date_created));
    updateElement("postContentTimestamp", "textContent", formatTimestamp(data.post.date_created));
    updateElement("postContent", "textContent", data.post.post_content);
    updateCommentTimestamps();
}

function updateCommentTimestamps() {
    const commentTimestamps = document.querySelectorAll(".comment.timestamp.time-ago");
    commentTimestamps.forEach(element => {
        const date = element.getAttribute("data-date");
        if (date) {
            element.textContent = formatTimestamp(date);
        }
    });
}

function attachEventListeners(postId) {
    // Like Button
    const likeButton = document.getElementById(`likeButton-${postId}`);
    if (likeButton) {
        likeButton.addEventListener("click", () => toggleLike(postId));
    } else {
        console.warn(`⚠️ Like button not found in the DOM for post ID: ${postId}`);
    }

    // Edit Post Button
    const editButton = document.getElementById("editPostButton");
    if (editButton) {
        editButton.addEventListener("click", () => openEditPostModal(postId));
    } else {
        console.warn("⚠️ Edit button not found in the DOM");
    }

    // Comment Button
    const commentLink = document.querySelector(".comment-link");
    if (commentLink) {
        commentLink.addEventListener("click", () => openCommentModal(postId));
    } else {
        console.warn("⚠️ Comment link not found in the DOM");
    }

    // Comment Form
    const commentForm = document.getElementById("modal-comment-form");
    if (commentForm) {
        commentForm.addEventListener("submit", (event) => {
            event.preventDefault();
            addComment(postId);
        });
    } else {
        console.warn(`⚠️ Comment form not found for post ID: ${postId}`);
    }

    // Delete Post Button
    const deletePostButton = document.getElementById("deletePostButton");
    if (deletePostButton) {
        deletePostButton.addEventListener("click", function() {
            const postId = this.dataset.postId; 
            if (postId && confirm("Are you sure you want to delete this post?")) {
                deletePost(postId);
            }
        });
    }

    // Save edited post
    const saveEditButton = document.getElementById("saveEditPostButton");
    if (saveEditButton) {
        saveEditButton.addEventListener("click", function() {
            const postId = this.dataset.postId;
            if (postId) {
                saveEditedPost(postId);
            }
        });
    }

    // Autorresize textareas
    if (typeof autoResizeTextarea === "function") {
        autoResizeTextarea();
    } else {
        console.warn("autoResizeTextarea function is not defined.");
    }
}

function updateElement(id, prop, value) {
    const element = document.getElementById(id);
    if (element) {
        element[prop] = value;
    } else {
        console.warn(`⚠️ Element with ID '${id}' not found in the DOM.`);
    }
}
