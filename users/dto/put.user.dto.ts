//For PUT requests,
//we want to update the entire object,
//so our optional fields are now required.
export interface PutUserDto {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    permissionLevel: number;
}
