// Demo data for premium website showcase
export const demoCategories = [
  {
    _id: '1',
    name: 'Fruits',
    slug: 'fruits',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800&auto=format&fit=crop',
    description: 'Exotic fruit plants for your garden',
    plantCount: 8
  },
  {
    _id: '2',
    name: 'Flowers',
    slug: 'flowers',
    image: 'https://images.unsplash.com/photo-1582794543462-0d7922e50cf5?w=800&auto=format&fit=crop',
    description: 'Beautiful flowering plants',
    plantCount: 12
  },
  {
    _id: '3',
    name: 'Indoor Plants',
    slug: 'indoor-plants',
    image: 'https://images.unsplash.com/photo-1592150621744-9e5c2b5ea4e9?w=800&auto=format&fit=crop',
    description: 'Perfect for home and office',
    plantCount: 15
  },
  {
    _id: '4',
    name: 'Outdoor Plants',
    slug: 'outdoor-plants',
    image: 'https://images.unsplash.com/photo-1592150621744-9e5c2b5ea4e9?w=800&auto=format&fit=crop',
    description: 'Plants that thrive in gardens',
    plantCount: 10
  }
];

export const demoPlants = [
  // Fruits
  {
    _id: 'p1',
    name: 'Mango Plant (Alphonso)',
    slug: 'mango-plant-alphonso',
    price: 1299,
    description: 'Premium Alphonso mango plant known for its sweet and rich flavor. Grows well in warm climates and produces fruits within 3-4 years.',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&auto=format&fit=crop',
    category: '1',
    categoryName: 'Fruits',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    isFeatured: true,
    careInstructions: {
      sunlight: 'Full sun (6-8 hours)',
      watering: 'Moderate, twice a week',
      soil: 'Well-drained, sandy loam',
      temperature: '25-35°C'
    }
  },
  {
    _id: 'p2',
    name: 'Guava Plant (Lucknow-49)',
    slug: 'guava-plant-lucknow-49',
    price: 899,
    description: 'High-yielding guava variety with large, sweet fruits. Disease-resistant and easy to maintain.',
    image: 'https://images.unsplash.com/photo-1551054212-3248313a6b9a?w=800&auto=format&fit=crop',
    category: '1',
    categoryName: 'Fruits',
    rating: 4.6,
    reviews: 89,
    inStock: true,
    isFeatured: false
  },
  {
    _id: 'p3',
    name: 'Dwarf Banana Plant',
    slug: 'dwarf-banana-plant',
    price: 699,
    description: 'Compact banana plant perfect for home gardens. Produces sweet, delicious bananas.',
    image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&auto=format&fit=crop',
    category: '1',
    categoryName: 'Fruits',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    isFeatured: true
  },
  {
    _id: 'p4',
    name: 'Papaya Plant (Red Lady)',
    slug: 'papaya-plant-red-lady',
    price: 549,
    description: 'Fast-growing papaya variety with sweet, red flesh. Fruits within 8-10 months.',
    image: 'https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&auto=format&fit=crop',
    category: '1',
    categoryName: 'Fruits',
    rating: 4.5,
    reviews: 67,
    inStock: true,
    isFeatured: false
  },

  // Flowers
  {
    _id: 'p5',
    name: 'English Rose (Double Delight)',
    slug: 'english-rose-double-delight',
    price: 799,
    description: 'Exquisite English rose with creamy white petals edged in red. Highly fragrant and perfect for gardens.',
    image: 'https://images.unsplash.com/photo-1548094891-4d4f3ec8f5b8?w=800&auto=format&fit=crop',
    category: '2',
    categoryName: 'Flowers',
    rating: 4.9,
    reviews: 203,
    inStock: true,
    isFeatured: true
  },
  {
    _id: 'p6',
    name: 'Sunflower (Russian Giant)',
    slug: 'sunflower-russian-giant',
    price: 349,
    description: 'Majestic sunflower variety growing up to 12 feet tall with massive 12-inch flower heads.',
    image: 'https://images.unsplash.com/photo-1505233769188-2f2b9e1e1e1e?w=800&auto=format&fit=crop',
    category: '2',
    categoryName: 'Flowers',
    rating: 4.7,
    reviews: 145,
    inStock: true,
    isFeatured: false
  },
  {
    _id: 'p7',
    name: 'Jasmine (Mogra)',
    slug: 'jasmine-mogra',
    price: 449,
    description: 'Fragrant jasmine plant with small, white flowers. Perfect for trellises and borders.',
    image: 'https://images.unsplash.com/photo-1594729095022-e2f6e2eece9f?w=800&auto=format&fit=crop',
    category: '2',
    categoryName: 'Flowers',
    rating: 4.8,
    reviews: 178,
    inStock: true,
    isFeatured: true
  },
  {
    _id: 'p8',
    name: 'Marigold (African)',
    slug: 'marigold-african',
    price: 299,
    description: 'Vibrant orange marigold with large, pom-pom like flowers. Excellent for festivals and decorations.',
    image: 'https://images.unsplash.com/photo-1562698321-9d6e4e5a1b1a?w=800&auto=format&fit=crop',
    category: '2',
    categoryName: 'Flowers',
    rating: 4.6,
    reviews: 98,
    inStock: true,
    isFeatured: false
  },

  // Indoor Plants
  {
    _id: 'p9',
    name: 'Snake Plant (Sansevieria)',
    slug: 'snake-plant-sansevieria',
    price: 899,
    description: 'Air-purifying snake plant with striking vertical leaves. Almost indestructible and perfect for beginners.',
    image: 'https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?w=800&auto=format&fit=crop',
    category: '3',
    categoryName: 'Indoor Plants',
    rating: 5.0,
    reviews: 312,
    inStock: true,
    isFeatured: true,
    careInstructions: {
      sunlight: 'Low to bright indirect light',
      watering: 'Every 2-3 weeks',
      soil: 'Well-draining cactus mix',
      temperature: '18-27°C'
    }
  },
  {
    _id: 'p10',
    name: 'Peace Lily (Spathiphyllum)',
    slug: 'peace-lily-spathiphyllum',
    price: 749,
    description: 'Elegant peace lily with glossy leaves and white flowers. Excellent air purifier and low maintenance.',
    image: 'https://images.unsplash.com/photo-1593691509543-c55c32e7e8f8?w=800&auto=format&fit=crop',
    category: '3',
    categoryName: 'Indoor Plants',
    rating: 4.8,
    reviews: 167,
    inStock: true,
    isFeatured: true
  },
  {
    _id: 'p11',
    name: 'Monstera Deliciosa',
    slug: 'monstera-deliciosa',
    price: 1299,
    description: 'Trendy Swiss cheese plant with iconic split leaves. Makes a bold statement in any room.',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&auto=format&fit=crop',
    category: '3',
    categoryName: 'Indoor Plants',
    rating: 4.9,
    reviews: 245,
    inStock: true,
    isFeatured: true
  },
  {
    _id: 'p12',
    name: 'Fiddle Leaf Fig',
    slug: 'fiddle-leaf-fig',
    price: 1599,
    description: 'Popular fiddle leaf fig with large, violin-shaped leaves. A favorite among interior designers.',
    image: 'https://images.unsplash.com/photo-1597852631997-5e4a9a5b5b5b?w=800&auto=format&fit=crop',
    category: '3',
    categoryName: 'Indoor Plants',
    rating: 4.7,
    reviews: 134,
    inStock: true,
    isFeatured: false
  },

  // Outdoor Plants
  {
    _id: 'p13',
    name: 'Bamboo Palm (Chamaedorea)',
    slug: 'bamboo-palm-chamaedorea',
    price: 1899,
    description: 'Graceful bamboo palm that adds tropical elegance to any outdoor space. Excellent air purifier.',
    image: 'https://images.unsplash.com/photo-1597058712635-3c4b5a4b4b4b?w=800&auto=format&fit=crop',
    category: '4',
    categoryName: 'Outdoor Plants',
    rating: 4.8,
    reviews: 89,
    inStock: true,
    isFeatured: true
  },
  {
    _id: 'p14',
    name: 'Hibiscus (Luna Red)',
    slug: 'hibiscus-luna-red',
    price: 599,
    description: 'Stunning red hibiscus with large, dinner-plate sized flowers. Blooms continuously throughout summer.',
    image: 'https://images.unsplash.com/photo-1597852631997-5e4a9a5b5b5b?w=800&auto=format&fit=crop',
    category: '4',
    categoryName: 'Outdoor Plants',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    isFeatured: false
  },
  {
    _id: 'p15',
    name: 'Lavender (English)',
    slug: 'lavender-english',
    price: 449,
    description: 'Fragrant English lavender with beautiful purple spikes. Perfect for borders and attracting pollinators.',
    image: 'https://images.unsplash.com/photo-1597058712635-3c4b5a4b4b4b?w=800&auto=format&fit=crop',
    category: '4',
    categoryName: 'Outdoor Plants',
    rating: 4.9,
    reviews: 203,
    inStock: true,
    isFeatured: true
  },
  {
    _id: 'p16',
    name: 'Hydrangea (Endless Summer)',
    slug: 'hydrangea-endless-summer',
    price: 899,
    description: 'Reblooming hydrangea with large, mophead flowers that bloom all season long. Color changes with soil pH.',
    image: 'https://images.unsplash.com/photo-1597058712635-3c4b5a4b4b4b?w=800&auto=format&fit=crop',
    category: '4',
    categoryName: 'Outdoor Plants',
    rating: 4.8,
    reviews: 178,
    inStock: true,
    isFeatured: true
  }
];

export const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'California, USA',
    comment: 'The plants arrived in perfect condition. The mango plant is already growing new leaves! Excellent quality.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'Singapore',
    comment: 'Best online nursery I\'ve ever ordered from. The peace lily transformed my living room.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 3,
    name: 'Priya Patel',
    location: 'Mumbai, India',
    comment: 'Amazing collection of flowering plants. The roses are absolutely stunning!',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/68.jpg'
  }
];