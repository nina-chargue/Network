
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('profile/<str:username>/', views.profile_view, name='profile_view'),
    path('profile/<str:username>/edit/', views.edit_profile, name='edit_profile'),
    path('profile/<str:username>/follow/', views.follow_user, name='follow_user'),
    path('post/<int:post_id>/', views.post_view, name='post_view'),

    # APIS ROUTES FOR POSTS
    path('api/posts/create', views.create_post, name='create_post'),
    path('api/posts/filter/<str:filter_type>/', views.filter_posts, name='filter_posts'),
    path('api/posts/<int:post_id>/', views.get_post_details, name='get_post_details'),
    path('api/posts/<int:post_id>/comment', views.add_comment, name='add_comment'),  
    path('api/posts/<int:post_id>/like', views.toggle_like, name='toggle_like'),
    path('api/posts/<int:post_id>/edit/', views.edit_post, name='edit_post'),
    path('api/posts/<int:post_id>/delete/', views.delete_post, name='delete_post'),
    
    # API ROUTES FOR PROFILE
    path('api/profile/<str:username>/', views.get_profile_information, name='get_profile_information'),
    path('api/profile/<str:username>/edit', views.update_profile, name='update_profile'),
    path('api/profile/<str:username>/follow', views.follow_user, name='api_follow_user'),

]
