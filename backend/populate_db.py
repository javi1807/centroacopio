import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'agrosync_backend.settings')
django.setup()

from django.contrib.auth.models import User
from api.models import *

def populate():
    print("Creando datos de prueba...")

    # 1. Obtener usuario admin
    if not User.objects.filter(username='admin').exists():
        admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin')
        print("Superusuario 'admin' creado (password: admin)")
    else:
        admin_user = User.objects.get(username='admin')
        print("Usuario 'admin' recuperado")

    # 2. Tipos de Documento
    docs = [
        ('DNI', 'Documento Nacional de Identidad'),
        ('RUC', 'Registro Único de Contribuyentes'),
        ('CE', 'Carnet de Extranjería')
    ]
    for code, desc in docs:
        DocumentType.objects.get_or_create(codigo=code, defaults={'descripcion': desc})
    print("Tipos de documento creados")

    # 3. Ubicaciones
    dept, _ = Department.objects.get_or_create(nombre='San Martín')
    prov, _ = Province.objects.get_or_create(nombre='Tocache', departamento=dept)
    districts = ['Pólvora', 'Tocache', 'Uchiza', 'Nuevo Progreso', 'Shunte']
    for d in districts:
        District.objects.get_or_create(nombre=d, provincia=prov)
    print("Ubicaciones creadas")

    # 4. Tipos de Riego
    riegos = ['Gravedad', 'Goteo', 'Aspersión', 'Secanero']
    for r in riegos:
        IrrigationType.objects.get_or_create(nombre=r)
    print("Tipos de riego creados")

    # 5. Productos y Precios
    prod, _ = Product.objects.get_or_create(name='Cacao', defaults={'variety': 'CCN-51'})
    
    Price.objects.get_or_create(quality='A', defaults={'price': 15.50})
    Price.objects.get_or_create(quality='B', defaults={'price': 14.20})
    Price.objects.get_or_create(quality='C', defaults={'price': 12.00})
    print("Productos y precios creados")

    # 6. Almacenes
    warehouses = ['Almacén Principal', 'Almacén Norte', 'Centro de Acopio B']
    for w in warehouses:
        if not Warehouse.objects.filter(name=w, user=admin_user).exists():
            Warehouse.objects.create(name=w, location='Tocache', capacity=10000, user=admin_user)
    print("Almacenes creados")

    # 7. Agricultores
    nombres = ['Juan Pérez', 'Maria Garcia', 'Carlos Lopez', 'Ana Martinez', 'Luis Rodriguez']
    documentos = ['45678901', '10456789012', '78901234', '12345678', '98765432']
    
    dist_polvora = District.objects.get(nombre='Pólvora')
    doc_dni = DocumentType.objects.get(codigo='DNI')
    
    farmers = []
    for i, name in enumerate(nombres):
        f = Farmer.objects.filter(document=documentos[i], user=admin_user).first()
        if not f:
            f = Farmer.objects.create(
                user=admin_user,
                document=documentos[i],
                name=name,
                tipo_documento=doc_dni,
                phone=f'99988877{i}',
                distrito=dist_polvora,
                status='Activo'
            )
        farmers.append(f)
    print(f"Agricultores asegurados: {len(farmers)}")

    # 8. Terrenos
    irrigation = IrrigationType.objects.first()
    for f in farmers:
        if not Land.objects.filter(farmer=f).exists():
            Land.objects.create(
                farmer=f,
                name=f'Parcela de {f.name.split()[0]}',
                distrito=dist_polvora,
                area=random.uniform(2.0, 10.0),
                location='Sector El Valle',
                altitude=800,
                tipo_riego=irrigation,
                product=prod
            )
    print("Terrenos verificados")

    # 9. Entregas (Recientes)
    warehouse = Warehouse.objects.filter(user=admin_user).first()
    land = Land.objects.filter(farmer__user=admin_user).first()
    
    # Create new deliveries specifically
    print("Creando nuevas entregas de prueba...")
    for _ in range(5):
        day_offset = random.randint(0, 10)
        date_str = (datetime.now() - timedelta(days=day_offset)).strftime('%Y-%m-%d')
        Delivery.objects.create(
            id=f"#{random.randint(10000, 99999)}",
            farmer=farmers[0], # Juan Perez
            land=land,
            product=prod,
            weight=random.uniform(50, 200),
            price_per_kg=15.50,
            date=date_str,
            warehouse=warehouse,
            status='Completado'
        )
    print("Nuevas entregas creadas")

if __name__ == '__main__':
    populate()
