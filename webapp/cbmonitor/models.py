from django.contrib import admin
from django.db import models


class Cluster(models.Model):

    name = models.CharField(max_length=64, primary_key=True, blank=False)

    def __str__(self):
        return self.name

    class Admin:
        pass


class Server(models.Model):

    class Meta:
        unique_together = ["address", "cluster"]

    cluster = models.ForeignKey("Cluster")
    address = models.CharField(max_length=80, blank=False)

    def __str__(self):
        return self.address

    class Admin:
        pass


class Bucket(models.Model):

    class Meta:
        unique_together = ["name", "cluster"]

    name = models.CharField(max_length=32, default="default")
    cluster = models.ForeignKey("Cluster")

    def __str__(self):
        return self.name

    class Admin:
        pass


class Index(models.Model):

    class Meta:
        unique_together = ["name", "cluster"]

    name = models.CharField(max_length=32, default="idx")
    cluster = models.ForeignKey("Cluster")

    def __str__(self):
        return self.name

    class Admin:
        pass



class Observable(models.Model):

    class Meta:
        unique_together = ["name", "cluster", "server", "bucket", "index"]

    name = models.CharField(max_length=128)
    cluster = models.ForeignKey("Cluster")
    server = models.ForeignKey("Server", null=True, blank=True)
    bucket = models.ForeignKey("Bucket", null=True, blank=True)
    index = models.ForeignKey("Index", null=True, blank=True)
    collector = models.CharField(max_length=32)

    def __str__(self):
        return self.name

    class Admin:
        pass


class Snapshot(models.Model):

    name = models.CharField(max_length=256, primary_key=True, blank=False)
    ts_from = models.DateTimeField()
    ts_to = models.DateTimeField()
    cluster = models.ForeignKey("Cluster")

    def __str__(self):
        return self.name

    class Admin:
        pass


admin.site.register(Cluster)
admin.site.register(Server)
admin.site.register(Bucket)
admin.site.register(Index)
admin.site.register(Observable)
admin.site.register(Snapshot)
