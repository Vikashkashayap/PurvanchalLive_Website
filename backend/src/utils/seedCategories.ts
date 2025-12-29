import Category from '../models/Category';

const defaultCategories = [
  { name: 'ग्राम समाचार', description: 'गांव और ग्रामीण क्षेत्रों से जुड़ी खबरें' },
  { name: 'राजनीति', description: 'राजनीतिक घटनाओं और समाचार' },
  { name: 'शिक्षा', description: 'शिक्षा से जुड़ी खबरें और घटनाएं' },
  { name: 'मौसम', description: 'मौसम और जलवायु से जुड़ी जानकारी' },
  { name: 'स्वास्थ्य', description: 'स्वास्थ्य और चिकित्सा से जुड़ी खबरें' },
  { name: 'कृषि', description: 'कृषि और किसानों से जुड़ी जानकारी' },
  { name: 'मनोरंजन', description: 'मनोरंजन और सांस्कृतिक समाचार' },
  { name: 'अन्य', description: 'अन्य महत्वपूर्ण समाचार' }
];

export const seedCategories = async (): Promise<void> => {
  try {
    console.log('🌱 Seeding categories...');

    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });

      if (!existingCategory) {
        await Category.create(categoryData);
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${categoryData.name}`);
      }
    }

    console.log('🎉 Categories seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};
