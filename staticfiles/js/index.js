const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

export function autoResizeTextarea() {
    const textarea = document.querySelector('textarea');
    if (textarea) {
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
}

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
                displayPosts(data.posts); 
            } else {
                console.error("Error: 'posts' is not an array");
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

export function displayPosts(posts) {
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
                    <span class="timestamp"> · ${formatTimestamp(post.date_created)}</span>
                </div>
                ${post.is_author ? `<button class="edit-post-button"><svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1xvli5t r-1hdv0qi">
                        <g><path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path></g>
                    </svg></button>` : ""}
            </div>
            <div class="post-content" style="cursor: pointer;" data-post-id="${post.id}">
                <p>${post.post}</p>
            </div>
            <div class="post-footer">
                <a class="comment-link" data-post-id="${post.id}">
                    <svg viewBox="0 0 24 24" aria-hidden="true" class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1xvli5t r-1hdv0qi"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                </a>
                <div class="like-container">
                    <div class="like-button" id="likeButton-${post.id}">
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
    });
}

export function formatTimestamp(date) {
    const postDate = new Date(date);
    const hours = postDate.getHours();
    const minutes = postDate.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    const month = postDate.toLocaleString('default', { month: 'long' });
    const day = postDate.getDate();
    const year = postDate.getFullYear();

    return `${formattedHours}:${minutes} ${ampm} · ${month} ${day}, ${year}`;
}

export function createPost(event) {
    event.preventDefault();

    const postContent = document.querySelector('#newPost').value;

    if (!postContent) {
        alert("Please write a post.");
        return;
    }

    fetch('/api/posts/create', { 
        method: 'POST',
        body: JSON.stringify({ post: postContent }),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Post created:', data);
        load_posts("foryou");
    })
    .catch(error => {
        console.error('Error creating post:', error);
        alert("Error creating post. Please try again.");
    });

    document.querySelector('#newPost').value = '';
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export function toggleLike(postId) {
    const likeButton = document.getElementById(`likeButton-${postId}`);
    const likesCount = document.getElementById(`likesCount-${postId}`);
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    if (!postId) {
        console.error("Error: postId is null when trying to like the post.");
        return;
    }

    fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.liked) {
                likeButton.querySelector('svg g').style.fill = '#FF204E'; // Liked color
            } else {
                likeButton.querySelector('svg g').style.fill = 'rgb(113, 118, 123)'; // Default color
            }

            likesCount.textContent = data.likes;
        })
        .catch(error => {
            console.error('Error toggling like:', error);
            alert("Error toggling like. Please try again.");
        });
}

export function openCommentModal(postId) {
    const modal = document.getElementById("commentModal");
    if (!modal) {
        console.error("Error: commentModal not found in the DOM.");
        return;
    }
    modal.style.display = "block";
    document.getElementById("modalPostId").value = postId;

    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch post information, status code: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("modalProfilePicture").src = data.profile_picture;
            document.getElementById("modalProfilePicture").alt = `${data.username}'s profile picture`;
            document.getElementById("modalUsername").innerText = data.username;

            const date = new Date(data.dateCreated);
            const month = date.toLocaleString('default', { month: 'short' });
            const day = date.getDate();
            document.getElementById("modalDate").innerText = `${month} ${day}`;

            document.getElementById("modalPostContent").innerText = data.postContent;
            document.getElementById("modalReplyContainer").innerText = `Replying to @${data.username}`;
        })
        .catch(error => {
            console.error('Error fetching post information:', error);
            alert("Failed to fetch post information.");
        });
}

