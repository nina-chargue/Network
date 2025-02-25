const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'); 

// 🔹 Function to Open Comment Modal
export function openCommentModal(postId) {
    const modal = document.getElementById("commentModal");
    if (!modal) {
        console.error("❌ Error: commentModal not found in the DOM.");
        return;
    }

    modal.style.display = "block";
    document.getElementById("modalPostId").value = postId;

    fetch(`/api/posts/${postId}`)
    .then(response => response.json())
    .then(data => {
        document.getElementById("modalProfilePicture").src = data.post.profile_picture;
        document.getElementById("modalProfilePicture").alt = `${data.post.username}'s profile picture`;
        document.getElementById("modalUsername").innerText = data.post.username;
        document.getElementById("modalDate").innerText = formatTimestamp(data.post.date_created);
        document.getElementById("modalPostContent").innerText = data.post.post_content;
        document.getElementById("modalReplyContainer").innerText = `Replying to @${data.post.username}`;
    })
    .catch(error => {
        console.error('❌ Error fetching post information:', error);
        alert("Failed to fetch post information.");
    });
}

// 🔹 Function to Open Edit Post Modal
export function openEditPostModal(postId) {
    const modal = document.getElementById("editPostModal");
    if (!modal) {
        console.error("❌ Error: editPostModal not found in the DOM.");
        return;
    }

    modal.style.display = "block";

    fetch(`/api/posts/${postId}`)
    .then(response => response.json())
    .then(data => {
        console.log("✅ Edit Post Data:", data);

        document.getElementById("editPostTextarea").value = data.post.post_content;
        document.getElementById("saveEditPostButton").dataset.postId = postId; 
        document.getElementById("deletePostButton").dataset.postId = postId;
    })
    .catch(error => {
        alert("Failed to fetch post information.");
    });
}

// 🔹 Function to Close Modal
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    } else {
        console.warn(`⚠️ Attempted to close non-existent modal: ${modalId}`);
    }
}

// 🔹 Function to Handle Relative Time Formatting
export function timeAgo(dateString) {
    if (!dateString) {
        return "Invalid date";
    }

    const now = new Date();
    const postDate = new Date(dateString);

    if (isNaN(postDate.getTime())) {
        return "Invalid date";
    }

    let seconds = Math.floor((now - postDate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;

    const intervals = [
        { label: "yr", seconds: 31536000 },
        { label: "m", seconds: 2592000 },
        { label: "d", seconds: 86400 },
        { label: "hr", seconds: 3600 },
        { label: "min", seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count}${interval.label} ago`;
    }
}

// 🔹 Function to Format Date Properly
export function formatTimestamp(dateString) {
    if (!dateString) {
        return "Invalid date";
    }

    const postDate = new Date(dateString);

    if (isNaN(postDate.getTime())) {
        return "Invalid date";
    }

    const hours = postDate.getHours();
    const minutes = postDate.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    const month = postDate.toLocaleString('default', { month: 'long' });
    const day = postDate.getDate();
    const year = postDate.getFullYear();

    return `${formattedHours}:${minutes} ${ampm} · ${month} ${day}, ${year}`;
}

// 🔹 Function to Initialize Modal Listeners
export function initializeModalListeners() {
    // ✅ Close modals when clicking on close buttons
    const closeModalButtons = document.querySelectorAll("[data-modal-target]");
    closeModalButtons.forEach(button => {
        button.addEventListener("click", function () {
            const modalId = this.getAttribute("data-modal-target");
            closeModal(modalId);
        });
    });

    // ✅ Close modals when clicking outside of them
    window.addEventListener("click", function (event) {
        const commentModal = document.getElementById("commentModal");
        const editPostModal = document.getElementById("editPostModal");

        if (commentModal && event.target === commentModal) {
            closeModal("commentModal");
        }
        if (editPostModal && event.target === editPostModal) {
            closeModal("editPostModal");
        }
    });
}
