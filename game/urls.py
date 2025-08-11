from django.urls import path
from . import views
urlpatterns = [
    path('', views.index, name='index'),  # 曲選択画面
    path('play/<slug:slug>', views.play, name='play'),  # プレイ画面
    path('charts/<slug:slug>.json', views.chart, name='chart'),
    path('api/chart/<slug:slug>', views.get_chart, name='get_chart'),  # 薄いAPI
    path('api/translate', views.translate_api, name='translate_api'),  # 翻訳API
]
