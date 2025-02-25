from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ValidationError
from django.conf import settings


class User(AbstractUser):
    profile_picture = models.URLField(max_length=200, blank=True, null=True)

    def get_profile_picture(self):
        if self.profile_picture:
            return self.profile_picture
        return f"{settings.STATIC_URL}images/no_face.png"

class Post(models.Model):
    post = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')

    def serialize(self, request_user=None):
        return {
            "id": self.id,
            "post": self.post,
            "date_created": self.date_created.strftime('%Y-%m-%d %H:%M:%S'),
            "creator": self.creator.username,
            "profile_picture": self.creator.get_profile_picture(),
            "is_author": self.creator == request_user,
            "likes_count": self.likes.count(),
            "is_liked": Like.objects.filter(liker=request_user, post=self).exists(),
        }

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    commenter = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.commenter.username} - {self.content[:20]}"

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    liker = models.ForeignKey(User, on_delete=models.CASCADE)

class Follower(models.Model):
    user = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('user', 'following')

    def clean(self):
        if self.user == self.following:
            raise ValidationError("A user cannot follow themselves.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

# followers

# python manage.py makemigrations network
# python manage.py migrate