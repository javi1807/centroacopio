from rest_framework import serializers
from .models import *
from .auth_serializers import RegisterSerializer
import random

class DocumentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentType
        fields = '__all__'

class IrrigationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrrigationType
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class PriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Price
        fields = '__all__'

class DateFieldAsChar(serializers.CharField):
    """Custom field to handle dates if they come as strings differently, simpler to use CharField as in legacy DB"""
    pass

class FarmerSerializer(serializers.ModelSerializer):
    document_type = serializers.CharField(write_only=True) # Code expected
    department = serializers.CharField(write_only=True, required=False, allow_blank=True)
    province = serializers.CharField(write_only=True, required=False, allow_blank=True)
    district = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Nested/Flattened representations for read compatibility
    # Note: 'distrito' is the FK, we can also expose 'distrito_nombre' etc if needed
    
    class Meta:
        model = Farmer
        fields = [
            'id', 'name', 'document', 'phone', 'zone', 'status', 'deliveries_count',
            'document_type', 'department', 'province', 'district', 'distrito', 'tipo_documento'
        ]
        read_only_fields = ['distrito', 'tipo_documento', 'deliveries_count']

    def create(self, validated_data):
        doc_type_code = validated_data.pop('document_type', None)
        dept_name = validated_data.pop('department', None)
        prov_name = validated_data.pop('province', None)
        dist_name = validated_data.pop('district', None)

        if doc_type_code:
            try:
                validated_data['tipo_documento'] = DocumentType.objects.get(codigo=doc_type_code)
            except DocumentType.DoesNotExist:
                pass # Or raise validation error, but legacy might just skip

        if dept_name and prov_name and dist_name:
             try:
                 validated_data['distrito'] = District.objects.get(
                     nombre=dist_name, 
                     provincia__nombre=prov_name,
                     provincia__departamento__nombre=dept_name
                 )
             except District.DoesNotExist:
                 pass
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        doc_type_code = validated_data.pop('document_type', None)
        dept_name = validated_data.pop('department', None)
        prov_name = validated_data.pop('province', None)
        dist_name = validated_data.pop('district', None)
        
        if doc_type_code:
            try:
                instance.tipo_documento = DocumentType.objects.get(codigo=doc_type_code)
            except DocumentType.DoesNotExist:
                pass
        
        if dept_name and prov_name and dist_name:
            try:
                instance.distrito = District.objects.get(
                     nombre=dist_name, 
                     provincia__nombre=prov_name,
                     provincia__departamento__nombre=dept_name
                 )
            except District.DoesNotExist:
                 pass
                 
        return super().update(instance, validated_data)
        
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add flattened location data if available (optional, but specific for frontend)
        if instance.distrito:
            data['district'] = instance.distrito.nombre
            data['province'] = instance.distrito.provincia.nombre
            data['department'] = instance.distrito.provincia.departamento.nombre
        if instance.tipo_documento:
            data['document_type'] = instance.tipo_documento.codigo
        return data

