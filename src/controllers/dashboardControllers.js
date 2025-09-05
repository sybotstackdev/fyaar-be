const Books = require('../models/bookModel.js')
const Authors = require('../models/authorModel.js')
const Genres = require("../models/genreModel.js")
const Instructions = require("../models/instructionModel.js")
const Plots = require("../models/plotModel.js")
const Narratives = require("../models/narrativeModel.js")
const SpiceLevels = require("../models/spiceLevelModel.js")
const Locations = require("../models/locationModel.js")
const Endings = require("../models/endingModel.js")
const Tags = require("../models/tagModel.js")

const GetDetails = async(req , res , next) => {
    try {
        const totalBooks = await Books.countDocuments()
        const totalAuthors = await Authors.countDocuments()
        const totalGenre = await Genres.countDocuments()
        const totalInstructions = await Instructions.countDocuments()
        const totalPlots = await Plots.countDocuments()
        const totalNarrativs = await Narratives.countDocuments()
        const totalSpiceLevels = await SpiceLevels.countDocuments()
        const totalLocations = await Locations.countDocuments()
        const totalEndings = await Endings.countDocuments();
        const totalTags = await Tags.countDocuments()

        let response = [
            {
                title : "Total Books",
                value : totalBooks
            },
            {
                title : "Total Authors",
                value : totalAuthors
            },
            {
                title : "Total Genre",
                value : totalGenre
            },
            {
                title : "Total Instructions",
                value : totalInstructions
            },
            {
                title : "Total Plots",
                value : totalPlots
            },
            {
                title : "Total Narrative",
                value : totalNarrativs
            },
            {
                title : "Total Spice Levels",
                value : totalSpiceLevels
            },
            {
                title : "Total Locations",
                value : totalLocations
            },
            {
                title : "Total Endings",
                value : totalEndings
            },
            {
                title : "Total Tags",
                value : totalTags
            },
        ]

        res?.status(200).json({
            message : "project stats are successfully fetched",
            success : true,
            status : 200,
            data : response
        })
    } catch (error) {
        res.status(500).json({
            message : "error while getting the stats of the projects",
            status : 500,
            success : false,
            error : error
        })
    }
}

module.exports = {
    GetDetails
}