/* ===== REQUIRED IMPORTS ===== */

const service = require("../services/room.service.js");

/* ========== */

/* ===== EXPORT CONTROLLER ===== */

module.exports = {

    post: async (req, res, next) => {
        const newRoom = req.body

        try {
            const result = await service.post(newRoom)
            return res.status(201).send(result)

        } catch (e) {
            next(e)
        }

    },

    getAll: async (req, res, next) =>  {

        try {

            const result = await service.getAll()
            return res.status(200).send(result)
            
        } catch(e) {
            next(e)
        }

    }

}

/* ========== */