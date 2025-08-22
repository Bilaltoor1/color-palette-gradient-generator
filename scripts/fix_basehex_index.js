// Quick fix for baseHex index issue
// Run this script to inspect and optionally fix the baseHex index
const mongoose = require('mongoose');

async function main() {
  // You need to set your MongoDB URI here or as an environment variable
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';
  
  if (!process.env.MONGODB_URI) {
    console.log('Please set MONGODB_URI environment variable or edit this script with your MongoDB URI');
    console.log('Example: $env:MONGODB_URI="your-mongo-uri"; node scripts/fix_basehex_index.js');
    return;
  }

  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collection = db.collection('shades');
    
    console.log('Checking indexes on shades collection...');
    const indexes = await collection.indexes();
    
    const baseHexIndex = indexes.find(idx => idx.name === 'baseHex_1');
    if (baseHexIndex) {
      console.log('Found baseHex_1 index:', baseHexIndex);
      
      // Drop the problematic index
      console.log('Dropping baseHex_1 index...');
      await collection.dropIndex('baseHex_1');
      console.log('Successfully dropped baseHex_1 index!');
      console.log('You should now be able to create collections without the duplicate key error.');
    } else {
      console.log('No baseHex_1 index found. The error might be resolved.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