class LandSerializer(serializers.ModelSerializer):
    department = serializers.CharField(write_only=True, required=False, allow_blank=True)
    province = serializers.CharField(write_only=True, required=False, allow_blank=True)
    district = serializers.CharField(write_only=True, required=False, allow_blank=True)
    irrigation_type = serializers.CharField(write_only=True, required=False, allow_blank=True) # Name expected
    cacao_variety = serializers.CharField(write_only=True, required=False, allow_blank=True) 
    
    # Frontend sends farmerId
    farmerId = serializers.PrimaryKeyRelatedField(
        queryset=Farmer.objects.all(), source='farmer', write_only=True
    )

    class Meta:
        model = Land
        fields = '__all__'
        read_only_fields = ['distrito', 'tipo_riego', 'product', 'farmer'] # farmer is read only, set via farmerId

    def create(self, validated_data):
        dept_name = validated_data.pop('department', None)
        prov_name = validated_data.pop('province', None)
        dist_name = validated_data.pop('district', None)
        irr_name = validated_data.pop('irrigation_type', None)
        validated_data.pop('cacao_variety', None) 
        
        # farmerId alias handled by source='farmer' automatically in ModelSerializer? 
        # Yes, if it maps to a field, validates it and puts it in validated_data as 'farmer'.
        
        if dept_name and prov_name and dist_name:
             try:
                 validated_data['distrito'] = District.objects.get(
                     nombre=dist_name, 
                     provincia__nombre=prov_name,
                     provincia__departamento__nombre=dept_name
                 )
             except District.DoesNotExist:
                 pass
        
        if irr_name:
            try:
                validated_data['tipo_riego'] = IrrigationType.objects.get(nombre=irr_name)
            except IrrigationType.DoesNotExist:
                pass

        return super().create(validated_data)

    def update(self, instance, validated_data):
        dept_name = validated_data.pop('department', None)
        prov_name = validated_data.pop('province', None)
        dist_name = validated_data.pop('district', None)
        irr_name = validated_data.pop('irrigation_type', None)
        validated_data.pop('cacao_variety', None)

        if dept_name and prov_name and dist_name:
            try:
                instance.distrito = District.objects.get(
                     nombre=dist_name, 
                     provincia__nombre=prov_name,
                     provincia__departamento__nombre=dept_name
                 )
            except District.DoesNotExist:
                 pass
        
        if irr_name:
            try:
                instance.tipo_riego = IrrigationType.objects.get(nombre=irr_name)
            except IrrigationType.DoesNotExist:
                pass
        
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Flattened fields
        if instance.product:
            data['cropName'] = instance.product.name
            data['cropVariety'] = instance.product.variety
        if instance.distrito:
            data['district'] = instance.distrito.nombre
            data['province'] = instance.distrito.provincia.nombre
            data['department'] = instance.distrito.provincia.departamento.nombre
        if instance.tipo_riego:
            data['irrigation_type'] = instance.tipo_riego.nombre
        
        # Frontend Compatibility
        if instance.farmer:
            data['farmerId'] = instance.farmer.id
            data['farmer'] = instance.farmer.name # Override ID with Name for display
            
        return data

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'


class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = '__all__'
        read_only_fields = ['id', 'weight', 'conversion_factor', 'weight_fresh']

