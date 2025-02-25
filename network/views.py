from datetime import timezone
from time import localtime
from django.utils import timezone
import json
from pyexpat.errors import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError, transaction
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.forms import PasswordChangeForm


from .models import User, Post, Like, Comment, Follower


def index(request):
    if request.user.is_authenticated:
        return render(request, "network/index.html", {
            "posts": Post.objects.all().order_by("-date_created")
        })
    else:
        return HttpResponseRedirect(reverse("login"))

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def create_post(request):
    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method."}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated."}, status=403)

    try:
        data = json.loads(request.body)
        post_content = data.get("post", "").strip()
        
        if not post_content:
            return JsonResponse({"error": "Post content cannot be empty."}, status=400)

        new_post = Post.objects.create(post=post_content, creator=request.user)
        return JsonResponse({"message": "Post created successfully.", "post_id": new_post.id}, status=201)
    
    except Exception as e:
        print("Error creating post:", e)  # Debugging line
        return JsonResponse({"error": "Failed to create post."}, status=500)

@login_required
def filter_posts(request, filter_type):
    user = request.user

    if filter_type == "following":
        following_users = Follower.objects.filter(user=user).values_list('following', flat=True)
        posts = Post.objects.filter(creator__in=following_users)
    elif filter_type == "foryou":
        posts = Post.objects.all()
    else:
        return JsonResponse({"error": "Invalid filter type."}, status=400)

    posts = posts.order_by("-date_created")

    posts_data = [post.serialize(request.user) for post in posts]

    return JsonResponse({"posts": posts_data}, safe=False)

@csrf_exempt
@login_required
def add_comment(request, post_id):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed."}, status=400)

    post = get_object_or_404(Post, id=post_id)

    try:
        data = json.loads(request.body)
        comment_content = data.get("comment", "").strip()
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    if not comment_content:
        return JsonResponse({"error": "Comment content cannot be empty."}, status=400)

    new_comment = Comment.objects.create(
        content=comment_content,
        post=post,
        commenter=request.user
    )

    profile_picture = ""
    if hasattr(request.user, "get_profile_picture"):
        profile_picture = request.user.get_profile_picture()

    response_data = {
        "message": "Comment added successfully.",
        "comment_id": new_comment.id,
        "comment_content": new_comment.content,
        "commenter": request.user.username,
        "commenter_profile_picture": profile_picture,
        "date_created": new_comment.timestamp.isoformat()
    }

    return JsonResponse(response_data, status=201)

def get_post_data(post_id, user):
    """Fetch post details & comments as a dictionary."""
    post = get_object_or_404(Post, id=post_id)
    comments = Comment.objects.filter(post=post).order_by('-timestamp')

    comments_data = [
        {
            "username": comment.commenter.username,
            "profile_picture": comment.commenter.get_profile_picture(),
            "date_created": comment.timestamp.isoformat(),
            "comment": comment.content
        }
        for comment in comments
    ]

    post_data = {
        "post_id": post.id,
        "profile_picture": post.creator.get_profile_picture(),
        "username": post.creator.username,
        "date_created": post.date_created.isoformat(),
        "post_content": post.post,
        "likes_count": post.likes.count(),
        "is_author": user == post.creator,
        "liked_by_user": Like.objects.filter(liker=user, post=post).exists(),
        "has_comments": comments.exists(),
    }

    return post_data, comments_data

def post_view(request, post_id):
    post_data, comments_data = get_post_data(post_id, request.user)

    return render(request, 'network/post.html', {
        "post": post_data,
        "comments": comments_data
    })

def get_post_details(request, post_id):
    post_data, comments_data = get_post_data(post_id, request.user)
    
    return JsonResponse({"post": post_data, "comments": comments_data})

def get_posts(request):
    posts = Post.objects.all().order_by("-date_created")
    posts_data = [
        {
            "id": post.id,
            "username": post.creator.username,
            "content": post.post,
            "date_created": localtime(post.date_created).isoformat(),
            "is_author": request.user == post.creator,
            "likes_count": post.likes.count(),
            "liked_by_user": Like.objects.filter(liker=request.user, post=post).exists(),
            "profile_picture": post.creator.get_profile_picture(),
        } for post in posts
    ]
    return JsonResponse({"posts": posts_data}, safe=False)

