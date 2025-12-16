from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import *

router = DefaultRouter()
router.register(r'farmers', FarmerViewSet)
router.register(r'lands', LandViewSet)
router.register(r'warehouses', WarehouseViewSet)
router.register(r'products', ProductViewSet)
router.register(r'prices', PriceViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    # Custom route for price update if needed to match `PUT /api/prices` without ID
    # Note: DRF Router doesn't handle PUT on base collection easily. 
    # We might handle it manually or accept that frontend must change or use a specific implementation.
    path('prices_update', PriceViewSet.as_view({'put': 'update_price'})), 
]
