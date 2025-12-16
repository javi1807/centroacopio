import os
import sys

# Add the 'backend' directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../backend'))

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "agrosync_backend.settings")

app = get_wsgi_application()
