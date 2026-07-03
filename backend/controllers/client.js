const mongoose = require("mongoose");
const ClientModel = require('../models/client');
const InvoiceModel = require('../models/invoice')

const createClient = async (req, res) => {
    try {

        const {
            clientName,
            phoneNumber,
            gstNumber,
            address,
            email
        } = req.body;

        if (
            !clientName ||
            !phoneNumber ||
            !address ||
            !email
        ) {
            return res.status(400).json({
                error: "Client Name, Phone, Address and Email are required"
            });
        }

        const userId = req.user.userId || req.user._id;

        // Check email first
        const emailExists = await ClientModel.findOne({
            userId,
            email: email.trim().toLowerCase()
        });

        if (emailExists) {
            return res.status(409).json({
                error: "Client with this email already exists"
            });
        }

        // Check GST only if provided
        if (gstNumber && gstNumber.trim() !== "") {

            const gstExists = await ClientModel.findOne({
                userId,
                gstNumber: gstNumber.trim().toUpperCase()
            });

            if (gstExists) {
                return res.status(409).json({
                    error: "Client with this GST number already exists"
                });
            }
        }

        const client = await ClientModel.create({
            userId,
            clientName,
            phoneNumber,
            gstNumber: gstNumber?.trim() || "",
            address,
            email: email.trim().toLowerCase()
        });

        return res.status(201).json({
            success: true,
            client
        });

    } catch (error) {

        console.error(error);


        return res.status(500).json({
            error: error.message
        });
    }
};
const getClient = async (req,res)=>{
    try{
 const Client = await ClientModel.findOne({userId: req.user.userId || req.user._id, email: req.params.email})
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
        const client = await ClientModel.findOne({userId: req.user.userId || req.user._id, _id: req.params.id})
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
        const client = await ClientModel.findOne({userId: req.user.userId || req.user._id, _id: req.params.id})
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
        const clients = await ClientModel.find({userId: req.user.userId || req.user._id})
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
        const recent = await ClientModel.find({userId: req.user.userId || req.user._id})
        .sort({ createdAt: - 1 })
        .limit(5)
        return res.status(201).json({recent: recent})
    }catch(error){
        return res.status(500).json({Msg: error.Msg})
    }
}


const getTopClient = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId || req.user._id);

        const grouped = await InvoiceModel.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: "$customerId",
                    totalSpent: { $sum: "$totalAmount" }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 1 }
        ]);

        if (grouped.length === 0) {
            return res.status(200).json({ topClient: null });
        }

        const clientMatch = await ClientModel.findById(grouped[0]._id);

        if (!clientMatch) {
            return res.status(200).json({ topClient: null });
        }

        return res.status(200).json({
            success: true,
            topClient: {
                name: clientMatch.clientName,
                totalSpent: grouped[0].totalSpent
            }
        });
    } catch (error) {
        console.error("Error fetching top client:", error);
        return res.status(500).json({ message: "Error fetching top client", error: error.message });
    }
};

module.exports = {
    createClient,
    getClient,
    updateClient,
    deleteClient,
    getClientAll,
    recentClient,
    getTopClient
}