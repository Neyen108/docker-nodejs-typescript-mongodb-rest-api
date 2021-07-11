//For PUT requests,
//we want to update the entire object,
//so our optional fields are now required.
export interface PutUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissionFlags: number;
}
