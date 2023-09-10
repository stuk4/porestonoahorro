interface SeedProduct {
    title: string;
    description: string;
    price: number;
    images: string[];
    // slug: string;
    // status: 'draft' | 'published' | 'archived';
    // created_at: Date;
    // updated_at: Date;
}

interface SeedData {
    products: SeedProduct[];
}

export const initialData: SeedData = {
    products: [
        {
            title: 'Patito Feoooooo',
            description:
                'Descripcion del producto ajjdkasjd esto es una descripción',
            price: 100.2,
            images: ['1740176-00-A_0_2000.jpg', '1740176-00-A_1.jpg'],
        },
        {
            title: 'Zapatillas Runner',
            description:
                'Zapatillas ideales para corredores con soporte y amortiguación.',
            price: 120.5,
            images: ['zapatilla1.jpg', 'zapatilla2.jpg'],
        },
        {
            title: 'Bolso de Viaje',
            description:
                'Bolso amplio para viajes largos con múltiples compartimentos.',
            price: 85.3,
            images: ['bolso1.jpg', 'bolso2.jpg'],
        },
        {
            title: 'Gafas de Sol Estilo',
            description: 'Gafas de sol con protección UV y diseño moderno.',
            price: 65.0,
            images: ['gafas1.jpg', 'gafas2.jpg'],
        },
        // ... Agregar más productos aquí siguiendo el mismo formato ...

        {
            title: 'Reloj Elegante',
            description:
                'Reloj de pulsera con diseño clásico y maquinaria de precisión.',
            price: 250.9,
            images: ['reloj1.jpg', 'reloj2.jpg'],
        },
        {
            title: 'Camisa Casual',
            description:
                'Camisa para uso diario, fabricada con materiales de alta calidad.',
            price: 49.9,
            images: ['camisa1.jpg', 'camisa2.jpg'],
        },
        {
            title: 'Pantalón Jeans',
            description: 'Jeans cómodos y resistentes para cualquier ocasión.',
            price: 70.0,
            images: ['jeans1.jpg', 'jeans2.jpg'],
        },
        {
            title: 'Bicicleta de Montaña',
            description:
                'Bicicleta resistente para terrenos difíciles y montañosos.',
            price: 320.5,
            images: ['bicicleta1.jpg', 'bicicleta2.jpg'],
        },
        {
            title: 'Smartphone Pro',
            description:
                'Teléfono inteligente con las últimas características del mercado.',
            price: 699.9,
            images: ['smartphone1.jpg', 'smartphone2.jpg'],
        },
        {
            title: 'Teclado Mecánico',
            description:
                'Teclado con switches mecánicos para una mejor experiencia de escritura.',
            price: 130.0,
            images: ['teclado1.jpg', 'teclado2.jpg'],
        },
        {
            title: 'Auriculares Inalámbricos',
            description:
                'Auriculares con conexión Bluetooth y cancelación de ruido.',
            price: 110.0,
            images: ['auriculares1.jpg', 'auriculares2.jpg'],
        },
        {
            title: 'Cámara Fotográfica Pro',
            description:
                'Cámara DSLR con lentes intercambiables y alta resolución.',
            price: 899.5,
            images: ['camara1.jpg', 'camara2.jpg'],
        },
        {
            title: 'Libro de Cocina',
            description:
                'Recetas deliciosas y fáciles de preparar para sorprender a tus invitados.',
            price: 25.0,
            images: ['libro1.jpg', 'libro2.jpg'],
        },
        {
            title: 'Silla de Oficina',
            description:
                'Silla ergonómica con soporte lumbar para largas horas de trabajo.',
            price: 220.5,
            images: ['silla1.jpg', 'silla2.jpg'],
        },
        {
            title: 'Tablet 10 Pulgadas',
            description:
                'Tablet con pantalla de alta resolución y batería de larga duración.',
            price: 299.9,
            images: ['tablet1.jpg', 'tablet2.jpg'],
        },
        {
            title: 'Mochila Escolar',
            description:
                'Mochila con múltiples compartimentos y resistente al agua.',
            price: 45.0,
            images: ['mochila1.jpg', 'mochila2.jpg'],
        },
        {
            title: 'Reloj Deportivo',
            description:
                'Reloj con GPS y monitor de ritmo cardíaco para deportistas.',
            price: 299.9,
            images: ['relojdeportivo1.jpg', 'relojdeportivo2.jpg'],
        },
        {
            title: 'Bolígrafos Premium',
            description:
                'Set de bolígrafos de alta calidad con tinta duradera.',
            price: 15.0,
            images: ['boligrafo1.jpg', 'boligrafo2.jpg'],
        },
        {
            title: 'Sombrero de Verano',
            description:
                'Sombrero con diseño fresco y material ligero para días soleados.',
            price: 30.0,
            images: ['sombrero1.jpg', 'sombrero2.jpg'],
        },
        {
            title: 'Zapatos de Vestir',
            description:
                'Zapatos elegantes con diseño clásico para eventos formales.',
            price: 150.5,
            images: ['zapato1.jpg', 'zapato2.jpg'],
        },
    ],
};
