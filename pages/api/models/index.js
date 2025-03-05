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
        const models = await db
          .collection('models')
          .find({})
          .sort({ name: 1 })
          .toArray();
        
        // Map to add the MongoDB _id as id
        const mappedModels = models.map(model => ({
          id: model._id,
          name: model.name,
          description: model.description,
          createdAt: model.createdAt,
          isActive: model.isActive,
          imageCount: model.imageCount,
          averageScore: model.averageScore
        }));
        
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
          createdAt: new Date()
        });
        
        // Save to database
        const result = await db.collection('models').insertOne(newModel.toDatabase());
        
        // Send back the created model with id
        res.status(201).json({ 
          message: 'Model created successfully',
          model: {
            id: result.insertedId,
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