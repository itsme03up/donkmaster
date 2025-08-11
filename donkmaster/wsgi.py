"""
WSGI config for DonkMaster project.
This exposes the WSGI callable as a module-level variable named ``application``.
"""
import os
try:
    from django.core.wsgi import get_wsgi_application
except ImportError:
    # Djangoがインストールされていない場合のためのダミー
    def get_wsgi_application():
        raise ImportError("Djangoがインストールされていません。仮想環境やパスを確認してください。")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'donkmaster.settings')
application = get_wsgi_application()
