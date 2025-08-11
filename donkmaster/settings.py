from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'dev-secret-key-change-me'
DEBUG = True
ALLOWED_HOSTS = ['*']
INSTALLED_APPS = ['django.contrib.staticfiles','game']
MIDDLEWARE = []
ROOT_URLCONF = 'donkmaster.urls'
TEMPLATES = [{
 'BACKEND':'django.template.backends.django.DjangoTemplates',
 'DIRS':[], 'APP_DIRS':True, 'OPTIONS':{'context_processors':[]}
}]
WSGI_APPLICATION = 'donkmaster.wsgi.application'
STATIC_URL = '/static/'
