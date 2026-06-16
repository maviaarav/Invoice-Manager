const ClientModel = require('../models/client');

const createClient = async (req,res)=>{
    try{
        const { clientName, phoneNumber, gstNumber, address ,email} = req.body;
        if(!req.body || !clientName || !phoneNumber || !address || !email || !gstNumber){
            return res.status(400).json({message: 'All fields are required'})
        }
        const userId =  req.user._id
        const existingClient = await ClientModel.findOne({ userId, email, phoneNumber });
        if(existingClient){
            return res.status(409).json({message: 'Client already exists'})
        }
        const userID = await req.user._id
        await ClientModel.create({
            userId : userID,
            clientName,
            phoneNumber,
            gstNumber,
            address,
            email
        })
        res.status(201).json({success: true, message: 'Client created successfully'}) 
    }catch(error){
        res.status(500).json({message: 'Error creating client', error: error.message})
    }
}
const getClient = async (req,res)=>{
    try{
 const Client = await ClientModel.findOne({userId: req.user._id, email: req.params.email})
    if(!Client){
        return res.status(404).json({message: 'Client not found'})
    }
    if(Client.length === 0){
        res.status(404).json({message: "Create a Client to proceed."})
    }
    return res.status(200).json({success: true, Client, clientLength: Client.length})
    }
    catch(error){
        res.status(500).json({message: 'Error fetching client', error: error.message})
    }
   
}

const updateClient = async (req,res)=>{
    try{
        const { clientName, phoneNumber, gstNumber, address ,email} = req.body;
        if(!req.body){
            return res.status(400).json({message: 'All fields are required'})
        }
        const client = await ClientModel.findOne({userId: req.user._id, _id: req.params.id})
        if(!client){
            return res.status(404).json({message: 'Client not found'})
        }
        client.clientName = clientName
        client.phoneNumber = phoneNumber
        client.gstNumber = gstNumber
        client.address = address
        client.email = email
        await client.save()
        res.status(200).json({success: true, message: 'Client updated successfully'})

    }catch(error){
        res.status(500).json({message: 'Error updating client', error: error.message})
    }
}

const deleteClient = async (req,res)=>{
    try{
        const client = await ClientModel.findOne({userId: req.user._id, _id: req.params.id})
        if(!client){
            return res.status(404).json({message: 'Client not found'})
        }
        await client.deleteOne()
        res.status(200).json({success: true, message: 'Client deleted successfully'})
    }catch(error){
        res.status(500).json({message: 'Error deleting client', error: error.message})
    }
}
const getClientAll = async (req,res)=>{
    try{
        const clients = await ClientModel.find({userId: req.user._id})
        if(clients.length === 0){
            return res.status(404).json({message: 'No clients found'})
        }
        return res.status(200).json({success: true, clients, clientLength: clients.length})
    }catch(error){
        res.status(500).json({message: 'Error fetching clients', error: error.message})
    }
}
const recentClient = async (req,res) =>{
    try{
        const recent = await ClientModel.find({userId: req.user._id})
        .sort({ createdAt: - 1 })
        .limit(5)
        return res.status(201).json({recent: recent})
    }catch(error){
        return res.status(500).json({Msg: error.Msg})
    }
}

module.exports = {
    createClient,
    getClient,
    updateClient,
    deleteClient,
    getClientAll,
    recentClient
}