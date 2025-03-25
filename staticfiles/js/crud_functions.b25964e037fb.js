import { closeModal } from "./modals.js";
import { load_posts } from "./post.js";

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'); 

export function createPost(event) {
    event.preventDefault();

    const postContent = document.getElementById('newPost').value;

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

export function toggleLike(postId) {
    const likeButton = document.getElementById(`likeButton-${postId}`);
    const likesCount = document.getElementById(`likesCount-${postId}`);
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        }
    })
    .then(async (response) => {
        const text = await response.text();
        try {
            const data = JSON.parse(text);
            return data;
        } catch (error) {
            throw new Error("❌ Server response is not valid JSON");
        }
    })
    .then(data => {
        if (likeButton && likesCount) {
            likeButton.querySelector('svg g').style.fill = data.liked ? '#FF204E' : 'rgb(113, 118, 123)';
            likesCount.textContent = data.likes;
        } else {
            console.warn(`⚠️ Like button or count disappeared from DOM before update (post ID: ${postId})`);
        }
    })
    .catch(error => {
        console.error('❌ Error toggling like:', error);
        alert("Error toggling like. Please try again.");
    });
}

export function addComment() {
    const modalPostIdInput = document.getElementById("modalPostId");

    if (!modalPostIdInput || !modalPostIdInput.value) {
        console.error("❌ No post ID found when submitting comment.");
        alert("Error: Post ID is missing.");
        return;
    }

    const postId = modalPostIdInput.value.trim();
    const commentContent = document.getElementById("modalNewComment").value.trim();

    if (!commentContent) {
        alert("Comment content cannot be empty.");
        return;
    }

    fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ comment: commentContent }),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ Comment added:', data);
        document.getElementById("commentModal").style.display = "none";
        document.getElementById("modalNewComment").value = '';
        window.location.href = `/post/${postId}/`;
    })
    .catch(error => {
        console.error('❌ Error adding comment:', error);
        alert("Error adding comment. Please check the console.");
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
        const postContentElement = document.querySelector(`.post-content[data-post-id="${postId}"] p`);
        if (postContentElement) {
            postContentElement.textContent = updatedContent;
        } else {
            console.warn(`⚠️ Could not find post content element for Post ID: ${postId}`);
        }

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
            window.location.href = `/`;
            closeModal("editPostModal");
        } else {
            console.error('Error deleting post');
            alert("Error deleting post. Please try again.");
        }
    });
}

export function autoResizeTextarea() {
    const textarea = document.querySelector('textarea');
    if (textarea) {
        textarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
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