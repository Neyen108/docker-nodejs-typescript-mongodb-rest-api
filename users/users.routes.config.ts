import { CommonRoutesConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";
import UsersMiddleware from "./middleware/users.middleware";
import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import express from "express";
import { body } from "express-validator";

import jwtMiddleware from "../auth/middleware/jwt.middleware";
import { PermissionFlag } from "../common/middleware/common.permissionflag.enum";
import permissionMiddleware from "../common/middleware/common.permission.middleware";

//importing the CommonRoutesConfig class and extending it to the UsersRoutes class
//This example is quite simple, but when scaling to create several route files, this will help us avoid duplicate code.
//Suppose we would want to add new features in this file, such as logging.
//We could add the necessary field to the CommonRoutesConfig class, and then all the routes that extend CommonRoutesConfig will have access to it.
export class UsersRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, "UsersRoutes");
    }

    configureRoutes(): express.Application {
        this.app
            .route("/users")
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired(
                    PermissionFlag.ADMIN_PERMISSION
                ),
                UsersController.listUsers
            )
            .post(
                body("email").isEmail(),
                body("password")
                    .isLength({ min: 5 })
                    .withMessage("Must include password (5+ characters)"),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                UsersMiddleware.validateSameEmailDoesntExist,
                UsersController.createUser
            );

        this.app.param(`userId`, UsersMiddleware.extractUserId);

        this.app
            .route("/users/:userId")
            .all(
                UsersMiddleware.validateUserExists,
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.onlySameUserOrAdminCanDoThisAction
            )
            .get(UsersController.getUserById)
            .delete(UsersController.removeUser);

        this.app.put(`/users/:userId`, [
            body("email").isEmail(),
            body("password")
                .isLength({ min: 5 })
                .withMessage("Must include password (5+ characters)"),
            body("firstName").isString(),
            body("lastName").isString(),
            body("permissionFlags").isInt(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            UsersMiddleware.validateSameEmailBelongToSameUser,
            UsersMiddleware.userCantChangePermission,
            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.PAID_PERMISSION
            ),
            UsersController.put,
        ]);

        this.app.patch(`/users/:userId`, [
            body("email").isEmail().optional(),
            body("password")
                .isLength({ min: 5 })
                .withMessage("Must include password (5+ characters)")
                .optional(),
            body("firstName").isString().optional(),
            body("lastName").isString().optional(),
            body("permissionFlags").isInt().optional(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            UsersMiddleware.validatePatchEmail,
            UsersMiddleware.userCantChangePermission,
            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.PAID_PERMISSION
            ),
            UsersController.patch,
        ]);

        this.app.put(`/users/:userId/permissionFlags/:permissionFlags`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,

            // Note: The above two pieces of middleware are needed despite
            // the reference to them in the .all() call, because that only covers
            // /users/:userId, not anything beneath it in the hierarchy

            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.FREE_PERMISSION
            ),
            UsersController.updatePermissionFlags,
        ]);

        return this.app;
    }
}