export function addComment(postId) {
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const commentContent = commentInput.value.trim();

    if (commentContent) {
        const csrfToken = getCookie("csrftoken");

        fetch(`/api/posts/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ comment: commentContent })
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    const commentsList = document.getElementById(`commentsList-${postId}`);
                    const newCommentElement = document.createElement("div");
                    newCommentElement.className = "comment";
                    newCommentElement.innerHTML = `
                        <div>
                            <img src="${data.commenter_profile_picture}" alt="${data.commenter}'s profile picture" class="profile-picture">
                            <a href="/profile/${data.commenter}" class="link">${data.commenter}</a>
                            <span class="timestamp">${formatTimestamp(new Date(data.date_created))}</span>
                        </div>
                        <p>${data.comment_content}</p>
                    `;
                    commentsList.appendChild(newCommentElement);
                    commentInput.value = '';
                } else if (data.error) {
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error adding comment:', error);
                alert("Error adding comment. Please try again.");
            });
    } else {
        alert("Comment content cannot be empty.");
    }
}

export function openEditPostModal(postId) {
    const modal = document.getElementById("editPostModal");
    modal.style.display = "block";

    if (!modal) {
        console.error("Error: editPostModal not found in the DOM.");
        return;
    }
    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch post information, status code: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("editPostTextarea").value = data.postContent;
            document.getElementById("saveEditPostButton").dataset.postId = postId; 
            document.getElementById("deletePostButton").dataset.postId = postId;
        })
        .catch(error => {
            console.error('Error fetching post information:', error);
            alert("Failed to fetch post information.");
        });
}

export function saveEditedPost(postId) {
    const updatedContent = document.getElementById("editPostTextarea").value;

    fetch(`/api/posts/${postId}/edit/`, {
        method: 'PUT',
        body: JSON.stringify({ post: updatedContent }),
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Post updated:', data);
        load_posts("foryou");  
        closeModal("editPostModal");
    })
    .catch(error => {   
        console.error('Error updating post:', error);
        alert("Error updating post. Please try again.");
    });
}

export function deletePost(postId) {
    fetch(`/api/posts/${postId}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken }
    })
    .then(response => {
        if (response.ok) {
            console.log('Post deleted');
            load_posts("foryou");
            closeModal("editPostModal");
        } else {
            console.error('Error deleting post');
            alert("Error deleting post. Please try again.");
        }
    });
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", function() {    
    // 1. Create post
    const composeForm = document.getElementById('compose-form');
    if (composeForm) {
        composeForm.addEventListener('submit', createPost);
    }

    // 2. Close modals
    const closeModalButtons = document.querySelectorAll('[data-modal-target]');
    closeModalButtons.forEach(button => {
        button.addEventListener("click", function () {
            const modalId = this.getAttribute('data-modal-target');
            closeModal(modalId);
        });
    });

    // 3. Handle clicks outside of modals to close them
    window.addEventListener("click", function(event) {
        const commentModal = document.getElementById("commentModal");
        const editPostModal = document.getElementById("editPostModal");

        if (commentModal && event.target === commentModal) {
            closeModal("commentModal");
        }
        if (editPostModal && event.target === editPostModal) {
            closeModal("editPostModal");
        }
    });

    // 7. Format timestamps
    const timestampElements = document.querySelectorAll('.timestamp');
    timestampElements.forEach(el => {
        const date = el.getAttribute('data-date');
        if (date) {
            if (el.classList.contains('time-ago')) {
                el.textContent = formatTimestamp(date);
            } else if (el.classList.contains('formatted-timestamp')) {
                el.textContent = formatTimestamp(date);
            }
        }
    });

    // 4. Save edited post
    const saveEditButton = document.getElementById("saveEditPostButton");
    if (saveEditButton) {
        saveEditButton.addEventListener("click", function() {
            const postId = this.dataset.postId;
            if (postId) {
                saveEditedPost(postId);
            }
        });
    }

    // 5. Delete post
    const deletePostButton = document.getElementById("deletePostButton");
    if (deletePostButton) {
        deletePostButton.addEventListener("click", function() {
            const postId = this.dataset.postId; 
            if (postId && confirm("Are you sure you want to delete this post?")) {
                deletePost(postId);
            }
        });
    }


    // 8. Comment form submission
    const commentForm = document.getElementById("modal-comment-form");
    if (commentForm) {
        commentForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const postId = document.getElementById("modalPostId").value;
            const commentContent = document.getElementById("modalNewComment").value;

            if (!commentContent) {
                alert("Please write a comment.");
                return;
            }

            fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                body: JSON.stringify({ comment: commentContent }),
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err });
                }
                return response.json();
            })
            .then(data => {
                console.log('Comment added:', data);
                document.getElementById("commentModal").style.display = "none";
                document.getElementById("modalNewComment").value = '';
                window.location.href = `/post/${postId}/`;
            })
            .catch(error => {
                console.error('Error adding comment:', error);
                alert("Error adding comment. Please try again.");
            });
        });
    }

    // 9. Autorresize textareas
    if (typeof autoResizeTextarea === "function") {
        autoResizeTextarea();
    } else {
        console.warn("autoResizeTextarea function is not defined.");
    }

});