@login_required
def toggle_like(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    user = request.user
    liked = False

    with transaction.atomic():
        existing_like = Like.objects.filter(liker=user, post=post).first()

        if existing_like:
            existing_like.delete()
        else:
            Like.objects.create(liker=user, post=post)
            liked = True

        likes_count = Like.objects.filter(post=post).count()

    return JsonResponse({"liked": liked, "likes": likes_count}, status=200)

def get_profile_and_owner(request, username):
    profile = get_object_or_404(User, username=username)
    is_owner = request.user == profile
    is_following = profile.followers.filter(user=request.user).exists()
    return profile, is_owner, is_following

def profile_view(request, username):
    profile, is_owner, is_following = get_profile_and_owner(request, username)
    return render(request, 'network/profile.html', {'profile': profile, "is_owner": is_owner, 'is_following': is_following,})

def get_profile_information(request, username):
    profile, is_owner, is_following = get_profile_and_owner(request, username)
    
    posts = profile.posts.all().order_by('-date_created')
    posts_serialized = [post.serialize(request_user=request.user) for post in posts]

    data = {
        "profile_picture": profile.get_profile_picture(),
        "username": profile.username,
        "name": profile.first_name,
        "followers_count": profile.followers.count(),
        "following_count": profile.following.count(),
        "posts": posts_serialized,
        "is_owner": is_owner,
        "is_following": is_following
    }

    return JsonResponse(data)

@login_required
def follow_user(request, username):
    profile, is_owner, is_following = get_profile_and_owner(request, username)

    if is_owner:
        return JsonResponse({"error": "You cannot follow yourself."}, status=400)

    existing_follow = Follower.objects.filter(user=request.user, following=profile).first()

    if existing_follow:
        existing_follow.delete()
        following = False
    else:
        Follower.objects.create(user=request.user, following=profile)
        following = True

    return JsonResponse({
        "following": following,
        "followers_count": profile.followers.count()
    }, status=200)

def update_profile(request, profile):
    new_username = request.POST.get('username')
    first_name = request.POST.get('name')

    if not new_username:
        messages.error(request, 'Username cannot be empty.')
        return redirect('edit_profile') 
    if User.objects.filter(username=new_username).exclude(username=profile.username).exists():
        messages.error(request, 'Username is already taken by another user.')
        return redirect('edit_profile')

    profile.username = new_username
    profile.first_name = first_name
    profile.save()
    
    messages.success(request, 'Your profile was successfully updated!')
    return redirect('profile_view')

def change_password(request, profile):
    password_form = PasswordChangeForm(profile, request.POST)
    if password_form.is_valid():
        profile = password_form.save()
        update_session_auth_hash(request, profile)
        messages.success(request, 'Your password was successfully updated!')
    return password_form

@login_required
def edit_profile(request, username):
    profile, is_owner, _ = get_profile_and_owner(request, username)
    if not is_owner:
        return JsonResponse({"error": "You are not authorized to edit this profile."}, status=403)

    if request.method == 'POST':
        if 'save_profile' in request.POST:
            update_profile(request, profile)
        elif 'change_password' in request.POST:
            password_form = change_password(request, profile)
            if password_form.is_valid():
                return redirect('edit_profile', username=username)

    else:
        password_form = PasswordChangeForm(profile)

    return render(request, 'network/edit_profile.html', {
        'user': profile,
        'password_form': password_form
    })

@login_required
def edit_post(request, post_id):
    post = get_object_or_404(Post, id=post_id, creator=request.user)
    if request.method == 'PUT':
        data = json.loads(request.body)
        post.post = data.get('post', post.post)
        post.save()
        return JsonResponse({'message': 'Post updated successfully.'})
    return JsonResponse({'error': 'Invalid request.'}, status=400)

@login_required
def delete_post(request, post_id):
    post = get_object_or_404(Post, id=post_id, creator=request.user)
    if request.method == 'DELETE':
        post.delete()
        return JsonResponse({'message': 'Post deleted successfully.'})
    return JsonResponse({'error': 'Invalid request.'}, status=400)
