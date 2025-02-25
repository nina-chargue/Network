import { displayPosts } from './index.js';

document.addEventListener("DOMContentLoaded", function () {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const username = pathParts.pop();
    console.log("Extracted username:", username);

    fetch(`/api/profile/${username}/`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("profile-picture").src = data.profile_picture;
            document.getElementById("profile-name").innerText = data.name || data.username;
            document.getElementById("profile-username").innerText = "@" + data.username;
            document.getElementById("followers-count").innerText = data.followers_count + " followers";
            document.getElementById("following-count").innerText = data.following_count + " following";

            displayPosts(data.posts);
        })
        .catch(error => {
            console.error("Error fetching profile information:", error);
        });

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

    const csrftoken = getCookie('csrftoken');

    const followButton = document.getElementById("follow-button");
    const unfollowButton = document.getElementById("unfollow-button");

    if (followButton) {
        followButton.addEventListener("click", function () {
            toggleFollow(true, followButton);
        });
    }

    if (unfollowButton) {
        unfollowButton.addEventListener("click", function () {
            toggleFollow(false, unfollowButton);
        });
    }

    function toggleFollow(isFollowing, button) {
        fetch(`/api/profile/${username}/follow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.following) {
                    button.innerText = "Unfollow";
                } else {
                    button.innerText = "Follow";
                }

                document.getElementById("followers-count").innerText = `${data.followers_count} followers`;
            })
            .catch(error => {
                console.error("Error toggling follow:", error);
            });
    }


    const editButton = document.getElementById("edit-button");
    if (editButton) {
        editButton.addEventListener("click", function () {
            window.location.href = `/profile/${username}/edit`;
        });
    }
});
