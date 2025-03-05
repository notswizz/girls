import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../config';
import Model from '../../../models/Model';

export default async function handler(req, res) {
  const { method } = req;
  const { db } = await connectToDatabase();

  switch (method) {
    // Get all models
    case 'GET':
      try {
        // Get all models
        const models = await db
          .collection('models')
          .find({})
          .sort({ name: 1 })
          .toArray();
        
        // Get image counts for each model
        const imageCounts = await db
          .collection('images')
          .aggregate([
            { $match: { isActive: true } },
            { $group: { 
              _id: "$modelId", 
              count: { $sum: 1 },
              averageScore: { $avg: "$averageScore" }
            }}
          ])
          .toArray();
        
        // Create a map of model ID to image count
        const imageCountMap = {};
        const scoreMap = {};
        
        imageCounts.forEach(item => {
          if (item._id) {
            imageCountMap[item._id.toString()] = item.count;
            if (item.averageScore) {
              scoreMap[item._id.toString()] = item.averageScore;
            }
          }
        });
        
        // Map to add the MongoDB _id as id and include image counts
        const mappedModels = models.map(model => {
          const modelId = model._id.toString();
          return {
            _id: model._id,
            name: model.name,
            description: model.description || '',
            createdAt: model.createdAt,
            isActive: model.isActive !== false,
            imageCount: imageCountMap[modelId] || 0,
            averageScore: scoreMap[modelId] || model.averageScore || null
          };
        });
        
        res.status(200).json({ models: mappedModels });
      } catch (error) {
        console.error('Error fetching models:', error);
        res.status(500).json({ error: 'Failed to fetch models' });
      }
      break;
      
    // Create a new model
    case 'POST':
      try {
        const { name, description } = req.body;
        
        // Validate input
        if (!name) {
          return res.status(400).json({ error: 'Model name is required' });
        }
        
        // Check if model with this name already exists
        const existingModel = await db.collection('models').findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });
        
        if (existingModel) {
          return res.status(400).json({ error: 'A model with this name already exists' });
        }
        
        // Create new model
        const newModel = new Model({
          name,
          description: description || '',
          createdAt: new Date(),
          imageCount: 0,
          averageScore: null
        });
        
        // Save to database
        const result = await db.collection('models').insertOne(newModel.toDatabase());
        
        // Send back the created model with id
        res.status(201).json({ 
          message: 'Model created successfully',
          model: {
            _id: result.insertedId,
            ...newModel.toDatabase()
          }
        });
      } catch (error) {
        console.error('Error creating model:', error);
        res.status(500).json({ error: 'Failed to create model' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
} 