
import { Router } from "express";
import conferenceRoutes from "./conference.routes";
import userRoutes from "./user.routes";

const routes = Router()

routes.use('/conference', conferenceRoutes)
routes.use('/user', userRoutes)

export default routes;