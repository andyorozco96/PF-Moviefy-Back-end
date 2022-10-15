/* ===== REQUIRED IMPORTS ===== */

const model = require("../models/reservation.model.js");
const logger = require("../utils/logger.js");
const showtimeService = require("./showtime.service.js");
const showtimeModel = require("../models/showtime.model")

/* ========== */

/* ===== EXPORT SERVICE ===== */

module.exports = {

    post: async (obj) => {

        if (!obj._id || typeof obj._id !== "string" || obj._id.trim(" ").length === 0) {
            throw new Error("Missing or invalid reservation ID")
        }

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

            const showtime = await showtimeModel.getById(obj.showtimeId)
            if (!showtime) {
                throw new Error("Invalid reservation showtime ID")
            }

            const repeated = await model.getRepeated(obj.userId, obj.showtimeId)
            console.log(repeated)
            if (repeated.length) {
                throw new Error("This user already has a reservation in this showtime!")
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

            const showtime = await showtimeModel.getById(reservation.showtimeId)
            if (!showtime) throw new Error("Invalid reservation showtime ID")

            const showtimeSeats = [...showtime.seats]

            for (const seat of seatLocations) {
                const row = seat[0].charCodeAt() - 65
                const column = Number(seat.slice(1))

                if (!showtimeSeats[row][column]) throw new Error("Invaalid showtime seat location")
                if (showtimeSeats[row][column].userId !== undefined) throw new Error("That seat is already taken!")

            }

            await showtimeService.setUserSeats(reservation.showtimeId, reservation.userId, seatLocations)
            return await model.setUserSeats(reservationId, seatLocations)

        } catch (e) {
            logger.error(e)
            throw new Error(e)
        }

    },

    cancelById: async (userId, reservationId) => {

        if (!reservationId || typeof reservationId !== "string" || reservationId.trim(" ").length === 0) {
            throw new Error("Missing or invalid reservation ID")
        }

        try {

            const reservation = await model.getById(reservationId)
            if (!reservation) {
                throw new Error("Invalid reservation ID")
            }

            if (reservation.userId !== userId) {
                throw new Error("This reservation does not belong to the user in this session!")
            }

            if (reservation.payed) {
                throw new Error("You can't cancel a reservation that is already payed!")
            }

            if (reservation.deleted) {
                throw new Error("You can't cancel a deleted reservation")
            }

            await model.cancelById(reservation._id)
            await showtimeService.cancelSeatsById(reservation.showtimeId, reservation.seatLocations)

        } catch (e) {
            logger.error(e)
            throw new Error(e)
        }
    },

    getPayedByUser: async (userId) => {

        if (!userId || typeof userId !== "string" || userId.trim(" ").length === 0) {
            throw new Error("Missing or invalid reservation ID")
        }

        try {

            const reservations = await model.getPayedByUser(userId)
            return reservations
        } catch (e) {
            logger.error(e)
            throw new Error(e)
        }

    },

    getByShowtime: async (showtimeId) => {

        if (!showtimeId || typeof showtimeId !== "string" || showtimeId.trim(" ").length === 0) {
            throw new Error("Missing or invalid showtime ID")
        }

        try {

            const reservations = await model.getByShowtimeId(showtimeId)
            return reservations

        } catch (e) {
            logger.error(e)
            throw new Error(e)
        }

    }

}

/* ========== */