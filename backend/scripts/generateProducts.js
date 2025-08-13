const generateRandomProducts = (numProducts) => {
  const categories = ["Electronics", "Fashion", "Home & Garden", "Books", "Sports", "Health & Beauty", "Automotive", "Toys & Games"];
  const products = [];

  for (let i = 0; i < numProducts; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const name = `Product ${i + 1} - ${category} Item`;
    const description = `A high-quality ${category.toLowerCase()} item.`;
    const detailedDescription = `This is a detailed description for Product ${i + 1}. It offers excellent features and durability. Perfect for all your needs.`;
    const price = parseFloat((Math.random() * 500 + 10).toFixed(2));
    const originalPrice = parseFloat((price * (1 + Math.random() * 0.5)).toFixed(2));
    const discount = Math.floor(Math.random() * 30);
    const imageId = Math.floor(Math.random() * 1000) + 1; // For unique image from picsum
    const imageUrl = `https://picsum.photos/seed/${imageId}/600/400`;
    const rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); // Between 3.0 and 5.0
    const reviews = Math.floor(Math.random() * 200) + 10;
    const inStock = Math.random() > 0.1; // 90% chance of being in stock
    const featured = Math.random() > 0.7; // 30% chance of being featured

    const specifications = {
      "Material": "Various",
      "Color": ["Red", "Blue", "Green", "Black", "White"][Math.floor(Math.random() * 5)],
      "Weight": `${(Math.random() * 2 + 0.5).toFixed(1)} kg`,
      "Dimensions": `${Math.floor(Math.random() * 30 + 10)}x${Math.floor(Math.random() * 20 + 5)}x${Math.floor(Math.random() * 15 + 3)} cm`
    };

    products.push({
      name,
      description,
      detailedDescription,
      price,
      originalPrice,
      discount,
      image: imageUrl,
      images: [imageUrl, `https://picsum.photos/seed/${imageId + 1}/600/400`, `https://picsum.photos/seed/${imageId + 2}/600/400`],
      category,
      rating,
      reviews,
      inStock,
      featured,
      specifications
    });
  }
  return products;
};

const newProducts = generateRandomProducts(30); // Generate 30 new products
console.log(JSON.stringify(newProducts, null, 2));