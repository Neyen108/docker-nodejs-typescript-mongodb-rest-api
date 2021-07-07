import { CommonRoutesConfig } from "../common/common.routes.config";
import express from "express";

//importing the CommonRoutesConfig class and extending it to the UsersRoutes class
//This example is quite simple, but when scaling to create several route files, this will help us avoid duplicate code.
//Suppose we would want to add new features in this file, such as logging.
//We could add the necessary field to the CommonRoutesConfig class, and then all the routes that extend CommonRoutesConfig will have access to it.
export class UsersRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, "UsersRoutes");
    }

    configureRoutes() {
        this.app
            .route("/users")
            .get((req: express.Request, res: express.Response) => {
                res.status(200).send("List of Users");
            })
            .post((req: express.Request, res: express.Response) => {
                res.status(200).send("Post to Users");
            });

        this.app
            .route("/users/:userId")
            .all(
                (
                    req: express.Request,
                    res: express.Response,
                    next: express.NextFunction
                ) => {
                    // this middleware function runs before any request to /users/:userId
                    // but it doesn't accomplish anything just yet---
                    // it simply passes control to the next applicable function below using next()
                    next();
                }
            )
            .get((req: express.Request, res: express.Response) => {
                res.status(200).send(
                    `GET requested for id ${req.params.userId}`
                );
            })
            .put((req: express.Request, res: express.Response) => {
                res.status(200).send(
                    `PUT requested for id ${req.params.userId}`
                );
            })
            .patch((req: express.Request, res: express.Response) => {
                res.status(200).send(
                    `PATCH requested for id ${req.params.userId}`
                );
            })
            .delete((req: express.Request, res: express.Response) => {
                res.status(200).send(
                    `DELETE requested for id ${req.params.userId}`
                );
            });

        return this.app;
    }
}
