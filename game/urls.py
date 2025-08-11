from django.urls import path
from . import views
urlpatterns = [
  path('', views.index, name='index'),
  path('charts/<slug:slug>.json', views.chart, name='chart'),
]