class DeliveryCreateSerializer(serializers.ModelSerializer):
    # Inputs from frontend
    weight = serializers.FloatField() 
    farmerId = serializers.PrimaryKeyRelatedField(
        queryset=Farmer.objects.all(), source='farmer', write_only=True
    )
    landId = serializers.PrimaryKeyRelatedField(
        queryset=Land.objects.all(), source='land', write_only=True
    )
    warehouseId = serializers.PrimaryKeyRelatedField(
        queryset=Warehouse.objects.all(), source='warehouse', write_only=True, required=False, allow_null=True
    )
    # productId? usually product is derived or simple.
    # Frontend might send 'product' string or ID? 
    # Let's assume frontend sends productId or we default it?
    # In populate_db we saw Product model.
    # Delivery model has 'product' FK.
    # Frontend logic? probably sends ID.
    productId = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True, required=False
    )
    
    class Meta:
        model = Delivery
        fields = [
            'id', 'farmerId', 'landId', 'warehouseId', 'productId', 'product_state', 'weight', 
            'price_per_kg', 'total_payment', 'date', 'notes'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        weight_input = validated_data.pop('weight')
        product_state = validated_data.get('product_state', 'seco')
        
        # If product is not provided, default to first product? 
        # Models says product can be null? 
        if 'product' not in validated_data:
             # Try to find a default product
             p = Product.objects.first()
             if p: validated_data['product'] = p

        # If warehouse is not provided?
        if 'warehouse' not in validated_data:
             w = Warehouse.objects.first() # Or handle as per logic (maybe user's warehouse?)
             if w: validated_data['warehouse'] = w

        weight_dry = weight_input
        weight_fresh = None
        conversion_factor = None
        
        if product_state == 'baba':
            weight_fresh = weight_input
            conversion_factor = 0.38
            weight_dry = weight_fresh * conversion_factor
            
        # Use DEL- prefix instead of # to avoid URL encoding/routing issues with hashtags
        validated_data['id'] = f"DEL-{random.randint(1000, 9999)}"
        validated_data['weight'] = weight_dry
        validated_data['weight_fresh'] = weight_fresh
        validated_data['conversion_factor'] = conversion_factor or 0.38
        
        # Update farmer delivery count
        farmer = validated_data['farmer']
        farmer.deliveries_count += 1
        farmer.save()
        
        return super().create(validated_data)

class DeliveryUpdateSerializer(serializers.ModelSerializer):
    # For quality control updates (status, price, notes, etc.)
    # We don't require the creation fields like farmerId, landId, weight
    
    farmerId = serializers.PrimaryKeyRelatedField(source='farmer', queryset=Farmer.objects.all(), required=False)
    landId = serializers.PrimaryKeyRelatedField(source='land', queryset=Land.objects.all(), required=False)
    warehouseId = serializers.PrimaryKeyRelatedField(source='warehouse', queryset=Warehouse.objects.all(), required=False)

    class Meta:
        model = Delivery
        fields = [
            'price_per_kg', 'total_payment', 'status', 'notes', 'location_detail', 
            'warehouseId', 'farmerId', 'landId', 'weight', 'date', 'product_state'
        ]
        
    def update(self, instance, validated_data):
        print("DEBUG: DeliveryUpdateSerializer.update called")
        try:
            # Handle weight/state calculation if changed
            # Check if we have the necessary data to recalculate
            has_weight = 'weight' in validated_data
            has_state = 'product_state' in validated_data
            
            if has_weight or has_state:
                # Get new values or fallback to instance values
                new_weight = validated_data.get('weight', instance.weight)
                # If product_state is changed, use it. If not, use instance state.
                new_state = validated_data.get('product_state', instance.product_state)
                
                # Careful: instance.weight is the DRY weight normally.
                # If user is editing, they provide the INPUT weight in 'weight' field.
                # We need to determine if input weight is fresh or dry based on state.
                
                # Logic:
                # 1. If state is BABA -> input is fresh weight.
                # 2. If state is SECO -> input is dry weight.
                
                if new_state == 'baba':
                    # Input is fresh
                    weight_fresh = float(new_weight)
                    weight_dry = weight_fresh * 0.38
                    
                    instance.weight_fresh = weight_fresh
                    instance.conversion_factor = 0.38
                    instance.weight = weight_dry
                    instance.product_state = 'baba'
                else:
                    # Input is dry
                    weight_dry = float(new_weight)
                    
                    instance.weight = weight_dry
                    instance.weight_fresh = None
                    instance.conversion_factor = 0.38 # Default or reset
                    instance.product_state = 'seco'
                
                # Remove from validated_data to prevent double assignment or conflicts
                if 'weight' in validated_data:
                    del validated_data['weight']
                if 'product_state' in validated_data:
                    del validated_data['product_state']

            return super().update(instance, validated_data)
        except Exception as e:
            print(f"CRITICAL ERROR in DeliveryUpdateSerializer: {str(e)}")
            raise e
        
    def to_representation(self, instance):
        # We might want to return the full representation after update
        return DeliveryReadSerializer(instance).data

class DeliveryReadSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='warehouse.name', read_only=True) # specific for frontend table?
    farmer = serializers.CharField(source='farmer.name', read_only=True)
    landName = serializers.CharField(source='land.name', read_only=True)
    product = serializers.SerializerMethodField()
    warehouseName = serializers.CharField(source='warehouse.name', read_only=True)
    
    class Meta:
        model = Delivery
        fields = '__all__'
        
    def get_product(self, obj):
        if obj.product:
            return f"{obj.product.name} {obj.product.variety or ''}".strip()
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Compatibility fields for frontend
        data['warehouseId'] = instance.warehouse_id
        data['farmerId'] = instance.farmer_id
        data['landId'] = instance.land_id
        if instance.product:
            data['productId'] = instance.product.id
        return data

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.delivery and instance.delivery.farmer:
             data['farmerName'] = instance.delivery.farmer.name
             data['farmerId'] = instance.delivery.farmer.id
        return data
