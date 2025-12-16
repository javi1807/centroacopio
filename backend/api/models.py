from django.db import models
from django.contrib.auth.models import User

class DocumentType(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    descripcion = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'tipos_documento'

class Department(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'departamentos'

class Province(models.Model):
    nombre = models.CharField(max_length=100)
    departamento = models.ForeignKey(Department, on_delete=models.CASCADE)

    class Meta:
        db_table = 'provincias'
        unique_together = ('nombre', 'departamento')

class District(models.Model):
    nombre = models.CharField(max_length=100)
    provincia = models.ForeignKey(Province, on_delete=models.CASCADE)

    class Meta:
        db_table = 'distritos'
        unique_together = ('nombre', 'provincia')

class IrrigationType(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'tipos_riego'

class Product(models.Model):
    name = models.CharField(max_length=100)
    variety = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=50, default='Activo')

    class Meta:
        db_table = 'productos'

class Farmer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True) # Datos existentes seran null o asignados despues
    name = models.CharField(max_length=255)
    document = models.CharField(max_length=50)
    tipo_documento = models.ForeignKey(DocumentType, on_delete=models.SET_NULL, null=True)
    phone = models.CharField(max_length=50, null=True, blank=True)
    distrito = models.ForeignKey(District, on_delete=models.SET_NULL, null=True)
    zone = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, default='Activo')
    deliveries_count = models.IntegerField(default=0, db_column='deliveries')

    class Meta:
        db_table = 'agricultores'

class Land(models.Model):
    name = models.CharField(max_length=255)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, db_column='farmerId')
    distrito = models.ForeignKey(District, on_delete=models.SET_NULL, null=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    area = models.FloatField(null=True)
    altitude = models.FloatField(null=True)
    tipo_riego = models.ForeignKey(IrrigationType, on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, db_column='productId')
    status = models.CharField(max_length=50, default='Activo')

    class Meta:
        db_table = 'terrenos'

class Warehouse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=100, null=True, blank=True)
    capacity = models.FloatField(null=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=50, default='Activo')

    class Meta:
        db_table = 'almacenes'


class Delivery(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    farmer = models.ForeignKey(Farmer, on_delete=models.CASCADE, db_column='farmerId')
    land = models.ForeignKey(Land, on_delete=models.SET_NULL, null=True, db_column='landId')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, db_column='productId')
    product_state = models.CharField(max_length=50, default='seco', choices=[('baba', 'baba'), ('seco', 'seco')])
    weight_fresh = models.FloatField(null=True, blank=True)
    weight = models.FloatField()
    conversion_factor = models.FloatField(default=0.38)
    price_per_kg = models.FloatField(null=True, blank=True)
    total_payment = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, default='Pendiente')
    date = models.CharField(max_length=50)
    notes = models.TextField(null=True, blank=True)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, db_column='warehouseId')
    location_detail = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'entregas'

class Price(models.Model):
    quality = models.CharField(max_length=100, unique=True)
    price = models.FloatField()

    class Meta:
        db_table = 'precios'

class Payment(models.Model):
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, db_column='deliveryId', null=True)
    amount = models.FloatField(null=True)
    date = models.CharField(max_length=50, null=True)
    method = models.CharField(max_length=50, null=True)
    reference = models.CharField(max_length=100, null=True)
    status = models.CharField(max_length=50, default='Completado')

    class Meta:
        db_table = 'pagos'
