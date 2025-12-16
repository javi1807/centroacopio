from rest_framework import viewsets, status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import *
from .serializers import *

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class BaseViewSet(viewsets.ModelViewSet):
    """Base viewset to wrap list responses in 'data' key for legacy compatibility"""
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Verify if pagination is disabled or enabled
        if isinstance(response.data, list):
            return Response({"data": response.data})
        # If pagination is enabled (it returns a dict with 'results'), we might need to adjust or keep it.
        # Assuming we want to match exact legacy format which was just a list wrapped in data.
        # We will disable pagination in settings or here.
        return response

class FarmerViewSet(BaseViewSet):
    queryset = Farmer.objects.all()
    serializer_class = FarmerSerializer

    def get_queryset(self):
        # Filter farmers by current user
        return Farmer.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Assign current user as owner
        serializer.save(user=self.request.user)

class LandViewSet(BaseViewSet):
    queryset = Land.objects.all()
    serializer_class = LandSerializer

    def get_queryset(self):
        # Filter lands by farmers owned by current user
        return Land.objects.filter(farmer__user=self.request.user)

class WarehouseViewSet(BaseViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

    def get_queryset(self):
        return Warehouse.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProductViewSet(BaseViewSet):
    # Products might be global or user specific. Assuming global for now as catalog.
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class PriceViewSet(BaseViewSet):
    # Prices might be global.
    queryset = Price.objects.all()
    serializer_class = PriceSerializer
    
    def update_price(self, request):
        quality = request.data.get('quality')
        price_val = request.data.get('price')
        if quality and price_val:
            try:
                p = Price.objects.get(quality=quality)
                p.price = price_val
                p.save()
                return Response({"message": "success", "data": request.data})
            except Price.DoesNotExist:
                return Response({"error": "Price not found"}, status=404)
        return Response({"error": "Invalid data"}, status=400)

from datetime import datetime

class DeliveryViewSet(BaseViewSet):
    queryset = Delivery.objects.all()
    # serializer_class handled by get_serializer_class

    def dispatch(self, request, *args, **kwargs):
        print(f"DEBUG: DeliveryViewSet dispatch. Method: {request.method}, Path: {request.path}, Args: {args}, Kwargs: {kwargs}")
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        # Filter deliveries by user's farmers
        return Delivery.objects.filter(farmer__user=self.request.user).order_by('-date')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DeliveryCreateSerializer
        if self.action == 'update' or self.action == 'partial_update':
            return DeliveryUpdateSerializer
        return DeliveryReadSerializer

    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Auto-create payment if total_payment is set and no payment exists
        # Usually triggers when Quality Control sets the price
        if instance.total_payment and instance.total_payment > 0:
            payment, created = Payment.objects.get_or_create(
                delivery=instance,
                defaults={
                    'amount': instance.total_payment,
                    'date': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'method': 'Transferencia',
                    'status': 'Pendiente', 
                    'reference': f'PAY-AUTO-{instance.id}'
                }
            )
            # If payment existed but amount changed, we could update it here too if desired
            if not created and payment.amount != instance.total_payment:
                payment.amount = instance.total_payment
                payment.save()

class PaymentViewSet(BaseViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return Payment.objects.filter(delivery__farmer__user=self.request.user).order_by('-date')
