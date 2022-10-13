/* ===== REQUIRED IMPORTS ===== */

const model = require("../models/reservation.model.js");
const logger = require("../utils/logger.js");
const showtimeService = require("./showtime.service.js");

/* ========== */

/* ===== EXPORT SERVICE ===== */

module.exports = {

    post: async (obj) => {

        if (!obj.userId || typeof obj.userId !== "string" || obj.userId.trim(" ").length === 0) {
            throw new Error("Missing or invalid user ID")
        }

        if (!obj.showtimeId || typeof obj.showtimeId !== "string" || obj.showtimeId.trim(" ").length === 0) {
            throw new Error("Missing or invalid showtime ID")
        }

        if (!obj.price || isNaN(Number(obj.price)) || Number(obj.price) < 0) {
            throw new Error("Missing or invalid reservation price")
        }

        if (!obj.type || typeof obj.type !== "string" || obj.type.trim(" ").length === 0) {
            throw new Error("Missing or invalid reservation type")
        }

        try {

            const showtime = await showtimeService.getById(obj.showtimeId)
            if (!showtime) {
                throw new Error("Invalid reservation showtime ID")
            }

            return await model.save(obj)

        } catch (e) {
            logger.error(e)
            throw new Error(e)
        }

    },

    getByUser: async (userId) => {

        if (!userId || typeof userId !== "string") {
            throw new Error("Missing or invalid user ID")
        }

        try {

            return await model.getByUser(userId)

        } catch (e) {
            logger.error(e)
            throw new Error(e)
        }

    },

    confirmByUser: async (userId) => {

        if (!userId || typeof userId !== "string") {
            throw new Error("Missing or invalid user ID")
        }

        try {

            await model.confirmByUser(userId)

        } catch (e) {
            logger.error(e)
            throw new Error(e)
        }

    },

    setUserSeats: async (reservationId, seatLocations) => {

        if (!reservationId || typeof reservationId !== "string" || reservationId.trim(" ").length === 0) {
            throw new Error("Missing or invalid reservation ID")
        }

        if (!Array.isArray(seatLocations) || !seatLocations.length) {
            throw new Error("Missing or invalid reservation seats IDs")
        }

        try {

            const reservation = await model.getById(reservationId)
            if (!reservation) throw new Error("Invalid reservation ID")

            if (!reservation.userId || reservation.userId === "") throw new Error("This reservation is not assigned to any user!")

            const showtime = await showtimeService.getById(reservation.showtimeId)
            if (!showtime) throw new Error("Invalid reservation showtime ID")

            const showtimeSeats = [...showtime.seats]
            
            for (const seat of seatLocations) {
                const row = seat[0].charCodeAt() - 65
                const column = Number(seat.slice(1))

                if (!showtimeSeats[row][column]) throw new Error("Invaalid showtime seat location")
                if (showtimeSeats[row][column].userId !== "") throw new Error("That seat is already taken!")

            }

            await showtimeService.setUserSeats(reservation.showtimeId, reservation.userId, seatLocations)
            return await model.setUserSeats(reservationId, seatLocations)

        } catch (e) {
            logger.error(e)
            throw new Error(e)
        }

    }

}

/* ========== */